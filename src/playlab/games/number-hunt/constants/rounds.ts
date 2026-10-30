/**
 * Number Hunt — every round, as data, and the check that proves it fair.
 *
 * Numerals out in the world and groups to put away, 1 to 5. Two modules of
 * four rounds, each repeating ONE mechanic:
 *
 *   • "find"  — FIND THE NUMBER (tap all). Six things in the playroom wear a
 *     numeral; tap every one that wears the number asked for.
 *   • "boxes" — GROUP BOXES (drag a group to a numeral). Three numbered
 *     boxes; drag each quantity card into the box with its number.
 *
 * Answers are DERIVED from the data, never stored twice, and `checkRounds()`
 * proves every round has its answers and no two rounds repeat. The module
 * plumbing (rounds per module, stars, tray shuffle, check helpers) is Count &
 * Match's, imported from `@games/number-groups/constants/kit`.
 */

import type { PictureId } from "@games/blend-read/components/PictureArt";
import {
  ROUND_COUNT,
  distinct,
  inRange,
  roundChecker,
  shuffled,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "find" | "boxes";
export const MODULE_IDS: readonly ModuleId[] = ["find", "boxes"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "find",
    name: "Find the Number",
    tag: "Tap every one",
    accent: "#2E7FD6",
    edge: "#1F5FA6",
    clip: "numhunt-mode-find",
  },
  {
    id: "boxes",
    name: "Group Boxes",
    tag: "Drag the card",
    accent: "#F08A24",
    edge: "#C06A12",
    clip: "numhunt-mode-boxes",
  },
];

export const VOICE: GameVoice = { welcome: "numhunt-welcome", done: "numhunt-done" };

/* ── Find the Number ──────────────────────────────────────────────────────── */

export interface FindRound {
  /** The number to find. It is on 2–3 of the objects. */
  target: number;
  /** The six things in the room, and the numeral each one wears. */
  objects: readonly { picture: PictureId; tag: number }[];
}

export const FIND_ROUNDS: readonly FindRound[] = [
  {
    target: 5,
    objects: [
      { picture: "ball", tag: 5 },
      { picture: "drum", tag: 2 },
      { picture: "box", tag: 3 },
      { picture: "clock", tag: 5 },
      { picture: "cup", tag: 1 },
      { picture: "hat", tag: 4 },
    ],
  },
  {
    target: 2,
    objects: [
      { picture: "train", tag: 3 },
      { picture: "shoe", tag: 2 },
      { picture: "bowl", tag: 4 },
      { picture: "toys", tag: 1 },
      { picture: "ball", tag: 2 },
      { picture: "cake", tag: 2 },
    ],
  },
  {
    target: 4,
    objects: [
      { picture: "cup", tag: 4 },
      { picture: "bus", tag: 1 },
      { picture: "drum", tag: 4 },
      { picture: "hat", tag: 5 },
      { picture: "telephone", tag: 3 },
      { picture: "box", tag: 2 },
    ],
  },
  {
    target: 3,
    objects: [
      { picture: "clock", tag: 1 },
      { picture: "toys", tag: 3 },
      { picture: "shoe", tag: 5 },
      { picture: "train", tag: 2 },
      { picture: "cake", tag: 4 },
      { picture: "bowl", tag: 3 },
    ],
  },
];

/** Which objects are the answers, derived. */
export function findTargets(r: FindRound): number[] {
  return r.objects.flatMap((o, i) => (o.tag === r.target ? [i] : []));
}

/* ── Group Boxes ──────────────────────────────────────────────────────────── */

/** Key Quest's chunky classroom things, or Pond Numbers' dots in purple. */
export type GroupLook = "book" | "ball" | "dots";

export interface BoxRound {
  /** What the quantity cards show: classroom things, or purple dots. */
  look: GroupLook;
  /** The three numbers — the boxes stand in this order, smallest first. */
  numbers: readonly number[];
}

export const BOX_ROUNDS: readonly BoxRound[] = [
  { look: "book", numbers: [1, 2, 4] },
  { look: "ball", numbers: [3, 4, 5] },
  { look: "dots", numbers: [1, 3, 5] },
  { look: "dots", numbers: [2, 4, 5] },
];

/** The quantity cards over the boxes, shuffled. */
export function boxTray(r: number): number[] {
  return shuffled(BOX_ROUNDS[r].numbers, 23 + r);
}

/** The dot colour on the dot cards. */
export const DOT_PURPLE = "#8E5BD9";

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, covers, noRepeats, trayOk } = roundChecker();

  need(FIND_ROUNDS.length === ROUND_COUNT, `find: ${FIND_ROUNDS.length} rounds`);
  need(BOX_ROUNDS.length === ROUND_COUNT, `boxes: ${BOX_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  // find: six objects, the target on 2–3 of them, the rest at least two others
  let seen = new Set<number>();
  FIND_ROUNDS.forEach((r, i) => {
    const tags = r.objects.map((o) => o.tag);
    tags.forEach((t) => seen.add(t));
    const hits = findTargets(r).length;
    need(r.objects.length === 6, `find ${i}: not six objects`);
    need(tags.every(inRange), `find ${i}: a numeral outside 1–5`);
    need(hits >= 2 && hits <= 3, `find ${i}: target appears ${hits} times, not 2–3`);
    need(distinct(r.objects.map((o) => o.picture)), `find ${i}: the same object twice in one room`);
    need(
      new Set(tags.filter((t) => t !== r.target)).size >= 2,
      `find ${i}: the distractors should be at least two different numbers`
    );
  });
  covers("find", seen);
  need(distinct(FIND_ROUNDS.map((r) => r.target)), "find: the same number is asked for twice");

  // boxes: three different numbers, smallest first; the tray reordered
  seen = new Set();
  BOX_ROUNDS.forEach((r, i) => {
    r.numbers.forEach((n) => seen.add(n));
    need(r.numbers.length === 3, `boxes ${i}: not three boxes`);
    need(r.numbers.every(inRange), `boxes ${i}: a number outside 1–5`);
    need(distinct(r.numbers), `boxes ${i}: two boxes with the same number`);
    need(
      r.numbers.every((n, k) => k === 0 || n > r.numbers[k - 1]),
      `boxes ${i}: boxes not smallest first`
    );
    trayOk(`boxes ${i}`, boxTray(i), r.numbers);
  });
  covers("boxes", seen);
  noRepeats(
    "boxes",
    BOX_ROUNDS.map((r) => r.look + r.numbers.join())
  );
  need(
    BOX_ROUNDS.some((r) => r.look !== "dots") && BOX_ROUNDS.some((r) => r.look === "dots"),
    "boxes: both things and dots should be played"
  );

  return problems;
}
