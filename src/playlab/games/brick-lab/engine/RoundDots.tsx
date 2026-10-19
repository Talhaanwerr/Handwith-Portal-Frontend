"use client";

import { memo } from "react";

/** Where the child is in the game: one dot per round, the current one big.
 *  Sits bottom-left of the scene, out of the way of the build. */
export const RoundDots = memo(function RoundDots({ total, at }: { total: number; at: number }) {
  return (
    <div className="bk-rounds" aria-label={`Round ${Math.min(at + 1, total)} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`bk-round ${i < at ? "bk-round--done" : ""} ${i === at ? "bk-round--now" : ""}`}
        />
      ))}
    </div>
  );
});
