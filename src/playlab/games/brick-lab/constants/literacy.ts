import type { BrickColor, BrickKind } from "@games/brick-lab/engine/geometry";
import type { PictureId } from "@games/blend-read/components/PictureArt";
import { unit } from "@shared/utils/hash";

/**
 * FIRST SOUND and ABC TOWER — the data for the two letter games. Every word
 * has a picture and a recorded name, every letter a recorded sound
 * (`phonics-*`) and name (`letter-*`); `checkLiteracy` proves it.
 */

const INK_COLORS: BrickColor[] = ["red", "blue", "green", "orange", "purple", "teal", "pink"];

/** A letter brick's colour — fixed per letter and round, never a clue. */
export function inkColor(letter: string, round: number): BrickColor {
  return INK_COLORS[Math.floor(unit(letter.charCodeAt(0) * 17 + round * 11) * INK_COLORS.length)];
}

/** Three letter bricks: the answer and two others, in a fixed mixed order. */
export function threeLetters(answer: string, pool: string, round: number): BrickKind[] {
  const others: string[] = [];
  for (let k = 0; others.length < 2 && k < 60; k++) {
    const c = pool[Math.floor(unit(round * 29 + k * 7) * pool.length)];
    if (c !== answer && !others.includes(c)) others.push(c);
  }
  const all = [answer, ...others];
  const r = round % 3;
  return [...all.slice(r), ...all.slice(0, r)].map((l) => ({
    w: 2,
    d: 2,
    color: inkColor(l, round),
    tag: l,
  }));
}

/* ── First Sound ─────────────────────────────────────────────────────── */

export interface SoundWord {
  word: string;
  picture: PictureId;
  clip: string;
}

export const SOUND_WORDS: SoundWord[] = [
  { word: "ball", picture: "ball", clip: "name-ball" },
  { word: "sun", picture: "sun", clip: "name-sun" },
  { word: "cat", picture: "cat", clip: "name-cat" },
  { word: "apple", picture: "apple", clip: "name-apple" },
  { word: "dog", picture: "dog", clip: "name-dog" },
  { word: "mouse", picture: "mouse", clip: "name-mouse" },
  { word: "hat", picture: "hat", clip: "name-hat" },
  { word: "lion", picture: "lion", clip: "name-lion" },
  { word: "fox", picture: "fox", clip: "name-fox" },
  { word: "whale", picture: "whale", clip: "name-whale" },
];

/** Wrong choices come from these: clear, different-sounding letters. */
export const SOUND_POOL = "abcdfhlmnpstw";

/* ── ABC Tower ───────────────────────────────────────────────────────── */

/** Each round builds one tower: the alphabet in five runs. */
export const ABC_RUNS = ["abcde", "fghij", "klmno", "pqrst", "uvwxyz"] as const;

/** The three ways to play ABC Tower: towers of 3, 5 or 10 letters in a row. */
export const ABC_RUN_SETS: Record<"three" | "five" | "ten", readonly string[]> = {
  three: ["abc", "def", "ghi", "jkl", "mno", "pqr", "stu", "vwx", "yz"],
  five: ABC_RUNS,
  ten: ["abcdefghij", "klmnopqrst", "uvwxyz"],
};

/* ── Self-check ──────────────────────────────────────────────────────── */

export function checkLiteracy(has: (id: string) => boolean): string[] {
  const errs: string[] = [];
  for (const [i, w] of SOUND_WORDS.entries()) {
    const first = w.word[0];
    if (!has(w.clip)) errs.push(`${w.word}: no clip`);
    if (!has(`phonics-${first}`)) errs.push(`${w.word}: no sound for ${first}`);
    const tray = threeLetters(first, SOUND_POOL, i);
    if (tray.filter((k) => k.tag === first).length !== 1) errs.push(`${w.word}: answer not once`);
    if (new Set(tray.map((k) => k.tag)).size !== 3) errs.push(`${w.word}: repeated choice`);
  }
  for (const [set, runs] of Object.entries(ABC_RUN_SETS))
    if (runs.join("") !== "abcdefghijklmnopqrstuvwxyz") errs.push(`abc ${set}: runs skip a letter`);
  for (const l of ABC_RUNS.join("")) if (!has(`letter-${l}`)) errs.push(`abc: no name for ${l}`);
  return errs;
}
