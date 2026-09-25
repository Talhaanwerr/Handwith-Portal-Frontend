"use client";

/**
 * voice.ts — the narration engine. Prefers pre-generated MP3s (Howler).
 * MP3s are optional: if a file is missing (typical after clone — they are
 * not in git), the clip's manifest `speak`/`text` is spoken via Web Speech
 * so games never hang waiting on a 404.
 *
 *  - ONE spoken voice event at a time.
 *  - play() resolves when speech/audio actually ends (or a short fail-safe).
 *  - UI text still comes from clipText() / the manifest.
 */

import { Howl } from "howler";
import { duckMusic } from "@shared/audio/music";
import { speak, primeVoices } from "@shared/audio/speech";
import manifest from "./manifest.json";

type ClipId = string;

interface ClipDef {
  file: string;
  text: string;
  speak?: string;
  /** This clip IS another clip: same words, already recorded elsewhere. */
  alias?: string;
}

const RAW: Record<string, ClipDef> = manifest.clips as Record<string, ClipDef>;

/**
 * Follow a clip's `alias` to the clip that actually owns the recording.
 *
 * Different games ask for the same words — "cat" is a Candy ABC word, a Blend
 * & Seek answer and a Word Site tile — and each game named its own clip id for
 * it. Rather than record "cat" three times, the duplicates carry
 * `alias: "treat-word-cat"` and resolve here, so a game keeps its own readable
 * id and still gets a real voice instead of the browser synthesiser.
 *
 * Resolution is shallow-looped with a hop limit: an alias chain is data, and
 * data can be edited into a circle.
 */
function resolve(id: ClipId): ClipDef | undefined {
  let def = RAW[id];
  for (let hop = 0; def?.alias && hop < 4; hop++) def = RAW[def.alias];
  return def;
}

/** The clips as the player sees them, aliases already followed. */
const CLIPS: Record<string, ClipDef> = new Proxy(RAW, {
  get: (_t, key: string) => resolve(key),
  has: (_t, key: string) => resolve(key as string) !== undefined,
}) as Record<string, ClipDef>;

const cache = new Map<ClipId, Howl>();
/** Whether a missing MP3 may fall back to browser speech. OFF: the portal
 *  speaks only with real recordings, so a missing clip is a short silence,
 *  never a synthesised voice. `setSpeechFallback(true)` exists for local
 *  debugging only — no game ships with it on. */
let speechFallback = false;
export function setSpeechFallback(enabled: boolean): void {
  speechFallback = enabled;
}
const failedIds = new Set<ClipId>();
let current: Howl | null = null;
/** Settles the promise of the clip now playing — so a stop from anywhere
 *  ends that line properly instead of leaving its promise hanging until a
 *  fail-safe fires, or worse, re-speaking the cancelled line as browser
 *  speech two seconds later. */
let settleCurrent: (() => void) | null = null;
/** The line being said right now, or the last one said: what `sayAfter`
 *  waits for. */
let speaking: Promise<void> = Promise.resolve();

function missing(id: ClipId, reason: string): void {
  console.warn(`[voice] clip "${id}" ${reason} — staying silent.`);
}

function spokenText(def: ClipDef): string {
  return (def.speak || def.text || "").trim();
}

function playSpoken(def: ClipDef): Promise<void> {
  return new Promise((resolve) => {
    const text = spokenText(def);
    if (!text || !speechFallback) {
      setTimeout(resolve, 200);
      return;
    }
    duckMusic(true);
    speak(
      text,
      0.92,
      1.18,
      () => {
        duckMusic(false);
        resolve();
      },
      true
    );
  });
}

function getClip(id: ClipId): Howl | null {
  const def = CLIPS[id];
  if (!def || failedIds.has(id)) return null;
  let h = cache.get(id);
  if (!h) {
    h = new Howl({
      src: [def.file],
      preload: true,
      html5: false,
      onloaderror: () => {
        failedIds.add(id);
        cache.delete(id);
        missing(id, "failed to load (file missing?)");
      },
    });
    cache.set(id, h);
  }
  return h;
}

/** The displayed-text half of a clip — UI text MUST come from here so screen
 *  and speech always match. */
export function clipText(id: ClipId): string {
  return CLIPS[id]?.text ?? "";
}

/** Warm the cache for clips the current interaction will need.
 *
 *  Also primes the Web Speech voice list, because that is the OTHER thing a
 *  first spoken line can end up waiting on: if an MP3 is missing the fallback
 *  cannot speak until the device has published its voices, which on a cold
 *  synth costs up to ~1.1s. Warming both here means "preloaded" really does
 *  mean "ready to make a sound", whichever path ends up being used. */
export function preloadClips(ids: ClipId[]): void {
  if (speechFallback) primeVoices();
  for (const id of ids) getClip(id);
}

