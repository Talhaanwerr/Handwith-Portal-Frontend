"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { Tone } from "@games/number-safari/constants/levels";

interface NumberBubbleProps {
  value: number;
  tone: Tone;
  /** Picked up by a tap, waiting for a place to go. */
  selected?: boolean;
  /** A wrong answer, shaking its head. */
  wrong?: boolean;
  /** The right answer on a count screen — ringed in green. */
  lit?: boolean;
  /** Already placed: the space stays, the number is gone. */
  used?: boolean;
  /** Faint while the ghost under the finger is the one that moves. */
  dragging?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onClick?: () => void;
  ariaLabel: string;
}

/**
 * A number in a big circle — the entire interface of this game, the same as it
 * is in Numbers 1 – 5. Framer does the wobble and the pick-up; the circle is
 * plain CSS so it costs nothing to have ten of them on screen.
 *
 * A wrong answer shakes rather than scales, because a shake is a head shaking
 * "no" and a scale reads as a reward — the distinction the whole no-penalty
 * design rests on.
 */
export const NumberBubble = forwardRef<HTMLButtonElement, NumberBubbleProps>(function NumberBubble(
  { value, tone, selected, wrong, lit, used, dragging, onPointerDown, onClick, ariaLabel },
  ref
) {
  const state = [
    // ten and up needs a smaller glyph, not a bigger circle: every layout in
    // this game is built around the circle's size
    value >= 10 ? "ns-bubble--wide" : "",
    selected ? "ns-bubble--selected" : "",
    lit ? "ns-bubble--lit" : "",
    used ? "ns-bubble--used" : "",
    dragging ? "ns-bubble--dragging" : "",
  ].join(" ");

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`ns-bubble ns-bubble--${tone} touch-none ${state}`}
      animate={wrong ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0, scale: selected ? 1.12 : 1 }}
      // a six-keyframe shake CANNOT be a spring (framer throws on more than two
      // keyframes); the settled state can be, and is
      transition={wrong ? { duration: 0.42 } : { type: "spring", stiffness: 320, damping: 18 }}
      onPointerDown={onPointerDown}
      onClick={onClick}
      disabled={used}
      aria-label={ariaLabel}
      aria-pressed={selected}
    >
      <span className="ns-bubble-glyph font-rounded font-black">{used ? "" : value}</span>
    </motion.button>
  );
});
