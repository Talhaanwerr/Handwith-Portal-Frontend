"use client";

import { memo } from "react";

/** Stars on a fixed, spread-out pattern (no randomness at render). */
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 389 + 61) % 1600,
  y: (i * 223 + 37) % 760,
  r: 1.6 + ((i * 7) % 5) * 0.55,
}));
/** A few that twinkle (CSS opacity only). */
const TWINKLES: readonly (readonly [number, number, number])[] = [
  [180, 130, 0],
  [560, 90, 0.8],
  [980, 160, 1.6],
  [1420, 110, 0.4],
  [760, 300, 2.2],
  [1260, 380, 1.2],
  [300, 420, 2.8],
];
const CRATERS: readonly (readonly [number, number, number])[] = [
  [170, 900, 46],
  [420, 948, 30],
  [1180, 920, 52],
  [1450, 960, 28],
  [860, 975, 22],
];

const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;

/**
 * DEEP SPACE — Rhyme Rocket's world: a deep navy sky full of stars, two soft
 * nebula glows, a little ringed planet and a crescent moon far away, and a
 * lilac moon-ground with craters along the bottom, where the launch pad
 * stands. Only a few stars twinkle. Sliced to fill.
 */
export const RrkWorld = memo(function RrkWorld() {
  return (
    <div className="rrk-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rrk-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0A1238" />
            <stop offset="0.65" stopColor="#1A2468" />
            <stop offset="1" stopColor="#2C2F86" />
          </linearGradient>
          <radialGradient id="rrk-neb-a">
            <stop offset="0" stopColor="#8E5BE8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8E5BE8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rrk-neb-b">
            <stop offset="0" stopColor="#2FC6D9" stopOpacity="0.38" />
            <stop offset="1" stopColor="#2FC6D9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rrk-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8C82D0" />
            <stop offset="1" stopColor="#5E54A6" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#rrk-sky)" />
        <ellipse cx="330" cy="330" rx="420" ry="260" fill="url(#rrk-neb-a)" />
        <ellipse cx="1300" cy="520" rx="460" ry="250" fill="url(#rrk-neb-b)" />
        <g fill="#FFFFFF">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={0.45 + ((i * 3) % 6) * 0.09} />
          ))}
        </g>
        <g fill="#FFF6C8">
          {TWINKLES.map(([x, y, d]) => (
            <path
              key={x}
              className="rrk-twinkle"
              style={{ animationDelay: `${d}s` }}
              d={sparkle(x, y, 16)}
            />
          ))}
        </g>
        {/* a little ringed planet, far away */}
        <g transform="translate(1440 230) rotate(-16)">
          <ellipse rx="92" ry="20" fill="none" stroke="#F7B2D0" strokeWidth="9" opacity="0.9" />
          <circle r="50" fill="#F28DB8" />
          <path d="M-50 0 A50 50 0 0 0 50 0 Z" fill="#D9679A" opacity="0.5" />
          <path d="M-92 0 A92 20 0 0 0 92 0" fill="none" stroke="#F7B2D0" strokeWidth="9" />
        </g>
        {/* a crescent moon */}
        <path d="M150 170 A70 70 0 1 0 220 260 A56 56 0 1 1 150 170 Z" fill="#FFE58A" />
        {/* the moon-ground */}
        <path
          d="M0 830 Q200 790 420 818 T860 806 T1260 822 T1600 800 V1000 H0 Z"
          fill="url(#rrk-ground)"
        />
        <path
          d="M0 830 Q200 790 420 818 T860 806 T1260 822 T1600 800 V826 Q1260 846 860 830 T0 852 Z"
          fill="#A79EE2"
        />
        {CRATERS.map(([x, y, r]) => (
          <g key={x}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.36} fill="#4F468F" />
            <ellipse cx={x} cy={y + r * 0.08} rx={r * 0.8} ry={r * 0.24} fill="#6B61B3" />
          </g>
        ))}
      </svg>
    </div>
  );
});