/** Stop any narration immediately (used before starting a new sequence). */
/** Bumped by every stopVoice(); a running playSequence compares it before
 *  each part so a stop really ends the whole line, not just the clip that
 *  happened to be playing. */
let generation = 0;

export function stopVoice(): void {
  generation++;
  const playing = current;
  settleCurrent?.();
  settleCurrent = null;
  playing?.stop();
  current = null;
  if (speechFallback && typeof window !== "undefined") window.speechSynthesis?.cancel();
  duckMusic(false);
}

/**
 * Play one clip NOW, over whatever is being said. Resolves when the clip
 * actually ENDS. Missing MP3s fall back to Web Speech using the manifest line.
 *
 * This is for REACTIONS — a wrong piece, an animal tapped, a number landing —
 * where the child just did something and the answer has to be immediate.
 * A line that belongs after another line goes through `sayAfter` instead.
 */
export function playClip(id: ClipId): Promise<void> {
  const line = startClip(id);
  speaking = line;
  return line;
}

/**
 * Say this AFTER whatever is being said, instead of over it.
 *
 * For lines that belong in a sequence — a question after an announcement,
 * "Hooray!" after "You made the park!", the next board's banner after "Now a
 * puzzle!" — where cutting the first one off mid-word is worse than half a
 * second's wait. Nothing is playing: it plays at once. A stop from anywhere
 * (Back, another screen, a reaction cutting in) empties the queue, so a
 * queued line can never turn up on the wrong screen.
 */
export function sayAfter(id: ClipId): Promise<void> {
  const token = generation;
  const line = speaking.then(() => {
    if (generation !== token) return;
    return playClip(id);
  });
  speaking = line;
  return line;
}

function startClip(id: ClipId): Promise<void> {
  const def = CLIPS[id];
  if (!def) {
    missing(id, "is not in manifest.json");
    return new Promise((r) => setTimeout(r, 250));
  }
  if (failedIds.has(id)) {
    // one voice at a time holds for browser speech too: it must not talk over
    // an MP3 that happens to be playing
    stopVoice();
    return playSpoken(def);
  }

  return new Promise((resolve) => {
    const h = getClip(id);
    if (!h) {
      stopVoice();
      void playSpoken(def).then(resolve);
      return;
    }

    stopVoice();
    current = h;
    duckMusic(true);

    let settled = false;
    /** `blacklist` marks the clip as permanently unavailable — only ever for a
     *  REAL error. A slow load is not a broken file: blacklisting on a timeout
     *  used to condemn a perfectly good MP3 to browser speech for the rest of
     *  the session after one slow fetch. */
    const finish = (useSpeech = false, blacklist = useSpeech) => {
      if (settled) return;
      settled = true;
      settleCurrent = null;
      if (current === h) current = null;
      duckMusic(false);
      h.off("end", onEnd);
      if (useSpeech) {
        if (blacklist) {
          failedIds.add(id);
          cache.delete(id);
        }
        void playSpoken(def).then(resolve);
        return;
      }
      resolve();
    };
    const onEnd = () => finish(false);
    // a stop from anywhere ends this line quietly: settled, no speech fallback
    settleCurrent = () => finish(false);

    h.once("end", onEnd);
    h.once("loaderror", () => finish(true));
    h.once("playerror", () => finish(true));

    if (h.state() === "loaded") {
      h.play();
      setTimeout(() => {
        if (!settled) finish(false);
      }, 6000);
    } else {
      // Play the INSTANT the fetch already in flight completes.
      h.once("load", () => {
        if (!settled) h.play();
      });
      // getClip() creates every Howl with preload:true, so a clip in the
      // "loading" state is already fetching. Calling load() again there
      // restarts that fetch from zero — which is exactly what made the first
      // line of a screen arrive late. Only kick off a load that never started.
      if (h.state() === "unloaded") h.load();
      // Fail-safe only: give the fetch a realistic window on a slow
      // connection, and fall back to speech WITHOUT condemning the file.
      setTimeout(() => {
        if (!settled && h.state() !== "loaded") finish(true, false);
      }, 2500);
    }
  });
}

/**
 * Play clips in order with a deliberate pause between them (deterministic:
 * each next clip starts only after the previous clip's real end + gap).
 * onPart fires when each clip BEGINS, for visuals synced to specific words.
 */
export async function playSequence(
  ids: ClipId[],
  gapMs = 250,
  onPart?: (index: number) => void
): Promise<void> {
  // playClip itself calls stopVoice() (which bumps `generation`), so the
  // token is read AFTER each part starts; a stop from anywhere else - Back,
  // unmount, another tap - then ends the sequence at the next boundary.
  let token = -1;
  for (let i = 0; i < ids.length; i++) {
    if (i > 0) {
      if (gapMs > 0) await new Promise((r) => setTimeout(r, gapMs));
      if (generation !== token) return;
    }
    onPart?.(i);
    const play = playClip(ids[i]);
    token = generation;
    await play;
    if (generation !== token) return;
  }
}
