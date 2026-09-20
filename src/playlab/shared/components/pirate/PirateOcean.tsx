"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { P } from "@shared/components/pirate/palette";

/**
 * THE PIRATE OCEAN — layered water for any screen in the theme.
 *
 * Three wave bands over a depth gradient, drawn to tile the full width at
 * any aspect (preserveAspectRatio="none" on the bands, which stretch
 * gracefully because they are long low curves). Works as a full-screen
 * background or, via `heightClassName`, as a lower-screen sea for a beach
 * scene.
 *
 * `drift` allows the one movement the sea earns — the front band sliding a
 * few pixels — and is off by default; a still sea is a calm sea.
 */
export function PirateOcean({
  drift = false,
  className = "",
}: {
  drift?: boolean;
  className?: string;
}) {
  const uid = useId();
  const depthId = `${uid}-depth`;

  return (
    <div className={`pp-ocean pointer-events-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 300" preserveAspectRatio="none" className="pp-fill">
        <defs>
          <linearGradient id={depthId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.SEA_LIGHT} />
            <stop offset="0.5" stopColor={P.SEA} />
            <stop offset="1" stopColor={P.SEA_DEEP} />
          </linearGradient>
        </defs>
        <rect width="800" height="300" fill={`url(#${depthId})`} />
        {/* horizon light */}
        <rect width="800" height="26" fill={P.FOAM} opacity="0.25" />
        {/* back band */}
        <path
          d="M0 60 Q100 44 200 60 T400 60 T600 60 T800 60 V300 H0 Z"
          fill={P.SEA}
          opacity="0.7"
        />
        {/* mid band with foam crest */}
        <path
          d="M0 130 Q100 110 200 130 T400 130 T600 130 T800 130 V300 H0 Z"
          fill={P.SEA_DEEP}
          opacity="0.45"
        />
        <path
          d="M0 130 Q100 110 200 130 T400 130 T600 130 T800 130"
          fill="none"
          stroke={P.FOAM}
          strokeWidth="5"
          opacity="0.5"
        />
      </svg>
      {/* front band — the one allowed to move */}
      <motion.svg
        viewBox="0 0 900 120"
        preserveAspectRatio="none"
        className="pp-ocean-front"
        animate={drift ? { x: [0, -34, 0] } : undefined}
        transition={drift ? { duration: 9, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <path d="M0 40 Q112 18 225 40 T450 40 T675 40 T900 40 V120 H0 Z" fill={P.SEA_DEEP} />
        <path
          d="M0 40 Q112 18 225 40 T450 40 T675 40 T900 40"
          fill="none"
          stroke={P.FOAM}
          strokeWidth="6"
          opacity="0.6"
        />
      </motion.svg>
    </div>
  );
}

/* ── Island pieces — composable, so every screen can build its own shore ── */

/** A sandy mound with a soft shoreline. The base every island scene starts from. */
export function IslandMound({ className = "" }: { className?: string }) {
  const uid = useId();
  const sandId = `${uid}-sand`;
  return (
    <svg viewBox="0 0 300 110" className={`pp-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={sandId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.SAND} />
          <stop offset="1" stopColor={P.SAND_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M6 104 Q40 40 150 34 Q262 40 294 104 Z"
        fill={`url(#${sandId})`}
        stroke={P.SAND_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M28 96 Q150 66 272 96" fill="none" stroke={P.FOAM} strokeWidth="4" opacity="0.55" />
    </svg>
  );
}

/** A friendly palm — trunk with segment lines and five soft fronds. */
export function PalmTree({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 200" className={`pp-art ${className}`} aria-hidden="true">
      <path
        d="M76 196 Q66 130 80 66 L96 70 Q86 132 94 196 Z"
        fill={P.TRUNK}
        stroke={P.WOOD_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g stroke={P.WOOD_LINE} strokeWidth="2" opacity="0.4">
        <path d="M74 160 h20" />
        <path d="M76 124 h18" />
        <path d="M79 92 h16" />
      </g>
      <g fill={P.LEAF} stroke={P.LEAF_DEEP} strokeWidth="3" strokeLinejoin="round">
        <path d="M86 66 Q40 40 10 62 Q44 74 84 74 Z" />
        <path d="M86 66 Q54 22 18 24 Q52 52 84 70 Z" />
        <path d="M88 64 Q92 14 128 6 Q118 48 92 70 Z" />
        <path d="M90 66 Q134 34 154 52 Q124 74 92 74 Z" />
        <path d="M88 68 Q120 60 148 78 Q116 86 90 76 Z" />
      </g>
      <circle cx="80" cy="72" r="7" fill={P.WOOD} stroke={P.WOOD_LINE} strokeWidth="2.5" />
      <circle cx="94" cy="76" r="6" fill={P.WOOD} stroke={P.WOOD_LINE} strokeWidth="2.5" />
    </svg>
  );
}

/** Two soft shoreline rocks. */
export function ShoreRocks({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 70" className={`pp-art ${className}`} aria-hidden="true">
      <path
        d="M12 62 Q10 30 44 26 Q76 26 78 60 Z"
        fill={P.IRON}
        stroke={P.IRON_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M74 62 Q76 40 102 38 Q128 40 130 62 Z"
        fill={P.IRON_DEEP}
        stroke={P.IRON_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M24 38 Q34 32 46 34"
        fill="none"
        stroke={P.FOAM}
        strokeWidth="3"
        opacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A small starfish and shell pair for shorelines. */
export function Seashells({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={`pp-art ${className}`} aria-hidden="true">
      {/* starfish */}
      <path
        d="M30 8 L36 24 L52 26 L39 36 L44 52 L30 42 L16 52 L21 36 L8 26 L24 24 Z"
        fill={P.PARROT_RED}
        stroke={P.PARROT_RED_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* shell */}
      <path
        d="M76 46 Q72 22 92 16 Q112 22 108 46 Q92 54 76 46 Z"
        fill={P.SAIL}
        stroke={P.PARCH_EDGE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g stroke={P.PARCH_EDGE} strokeWidth="2" opacity="0.7">
        <path d="M92 18 L92 48" fill="none" />
        <path d="M84 20 L88 48" fill="none" />
        <path d="M100 20 L96 48" fill="none" />
      </g>
    </svg>
  );
}
