import type { BrickColor } from "@games/brick-lab/engine/geometry";
import type { Plate } from "@games/brick-lab/engine/world";

/**
 * PLUS TOWER and TAKE AWAY TOWER — sums for four-year-olds: nothing past 5,
 * one step at a time, the first numbers small. `checkMaths` proves it, and
 * that every number said has a recording.
 */

export interface PlusRound {
  a: number;
  b: number;
}

/** Start with "one more", then grow; every answer 2 to 5. */
export const PLUS_ROUNDS: PlusRound[] = [
  { a: 1, b: 1 },
  { a: 2, b: 1 },
  { a: 1, b: 2 },
  { a: 3, b: 1 },
  { a: 2, b: 2 },
  { a: 1, b: 3 },
  { a: 3, b: 2 },
  { a: 2, b: 3 },
];

export interface TakeRound {
  /** Bricks in the tower to begin with. */
  from: number;
  /** Bricks to take away. */
  take: number;
}

/** Take one away first, then two; never down to nothing. */
export const TAKE_ROUNDS: TakeRound[] = [
  { from: 2, take: 1 },
  { from: 3, take: 1 },
  { from: 4, take: 1 },
  { from: 3, take: 2 },
  { from: 5, take: 1 },
  { from: 4, take: 2 },
  { from: 5, take: 2 },
  { from: 5, take: 3 },
];

/** The two colours of a sum: the first number red, the one added blue. */
export const FIRST_COLOR: BrickColor = "red";
export const ADD_COLOR: BrickColor = "blue";
/** Take Away's tower is one colour, so only the count matters. */
export const TAKE_COLOR: BrickColor = "green";

export const MATH_PLATE: Plate = { w: 4, d: 4 };
export const MATH_SPOT = { x: 1, z: 1, w: 2, d: 2 };

export function checkMaths(has: (id: string) => boolean): string[] {
  const errs: string[] = [];
  for (const [i, r] of PLUS_ROUNDS.entries()) {
    if (r.a < 1 || r.b < 1) errs.push(`plus ${i}: needs both numbers`);
    if (r.a + r.b > 5) errs.push(`plus ${i}: ${r.a}+${r.b} is past 5`);
  }
  for (const [i, r] of TAKE_ROUNDS.entries()) {
    if (r.from > 5) errs.push(`take ${i}: starts past 5`);
    if (r.take < 1 || r.take >= r.from) errs.push(`take ${i}: must leave at least one`);
  }
  for (let n = 1; n <= 5; n++) if (!has(`number-${n}`)) errs.push(`no recording for ${n}`);
  return errs;
}
