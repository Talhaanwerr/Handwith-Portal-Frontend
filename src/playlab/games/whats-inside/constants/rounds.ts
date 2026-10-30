/**
 * What's Inside? — every round, as data, and the check that proves it fair.
 *
 * RECOGNITION and PREDICTION with treasure chests in the pirate cove. Two
 * modules of four rounds, each ONE mechanic:
 *
 *   • "peek"  — PEEK & GUESS (tap a picture). A chest's lid is lifted a
 *     crack and the top of a toy peeks out. Tap the toy it is: the chest
 *     opens and the toy pops out. A wrong guess is crossed out and the toy
 *     peeks out a little MORE — a bigger hint each time, never a dead end.
 *   • "where" — WHERE DID IT GO? (tap a chest). A toy hops into one of 2–3
 *     chests and the lids close; from round 3 two chests slowly swap places
 *     once. Tap the chest the toy is in. A wrong chest opens empty.
 *
 * Answers are DERIVED from the data (the right picture is the round's toy;
 * the right chest is the one the toy hopped into, wherever the swap took
 * it), never stored twice, and `checkRounds()` proves every round fair.
 */

import type { PictureId } from "@games/blend-read/components/PictureArt";
import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  shuffled,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "peek" | "where";
export const MODULE_IDS: readonly ModuleId[] = ["peek", "where"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "peek",
    name: "Peek & Guess",
    tag: "Tap the toy in the chest",
    accent: "#2E86AB",
    edge: "#155E86",
    clip: "wsi-mode-peek",
  },
  {
    id: "where",
    name: "Where Did It Go?",
    tag: "Watch, then tap the chest",
    accent: "#F08A24",
    edge: "#C06A12",
    clip: "wsi-mode-where",
  },
];

export const VOICE: GameVoice = { welcome: "wsi-welcome", done: "wsi-done" };

/* ── The toys ─────────────────────────────────────────────────────────────── */

/** Toys a child can name — every one has a recorded `name-*` clip. */
export type ToyId = "ball" | "drum" | "train" | "bus" | "cat" | "dog" | "hat";

/** Each toy's picture (the portal's Twemoji set). */
export const TOY_PICTURE: Record<ToyId, PictureId> = {
  ball: "ball",
  drum: "drum",
  train: "train",
  bus: "bus",
  cat: "cat",
  dog: "dog",
  hat: "hat",
};

/** The toy's name, said when it pops out. */
export const nameClip = (t: ToyId) => `name-${t}`;

/** What the top of each picture looks like — all a peek shows at first. Two
 *  toys with the same top in one round would be a guess, not a find. */
const TOP: Record<ToyId, string> = {
  ball: "a round dome",
  drum: "two drumsticks",
  train: "a chimney",
  bus: "a flat roof",
  cat: "pointy ears",
  dog: "floppy ears",
  hat: "a tall black crown",
};

/* ── Peek & Guess ─────────────────────────────────────────────────────────── */

export interface PeekRound {
  /** The toy in the chest. */
  toy: ToyId;
  /** The other pictures to choose from. */
  others: readonly ToyId[];
}

/** How many pictures to choose from, round by round. */
export const PEEK_CHOICES = [2, 3, 3, 3] as const;

export const PEEK_ROUNDS: readonly PeekRound[] = [
  { toy: "cat", others: ["ball"] },
  { toy: "train", others: ["ball", "dog"] },
  { toy: "drum", others: ["hat", "bus"] },
  { toy: "dog", others: ["cat", "train"] },
];

/** How much of the toy shows above the rim (a share of its height), after
 *  0, 1 and 2 wrong guesses — the hint grows. */
export const PEEKS = [0.34, 0.52, 0.7] as const;
/** How far the lid is lifted for each peek (degrees, about its hinge). */
export const PEEK_LIDS = [-26, -36, -48] as const;
/** Wide open. */
export const OPEN_LID = -82;

/** The peek after `misses` wrong guesses. */
export const peekStep = (misses: number) => Math.min(misses, PEEKS.length - 1);

/** The pictures under the chest, left to right, in a fixed shuffle. */
export function peekChoices(round: number): ToyId[] {
  const r = PEEK_ROUNDS[round];
  const all = [r.toy, ...r.others];
  return shuffled(
    all.map((_, i) => i),
    5 + round * 7
  ).map((i) => all[i]);
}

/* ── Where Did It Go? ─────────────────────────────────────────────────────── */

export interface WhereRound {
  toy: ToyId;
  /** How many chests stand on the sand. */
  chests: number;
  /** The place (left to right, from 0) of the chest the toy hops into. */
  hideIn: number;
  /** Two places whose chests slowly swap once the lids are shut, or none. */
  swap: readonly [number, number] | null;
}

