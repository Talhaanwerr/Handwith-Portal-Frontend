"use client";

/**
 * Shared background music — ONE gentle looping track for every game.
 *
 * Follows the platform's zero-asset audio philosophy (see sfx.ts): the music
 * is COMPOSED PROCEDURALLY at runtime — a soft marimba-style pentatonic
 * arpeggio over a slow I–vi–IV–I–V–I progression — rendered once into an
 * in-memory WAV (composed a bar at a time in idle moments, see
 * prepareMusic) and looped by Howler. No file to ship, nothing to load.
 *
 * Seamlessness is guaranteed by construction: notes are written into the
 * buffer with WRAPAROUND, so a note-tail that runs past the end continues at
 * sample 0 — the loop point is mathematically inaudible.
 *
 * Rules enforced here (not left to each game):
 *  - SINGLETON: startMusic() is idempotent; two tracks can never overlap,
 *    including when hopping between games.
 *  - Mute/volume: plays through Howler, so the shared settings store's
 *    global Howler.volume() (wired in initAudio) governs it automatically.
 *  - Autoplay: reaching any game's post-splash screen requires a tap, and
 *    Howler's autoUnlock resumes the AudioContext on that first gesture —
 *    so starting from a screen-change effect is reliable.
 *  - Ducking: voice narration lowers the music and restores it after, so
 *    instructions are never fighting the soundtrack.
 */

import { Howl } from "howler";
import { whenIdle, type IdleBudget } from "@shared/utils/idle";

const RATE = 22050;
const BPM = 84;
const MUSIC_VOLUME = 0.2;
const DUCKED_VOLUME = 0.1;

// C-major pentatonic voicings per bar: [bass, chord tones for the arp]
const BARS: { bass: number; tones: number[] }[] = [
  { bass: 130.81, tones: [261.63, 329.63, 392.0, 523.25] }, // C
  { bass: 110.0, tones: [220.0, 261.63, 329.63, 440.0] }, // Am
  { bass: 87.31, tones: [174.61, 261.63, 349.23, 440.0] }, // F
  { bass: 130.81, tones: [261.63, 329.63, 392.0, 523.25] }, // C
  { bass: 98.0, tones: [196.0, 293.66, 392.0, 493.88] }, // G
  { bass: 130.81, tones: [261.63, 329.63, 392.0, 523.25] }, // C
];

/** Soft mallet voice: fundamental + gentle harmonics, fast attack, long decay */
function addNote(
  out: Float32Array,
  startSample: number,
  freq: number,
  durSec: number,
  vel: number
) {
  const n = Math.floor(durSec * RATE);
  const total = out.length;
  const attack = Math.floor(0.006 * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env = (i < attack ? i / attack : Math.exp(-(i - attack) / (0.24 * RATE))) * vel;
    const s =
      Math.sin(2 * Math.PI * freq * t) * 1.0 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.28 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.09;
    out[(startSample + i) % total] += s * env; // wraparound → seamless loop
  }
}

/** One note of the loop: where it starts (in samples) and how it sounds. */
interface Note {
  start: number;
  freq: number;
  dur: number;
  vel: number;
}

/** Every note of the loop, bar by bar. Composing them one at a time (see
 *  prepareMusic) keeps each piece of work to a few milliseconds. */
function loopNotes(): Note[] {
  const beat = 60 / BPM;
  const eighth = beat / 2;
  const at = (sec: number) => Math.floor(sec * RATE);
  return BARS.flatMap((bar, b) => {
    const barStart = b * beat * 4;
    const notes: Note[] = [
      // soft bass on beats 1 and 3
      { start: at(barStart), freq: bar.bass, dur: 1.4, vel: 0.14 },
      { start: at(barStart + 2 * beat), freq: bar.bass * 1.5, dur: 1.1, vel: 0.09 },
    ];
    // lilting up-down eighth-note arpeggio, tiny velocity variation
    [0, 1, 2, 3, 2, 3, 1, 2].forEach((tone, i) => {
      const vel = 0.115 + (i % 2 === 0 ? 0.02 : 0) + (i === 0 ? 0.015 : 0);
      notes.push({ start: at(barStart + i * eighth), freq: bar.tones[tone], dur: 0.55, vel });
    });
    // a sparse high "bell" every other bar for sparkle
    if (b % 2 === 1) {
      notes.push({ start: at(barStart + 3 * beat), freq: bar.tones[3] * 2, dur: 0.9, vel: 0.045 });
    }
    return notes;
  });
}

