/**
 * Magic Hat Swap — rhyme by CHANGING one sound. A word card stands in the
 * wizard's tower ("cat"); the hat wishes for a new word ("Can you make…
 * hat?"). Wooden letter blocks wait below; drag the right one into the magic
 * hat and — sparkle — the card's first letter swaps (c → h), its picture
 * becomes a hat and the word is said. At the end of a round the whole family
 * stands on the card in a row: "cat, hat, rat — They all rhyme!"
 *
 * Six rounds, one word family each, one module. Every word is Rhyme Time's
 * (`rhyme-or-not/constants/words`): each has a picture and a recording, and
 * every swap changes ONLY the first letter.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { WORDS, checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "swap";
export const MODULE_IDS: readonly ModuleId[] = ["swap"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "swap",
    name: "Magic Hat Swap",
    tag: "Drag a letter into the hat to make a new word",
    accent: "#7B4FD6",
    edge: "#5A35A8",
    clip: "mht-mode-swap",
  },
];

export const VOICE: GameVoice = { welcome: "mht-welcome", done: "mht-done" };

/** "Can you make" — the wished-for word follows. */
export const MAKE = "mht-make";
/** Said at the end of a round, after the whole family. */
export const ALL_RHYME = "mht-all-rhyme";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const HAT_ROUNDS = 6;

/** The letter's SOUND (manifest `phonics-*`), said when its block is picked up. */
export const soundOf = (letter: string): string => `phonics-${letter}`;

export interface Swap {
  /** The word the hat wishes for: one new first letter on the card's word. */
  to: Word;
  /** The blocks, left to right: one is the new first letter. */
  tiles: readonly string[];
}

export interface HatRound {
  start: Word;
  swaps: readonly Swap[];
}

export const ROUNDS: readonly HatRound[] = [
  {
    start: "cat",
    swaps: [
      { to: "hat", tiles: ["h", "s"] },
      { to: "rat", tiles: ["m", "r"] },
    ],
  },
  {
    start: "van",
    swaps: [
      { to: "can", tiles: ["d", "c"] },
      { to: "fan", tiles: ["f", "l"] },
    ],
  },
  {
    start: "hen",
    swaps: [
      { to: "pen", tiles: ["s", "p", "b"] },
      { to: "ten", tiles: ["t", "m", "d"] },
    ],
  },
  { start: "bug", swaps: [{ to: "mug", tiles: ["k", "f", "m"] }] },
  { start: "cap", swaps: [{ to: "map", tiles: ["m", "s", "l"] }] },
  { start: "pin", swaps: [{ to: "bin", tiles: ["k", "b", "g"] }] },
];

/** The word on the card after `step` swaps. */
export const wordAt = (r: HatRound, step: number): Word =>
  step <= 0 ? r.start : r.swaps[Math.min(step, r.swaps.length) - 1].to;

/** The whole family, in the order it was made. */
export const familyOf = (r: HatRound): Word[] => [r.start, ...r.swaps.map((s) => s.to)];

/** Which block is the right one (derived, never stored twice). */
export const answerOf = (s: Swap): number => s.tiles.indexOf(s.to[0]);

/** Self-check: every swap changes only the first letter into a word that has
 *  a picture and a recording and rhymes with the last; exactly one right
 *  block, never the letter already there; the right block moves about. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === HAT_ROUNDS, `${ROUNDS.length} rounds`);
  need(ROUNDS.length >= ROUND_COUNT, "fewer rounds than the kit plays");
  const places: number[] = [];
  ROUNDS.forEach((r, i) => {
    need(r.swaps.length >= 1, `round ${i}: no swap`);
    need(distinct(familyOf(r)), `round ${i}: a word twice`);
    r.swaps.forEach((s, k) => {
      const from = wordAt(r, k);
      need(s.to in WORDS, `round ${i}: ${s.to} is not a rhyme word`);
      need(rhymes(from, s.to), `round ${i}: ${from} and ${s.to} do not rhyme`);
      need(
        s.to.slice(1) === from.slice(1),
        `round ${i}: ${from} → ${s.to} is not a first-letter swap`
      );
      need(s.to.length === from.length, `round ${i}: ${from} → ${s.to} changes length`);
      need(distinct(s.tiles), `round ${i}: a block twice`);
      need(s.tiles.filter((t) => t === s.to[0]).length === 1, `round ${i}: not one right block`);
      need(!s.tiles.includes(from[0]), `round ${i}: the card's own letter is a block`);
      need(
        s.tiles.every((t) => /^[a-z]$/.test(t)),
        `round ${i}: a block is not one letter`
      );
      places.push(answerOf(s));
    });
  });
  need(new Set(places).size >= 3, "the right block is always in the same place");
  return problems;
}
