"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { P } from "@shared/components/pirate/palette";

export type ParrotMood = "idle" | "happy" | "celebrating";

/**
 * THE PIRATE PARROT — the theme's character.
 *
 * `mood` follows the portal's established character convention (DinoArt's
 * moods): it changes the DRAWING — eyes, wing, crest — not a looping
 * animation. "celebrating" alone adds motion: one gentle bounce loop,
 * because a celebrating parrot that stands still reads as broken.
 */
export function PirateParrot({
  mood = "idle",
  className = "",
}: {
  mood?: ParrotMood;
  className?: string;
}) {
  const uid = useId();
  const bodyId = `${uid}-body`;
  const happy = mood !== "idle";

  const art = (
    <svg
      viewBox="0 0 180 200"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A friendly pirate parrot"
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.PARROT_RED} />
          <stop offset="1" stopColor={P.PARROT_RED_DEEP} />
        </linearGradient>
      </defs>

      {/* tail feathers */}
      <g strokeWidth="3" strokeLinejoin="round">
        <path
          d="M74 138 Q48 176 30 192 Q52 190 72 168 Z"
          fill={P.PARROT_BLUE}
          stroke={P.SEA_DEEP}
        />
        <path
          d="M82 142 Q66 180 52 196 Q76 192 90 168 Z"
          fill={P.PARROT_GREEN}
          stroke={P.LEAF_DEEP}
        />
        <path
          d="M90 144 Q84 182 76 198 Q98 192 102 166 Z"
          fill={P.PARROT_YELLOW}
          stroke={P.GOLD_LINE}
        />
      </g>

      {/* body */}
      <path
        d="M64 96 Q60 44 104 40 Q142 40 142 86 Q142 140 106 152 Q70 160 64 118 Z"
        fill={`url(#${bodyId})`}
        stroke={P.PARROT_RED_DEEP}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* belly */}
      <path
        d="M84 96 Q86 134 108 142 Q126 132 128 100 Q108 84 84 96 Z"
        fill={P.PARROT_YELLOW}
        stroke={P.GOLD_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* wing — folded when idle, raised in a little wave when happy */}
      {happy ? (
        <path
          d="M70 96 Q34 74 26 44 Q56 52 78 78 Q84 88 70 96 Z"
          fill={P.PARROT_BLUE}
          stroke={P.SEA_DEEP}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M72 96 Q56 118 66 140 Q88 136 92 112 Q86 98 72 96 Z"
          fill={P.PARROT_BLUE}
          stroke={P.SEA_DEEP}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      )}

      {/* head crest */}
      <g fill={P.PARROT_YELLOW} stroke={P.GOLD_LINE} strokeWidth="3" strokeLinejoin="round">
        <path
          d={
            happy
              ? "M104 40 Q100 20 112 10 Q116 26 112 40 Z"
              : "M104 42 Q102 26 112 18 Q114 30 112 42 Z"
          }
        />
        <path
          d={
            happy
              ? "M114 40 Q118 18 132 14 Q130 32 120 42 Z"
              : "M114 42 Q118 26 128 22 Q126 36 118 44 Z"
          }
        />
      </g>

      {/* eye — round and bright; happy closes it into an arc */}
      <circle cx="118" cy="66" r="13" fill={P.WHITE} stroke={P.PARROT_RED_DEEP} strokeWidth="3" />
      {happy ? (
        <path
          d="M112 66 q6 -7 12 0"
          fill="none"
          stroke={P.INK}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ) : (
        <circle cx="119" cy="67" r="5" fill={P.INK} />
      )}

      {/* beak */}
      <path
        d="M138 76 Q166 76 164 94 Q154 108 136 100 Q132 86 138 76 Z"
        fill={P.BEAK}
        stroke={P.GOLD_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M138 96 Q148 104 158 100"
        fill="none"
        stroke={P.GOLD_LINE}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* feet on a little perch */}
      <rect
        x="70"
        y="154"
        width="64"
        height="9"
        rx="4.5"
        fill={P.WOOD}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      <g stroke={P.BEAK} strokeWidth="5" strokeLinecap="round">
        <path d="M92 150 v10" fill="none" />
        <path d="M112 150 v10" fill="none" />
      </g>
    </svg>
  );

  if (mood !== "celebrating") return art;
  return (
    <motion.div
      className="pp-motion"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    >
      {art}
    </motion.div>
  );
}
