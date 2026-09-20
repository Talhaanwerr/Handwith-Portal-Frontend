"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { P } from "@shared/components/pirate/palette";

/**
 * THE TREASURE MAP — aged parchment with an island, a dotted route and the
 * X, plus a small compass rose. Drawn QUIET on purpose: soft two-tone inks
 * and plenty of empty parchment, so it stays readable used behind UI (a
 * panel background) as well as shown on its own.
 */
export function TreasureMap({ className = "" }: { className?: string }) {
  const uid = useId();
  const parchId = `${uid}-parch`;
  return (
    <svg
      viewBox="0 0 320 230"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A treasure map"
    >
      <defs>
        <linearGradient id={parchId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.PARCH} />
          <stop offset="1" stopColor={P.PARCH_DEEP} />
        </linearGradient>
      </defs>
      {/* parchment with softly irregular edges */}
      <path
        d="M14 22 Q10 12 22 10 Q160 2 298 10 Q310 12 306 24
           Q312 115 306 206 Q310 218 298 220 Q160 228 22 220 Q10 218 14 206 Q8 114 14 22 Z"
        fill={`url(#${parchId})`}
        stroke={P.PARCH_EDGE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* island */}
      <path
        d="M60 150 Q66 108 116 104 Q170 100 176 138 Q182 166 140 172 Q84 178 60 150 Z"
        fill={P.SAND}
        stroke={P.PARCH_EDGE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* landmarks: a palm and two peaks */}
      <g stroke={P.LEAF_DEEP} strokeWidth="3" strokeLinecap="round">
        <path d="M92 138 v-14" />
        <path d="M92 124 q-8 -8 -16 -6 M92 124 q8 -8 16 -6 M92 124 q0 -10 6 -14" fill="none" />
      </g>
      <g fill="none" stroke={P.PARCH_EDGE} strokeWidth="3" strokeLinejoin="round">
        <path d="M126 130 l10 -14 l10 14" />
        <path d="M142 134 l8 -11 l8 11" />
      </g>
      {/* wave marks on the sea part of the paper */}
      <g fill="none" stroke={P.SEA} strokeWidth="2.5" strokeLinecap="round" opacity="0.5">
        <path d="M218 62 q8 -6 16 0 q8 6 16 0" />
        <path d="M232 84 q8 -6 16 0" />
        <path d="M50 60 q8 -6 16 0" />
      </g>
      {/* dotted route to the X */}
      <path
        d="M44 40 Q120 54 150 84 Q166 102 152 128"
        fill="none"
        stroke={P.WOOD_DEEP}
        strokeWidth="4"
        strokeDasharray="1 12"
        strokeLinecap="round"
      />
      {/* the X */}
      <g stroke={P.PARROT_RED_DEEP} strokeWidth="7" strokeLinecap="round">
        <line x1="142" y1="136" x2="162" y2="156" />
        <line x1="162" y1="136" x2="142" y2="156" />
      </g>
      {/* compass rose, small, top-right */}
      <g transform="translate(262 172)">
        <circle r="24" fill={P.PARCH} stroke={P.PARCH_EDGE} strokeWidth="3" />
        <path
          d="M0 -18 L5 0 L0 18 L-5 0 Z"
          fill={P.PARROT_RED}
          stroke={P.PARROT_RED_DEEP}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M-18 0 L0 5 L18 0 L0 -5 Z"
          fill={P.SEA}
          stroke={P.SEA_DEEP}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle r="3.5" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

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
