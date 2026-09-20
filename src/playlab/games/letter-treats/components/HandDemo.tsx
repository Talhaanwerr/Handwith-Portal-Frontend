"use client";

import { motion } from "framer-motion";
import { F, Spec, Shade } from "@games/letter-treats/components/candy-world/CandyDefs";

/** How long the whole demonstration takes, and when the tap lands inside it.
 *  LetterScreen fires the object's response at TAP_AT_MS so the picture
 *  reacts exactly when the finger touches it. */
export const HAND_DEMO_MS = 2000;
export const HAND_TAP_AT_MS = 1050;

/**
 * HandDemo - one short "this is what you do" demonstration.
 *
 *   appear beside the picture -> glide onto it -> press -> lift -> fade
 *
 * Pure visual: no audio of its own, no interaction lock (the hand is
 * pointer-events-none and the parent unmounts it the moment the child taps
 * anything). Drawn in the Candy Land language: a lit, soft pointing hand
 * with a cuff, so it reads as "a finger" at a glance.
 */
export function HandDemo() {
  return (
    <motion.div
      className="ab-hand pointer-events-none absolute z-20"
      aria-hidden="true"
      initial={{ opacity: 0, x: 70, y: 80, scale: 1 }}
      animate={{
        opacity: [0, 1, 1, 1, 1, 0],
        x: [70, 70, 0, 0, 0, 0],
        y: [80, 80, 0, 0, 0, 0],
        scale: [1, 1, 1, 0.82, 1, 1],
      }}
      transition={{
        duration: HAND_DEMO_MS / 1000,
        times: [0, 0.12, 0.48, 0.55, 0.66, 1],
        ease: "easeInOut",
      }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <Shade x={46} y={92} rx={22} ry={4} />
        {/* cuff */}
        <path d="M22 96 L30 70 L74 70 L80 96 Z" fill={F.strawberry} />
        <path
          d="M26 74 L78 74"
          stroke="#FFFFFF"
          strokeWidth="3"
          opacity="0.6"
          strokeLinecap="round"
        />
        {/* palm + curled fingers */}
        <rect x="26" y="38" width="46" height="40" rx="14" fill={F.sand} />
        <rect x="48" y="36" width="12" height="16" rx="6" fill={F.sand} />
        <rect x="60" y="38" width="11" height="16" rx="5.5" fill={F.sand} />
        <path
          d="M48 40 h12 M60 42 h11"
          stroke="#C99A72"
          strokeWidth="1.5"
          opacity="0.5"
          strokeLinecap="round"
        />
        {/* thumb */}
        <path d="M28 48 Q14 46 16 60 Q18 70 30 66 Z" fill={F.sand} />
        {/* pointing finger */}
        <rect x="34" y="4" width="14" height="44" rx="7" fill={F.sand} />
        <Spec x={38} y={14} rx={3} ry={6} rotate={0} />
        <Spec x={36} y={52} rx={6} ry={4} />
      </svg>
    </motion.div>
  );
}
