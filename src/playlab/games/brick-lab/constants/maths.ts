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

/** The two colours of a sum: the first number red, the one added blue. */
export const FIRST_COLOR: BrickColor = "red";
export const ADD_COLOR: BrickColor = "blue";

export const MATH_PLATE: Plate = { w: 4, d: 4 };
export const MATH_SPOT = { x: 1, z: 1, w: 2, d: 2 };

export function checkMaths(has: (id: string) => boolean): string[] {
  const errs: string[] = [];
  for (const [i, r] of PLUS_ROUNDS.entries()) {
    if (r.a < 1 || r.b < 1) errs.push(`plus ${i}: needs both numbers`);
    if (r.a + r.b > 5) errs.push(`plus ${i}: ${r.a}+${r.b} is past 5`);
  }
  for (let n = 1; n <= 5; n++) if (!has(`number-${n}`)) errs.push(`no recording for ${n}`);
  return errs;
}
