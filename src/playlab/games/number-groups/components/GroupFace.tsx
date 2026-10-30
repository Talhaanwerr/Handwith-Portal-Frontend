"use client";

import type { ReactNode } from "react";
import { cssVars } from "@shared/styles/cssVars";

/** Where each thing sits (% of the face): pairs side by side, three as a
 *  triangle, four in a square, five as the die face — as big as the face
 *  allows with a clear gap between neighbours (sizes in the stylesheet). */
const LAYOUT: Record<number, readonly [number, number][]> = {
  1: [[50, 50]],
  2: [
    [27, 50],
    [73, 50],
  ],
  3: [
    [27, 29],
    [73, 29],
    [50, 72],
  ],
  4: [
    [27, 27],
    [73, 27],
    [27, 73],
    [73, 73],
  ],
  5: [
    [23, 23],
    [77, 23],
    [50, 50],
    [23, 77],
    [77, 77],
  ],
};

/**
 * A GROUP TO COUNT — `count` copies of one drawing in a neat dice-like
 * pattern, big and clearly apart, so the count reads as a shape as well as a
 * number. Fills its box; the card around it decides how big that is. Used by
 * Count & Match's number cards and Number Hunt's quantity cards.
 */
export function GroupFace({ count, art }: { count: number; art: ReactNode }) {
  return (
    <span className="ng-gface" data-n={count}>
      {(LAYOUT[count] ?? []).map(([x, y], i) => (
        <span
          key={i}
          className="ng-gthing"
          style={cssVars({ "--pl-x": `${x}%`, "--pl-y": `${y}%` })}
        >
          {art}
        </span>
      ))}
    </span>
  );
}
