"use client";

/**
 * Shared sound-effects layer — every game gets the same synthesized SFX with
 * zero audio assets: tones are generated as in-memory WAVs and cached in
 * Howler. Games call `playCorrectSound()` etc. instead of building their own
 * audio systems. Volume/mute is governed by the shared settings store.
 */

import { Howl, Howler } from "howler";
import { useSettingsStore } from "@shared/stores/settingsStore";
import { unit } from "@shared/utils/hash";
import { whenIdle, type IdleBudget } from "@shared/utils/idle";

// ---------------------------------------------------------------------------
// WAV generator — creates PCM audio in-memory so Howler has a src to load.
// No audio files required; everything is generated from sine waves at runtime.
// ---------------------------------------------------------------------------
function buildWavDataURI(
  frequencies: readonly number[],
  durationSec: number,
  volume = 0.16
): string {
  const rate = 22050;
  const samples = Math.floor(rate * durationSec);
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);

  const u32 = (o: number, n: number) => view.setUint32(o, n, true);
  const u16 = (o: number, n: number) => view.setUint16(o, n, true);

  // RIFF/WAVE header
  [0x52, 0x49, 0x46, 0x46].forEach((b, i) => view.setUint8(i, b)); // "RIFF"
  u32(4, 36 + samples * 2);
  [0x57, 0x41, 0x56, 0x45].forEach((b, i) => view.setUint8(8 + i, b)); // "WAVE"
  [0x66, 0x6d, 0x74, 0x20].forEach((b, i) => view.setUint8(12 + i, b)); // "fmt "
  u32(16, 16); // subchunk size
  u16(20, 1); // PCM
  u16(22, 1); // mono
  u32(24, rate);
  u32(28, rate * 2); // byte rate
  u16(32, 2); // block align
  u16(34, 16); // bits per sample
  [0x64, 0x61, 0x74, 0x61].forEach((b, i) => view.setUint8(36 + i, b)); // "data"
  u32(40, samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / rate;
    // Smooth attack (10ms) + release (60ms) envelope
    const attack = Math.min(t / 0.01, 1);
    const release = Math.min((durationSec - t) / 0.06, 1);
    const env = Math.min(attack, release);

    let s = 0;
    for (const f of frequencies) {
      s += Math.sin(2 * Math.PI * f * t) / frequencies.length;
    }

    const pcm = Math.max(-32768, Math.min(32767, Math.floor(32767 * volume * env * s)));
    view.setInt16(44 + i * 2, pcm, true);
  }

  const bytes = new Uint8Array(buf);
  let b64 = "";
  // btoa-safe encoding
  for (let i = 0; i < bytes.length; i++) {
    b64 += String.fromCharCode(bytes[i]);
  }
  return "data:audio/wav;base64," + btoa(b64);
}

// ---------------------------------------------------------------------------
// The sound tables — every sound the vocabulary below plays, declared once.
// Building a sound (synthesising its WAV and decoding it) costs real main-
// thread time; declared here, `warmSfx()` can build them all in idle moments
// before the first one is needed, instead of on the frame of a celebration.
// ---------------------------------------------------------------------------

/** frequencies (played together), seconds, volume */
type ToneSpec = readonly [frequencies: readonly number[], seconds: number, volume?: number];

const TONES = {
  "success-c5": [[523], 0.22],
  "success-e5": [[659], 0.22],
  "success-g5": [[784], 0.32],
  "oops-1": [[349], 0.16, 0.4],
  "oops-2": [[311], 0.2, 0.4],
  "tap-440": [[440], 0.09, 0.55],
  "stroke-e5": [[659], 0.14],
  "stroke-b5": [[988], 0.18],
  "place-plop": [[196, 262], 0.09, 0.6],
  "place-ding": [[1047, 1319], 0.22, 0.5],
  "star-1": [[784], 0.1, 0.55],
  "star-2": [[1047], 0.18, 0.55],
  "five-659": [[659], 0.24, 0.6],
  "five-784": [[784], 0.24, 0.6],
  "five-988": [[988], 0.24, 0.6],
  "five-1319": [[1319], 0.24, 0.6],
  "cel-523": [[523], 0.2],
  "cel-587": [[587], 0.2],
  "cel-659": [[659], 0.2],
  "cel-698": [[698], 0.2],
  "cel-784": [[784], 0.2],
  "cel-880": [[880], 0.2],
  "cel-988": [[988], 0.2],
  "cel-1047": [[1047], 0.2],
} as const satisfies Record<string, ToneSpec>;

type ToneId = keyof typeof TONES;

// Howl cache — lazy, keyed by sound id, so nothing is ever generated twice.
const howlCache = new Map<string, Howl>();

function cached(key: string, build: () => string, volume: number): Howl | null {
  if (typeof window === "undefined") return null;
  if (!howlCache.has(key)) {
    try {
      howlCache.set(key, new Howl({ src: [build()], format: ["wav"], volume, html5: false }));
    } catch {
      return null;
    }
  }
  return howlCache.get(key) ?? null;
}

