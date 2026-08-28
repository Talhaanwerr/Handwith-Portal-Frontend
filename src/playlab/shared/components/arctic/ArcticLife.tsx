"use client";

import { useId } from "react";
import { A } from "@shared/components/arctic/palette";

/**
 * MORE ARCTIC LIFE — the birds, the sea and the trails. Same palette, same
 * soft language as ArcticAnimals; underwater pieces kept deliberately
 * subtle (a fin, a tail, ripples) per the theme's restraint rule.
 */

/** The snowy owl — perched, round, wise. */
export function SnowyOwl({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-owl`;
  return (
    <svg
      viewBox="0 0 120 150"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A snowy owl"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.OWL} />
          <stop offset="1" stopColor={A.SNOW_SHADE} />
        </linearGradient>
      </defs>
      {/* body */}
      <path
        d="M26 92 Q22 34 60 30 Q98 34 94 92 Q92 128 60 132 Q28 128 26 92 Z"
        fill={`url(#${gid})`}
        stroke={A.SNOW_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* barred wing marks — the "not a cartoon sticker" detail */}
      <g stroke={A.OWL_MARK} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M34 76 q6 4 12 0" />
        <path d="M74 76 q6 4 12 0" />
        <path d="M40 94 q6 4 12 0" />
        <path d="M68 94 q6 4 12 0" />
        <path d="M52 110 q6 4 12 0" />
      </g>
      {/* face disc */}
      <path
        d="M34 58 Q34 34 60 34 Q86 34 86 58 Q86 74 60 74 Q34 74 34 58 Z"
        fill={A.WHITE}
        stroke={A.SNOW_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="55" r="7" fill={A.FIRE} stroke={A.FIRE_DEEP} strokeWidth="2" />
      <circle cx="72" cy="55" r="7" fill={A.FIRE} stroke={A.FIRE_DEEP} strokeWidth="2" />
      <circle cx="48" cy="56" r="3" fill={A.INK} />
      <circle cx="72" cy="56" r="3" fill={A.INK} />
      <path
        d="M56 62 L60 70 L64 62 Z"
        fill={A.ROCK_DEEP}
        stroke={A.ROCK_DEEP}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* perch feet */}
      <g stroke={A.ROCK_DEEP} strokeWidth="4" strokeLinecap="round">
        <path d="M48 132 v10" fill="none" />
        <path d="M72 132 v10" fill="none" />
      </g>
    </svg>
  );
}

/** The narwhal — the Arctic's unicorn, arcing gently. */
export function Narwhal({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-nar`;
  return (
    <svg viewBox="0 0 220 120" className={`pl-art ${className}`} role="img" aria-label="A narwhal">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.NARWHAL} />
          <stop offset="1" stopColor={A.NARWHAL_DEEP} />
        </linearGradient>
      </defs>
      {/* the tusk — a spiral suggested by two crossing lines */}
      <g>
        <path d="M28 44 L86 58" stroke={A.CRYSTAL} strokeWidth="7" strokeLinecap="round" />
        <path
          d="M28 44 L86 58"
          stroke={A.SNOW_LINE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 8"
        />
      </g>
      {/* body arc */}
      <path
        d="M78 54 Q104 30 146 38 Q192 48 196 78 Q198 96 176 98 Q150 100 122 92 Q90 82 78 54 Z"
        fill={`url(#${gid})`}
        stroke={A.NARWHAL_DEEP}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* belly */}
      <path d="M96 74 Q130 90 168 92 Q140 96 118 90 Q102 84 96 74 Z" fill={A.WHITE} opacity="0.6" />
      {/* tail */}
      <path
        d="M192 74 Q214 62 218 46 Q204 50 196 62 Q208 58 214 44 Q198 48 188 64 Z"
        fill={`url(#${gid})`}
        stroke={A.NARWHAL_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* fin */}
      <path
        d="M124 84 Q128 100 144 104 Q140 90 132 82 Z"
        fill={A.NARWHAL_DEEP}
        stroke={A.NARWHAL_DEEP}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* face */}
      <circle cx="102" cy="56" r="3.4" fill={A.INK} />
      <path
        d="M96 66 q6 5 13 1"
        fill="none"
        stroke={A.INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* mottled back marks */}
      <g fill={A.NARWHAL_DEEP} opacity="0.5">
        <circle cx="140" cy="48" r="3" />
        <circle cx="156" cy="54" r="2.4" />
        <circle cx="148" cy="62" r="2" />
        <circle cx="170" cy="60" r="2.6" />
      </g>
    </svg>
  );
}

