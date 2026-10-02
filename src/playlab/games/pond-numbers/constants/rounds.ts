/**
 * Pond Numbers — the round data for both modules.
 *
 * Two early-number skills the portal did not teach yet, each one mechanic
 * repeated for six rounds, both answered on the same row of number tiles:
 *
 *   • "quick" — QUICK LOOK (subitising). A card shows 1–6 dots in dice
 *     patterns for a moment, then turns over; the child says how many they
 *     saw. The flash shortens a little each round.
 *   • "more"  — ONE MORE (counting on). Some frogs sit on a log, the teacher
 *     says how many, one more frog hops on; how many now?
 *
 * Answers are DERIVED from the data (never stored twice) and `checkRounds`
 * proves every run is fair — GAME_DEV's "level data checks itself".
 */

export type ModuleId = "quick" | "more";

export const ROUND_COUNT = 6;

/** The number tiles run 1..TILE_MAX in both modules. */
export const TILE_MAX = 6;

/** Quick Look: how many dots each round shows. Easy two first, every number
 *  1–6 once, never the same twice in a row. */
const QUICK_DOTS = [2, 4, 3, 5, 1, 6] as const;

/** One More: how many frogs are on the log before the extra one hops on. */
const MORE_START = [2, 1, 3, 4, 2, 5] as const;

export function quickDots(round: number): number {
  return QUICK_DOTS[round % QUICK_DOTS.length];
}

/** How long the dots stay face up, in ms — generous first, quicker later. */
export function flashMs(round: number): number {
  return Math.max(1200, 2200 - round * 200);
}

export function moreStart(round: number): number {
  return MORE_START[round % MORE_START.length];
}

/** The answer a round wants, derived — never stored. */
export function answerFor(module: ModuleId, round: number): number {
  return module === "quick" ? quickDots(round) : moreStart(round) + 1;
}

/**
 * Dice layouts — where the dots sit on the card for each count, as % of the
 * card. Standard die faces, because recognising a familiar pattern at a
 * glance is exactly the skill being practised.
 */
const L = 26;
const M = 50;
const R = 74;
export const DICE: Record<number, readonly [number, number][]> = {
  1: [[M, M]],
  2: [
    [L, L],
    [R, R],
  ],
  3: [
    [L, L],
    [M, M],
    [R, R],
  ],
  4: [
    [L, L],
    [R, L],
    [L, R],
    [R, R],
  ],
  5: [
    [L, L],
    [R, L],
    [M, M],
    [L, R],
    [R, R],
  ],
  6: [
    [L, L],
    [R, L],
    [L, M],
    [R, M],
    [L, R],
    [R, R],
  ],
};

/** A different dot colour each round, so no two rounds look alike. */
export const DOT_COLORS = ["#E5484D", "#2E7FD6", "#3DAB72", "#F08A24", "#8E5BD9", "#E0457B"];

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const problems: string[] = [];
  for (const mod of ["quick", "more"] as const) {
    const seen = new Set<number>();
    for (let r = 0; r < ROUND_COUNT; r++) {
      const a = answerFor(mod, r);
      seen.add(a);
      if (a < 1 || a > TILE_MAX) problems.push(`${mod} ${r}: answer ${a} has no tile`);
      if (r > 0 && a === answerFor(mod, r - 1))
        problems.push(`${mod} ${r}: same answer as round ${r - 1}`);
    }
    if (mod === "quick")
      for (let n = 1; n <= TILE_MAX; n++)
        if (!seen.has(n)) problems.push(`quick: ${n} never shown`);
  }
  for (let n = 1; n <= TILE_MAX; n++)
    if (!DICE[n] || DICE[n].length !== n) problems.push(`dice ${n}: wrong dot count`);
  if (flashMs(ROUND_COUNT - 1) < 1200) problems.push("last flash shorter than 1.2s");
  return problems;
}

/** Stars for a finished run: no misses is three, a few is two, else one. */
export function starsFor(misses: number): number {
  if (misses === 0) return 3;
  if (misses <= 3) return 2;
  return 1;
}
