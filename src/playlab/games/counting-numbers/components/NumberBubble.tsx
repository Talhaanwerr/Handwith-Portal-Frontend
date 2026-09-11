"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { Tone } from "@games/counting-numbers/constants/levels";

interface NumberBubbleProps {
  value: number;
  tone: Tone;
  /** The bubble is the one the child has picked up — raised and bright. */
  selected?: boolean;
  /** A wrong answer, shaking its head. */
  wrong?: boolean;
  /** The right answer, ringed in green (the count puzzles). */
  lit?: boolean;
  /** Placed somewhere else — the bubble stays in the strip but empty. */
  used?: boolean;
  /** Faint while it is being dragged (the ghost is the one that moves). */
  dragging?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onClick?: () => void;
  ariaLabel: string;
}

/**
 * A number in a big circle — the whole interface of this game.
 *
 * Purple in the strip, blue over the field, cyan on the ship's rail, white
 * in the panel: the colour is the level's, the number is always chunky and
 * centred. Framer moves it for the wobble; the circle itself is plain CSS.
 */
export const NumberBubble = forwardRef<HTMLButtonElement, NumberBubbleProps>(function NumberBubble(
  { value, tone, selected, wrong, lit, used, dragging, onPointerDown, onClick, ariaLabel },
  ref
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      className={`cn-bubble cn-bubble--${tone} touch-none ${selected ? "cn-bubble--selected" : ""} ${
        lit ? "cn-bubble--lit" : ""
      } ${used ? "cn-bubble--used" : ""} ${dragging ? "cn-bubble--dragging" : ""}`}
      animate={wrong ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0, scale: selected ? 1.12 : 1 }}
      transition={wrong ? { duration: 0.42 } : { type: "spring", stiffness: 320, damping: 18 }}
      onPointerDown={onPointerDown}
      onClick={onClick}
      disabled={used}
      aria-label={ariaLabel}
      aria-pressed={selected}
    >
      <span className="cn-bubble-glyph font-rounded font-black">{used ? "" : value}</span>
    </motion.button>
  );
});
