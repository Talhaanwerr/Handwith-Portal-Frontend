"use client";

import { memo } from "react";

const RAYS = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);
const TUFTS: readonly (readonly [number, number])[] = [
  [60, 930],
  [250, 965],
  [470, 940],
  [700, 975],
  [930, 945],
  [1150, 970],
  [1370, 940],
  [1560, 965],
];
const POPPIES: readonly (readonly [number, number, string])[] = [
  [140, 900, "#E8483C"],
  [380, 930, "#F6D14B"],
  [610, 905, "#E8483C"],
  [820, 935, "#FFFFFF"],
  [1060, 905, "#E8483C"],
  [1290, 930, "#F6D14B"],
  [1480, 900, "#FFFFFF"],
];
const LEAVES: readonly (readonly [number, number, number])[] = [
  [40, 60, 150],
  [190, 10, 130],
  [330, 70, 120],
  [120, 190, 120],
  [1500, 40, 150],
  [1370, 0, 120],
  [1600, 190, 140],
];

/**
 * THE GOLDEN MEADOW — Finish My Song's world: a warm evening sky, the sun
 * sitting low over violet hills, a meadow of long gold grass and poppies, and
 * the leafy edges of two big trees framing the top corners. Calm: nothing
 * moves. Sliced to fill the stage.
 */
export const FmsWorld = memo(function FmsWorld() {
  return (
    <div className="fms-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fms-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F7A26B" />
            <stop offset="0.45" stopColor="#FFC98A" />
            <stop offset="1" stopColor="#FFE7B8" />
          </linearGradient>
          <radialGradient id="fms-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFF4C4" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFF4C4" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fms-field" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C9C25E" />
            <stop offset="1" stopColor="#8FA343" />
          </linearGradient>
        </defs>

        <rect width="1600" height="1000" fill="url(#fms-sky)" />
        {/* the low sun and its glow */}
        <circle cx="1040" cy="560" r="300" fill="url(#fms-glow)" />
        {RAYS.map((a) => (
          <path
            key={a}
            d={`M${1040 + Math.cos(a) * 130} ${560 + Math.sin(a) * 130} L${1040 + Math.cos(a + 0.12) * 260} ${560 + Math.sin(a + 0.12) * 260} L${1040 + Math.cos(a - 0.12) * 260} ${560 + Math.sin(a - 0.12) * 260} Z`}
            fill="#FFF0B0"
            opacity="0.35"
          />
        ))}
        <circle cx="1040" cy="560" r="105" fill="#FFE07A" />
        {/* pink evening clouds */}
        <g fill="#FFD3C2" opacity="0.9">
          <ellipse cx="420" cy="250" rx="150" ry="34" />
          <ellipse cx="480" cy="226" rx="80" ry="36" />
          <ellipse cx="1220" cy="300" rx="120" ry="28" />
          <ellipse cx="1260" cy="282" rx="60" ry="28" />
        </g>
        {/* violet hills far off, then the meadow */}
        <path d="M0 600 Q260 520 560 590 T1100 580 T1600 560 V700 H0 Z" fill="#B48AB8" />
        <path d="M0 650 Q420 590 820 640 T1600 620 V720 H0 Z" fill="#C79A8E" />
        <path d="M0 680 Q500 630 1000 670 T1600 660 V1000 H0 Z" fill="url(#fms-field)" />
        <path d="M0 760 Q400 730 800 760 T1600 750 V1000 H0 Z" fill="#A6B24C" opacity="0.7" />
        {/* long grass and flowers along the front */}
        {TUFTS.map(([x, y]) => (
          <path
            key={x}
            d={`M${x - 40} ${y + 40} Q${x - 30} ${y - 40} ${x - 14} ${y - 70} Q${x - 10} ${y - 10} ${x} ${y + 40} Q${x + 8} ${y - 60} ${x + 26} ${y - 90} Q${x + 20} ${y - 10} ${x + 40} ${y + 40} Z`}
            fill="#7E9437"
          />
        ))}
        {POPPIES.map(([x, y, c]) => (
          <g key={x}>
            <path
              d={`M${x} ${y} Q${x + 6} ${y + 40} ${x} ${y + 80}`}
              stroke="#5E7A2A"
              strokeWidth="5"
              fill="none"
            />
            <circle cx={x - 10} cy={y} r="13" fill={c} />
            <circle cx={x + 10} cy={y} r="13" fill={c} />
            <circle cx={x} cy={y - 10} r="13" fill={c} />
            <circle cx={x} cy={y + 8} r="12" fill={c} />
            <circle cx={x} cy={y} r="7" fill="#4A3A20" />
          </g>
        ))}
        {/* the trees' leafy edges in the top corners, lit warm */}
        <rect x="-20" y="0" width="70" height="700" fill="#6E4A2C" />
        <rect x="1560" y="0" width="70" height="720" fill="#6E4A2C" />
        {LEAVES.map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r} fill="#5C8A3A" />
            <circle cx={x + r * 0.25} cy={y + r * 0.2} r={r * 0.7} fill="#7FA94A" />
          </g>
        ))}
      </svg>
    </div>
  );
});
