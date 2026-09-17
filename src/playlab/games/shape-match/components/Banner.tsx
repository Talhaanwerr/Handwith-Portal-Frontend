"use client";

import { motion } from "framer-motion";

/**
 * THE INSTRUCTION BANNER — one line, across the top, in the game's purple.
 *
 * It says what to do and nothing else: no score, no timer, no round counter.
 * The words are DERIVED from the round (see `askFor`), so the banner can
 * never promise an activity the board is not showing.
 *
 * It drops in from above each round, which is also the cue that something
 * new has arrived for a child who cannot read it.
 */
export function Banner({ text }: { text: string }) {
  return (
    <motion.p
      className="sm-banner font-rounded font-black"
      initial={{ y: "-140%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      transition={{ type: "spring", stiffness: 210, damping: 17 }}
      role="status"
    >
      {text}
    </motion.p>
  );
}
