"use client";

import { motion } from "framer-motion";

import {
  CandyWorld,
  type WorldVariant,
} from "@games/letter-treats/components/candy-world/CandyWorld";
import { CandyDefs, F, Spec, Shade } from "@games/letter-treats/components/candy-world/CandyDefs";

/**
 * CandyScene - the backdrop every Letter Treats screen mounts.
 *
 * Kept as the single entry point the screens already import; the actual
 * environment (sky atmosphere, clouds, castle, hills, path, trees, sweets)
 * lives in ./candy-world so the layers can be tuned without touching any
 * screen. The wrapper sits at z-0, is pointer-events-none and aria-hidden,
 * so nothing in it can intercept a tap or be read out by a screen reader.
 */
export function CandyScene({ variant = "full" }: { variant?: WorldVariant }) {
  return (
    <div className="lt-candy-scene pointer-events-none absolute inset-0" aria-hidden="true">
      {/* the shared gradients/patterns every SVG on the screen references */}
      <CandyDefs />
      <CandyWorld variant={variant} />
    </div>
  );
}

/**
 * Bee - the guide. One component, three poses, used on every screen so the
 * child meets the same character throughout.
 *
 * The animation is deliberately a single slow hover plus a wing flutter: the
 * brief asked for short, soft, purposeful and predictable, and a mascot that
 * wanders continuously is exactly the peripheral motion that pulls a young
 * child's eye off the task. Bee holds position and lets the letter lead.
 */
export function Bee({
  mood = "idle",
  className = "",
}: {
  mood?: "idle" | "cheer" | "point";
  className?: string;
}) {
  return (
    <motion.div
      className={`lt-bee ${className}`}
      animate={
        mood === "cheer"
          ? { y: [0, -14, 0], rotate: [0, -8, 6, 0] }
          : mood === "point"
            ? { y: [0, -5, 0], rotate: [0, 5, 0] }
            : { y: [0, -7, 0] }
      }
      transition={{
        duration: mood === "cheer" ? 0.7 : 2.6,
        repeat: mood === "cheer" ? 2 : Infinity,
        ease: "easeInOut",
      }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {/* wings - behind the body; glassy, with a veined sheen */}
        <motion.g
          animate={{ scaleY: [1, 0.72, 1] }}
          transition={{ duration: 0.22, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50px 40px" }}
        >
          <ellipse
            cx="34"
            cy="36"
            rx="15"
            ry="19"
            fill="#EAF6FF"
            opacity="0.85"
            transform="rotate(-12 34 36)"
          />
          <ellipse
            cx="66"
            cy="36"
            rx="15"
            ry="19"
            fill="#EAF6FF"
            opacity="0.85"
            transform="rotate(12 66 36)"
          />
          <ellipse
            cx="34"
            cy="36"
            rx="15"
            ry="19"
            fill="url(#cg-sheen)"
            opacity="0.8"
            transform="rotate(-12 34 36)"
          />
          <ellipse
            cx="66"
            cy="36"
            rx="15"
            ry="19"
            fill="url(#cg-sheen)"
            opacity="0.8"
            transform="rotate(12 66 36)"
          />
          <path
            d="M34 20 Q30 36 36 52 M66 20 Q70 36 64 52"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            opacity="0.7"
          />
        </motion.g>
        <Shade x={50} y={88} rx={24} ry={4} />
        {/* body: lit sphere, velvet stripes that follow the curve */}
        <ellipse cx="50" cy="58" rx="26" ry="23" fill={F.yellow} />
        <path d="M31 48 Q50 44 69 48 Q71 52 70 56 Q50 52 30 56 Q29 52 31 48Z" fill="#4A3B12" />
        <path d="M31 64 Q50 60 69 64 Q67 70 64 74 Q50 70 36 74 Q33 70 31 64Z" fill="#4A3B12" />
        <path d="M31 48 Q50 44 69 48 Q50 46 31 48Z" fill="#FFFFFF" opacity="0.2" />
        <ellipse cx="50" cy="58" rx="26" ry="23" fill="url(#cg-shadow)" opacity="0.3" />
        <Spec x={38} y={44} rx={7} ry={4} rotate={-25} />
        {/* stinger */}
        <path d="M74 62 L82 66 L73 68 Z" fill="#4A3B12" />
        {/* face */}
        <circle cx="42" cy="54" r="3.8" fill="#3A2E0C" />
        <circle cx="58" cy="54" r="3.8" fill="#3A2E0C" />
        <circle cx="43.4" cy="52.6" r="1.4" fill="#FFF" />
        <circle cx="59.4" cy="52.6" r="1.4" fill="#FFF" />
        <path
          d="M45 62q5 4.5 10 0"
          stroke="#3A2E0C"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="34" cy="60" r="3.4" fill="#FF9EC4" opacity="0.6" />
        <circle cx="66" cy="60" r="3.4" fill="#FF9EC4" opacity="0.6" />
        {/* antennae with candy tips */}
        <path
          d="M42 38q-3-8-8-10M58 38q3-8 8-10"
          stroke="#4A3B12"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="34" cy="28" r="2.8" fill={F.pink} />
        <circle cx="66" cy="28" r="2.8" fill={F.pink} />
      </svg>
    </motion.div>
  );
}
