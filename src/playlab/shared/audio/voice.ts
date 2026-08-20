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
import { speak } from "@shared/audio/speech";
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

/** Warm the cache for clips the current interaction will need. */
export function preloadClips(ids: ClipId[]): void {
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
    const finish = (useSpeech = false) => {
      if (settled) return;
      settled = true;
      if (current === h) current = null;
      duckMusic(false);
      h.off("end", onEnd);
      if (useSpeech) {
        failedIds.add(id);
        cache.delete(id);
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
      h.once("load", () => {
        if (!settled) h.play();
      });
      h.load();
      setTimeout(() => {
        if (!settled && h.state() !== "loaded") finish(true);
      }, 1200);
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
