"use client";

import { memo } from "react";

const TREES: readonly (readonly [number, number])[] = [
  [110, 600],
  [1490, 610],
  [300, 560],
  [1300, 565],
];

/**
 * RHYME STREET — Rhyme Houses' world: a sunny sky, soft hills with round
 * trees, a green where the houses stand, and a sandy path winding up from
 * the front, where each new picture arrives. Calm: nothing moves. Sliced to
 * fill the stage.
 */
export const RyhWorld = memo(function RyhWorld() {
  return (
    <div className="ryh-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ryh-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86D2F6" />
            <stop offset="1" stopColor="#E6F7FF" />
          </linearGradient>
          <linearGradient id="ryh-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9EDB7C" />
            <stop offset="1" stopColor="#6BBF52" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#ryh-sky)" />
        <circle cx="1330" cy="190" r="78" fill="#FFE36E" />
        <circle cx="1330" cy="190" r="110" fill="#FFE36E" opacity="0.25" />
        <g fill="#FFFFFF" opacity="0.92">
          <ellipse cx="380" cy="220" rx="120" ry="34" />
          <ellipse cx="430" cy="196" rx="62" ry="34" />
          <ellipse cx="900" cy="300" rx="84" ry="24" />
        </g>
        <path d="M0 520 Q300 430 640 500 T1260 470 T1600 500 V700 H0 Z" fill="#B9E6A0" />
        {TREES.map(([x, y]) => (
          <g key={x}>
            <rect x={x - 8} y={y} width="16" height="60" fill="#9A6A44" />
            <circle cx={x} cy={y - 20} r="52" fill="#5DB34E" />
            <circle cx={x - 22} cy={y - 34} r="22" fill="#79C766" />
          </g>
        ))}
        <rect y="640" width="1600" height="360" fill="url(#ryh-green)" />
        <path d="M0 640 Q400 618 800 640 T1600 640 V656 H0 Z" fill="#8CD06C" />
        {/* the sandy path up to the houses */}
        <path
          d="M640 1000 Q700 860 760 800 Q790 760 800 720 Q810 760 840 800 Q900 860 960 1000 Z"
          fill="#F3D89B"
        />
        <path
          d="M700 1000 Q750 880 800 820 Q850 880 900 1000"
          fill="none"
          stroke="#E6C27A"
          strokeWidth="6"
          strokeDasharray="18 22"
        />
      </svg>
    </div>
  );
});
