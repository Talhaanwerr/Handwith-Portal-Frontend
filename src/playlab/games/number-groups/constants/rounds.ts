/**
 * Count & Match — every round, as data, and the check that proves it fair.
 *
 * A NUMBER and the QUANTITY it names, 1 to 5, with real things to count. Two
 * modules of four rounds, each repeating ONE mechanic:
 *
 *   • "plates" — COUNT THE PLATES (tap). Three plates of fruit; tap the one
 *     with the number asked for.
 *   • "cards"  — NUMBER CARDS (drag a numeral to a group). Three tall cards,
 *     each with a group and an empty slot; drag each numeral to its card.
 *
 * Answers are DERIVED from the data, never stored twice, and `checkRounds()`
 * proves every round has exactly one right answer and no two rounds repeat.
 * (Find the Number and Group Boxes are Number Hunt's, in `@games/number-hunt`.)
 */

import type { Thing } from "@games/number-match/constants/rounds";
import {
  ROUND_COUNT,
  distinct,
  inRange,
  roundChecker,
  shuffled,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "plates" | "cards";
export const MODULE_IDS: readonly ModuleId[] = ["plates", "cards"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "plates",
    name: "Count the Plates",
    tag: "Tap the plate",
    accent: "#E5484D",
    edge: "#B8363A",
    clip: "count-mode-plates",
  },
  {
    id: "cards",
    name: "Number Cards",
    tag: "Drag the number",
    accent: "#8E5BD9",
    edge: "#6A3FB0",
    clip: "count-mode-cards",
  },
];

export const VOICE: GameVoice = { welcome: "count-welcome", done: "count-done" };

/* ── Count the Plates ─────────────────────────────────────────────────────── */

/** Letter Treats' fruit (VOCAB_ART keys). */
export type Fruit = "apple" | "orange" | "lemon" | "banana" | "pineapple";

export interface PlateRound {
  plates: readonly { fruit: Fruit; count: number }[];
  /** The number asked for — exactly one plate holds this many. */
  target: number;
}

export const PLATE_ROUNDS: readonly PlateRound[] = [
  {
    plates: [
      { fruit: "lemon", count: 4 },
      { fruit: "apple", count: 3 },
      { fruit: "pineapple", count: 1 },
    ],
    target: 3,
  },
  {
    plates: [
      { fruit: "orange", count: 2 },
      { fruit: "apple", count: 1 },
      { fruit: "banana", count: 5 },
    ],
    target: 5,
  },
  {
    plates: [
      { fruit: "lemon", count: 2 },
      { fruit: "apple", count: 4 },
      { fruit: "orange", count: 5 },
    ],
    target: 2,
  },
  {
    plates: [
      { fruit: "banana", count: 3 },
      { fruit: "orange", count: 4 },
      { fruit: "pineapple", count: 2 },
    ],
    target: 4,
  },
];

/** The plate that is the answer, derived. */
export function plateAnswer(r: PlateRound): number {
  return r.plates.findIndex((p) => p.count === r.target);
}

/* ── Number Cards ─────────────────────────────────────────────────────────── */

export interface CardRound {
  /** What the cards hold — Number Pals' drawings. */
  thing: Thing;
  /** How many on each card, left to right. All different. */
  counts: readonly number[];
}

export const CARD_ROUNDS: readonly CardRound[] = [
  { thing: "flower", counts: [2, 4, 1] },
  { thing: "star", counts: [3, 5, 2] },
  { thing: "duck", counts: [5, 1, 3] },
  { thing: "fish", counts: [4, 2, 5] },
];

/** The numerals under the cards, shuffled. */
export function cardTray(r: number): number[] {
  return shuffled(CARD_ROUNDS[r].counts, 11 + r);
}

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, covers, noRepeats, trayOk } = roundChecker();

  need(PLATE_ROUNDS.length === ROUND_COUNT, `plates: ${PLATE_ROUNDS.length} rounds`);
  need(CARD_ROUNDS.length === ROUND_COUNT, `cards: ${CARD_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  // plates: three plates, all different counts, the target on exactly one
  let seen = new Set<number>();
  PLATE_ROUNDS.forEach((r, i) => {
    const counts = r.plates.map((p) => p.count);
    counts.forEach((c) => seen.add(c));
    need(r.plates.length === 3, `plates ${i}: not three plates`);
    need(counts.every(inRange), `plates ${i}: a count outside 1–5`);
    need(distinct(counts), `plates ${i}: two plates hold the same number`);
    need(counts.filter((c) => c === r.target).length === 1, `plates ${i}: target not on one plate`);
    need(plateAnswer(r) >= 0, `plates ${i}: no answer`);
  });
  covers("plates", seen);
  noRepeats(
    "plates",
    PLATE_ROUNDS.map((r) => `${r.target}|${r.plates.map((p) => p.fruit + p.count).join()}`)
  );
  need(distinct(PLATE_ROUNDS.map((r) => r.target)), "plates: the same number is asked for twice");

  // cards: three different counts; the tray is the same numbers, reordered
  seen = new Set();
  CARD_ROUNDS.forEach((r, i) => {
    r.counts.forEach((c) => seen.add(c));
    need(r.counts.length === 3, `cards ${i}: not three cards`);
    need(r.counts.every(inRange), `cards ${i}: a count outside 1–5`);
    need(distinct(r.counts), `cards ${i}: two cards hold the same number`);
    trayOk(`cards ${i}`, cardTray(i), r.counts);
  });
  covers("cards", seen);
  noRepeats(
    "cards",
    CARD_ROUNDS.map((r) => r.thing + r.counts.join())
  );

  return problems;
}