/** The finished loop as a WAV blob URL: gentle soft-clip so summed voices can
 *  never crackle, then 16-bit PCM. A blob URL rather than a base64 data URI —
 *  the buffer is ~750 KB and encoding it to a string was most of the cost. */
function toWavUrl(pcm: Float32Array): string {
  const samples = pcm.length;
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);
  const u32 = (o: number, v: number) => view.setUint32(o, v, true);
  const u16 = (o: number, v: number) => view.setUint16(o, v, true);
  [0x52, 0x49, 0x46, 0x46].forEach((c, i) => view.setUint8(i, c));
  u32(4, 36 + samples * 2);
  [0x57, 0x41, 0x56, 0x45].forEach((c, i) => view.setUint8(8 + i, c));
  [0x66, 0x6d, 0x74, 0x20].forEach((c, i) => view.setUint8(12 + i, c));
  u32(16, 16);
  u16(20, 1);
  u16(22, 1);
  u32(24, RATE);
  u32(28, RATE * 2);
  u16(32, 2);
  u16(34, 16);
  [0x64, 0x61, 0x74, 0x61].forEach((c, i) => view.setUint8(36 + i, c));
  u32(40, samples * 2);
  for (let i = 0; i < samples; i++) {
    const v = Math.tanh(pcm[i] * 1.4) * 0.62;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 32767, true);
  }
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

let track: Howl | null = null;
/** The loop is meant to be playing (set by startMusic, cleared by stopMusic)
 *  — the source of truth, not Howler's `playing()`, which is still true
 *  during a fade-out and still false while a fresh track loads. */
let started = false;
let ducked = false;
/** startMusic() was called before the loop finished composing. */
let wanted = false;
let preparing = false;

/**
 * Composes the loop in the background — a few notes per idle moment, then
 * the WAV — so the first screen after a game's title never freezes while
 * ~17 s of audio is synthesised (measured at about 2 s of blocked main thread
 * on a throttled phone when it was done in one go). Called by
 * `useGameSession` as a game opens; idempotent.
 */
export function prepareMusic(): void {
  if (typeof window === "undefined" || track || preparing) return;
  preparing = true;
  const beat = 60 / BPM;
  const out = new Float32Array(Math.floor(BARS.length * beat * 4 * RATE));
  const notes = loopNotes();
  const step = (budget: IdleBudget) => {
    do {
      const n = notes.shift();
      if (n) addNote(out, n.start, n.freq, n.dur, n.vel);
    } while (notes.length > 0 && budget.timeRemaining() > 4);
    if (notes.length > 0) {
      whenIdle(step, 1500);
      return;
    }
    whenIdle(() => {
      preparing = false;
      try {
        track = new Howl({
          src: [toWavUrl(out)],
          format: ["wav"],
          loop: true,
          volume: MUSIC_VOLUME,
          html5: false,
        });
      } catch {
        return; // a later startMusic() will try again
      }
      if (wanted) startMusic();
    }, 1500);
  };
  whenIdle(step, 1500);
}

/** Start the shared background loop. Idempotent — safe to call on every
 *  screen change; a second call while it is meant to be playing is a no-op,
 *  so two loops can never overlap. */
export function startMusic(): void {
  if (started) return;
  const t = track;
  if (!t) {
    // still composing: play the moment it is ready
    wanted = true;
    prepareMusic();
    return;
  }
  wanted = false;
  started = true;
  const volume = ducked ? DUCKED_VOLUME : MUSIC_VOLUME;
  if (t.playing()) {
    // caught during stopMusic's fade-out (a game→game hop): bring it back up
    t.fade(t.volume(), volume, 200);
    return;
  }
  t.volume(volume);
  t.play();
}

/** Fade out and stop — call when a game unmounts. */
export function stopMusic(): void {
  wanted = false;
  if (!track || !started) return;
  started = false;
  const t = track;
  t.fade(t.volume(), 0, 350);
  setTimeout(() => {
    // only stop if nothing restarted it during the fade (game→game hop)
    if (!started) t.stop();
  }, 380);
}

/** Voice narration ducking — lowers music under speech, restores after. */
export function duckMusic(on: boolean): void {
  ducked = on;
  if (!track || !track.playing()) return;
  track.fade(track.volume(), on ? DUCKED_VOLUME : MUSIC_VOLUME, 180);
}
