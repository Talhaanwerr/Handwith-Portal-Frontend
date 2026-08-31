"use client";

import { motion } from "framer-motion";
import { P } from "@shared/components/pirate/palette";

/**
 * The pirate flag's DRAWING, as a plain SVG group so the ship can mount it
 * at its masthead and the standalone flag can wrap it — one motif, two
 * homes, zero copies.
 *
 * The skull is deliberately a friendly one: round head, big soft eyes, a
 * small smile — "pirate adventure" at a glance, nothing to frighten anyone.
 * Sized from its left edge (the hoist) so it hangs naturally off a mast.
 */
export function PirateFlagMotif({ width = 100 }: { width?: number }) {
  const s = width / 100;
  return (
    <g transform={`scale(${s})`}>
      <path
        d="M2 4 Q40 -4 96 6 Q86 22 96 40 Q40 50 2 42 Z"
        fill={P.FLAG_INK}
        stroke={P.FLAG_INK_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* friendly skull */}
      <circle cx="42" cy="20" r="11" fill={P.WHITE} />
      <path d="M36 28 h12 v5 q-6 3 -12 0 Z" fill={P.WHITE} />
      <circle cx="38" cy="19" r="2.6" fill={P.FLAG_INK_DEEP} />
      <circle cx="46" cy="19" r="2.6" fill={P.FLAG_INK_DEEP} />
      <path
        d="M39 26 q3 2.4 6 0"
        fill="none"
        stroke={P.FLAG_INK_DEEP}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* soft crossbones */}
      <g stroke={P.WHITE} strokeWidth="4.5" strokeLinecap="round" opacity="0.95">
        <line x1="58" y1="12" x2="78" y2="30" />
        <line x1="78" y1="12" x2="58" y2="30" />
      </g>
    </g>
  );
}

/**
 * The standalone flag on its own pole. `flutter` allows the one movement a
 * flag earns — a slow, gentle wave — and is off by default.
 */
export function PirateFlag({
  flutter = false,
  className = "",
}: {
  flutter?: boolean;
  className?: string;
}) {
  const cloth = (
    <g transform="translate(14 8)">
      <PirateFlagMotif width={100} />
    </g>
  );

  return (
    <svg
      viewBox="0 0 124 130"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A friendly pirate flag"
    >
      <rect
        x="6"
        y="2"
        width="8"
        height="124"
        rx="4"
        fill={P.WOOD_DEEP}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      <circle cx="10" cy="6" r="6" fill={P.WOOD_GOLD} stroke={P.WOOD_LINE} strokeWidth="2" />
      {flutter ? (
        <motion.g
          animate={{ skewY: [0, 2.5, 0, -2, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {cloth}
        </motion.g>
      ) : (
        cloth
      )}
    </svg>
  );
}