function tone(id: ToneId): Howl | null {
  const [frequencies, seconds, volume = 0.7]: ToneSpec = TONES[id];
  return cached(id, () => buildWavDataURI(frequencies, seconds, 0.16), volume);
}

// ---------------------------------------------------------------------------
// Texture generator — the same in-memory WAV trick, but for sounds that are
// OBJECTS rather than notes.
//
// A sine tone is a beep; a shape clicking into a board is a short burst of
// noise with a pitched body under it that dies away fast. That needs three
// things the tone generator above does not have: white noise, a pitch that
// slides during the sound, and an exponential decay instead of a flat
// envelope. Games that move physical-feeling pieces around (Leo's
// Puzzles) use these; everything else keeps the notes.
//
// The noise is hashed, never Math.random, so the same knock sounds the same
// every time — which is most of what makes it read as a real object rather
// than static.
// ---------------------------------------------------------------------------

interface Texture {
  /** How much of the voice is noise, 0 (pure tone) to 1 (pure rustle). */
  noise: number;
  /** The pitched body slides from this frequency to that one, in Hz. */
  from: number;
  to: number;
  /** Seconds. A knock is 0.07–0.16; anything longer stops being an impact. */
  duration: number;
  /** How fast it dies away. Higher is drier and snappier. */
  decay: number;
  volume?: number;
}

function buildTextureWav(texture: Texture): string {
  const { noise, from, to, duration, decay, volume = 0.22 } = texture;
  const rate = 22050;
  const samples = Math.floor(rate * duration);
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);

  const u32 = (o: number, n: number) => view.setUint32(o, n, true);
  const u16 = (o: number, n: number) => view.setUint16(o, n, true);

  [0x52, 0x49, 0x46, 0x46].forEach((b, i) => view.setUint8(i, b)); // "RIFF"
  u32(4, 36 + samples * 2);
  [0x57, 0x41, 0x56, 0x45].forEach((b, i) => view.setUint8(8 + i, b)); // "WAVE"
  [0x66, 0x6d, 0x74, 0x20].forEach((b, i) => view.setUint8(12 + i, b)); // "fmt "
  u32(16, 16);
  u16(20, 1);
  u16(22, 1);
  u32(24, rate);
  u32(28, rate * 2);
  u16(32, 2);
  u16(34, 16);
  [0x64, 0x61, 0x74, 0x61].forEach((b, i) => view.setUint8(36 + i, b)); // "data"
  u32(40, samples * 2);

  let phase = 0;
  let rustle = 0;
  for (let i = 0; i < samples; i++) {
    const t = i / rate;
    const progress = t / duration;
    // 1.5ms attack so the onset is a click, not a pop of silence
    const attack = Math.min(t / 0.0015, 1);
    const env = attack * Math.exp(-decay * t);

    const hz = from + (to - from) * progress;
    phase += (2 * Math.PI * hz) / rate;
    const body = Math.sin(phase);

    // lightly smoothed white noise: raw hash is too bright to sound like wood
    const raw = unit(i * 2654435761) * 2 - 1;
    rustle = rustle * 0.55 + raw * 0.45;

    const s = body * (1 - noise) + rustle * noise;
    const pcm = Math.max(-32768, Math.min(32767, Math.floor(32767 * volume * env * s)));
    view.setInt16(44 + i * 2, pcm, true);
  }

  const bytes = new Uint8Array(buf);
  let b64 = "";
  for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
  return "data:audio/wav;base64," + btoa(b64);
}

/** The impacts: a texture and its playback volume. */
const TEXTURES = {
  lift: [{ noise: 0.35, from: 430, to: 760, duration: 0.07, decay: 42 }, 0.5],
  snap: [{ noise: 0.7, from: 950, to: 420, duration: 0.06, decay: 62 }, 0.65],
  "snap-body": [{ noise: 0.25, from: 260, to: 170, duration: 0.13, decay: 30 }, 0.5],
  thud: [{ noise: 0.5, from: 190, to: 110, duration: 0.15, decay: 24 }, 0.45],
  knock: [{ noise: 0.55, from: 240, to: 150, duration: 0.11, decay: 34 }, 0.55],
  "knock-2": [{ noise: 0.55, from: 215, to: 138, duration: 0.1, decay: 36 }, 0.42],
  latch: [{ noise: 0.62, from: 1120, to: 520, duration: 0.05, decay: 70 }, 0.5],
  swing: [{ noise: 0.3, from: 300, to: 118, duration: 0.26, decay: 12 }, 0.4],
  clink: [{ noise: 0.28, from: 1650, to: 1180, duration: 0.09, decay: 34 }, 0.5],
  "clink-2": [{ noise: 0.2, from: 2100, to: 1500, duration: 0.11, decay: 26 }, 0.3],
} as const satisfies Record<string, readonly [Texture, number]>;

type TextureId = keyof typeof TEXTURES;

function impact(id: TextureId): Howl | null {
  const [texture, volume] = TEXTURES[id];
  return cached(id, () => buildTextureWav(texture), volume);
}

let warmed = false;

