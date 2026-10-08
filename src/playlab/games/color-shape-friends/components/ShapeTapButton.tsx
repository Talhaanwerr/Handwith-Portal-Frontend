"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { ShapeGlyph, Tick, Twinkle } from "@games/shape-match/components/ShapeArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import type { TapOption } from "@games/color-shape-friends/constants/rounds";

export type TapState = "idle" | "wrong" | "found";

interface ShapeTapButtonProps {
  option: TapOption;
  state: TapState;
  onTap: (option: TapOption) => void;
  ariaLabel: string;
  /** "tile" — a chunky white tile on a table or bench; "canvas" — a
   *  painter's canvas resting on an easel (Shapes). Same button, same
   *  rules, a different surface. */
  surface?: "tile" | "canvas";
}

/** What a right answer throws in the air — Leo's Puzzles' twinkles. */
const SPARKS = [
  <Twinkle key="a" fill="#FFC93C" />,
  <Twinkle key="b" fill="#FF7EB6" />,
  <Twinkle key="c" fill="#3DA5F4" />,
  <Twinkle key="d" fill="#5FCB52" />,
];
const SPARK_REACH = [9, 18] as const;

/**
 * One big tappable shape: Leo's Puzzles' own `ShapeGlyph` on a chunky 3D
 * tile, Math Maze's red cross on a wrong one, Leo's green tick and the
 * shared `Burst` on the right one.
 *
 * Feedback follows GAME_DEV.md's "wrong answers" rule: a wrong tap shakes
 * once and then stays crossed out for the rest of that round (it cannot be
 * tapped again) and counts as a miss; the right one ticks and sparkles.
 * Memoised: a tap re-renders only the tile whose state changed.
 */
export const ShapeTapButton = memo(function ShapeTapButton({
  option,
  state,
  onTap,
  ariaLabel,
  surface = "tile",
}: ShapeTapButtonProps) {
  const disabled = state !== "idle";
  return (
    <motion.button
      type="button"
      className={`csf-tile csf-tile--${surface} csf-tile--${state}`}
      onClick={disabled ? undefined : () => onTap(option)}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.93 }}
      animate={state === "wrong" ? { x: [0, -9, 9, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="csf-tile-glyph">
        <ShapeGlyph piece={option} />
      </span>
      {state === "wrong" && (
        <span className="csf-tile-cross">
          <CrossMark />
        </span>
      )}
      {state === "found" && (
        <>
          <Burst pieces={SPARKS} count={14} reach={SPARK_REACH} />
          <motion.span
            className="csf-tile-tick"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
          >
            <Tick />
          </motion.span>
        </>
      )}
    </motion.button>
  );
});