export const WHERE_ROUNDS: readonly WhereRound[] = [
  { toy: "ball", chests: 2, hideIn: 1, swap: null },
  { toy: "drum", chests: 3, hideIn: 0, swap: null },
  { toy: "train", chests: 3, hideIn: 2, swap: [1, 2] },
  { toy: "dog", chests: 3, hideIn: 0, swap: [0, 2] },
];

/** The ask once the lids are shut. */
export const whereClip = (t: ToyId) => `wsi-where-${t}`;

/** Where each chest stands once the swap (if any) is over: chest `k` started
 *  at place `k`. */
export function finalPlaces(r: WhereRound): number[] {
  const places = Array.from({ length: r.chests }, (_, k) => k);
  if (r.swap) {
    const [a, b] = r.swap;
    places[a] = b;
    places[b] = a;
  }
  return places;
}

/** The chest the toy is in (its starting place names it), and where it
 *  stands when the child is asked. */
export const answerChest = (r: WhereRound) => r.hideIn;
export const answerPlace = (r: WhereRound) => finalPlaces(r)[r.hideIn];

/** The beats of a Where round, in ms. */
export const HOP_MS = 950;
export const SINK_MS = 500;
/** The swap is slow on purpose: easy to follow with the eyes. */
export const SWAP_MS = 2000;

/* ── The self-check ───────────────────────────────────────────────────────── */

/**
 * Every problem with the round data, or an empty list. Run by the harness.
 * `hasClip` (the manifest) checks the toys' names are recorded.
 */
export function checkRounds(hasClip?: (id: string) => boolean): string[] {
  const { problems, need, noRepeats } = roundChecker();
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");
  need(PEEK_ROUNDS.length === ROUND_COUNT, `peek: ${PEEK_ROUNDS.length} rounds`);
  need(WHERE_ROUNDS.length === ROUND_COUNT, `where: ${WHERE_ROUNDS.length} rounds`);
  need(PEEKS.length === PEEK_LIDS.length, "peek: a hint without a lid");
  need(
    PEEKS.every((p, i) => p > 0.25 && p < 0.8 && (i === 0 || p > PEEKS[i - 1])),
    "peek: each hint must show more than the last, and never the whole toy"
  );

  const toys = new Set<ToyId>();
  // Peek & Guess: the toy is one of the pictures exactly once, and every
  // picture's top looks different
  const spots: number[] = [];
  PEEK_ROUNDS.forEach((r, i) => {
    const name = `peek ${i}`;
    const choices = peekChoices(i);
    choices.forEach((t) => toys.add(t));
    need(choices.length === PEEK_CHOICES[i], `${name}: ${choices.length} pictures`);
    need(choices.filter((t) => t === r.toy).length === 1, `${name}: the toy is not there once`);
    need(distinct(choices), `${name}: the same picture twice`);
    need(distinct(choices.map((t) => TOP[t])), `${name}: two pictures with the same top`);
    spots.push(choices.indexOf(r.toy));
  });
  need(new Set(spots).size > 1, "peek: the answer is always in the same place");
  noRepeats(
    "peek",
    PEEK_ROUNDS.map((r) => r.toy)
  );

  // Where Did It Go?: 2, 3, 3, 3 chests; a swap only from round 3, always
  // moving the toy's chest, so watching it matters
  const places: number[] = [];
  WHERE_ROUNDS.forEach((r, i) => {
    const name = `where ${i}`;
    toys.add(r.toy);
    need(r.chests === [2, 3, 3, 3][i], `${name}: ${r.chests} chests`);
    need(r.hideIn >= 0 && r.hideIn < r.chests, `${name}: hidden in no chest`);
    need((r.swap !== null) === i >= 2, `${name}: a swap only (and always) from round 3`);
    if (r.swap) {
      const [a, b] = r.swap;
      need(a !== b && [a, b].every((p) => p >= 0 && p < r.chests), `${name}: a bad swap`);
      need(r.swap.includes(r.hideIn), `${name}: the swap does not move the toy's chest`);
      need(answerPlace(r) !== r.hideIn, `${name}: after the swap the toy is where it was`);
    }
    const final = finalPlaces(r);
    need(distinct(final) && final.length === r.chests, `${name}: two chests in one place`);
    need(
      final.indexOf(answerPlace(r)) === answerChest(r),
      `${name}: the chest at the answer's place is not the toy's chest`
    );
    places.push(answerPlace(r));
  });
  need(new Set(places).size > 1, "where: the toy always ends in the same place");
  noRepeats(
    "where",
    WHERE_ROUNDS.map((r) => r.toy)
  );
  need(SWAP_MS >= 1500, "where: the swap is too fast to follow");

  if (hasClip) for (const t of toys) need(hasClip(nameClip(t)), `toys: ${t} has no recorded name`);

  return problems;
}
