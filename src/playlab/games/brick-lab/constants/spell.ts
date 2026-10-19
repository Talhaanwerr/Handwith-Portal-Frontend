import type { BrickColor, BrickKind } from "@games/brick-lab/engine/geometry";
import type { PictureId } from "@games/blend-read/components/PictureArt";
import type { Plate } from "@games/brick-lab/engine/world";
import { unit } from "@shared/utils/hash";

/**
 * SPELL BRICKS — the words. Every word is three letters, has a picture in
 * the shared Twemoji set and a recorded whole-word clip; every letter has a
 * recorded SOUND (`phonics-*`). `checkSpell` proves all of that.
 */
export interface SpellWord {
  text: string;
  picture: PictureId;
  clip: string;
}

export const SPELL_WORDS: SpellWord[] = [
  { text: "cat", picture: "cat", clip: "name-cat" },
  { text: "sun", picture: "sun", clip: "name-sun" },
  { text: "dog", picture: "dog", clip: "name-dog" },
  { text: "hat", picture: "hat", clip: "name-hat" },
  { text: "bus", picture: "bus", clip: "name-bus" },
  { text: "cup", picture: "cup", clip: "name-cup" },
  { text: "fox", picture: "fox", clip: "name-fox" },
  { text: "hen", picture: "hen", clip: "name-hen" },
  { text: "bed", picture: "bed", clip: "word-bed" },
  { text: "box", picture: "box", clip: "name-box" },
];

export const SPELL_W = 2;
export const SPELL_Z = 1;
export const SPELL_PLATE: Plate = { w: 8, d: 4 };

const BRICK_COLORS: BrickColor[] = [
  "red",
  "yellow",
  "blue",
  "green",
  "orange",
  "purple",
  "teal",
  "pink",
];

/** A letter's brick colour — mixed per word, so colour never gives the answer. */
export function letterColor(letter: string, wi: number): BrickColor {
  return BRICK_COLORS[Math.floor(unit(letter.charCodeAt(0) * 31 + wi * 7) * BRICK_COLORS.length)];
}

const SPARE = "abcdefghilmnoprstu";

/** The word's letters plus two that are not in it, in a fixed mixed order. */
export function spellChoices(text: string, wi: number): BrickKind[] {
  const letters = text.split("");
  const spares: string[] = [];
  for (let k = 0; spares.length < 2 && k < 50; k++) {
    const c = SPARE[Math.floor(unit(wi * 13 + k) * SPARE.length)];
    if (!letters.includes(c) && !spares.includes(c)) spares.push(c);
  }
  const all = [...letters, ...spares];
  const order = all.map((l, i) => ({ l, r: unit(wi * 101 + i * 17) })).sort((a, b) => a.r - b.r);
  return order.map(({ l }) => ({ w: SPELL_W, d: SPELL_W, color: letterColor(l, wi), tag: l }));
}

/** Every word fits the plate, has no repeated letter (a tray brick per letter)
 *  and is fully voiced. `has` is the manifest lookup. */
export function checkSpell(has: (id: string) => boolean): string[] {
  const errs: string[] = [];
  for (const [wi, w] of SPELL_WORDS.entries()) {
    if (1 + w.text.length * SPELL_W > SPELL_PLATE.w) errs.push(`${w.text}: too long for the plate`);
    if (new Set(w.text).size !== w.text.length) errs.push(`${w.text}: repeats a letter`);
    if (!has(w.clip)) errs.push(`${w.text}: no clip ${w.clip}`);
    for (const l of w.text) if (!has(`phonics-${l}`)) errs.push(`${w.text}: no sound for ${l}`);
    const tray = spellChoices(w.text, wi);
    if (tray.length !== w.text.length + 2) errs.push(`${w.text}: wrong number of choices`);
  }
  return errs;
}
