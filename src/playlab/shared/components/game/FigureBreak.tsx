"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Confetti } from "@shared/components/game/Confetti";

interface FigureBreakProps {
  /** What a screen reader hears while it plays. */
  label: string;
  /** The figure that comes up to cheer — the game's own grown-up or helper. */
  children: ReactNode;
}

/**
 * THE BIG CHEER — the board dims, confetti falls, and a figure rises from the
 * bottom of the screen, bounces, and drops away again, while the board stays
 * visible underneath. Numbers 1 – 5's celebration break, with the figure
 * left to the game: Math Maze sends up its teacher, Sorting Food its chef.
 *
 * Deliberately light: a translucent wash (no backdrop blur), the shared
 * transform-only confetti, and ONE animated element. It never takes a tap.
 * Mount it inside an <AnimatePresence> so it fades out.
 */
export function FigureBreak({ label, children }: FigureBreakProps) {
  return (
    <motion.div
      className="pl-break"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label={label}
    >
      <Confetti count={40} />
      <motion.div
        className="pl-break-figure"
        // moved by `bottom`, NOT a transform: a transform makes a stacking
        // context, and a photo that drops its white background with
        // mix-blend-mode (Key Quest's teacher) would then show as a white box.
        // One element, for two seconds — the layout cost is nothing.
        initial={{ bottom: "-55%" }}
        // a multi-keyframe rise, bounce and drop: a tween, never a spring
        animate={{ bottom: ["-55%", "0%", "4%", "0%", "0%", "-55%"] }}
        transition={{ duration: 2.3, times: [0, 0.28, 0.42, 0.55, 0.78, 1], ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
