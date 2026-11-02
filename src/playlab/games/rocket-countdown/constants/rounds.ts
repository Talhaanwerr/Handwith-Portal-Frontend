/**
 * Rocket Countdown — every round, as data, and the check that proves it fair.
 *
 * Counting BACKWARDS and numeral → quantity, 1 to 5, at a launch pad in
 * space. Two modules of four rounds, each repeating ONE mechanic:
 *
 *   • "count" — COUNT DOWN. Big numbered stars hang on the launch tower in
 *     mixed places; tap them from the biggest down to 1. Each one switches a
 *     rocket light on; at 1 the rocket blasts off and lands on the planet.
 *   • "fuel"  — FUEL THE ROCKET. The rocket's fuel window shows a number;
 *     drag that many star cells into the tank and pull the Go! lever.
 *
 * Answers are DERIVED from the data (the order to tap, the fuel needed),
 * never stored twice, and `checkRounds()` proves every round can be won.
 */

import {
  ROUND_COUNT,
  distinct,
  inRange,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "count" | "fuel";
export const MODULE_IDS: readonly ModuleId[] = ["count", "fuel"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "count",
    name: "Count Down",
    tag: "Tap the stars from the biggest number",
    accent: "#2E7FD6",
    edge: "#1F5FA6",
    clip: "rkc-mode-count",
  },
  {
    id: "fuel",
    name: "Fuel the Rocket",
    tag: "Put in the right number of star cells",
    accent: "#F08A24",
    edge: "#C06A12",
    clip: "rkc-mode-fuel",
  },
];

export const VOICE: GameVoice = { welcome: "rkc-welcome", done: "rkc-done" };

/* ── Count Down ───────────────────────────────────────────────────────────── */

/** The tower's star places: two columns, three rows, read top-left first. */
export const TOWER_SLOTS = 6;

export interface CountRound {
  /** The number on each tower place (`null` = no star there). */
  tower: readonly (number | null)[];
}

export const COUNT_ROUNDS: readonly CountRound[] = [
  { tower: [null, 2, 3, null, null, 1] },
  { tower: [1, null, 4, 2, null, 3] },
  { tower: [3, 5, null, 1, 4, 2] },
  { tower: [2, 4, 5, null, 1, 3] },
];

/** The biggest number — where the countdown starts. */
export const startOf = (r: CountRound) => Math.max(...r.tower.map((n) => n ?? 0));

/** The tower places in the order to tap them: biggest number first. */
export function tapOrder(r: CountRound): number[] {
  return r.tower
    .flatMap((n, slot) => (n === null ? [] : [{ n, slot }]))
    .sort((a, b) => b.n - a.n)
    .map((s) => s.slot);
}

/* ── Fuel the Rocket ──────────────────────────────────────────────────────── */

/** Places in the fuel tank — the same tank every round. */
export const TANK = 6;

export interface FuelRound {
  /** The number in the fuel window: the cells the rocket needs. */
  need: number;
  /** Star cells in the crate — always more than needed. */
  cells: number;
}

export const FUEL_ROUNDS: readonly FuelRound[] = [
  { need: 2, cells: 4 },
  { need: 3, cells: 5 },
  { need: 4, cells: 5 },
  { need: 5, cells: 6 },
];

/** The automatic countdown after the lever is pulled: 3, 2, 1… */
export const COUNTDOWN = [3, 2, 1] as const;

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();

  need(COUNT_ROUNDS.length === ROUND_COUNT, `count: ${COUNT_ROUNDS.length} rounds`);
  need(FUEL_ROUNDS.length === ROUND_COUNT, `fuel: ${FUEL_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  // count down: the stars are exactly N, N-1 … 1, in mixed places
  COUNT_ROUNDS.forEach((r, i) => {
    const stars = r.tower.filter((n): n is number => n !== null);
    const top = startOf(r);
    need(r.tower.length === TOWER_SLOTS, `count ${i}: not ${TOWER_SLOTS} tower places`);
    need(stars.every(inRange), `count ${i}: a star outside 1–5`);
    need(
      [...stars].sort((a, b) => a - b).join() ===
        Array.from({ length: top }, (_, k) => k + 1).join(),
      `count ${i}: the stars are not exactly 1 to ${top}`
    );
    const order = tapOrder(r);
    const up = order.every((s, k) => k === 0 || s > order[k - 1]);
    const down = order.every((s, k) => k === 0 || s < order[k - 1]);
    need(!up && !down, `count ${i}: the stars stand in order — they should be mixed`);
  });
  need(
    COUNT_ROUNDS.map(startOf).join() === "3,4,5,5",
    "count: the countdowns should start at 3, 4, 5 and 5"
  );
  noRepeats(
    "count",
    COUNT_ROUNDS.map((r) => r.tower.join())
  );

  // fuel: every number reachable with the crate, and too many possible
  FUEL_ROUNDS.forEach((r, i) => {
    need(inRange(r.need) && r.need >= 2, `fuel ${i}: need ${r.need}, not 2–5`);
    need(r.cells >= r.need, `fuel ${i}: only ${r.cells} cells for ${r.need}`);
    need(r.cells > r.need, `fuel ${i}: no spare cell — too many is never possible`);
    need(r.cells <= TANK, `fuel ${i}: ${r.cells} cells will not fit the tank`);
  });
  need(
    FUEL_ROUNDS.map((r) => r.need).join() === "2,3,4,5",
    "fuel: the rocket should need 2, 3, 4 and 5"
  );
  need(
    COUNTDOWN.every((n, k) => k === 0 || n === COUNTDOWN[k - 1] - 1),
    "fuel: the countdown does not count down"
  );

  return problems;
}
