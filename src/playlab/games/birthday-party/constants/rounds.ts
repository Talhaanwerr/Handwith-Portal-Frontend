/**
 * Birthday Party — every round, as data, and the check that proves it fair.
 *
 * One-to-one correspondence and numeral → quantity, 1 to 5, at a party in
 * Candy Land. Two modules of four rounds, each repeating ONE mechanic:
 *
 *   • "each"    — ONE FOR EACH. Friends sit at the party table, each with an
 *     empty plate; the tray holds MORE cupcakes than there are friends. Drag
 *     one cupcake onto every plate (a plate takes one), then tap how many
 *     cupcakes there are.
 *   • "candles" — CANDLES ON THE CAKE. The birthday friend wears a badge with
 *     their age; drag that many candles onto the cake and tap Done. Right:
 *     the candles light and the child blows them out one by one.
 *
 * Answers are DERIVED from the data (the number of guests, the age), never
 * stored twice, and `checkRounds()` proves every round can be played and won.
 */

import {
  ROUND_COUNT,
  distinct,
  inRange,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "each" | "candles";
export const MODULE_IDS: readonly ModuleId[] = ["each", "candles"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "each",
    name: "One for Each",
    tag: "One cupcake for every friend",
    accent: "#F06AA0",
    edge: "#C2457A",
    clip: "bdc-mode-each",
  },
  {
    id: "candles",
    name: "Candles on the Cake",
    tag: "Put on the right number of candles",
    accent: "#8E5BD9",
    edge: "#6A3FB0",
    clip: "bdc-mode-candles",
  },
];

export const VOICE: GameVoice = { welcome: "bdc-welcome", done: "bdc-done" };

/** The most things a tray holds — one row on the smallest phone. */
export const MAX_TRAY = 6;

/* ── One for Each ─────────────────────────────────────────────────────────── */

/** Letter Treats' round animal heads that sit nicely behind a table. */
export type GuestId = "bear" | "cat" | "dog" | "monkey" | "frog" | "tiger" | "lion" | "elephant";

export interface EachRound {
  /** Who sits at the table, left to right. One plate each. */
  guests: readonly GuestId[];
  /** Cupcakes on the tray — always more than the guests. */
  cupcakes: number;
  /** The three numbers to choose from at the end, in the order shown. */
  choices: readonly number[];
}

export const EACH_ROUNDS: readonly EachRound[] = [
  { guests: ["bear", "cat"], cupcakes: 3, choices: [2, 3, 1] },
  { guests: ["dog", "tiger", "frog"], cupcakes: 5, choices: [4, 2, 3] },
  { guests: ["monkey", "tiger", "elephant", "cat"], cupcakes: 5, choices: [4, 5, 3] },
  { guests: ["lion", "bear", "frog", "dog", "monkey"], cupcakes: 6, choices: [3, 5, 4] },
];

/** The answer: one cupcake for each friend. */
export const cupcakesWanted = (r: EachRound) => r.guests.length;

/* ── Candles on the Cake ──────────────────────────────────────────────────── */

/** The birthday friend: Play Street Pals' three, or Letter Treats' penguin. */
export type FriendId = "bo" | "ruby" | "bird" | "penguin";

export interface CandleRound {
  friend: FriendId;
  /** How old the friend is — the number of candles wanted. */
  age: number;
  /** Candles on the tray — always more than the age, so too many is possible. */
  candles: number;
}

export const CANDLE_ROUNDS: readonly CandleRound[] = [
  { friend: "bo", age: 2, candles: 4 },
  { friend: "ruby", age: 3, candles: 5 },
  { friend: "bird", age: 4, candles: 5 },
  { friend: "penguin", age: 5, candles: 6 },
];

/**
 * The order the cake's candle spots fill in: from the middle out, so two
 * candles stand in the centre of the cake rather than at its left edge.
 * Spot k of n is laid out k-th from the left.
 */
export function spotOrder(n: number): number[] {
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, k) => k).sort(
    (a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b
  );
}

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();

  need(EACH_ROUNDS.length === ROUND_COUNT, `each: ${EACH_ROUNDS.length} rounds`);
  need(CANDLE_ROUNDS.length === ROUND_COUNT, `candles: ${CANDLE_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  // one for each: 2–5 different friends, more cupcakes than friends (so the
  // tray never runs out and one is always left over), and a fair question
  EACH_ROUNDS.forEach((r, i) => {
    const n = cupcakesWanted(r);
    need(n >= 2 && n <= 5, `each ${i}: ${n} guests, not 2–5`);
    need(distinct(r.guests), `each ${i}: the same friend twice at one table`);
    need(r.cupcakes > n, `each ${i}: ${r.cupcakes} cupcakes is not more than ${n} friends`);
    need(r.cupcakes <= MAX_TRAY, `each ${i}: ${r.cupcakes} cupcakes will not fit the tray`);
    need(r.choices.length === 3 && distinct(r.choices), `each ${i}: not three different choices`);
    need(r.choices.every(inRange), `each ${i}: a choice outside 1–5`);
    need(r.choices.filter((c) => c === n).length === 1, `each ${i}: ${n} is not a choice`);
    need(
      r.choices.every((c) => Math.abs(c - n) <= 2),
      `each ${i}: a wrong choice is too far away to be a real question`
    );
  });
  need(
    EACH_ROUNDS.map(cupcakesWanted).join() === "2,3,4,5",
    "each: the tables should seat 2, 3, 4 and 5 friends"
  );
  need(
    new Set(EACH_ROUNDS.map((r) => r.choices.indexOf(cupcakesWanted(r)))).size >= 2,
    "each: the right number always stands in the same place"
  );
  noRepeats(
    "each",
    EACH_ROUNDS.map((r) => r.guests.join())
  );

  // candles: every age reachable with the tray, too many always possible,
  // every candle has a spot on the cake
  CANDLE_ROUNDS.forEach((r, i) => {
    need(r.age >= 2 && r.age <= 5, `candles ${i}: age ${r.age}, not 2–5`);
    need(r.candles >= r.age, `candles ${i}: only ${r.candles} candles for age ${r.age}`);
    need(r.candles > r.age, `candles ${i}: no spare candle — too many is never possible`);
    need(r.candles <= MAX_TRAY, `candles ${i}: ${r.candles} candles will not fit the tray`);
    const order = spotOrder(r.candles);
    need(
      [...order].sort((a, b) => a - b).join() ===
        Array.from({ length: r.candles }, (_, k) => k).join(),
      `candles ${i}: the spot order is not every spot once`
    );
  });
  need(
    CANDLE_ROUNDS.map((r) => r.age).join() === "2,3,4,5",
    "candles: the friends should be 2, 3, 4 and 5"
  );
  need(distinct(CANDLE_ROUNDS.map((r) => r.friend)), "candles: the same friend twice");

  return problems;
}
