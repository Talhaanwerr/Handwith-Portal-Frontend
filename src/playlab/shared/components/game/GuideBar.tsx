"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * THE GUIDE BAR — one thin bar at the top centre of a game's stage, between
 * the Back and Back to Games pills: the game's progress (its stars or dots,
 * passed as children) and, beside them, what to do right now ("Tap the drum
 * two times!"). The line changes with the game, so a grown-up reading over
 * the child's shoulder always sees the current step; a new line fades in.
 *
 * It is placed and styled by shared/styles/guide-bar.css (prefix pl-guidebar),
 * the same in every game that shows one. The text is the line being said —
 * pass `clipText(id)` of the clip actually played, never typed words.
 */
export function GuideBar({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="pl-guidebar" role="status" aria-live="polite">
      {children ? <span className="pl-guidebar-progress">{children}</span> : null}
      {text ? (
        <motion.span
          key={text}
          className="pl-guidebar-text font-rounded font-black"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {text}
        </motion.span>
      ) : null}
    </div>
  );
}
