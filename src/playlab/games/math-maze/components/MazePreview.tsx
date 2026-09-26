"use client";

import { motion } from "framer-motion";
import { Picture } from "@games/blend-read/components/PictureArt";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { CrossMark } from "@games/math-maze/components/CrossMark";

type Tile =
  | { kind: "start" }
  | { kind: "prize" }
  | { kind: "num"; n: number; look?: "on" | "crossed" | "next" };

/**
 * A small maze, two steps in: 1 and 2 already on the trail, a wrong 3
 * crossed out, and the hand on the right 3 — then 4, then the prize. The walk
 * is start → 1 → 2 → 3 → 4 → prize, each step to a side-by-side neighbour,
 * exactly the game's rule.
 */
const ROWS: readonly (readonly Tile[])[] = [
  [
    { kind: "start" },
    { kind: "num", n: 1, look: "on" },
    { kind: "num", n: 2, look: "on" },
    { kind: "num", n: 5 },
  ],
  [
    { kind: "num", n: 6 },
    { kind: "num", n: 8 },
    { kind: "num", n: 3, look: "next" },
    { kind: "num", n: 9 },
  ],
  [
    { kind: "num", n: 3, look: "crossed" },
    { kind: "num", n: 7 },
    { kind: "num", n: 4 },
    { kind: "prize" },
  ],
];

const LOOK_CLASS = { on: "mz-number--on", crossed: "mz-number--crossed", next: "mz-home-next" };

/**
 * THE HOME SCREEN'S PICTURE OF THE GAME — drawn with the board's own tile
 * classes, so it is the game itself in miniature, not an illustration of it.
 * The tiles pop in once; after that only the hand and one soft ring move.
 * Decorative: the Play button is the way in.
 */
export function MazePreview() {
  return (
    <div className="mz-board mz-home-maze" aria-hidden="true">
      {ROWS.flatMap((row, r) =>
        row.map((tile, c) => {
          const place = cssVars({ "--mz-r": r + 1, "--mz-c": c + 1, "--mz-span": 1 });
          const pop = {
            initial: { scale: 0.6, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            transition: {
              delay: 0.15 + (r * 4 + c) * 0.045,
              type: "spring" as const,
              stiffness: 320,
              damping: 18,
            },
          };
          if (tile.kind === "start") {
            return (
              <motion.span key={`${r}-${c}`} className="mz-cell mz-start" style={place} {...pop}>
                <span className="mz-start-art">
                  <Picture id="flag" />
                </span>
              </motion.span>
            );
          }
          if (tile.kind === "prize") {
            return (
              <motion.span key={`${r}-${c}`} className="mz-prize" style={place} {...pop}>
                <span className="mz-prize-art">
                  <Picture id="trophy" />
                </span>
              </motion.span>
            );
          }
          return (
            <motion.span
              key={`${r}-${c}`}
              className={`mz-cell mz-number font-rounded font-black ${
                tile.look ? LOOK_CLASS[tile.look] : ""
              }`}
              style={place}
              {...pop}
            >
              <span className="mz-number-glyph">{tile.n}</span>
              {tile.look === "crossed" && (
                <span className="mz-cross">
                  <CrossMark />
                </span>
              )}
              {tile.look === "next" && (
                // the portal's guide hand, tapping this tile's centre
                <span className="mz-home-hand">
                  <TeachingHand fx={0} fy={0} tx={0} ty={0} />
                </span>
              )}
            </motion.span>
          );
        })
      )}
    </div>
  );
}
