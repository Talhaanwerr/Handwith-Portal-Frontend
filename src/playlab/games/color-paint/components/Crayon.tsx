"use client";

import { motion } from "framer-motion";
import type { PaintColor } from "@games/color-paint/constants/colors";
import { OUTLINE_INK } from "@games/color-paint/constants/colors";

/** What a crayon is doing right now — drives its look and its motion. */
export type CrayonState = "idle" | "active" | "wrong" | "dim";

interface CrayonProps {
  color: PaintColor;
  state: CrayonState;
  onPick: () => void;
}

/**
 * A fat wax crayon standing upright, its name written underneath.
 *
 * Drawn flat and thick on purpose — a wrapper band, a blunt tip, a hard ink
 * edge — so it reads as a toy rather than as a colour swatch. The whole card
 * is the tap target. The "wrong" state is a short shake and nothing else; the
 * crayon stays exactly where it was so the child can simply try the next one.
 */
export function Crayon({ color, state, onPick }: CrayonProps) {
  return (
    <motion.button
      type="button"
      onClick={onPick}
      className={`cp-crayon ${state === "active" ? "is-active" : ""} ${state === "dim" ? "is-dim" : ""}`}
      animate={
        state === "wrong"
          ? { x: [0, -8, 8, -6, 6, 0], y: 0 }
          : state === "active"
            ? { y: -10, x: 0 }
            : { y: 0, x: 0 }
      }
      transition={
        state === "wrong" ? { duration: 0.45 } : { type: "spring", stiffness: 300, damping: 18 }
      }
      whileTap={{ scale: 0.94 }}
      aria-label={`${color.label} crayon`}
      aria-pressed={state === "active"}
    >
      <svg className="cp-crayon-art" viewBox="0 0 60 120" aria-hidden="true" focusable="false">
        <g stroke={OUTLINE_INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
          {/* the tip */}
          <path d="M30 6 L44 30 L16 30 Z" fill={color.fill} />
          {/* the body */}
          <rect x="12" y="30" width="36" height="82" rx="8" fill={color.fill} />
          {/* the paper wrapper band */}
          <rect x="12" y="52" width="36" height="18" fill={color.shade} />
        </g>
      </svg>
      <span className="cp-crayon-label font-rounded font-black">{color.label}</span>
    </motion.button>
  );
}
