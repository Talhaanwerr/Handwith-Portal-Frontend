"use client";

import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { unit } from "@shared/utils/hash";

/** Bubbles available. A burst wants to be DENSE — a handful reads as a few
 *  stray bubbles, dozens read as the whole sea fizzing. */
const MAX = 72;

/** Columns the burst is spread over — stratified, like the celebration motif,
 *  so the pops cover the whole screen evenly instead of clumping. */
const COLUMNS = 12;

interface Pop {
  x: string;
  y: string;
  delay: number;
  dur: number;
  size: number;
}

const POPS: Pop[] = Array.from({ length: MAX }, (_, i) => {
  const column = (i * 5) % COLUMNS;
  const bandWidth = 100 / COLUMNS;
  return {
    x: `${(column * bandWidth + 0.1 * bandWidth + unit(i * 3) * 0.8 * bandWidth).toFixed(2)}%`,
    y: `${(6 + unit(i * 3 + 1) * 84).toFixed(2)}%`,
    // Spread across ~1.7s and jittered: a rolling fizz across the whole
    // celebration, never one flash that is over before the child looks up.
    delay: Number((((i % 24) / 24) * 1.7 + unit(i * 3 + 2) * 0.2).toFixed(3)),
    dur: Number((0.9 + unit(i * 5) * 0.5).toFixed(3)),
    size: Number((0.5 + unit(i * 7) * 0.9).toFixed(3)),
  };
});

interface BubblePopsProps {
  /** How many bubbles pop. Default is a proper fizz. */
  count?: number;
  /** Seconds before the fizz starts — a second wave timed to a later beat. */
  delay?: number;
}

/**
 * The sea fizzing — dozens of bubbles that inflate where they sit and POP.
 *
 * Each bubble is one declarative keyframe run: it swells up, holds a beat,
 * then snaps outward and vanishes, which is what a pop looks like. Staggered
 * across the celebration so the screen keeps fizzing rather than flashing
 * once. Distinct from CelebrationMotif's bubbles, which RISE; these stay put
 * and burst, and the two together are what make water feel like water.
 *
 * NO ANIMATION LOOP — Framer runs every bubble on the compositor from one
 * transition, and unmounting is the only cleanup. Mount inside a positioned
 * parent when the moment arrives.
 */
export function BubblePops({ count = 48, delay = 0 }: BubblePopsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {POPS.slice(0, Math.min(count, MAX)).map((p, i) => (
        <motion.span
          key={i}
          className="pl-bp pl-at"
          style={cssVars({ "--pl-x": p.x, "--pl-y": p.y, "--pl-scale": `${p.size}` })}
          initial={{ scale: 0, opacity: 0 }}
          // inflate → hold → snap out and vanish: the pop
          animate={{ scale: [0, 1, 1.08, 1.45, 0], opacity: [0, 0.95, 1, 0.6, 0] }}
          transition={{
            duration: p.dur,
            delay: delay + p.delay,
            times: [0, 0.55, 0.78, 0.9, 1],
            ease: "easeOut",
          }}
        >
          <span className="pl-bp-skin" />
          <span className="pl-bp-shine" />
        </motion.span>
      ))}
    </div>
  );
}