/** The arctic hare — sitting tall, ears up. */
export function ArcticHare({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-hare`;
  return (
    <svg
      viewBox="0 0 110 150"
      className={`pl-art ${className}`}
      role="img"
      aria-label="An arctic hare"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.FOX} />
          <stop offset="1" stopColor={A.FOX_SHADE} />
        </linearGradient>
      </defs>
      {/* ears */}
      <path
        d="M34 44 Q28 6 44 4 Q54 6 50 44 Z"
        fill={`url(#${gid})`}
        stroke={A.FOX_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M60 44 Q58 4 72 4 Q84 8 74 46 Z"
        fill={`url(#${gid})`}
        stroke={A.FOX_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M40 38 Q38 14 44 12 Q48 14 46 38 Z" fill={A.SCARF} opacity="0.3" />
      {/* body */}
      <path
        d="M22 118 Q16 72 54 64 Q92 70 88 116 Q86 138 54 140 Q24 138 22 118 Z"
        fill={`url(#${gid})`}
        stroke={A.FOX_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <ellipse cx="55" cy="116" rx="22" ry="16" fill={A.WHITE} opacity="0.7" />
      {/* head */}
      <g transform="translate(26 34)">
        <path
          d="M4 26 Q4 4 28 4 Q52 4 52 26 Q52 44 28 44 Q4 44 4 26 Z"
          fill={`url(#${gid})`}
          stroke={A.FOX_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="22" r="3" fill={A.INK} />
        <circle cx="38" cy="22" r="3" fill={A.INK} />
        <ellipse cx="28" cy="30" rx="3.5" ry="2.8" fill={A.SCARF} />
        <path
          d="M24 36 q4 3 8 0"
          fill="none"
          stroke={A.INK}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <g stroke={A.FOX_LINE} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
          <path d="M12 30 L2 28" fill="none" />
          <path d="M44 30 L54 28" fill="none" />
        </g>
      </g>
      {/* feet */}
      <ellipse
        cx="36"
        cy="140"
        rx="14"
        ry="7"
        fill={`url(#${gid})`}
        stroke={A.FOX_LINE}
        strokeWidth="2.5"
      />
      <ellipse
        cx="72"
        cy="140"
        rx="14"
        ry="7"
        fill={`url(#${gid})`}
        stroke={A.FOX_LINE}
        strokeWidth="2.5"
      />
    </svg>
  );
}

/** An orca fin breaking the water — the subtle open-water accent. */
export function OrcaFin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M50 58 Q52 18 74 8 Q78 34 70 58 Z"
        fill={A.PENGUIN_INK}
        stroke={A.PENGUIN_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g stroke={A.ICE_LIGHT} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M20 60 q14 -6 28 0" />
        <path d="M66 60 q16 -6 32 0" />
      </g>
    </svg>
  );
}

/** A whale tail lifting from the water. */
export function WhaleTail({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 90" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M62 82 Q58 46 40 34 Q24 24 10 28 Q22 40 32 44 Q18 46 8 42 Q18 60 44 62 Q56 64 62 82 Z"
        fill={A.NARWHAL}
        stroke={A.NARWHAL_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
        transform="translate(60 0) scale(-1 1) translate(-60 0)"
      />
      <path
        d="M62 82 Q58 46 40 34 Q24 24 10 28 Q22 40 32 44 Q18 46 8 42 Q18 60 44 62 Q56 64 62 82 Z"
        fill={A.NARWHAL}
        stroke={A.NARWHAL_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
        transform="translate(16 0)"
      />
      <g stroke={A.ICE_LIGHT} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M28 84 q20 -8 44 0" />
        <path d="M84 84 q14 -6 28 0" />
      </g>
    </svg>
  );
}

export type FootprintKind = "penguin" | "bear" | "boots";

/**
 * A footprint trail — optional decoration that walks diagonally across its
 * box. Three kinds, each a repeated stamp, subtle by opacity.
 */
export function Footprints({
  kind = "penguin",
  className = "",
}: {
  kind?: FootprintKind;
  className?: string;
}) {
  const stamp = (x: number, y: number, flip: boolean) => {
    const t = `translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`;
    if (kind === "bear")
      return (
        <g transform={t} key={`${x}-${y}`}>
          <ellipse cx="0" cy="0" rx="8" ry="6.5" />
          <circle cx="-7" cy="-8" r="2.4" />
          <circle cx="-2" cy="-10" r="2.4" />
          <circle cx="3" cy="-10" r="2.4" />
          <circle cx="8" cy="-8" r="2.4" />
        </g>
      );
    if (kind === "boots")
      return (
        <g transform={t} key={`${x}-${y}`}>
          <rect x="-5" y="-10" width="10" height="14" rx="4" />
          <rect x="-5" y="6" width="10" height="5" rx="2.5" />
        </g>
      );
    return (
      <g transform={t} key={`${x}-${y}`}>
        <path d="M0 0 L-6 10 L0 8 L6 10 Z" />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 200 120" className={`pl-art ${className}`} aria-hidden="true">
      <g fill={A.SNOW_DEEP} opacity="0.75">
        {stamp(30, 96, false)}
        {stamp(64, 78, true)}
        {stamp(98, 62, false)}
        {stamp(132, 44, true)}
        {stamp(166, 26, false)}
      </g>
    </svg>
  );
}
