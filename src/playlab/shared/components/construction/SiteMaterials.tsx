"use client";

import { useId } from "react";
import { C } from "@shared/components/construction/palette";

/**
 * MATERIALS, SAFETY AND HAND PROPS — the countable, sortable, matchable
 * stuff of the site (bricks and blocks stack in exact counts for counting
 * games), and the orange layer that says "careful here". Wooden crates and
 * barrels are NOT here: reuse the pirate theme's (wood is wood — README).
 */

/** A stack of bricks in a running bond. `count` rows for counting games. */
export function BrickStack({
  rows = 3,
  className = "",
}: {
  rows?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const h = 22;
  const bricks = [];
  for (let r = 0; r < rows; r++) {
    const y = 96 - (r + 1) * h;
    const off = r % 2 === 0 ? 0 : 22;
    for (let b = 0; b < 3; b++) {
      const x = 10 + off + b * 44;
      if (x + 40 <= 160)
        bricks.push(
          <rect
            key={`${r}-${b}`}
            x={x}
            y={y}
            width="40"
            height={h - 3}
            rx="4"
            fill={C.BRICK}
            stroke={C.BRICK_DEEP}
            strokeWidth="2.5"
          />
        );
    }
  }
  return (
    <svg viewBox="0 0 170 100" className={`pl-art ${className}`} aria-hidden="true">
      {bricks}
    </svg>
  );
}

/* ── Safety ── */

/** The traffic cone — reflective band and all. */
export function TrafficCone({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-cone`;
  return (
    <svg viewBox="0 0 90 110" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.ORANGE} />
          <stop offset="1" stopColor={C.ORANGE_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M36 16 Q45 8 54 16 L72 88 H18 Z"
        fill={`url(#${gid})`}
        stroke={C.ORANGE_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M30 46 L60 46 L64 62 L26 62 Z" fill={C.WHITE} opacity="0.92" />
      <rect
        x="8"
        y="86"
        width="74"
        height="14"
        rx="6"
        fill={C.ORANGE_DEEP}
        stroke={C.ORANGE_DEEP}
        strokeWidth="2"
      />
    </svg>
  );
}

/* ── Hand props ── */

/** The classic red toolbox. */
export function ToolBox({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 100" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M56 30 q0 -14 19 -14 q19 0 19 14"
        fill="none"
        stroke={C.STEEL_LINE}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect
        x="18"
        y="30"
        width="114"
        height="56"
        rx="10"
        fill={C.BRICK}
        stroke={C.BRICK_DEEP}
        strokeWidth="3.5"
      />
      <path d="M18 52 H132" stroke={C.BRICK_DEEP} strokeWidth="3" />
      <rect
        x="64"
        y="44"
        width="22"
        height="14"
        rx="4"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="2.5"
      />
    </svg>
  );
}
