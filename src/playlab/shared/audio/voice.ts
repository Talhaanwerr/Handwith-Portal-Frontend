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
}

const CLIPS: Record<string, ClipDef> = manifest.clips as Record<string, ClipDef>;

const cache = new Map<ClipId, Howl>();
const failedIds = new Set<ClipId>();
let current: Howl | null = null;

function missing(id: ClipId, reason: string): void {
  console.warn(`[voice] clip "${id}" ${reason} — using browser speech so the game can continue.`);
}

function spokenText(def: ClipDef): string {
  return (def.speak || def.text || "").trim();
}

function playSpoken(def: ClipDef): Promise<void> {
  return new Promise((resolve) => {
    const text = spokenText(def);
    if (!text) {
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
  primeVoices();
  for (const id of ids) getClip(id);
}

/** Stop any narration immediately (used before starting a new sequence). */
export function stopVoice(): void {
  current?.stop();
  current = null;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  duckMusic(false);
}

/**
 * Play one clip. Resolves when the clip actually ENDS.
 * Missing MP3s fall back to Web Speech using the manifest line.
 */
export function playClip(id: ClipId): Promise<void> {
  const def = CLIPS[id];
  if (!def) {
    missing(id, "is not in manifest.json");
    return new Promise((r) => setTimeout(r, 250));
  }
  if (failedIds.has(id)) {
    return playSpoken(def);
  }

  return new Promise((resolve) => {
    const h = getClip(id);
    if (!h) {
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
  for (let i = 0; i < ids.length; i++) {
    if (i > 0 && gapMs > 0) await new Promise((r) => setTimeout(r, gapMs));
    onPart?.(i);
    await playClip(ids[i]);
  }
}