/**
 * Builds every sound ahead of time, a few per idle moment, so the first
 * correct answer of a session does not stall its own celebration while the
 * WAVs are synthesised (measured at 120–170 ms of blocked main thread on the
 * first drop). Called once by `useGameSession`; safe to call again.
 */
export function warmSfx(): void {
  if (typeof window === "undefined" || warmed) return;
  warmed = true;
  const jobs: (() => unknown)[] = [
    ...(Object.keys(TONES) as ToneId[]).map((id) => () => tone(id)),
    ...(Object.keys(TEXTURES) as TextureId[]).map((id) => () => impact(id)),
  ];
  const step = (budget: IdleBudget) => {
    do jobs.shift()?.();
    while (jobs.length > 0 && budget.timeRemaining() > 4);
    if (jobs.length > 0) whenIdle(step);
  };
  whenIdle(step);
}

// ---------------------------------------------------------------------------
// Global volume / mute — driven by the shared settings store
// ---------------------------------------------------------------------------
let settingsWired = false;

/** Apply (and keep applying) the shared audio settings. Call once per app. */
export function initAudio(): void {
  if (typeof window === "undefined" || settingsWired) return;
  settingsWired = true;
  const apply = () => {
    const { soundEnabled, volume } = useSettingsStore.getState();
    Howler.volume(soundEnabled ? volume : 0);
  };
  apply();
  useSettingsStore.subscribe(apply);
}

// ---------------------------------------------------------------------------
// The shared SFX vocabulary
// ---------------------------------------------------------------------------

/** Satisfying three-note ascending chord — a correct answer / success */
export function playCorrectSound(): void {
  tone("success-c5")?.play();
  setTimeout(() => tone("success-e5")?.play(), 90);
  setTimeout(() => tone("success-g5")?.play(), 180);
}

/** Gentle, non-alarming two-note "oops" — never harsh or buzzer-like */
export function playIncorrectSound(): void {
  tone("oops-1")?.play();
  setTimeout(() => tone("oops-2")?.play(), 100);
}

/** Soft single tap / button click */
export function playClickSound(): void {
  tone("tap-440")?.play();
}

/** Subtle two-note mid-task chime (e.g. one stroke of a letter completed) */
export function playChime(): void {
  tone("stroke-e5")?.play();
  setTimeout(() => tone("stroke-b5")?.play(), 85);
}

/** A piece landing in its place — a soft low plop, then a bright ding.
 *  Numbers 1–5 plays it whenever a number settles into its circle. */
export function playPlaceSound(): void {
  tone("place-plop")?.play();
  setTimeout(() => tone("place-ding")?.play(), 70);
}

/** Bright little "pop" (earning a star / small reward) */
export function playStarPop(): void {
  tone("star-1")?.play();
  setTimeout(() => tone("star-2")?.play(), 70);
}

/** Bigger four-note fanfare (finishing a full level / five stars) */
export function playFanfare(): void {
  const melody = [659, 784, 988, 1319] as const;
  melody.forEach((freq, i) => {
    setTimeout(() => tone(`five-${freq}`)?.play(), i * 80);
  });
}

/* ── Handling things ──────────────────────────────────────────────────────
   Picking a piece up, clicking it into place and bumping it against the wrong
   place. These are IMPACTS, not notes: short, noisy and dry, so a child hears
   an object being moved rather than a menu being operated. */

/** Lifting a piece off the tray — a small dry tick with a rising tail. */
export function playPickUpSound(): void {
  impact("lift")?.play();
}

/** A piece clicking into its place: the click of the edges meeting, then the
 *  body of the piece settling into the board a moment later. */
export function playSnapSound(): void {
  impact("snap")?.play();
  setTimeout(() => impact("snap-body")?.play(), 26);
}

/** A piece bumped against a place it does not belong — a dull, soft thud with
 *  no click in it, so "not there" never sounds like a buzzer. */
export function playThudSound(): void {
  impact("thud")?.play();
}

/* ── Doors, latches and keys ──────────────────────────────────────────────
   Key Quest is made of one object — a door — so its two answers are the two
   things a door does. Neither is a buzzer or a bell. */

/** A knuckle on wood: a door tried and found locked. Two taps, the second
 *  softer and a shade lower, because that is how a hand actually knocks. */
export function playKnockSound(): void {
  impact("knock")?.play();
  setTimeout(() => impact("knock-2")?.play(), 135);
}

/** A latch giving and a door swinging away: the click of the catch, then the
 *  long low sweep of the leaf moving. */
export function playDoorOpenSound(): void {
  impact("latch")?.play();
  setTimeout(() => impact("swing")?.play(), 45);
}

/** Brass on steel — a key dropping into the vault. */
export function playClinkSound(): void {
  impact("clink")?.play();
  setTimeout(() => impact("clink-2")?.play(), 60);
}

/** Ascending celebratory scale (level-complete celebrations) */
export function playCelebrationSound(): void {
  const melody = [523, 587, 659, 698, 784, 880, 988, 1047] as const;
  melody.forEach((freq, i) => {
    setTimeout(() => tone(`cel-${freq}`)?.play(), i * 95);
  });
}
