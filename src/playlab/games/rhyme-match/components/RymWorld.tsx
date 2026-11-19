"use client";

import { memo } from "react";

const PICKETS = Array.from({ length: 27 }, (_, i) => i * 62);
const FLOWERS: readonly (readonly [number, number, string])[] = [
  [90, 880, "#FF7A9A"],
  [210, 940, "#FFD23D"],
  [330, 870, "#B38CF0"],
  [1270, 880, "#FF7A9A"],
  [1390, 935, "#FFD23D"],
  [1510, 875, "#B38CF0"],
  [640, 960, "#FF9A5C"],
  [960, 955, "#FF7A9A"],
];

/**
 * THE RHYME GARDEN — Rhyme Match's world: a soft sky, a white picket fence
 * across rolling green hills, and flowers along the front of the lawn, where
 * the pad and the pictures sit. Calm: nothing moves. Sliced to fill.
 */
export const RymWorld = memo(function RymWorld() {
  return (
    <div className="rym-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rym-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8ED8F8" />
            <stop offset="1" stopColor="#E4F7FF" />
          </linearGradient>
          <linearGradient id="rym-lawn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8BD46E" />
            <stop offset="1" stopColor="#5DB547" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#rym-sky)" />
        <circle cx="220" cy="210" r="80" fill="#FFE36E" />
        <circle cx="220" cy="210" r="112" fill="#FFE36E" opacity="0.25" />
        <g fill="#FFFFFF" opacity="0.92">
          <ellipse cx="1150" cy="200" rx="120" ry="36" />
          <ellipse cx="1200" cy="174" rx="66" ry="38" />
          <ellipse cx="640" cy="300" rx="90" ry="26" />
          <ellipse cx="672" cy="282" rx="48" ry="26" />
        </g>
        <path d="M0 560 Q260 470 560 530 T1120 500 T1600 540 V700 H0 Z" fill="#B5E59A" />
        <path d="M0 610 Q420 540 860 600 T1600 590 V720 H0 Z" fill="#9BDB80" />
        {/* the fence */}
        <g fill="#FFFFFF" stroke="#D9D2C3" strokeWidth="3">
          <rect x="0" y="616" width="1600" height="16" />
          <rect x="0" y="660" width="1600" height="16" />
          {PICKETS.map((x) => (
            <path key={x} d={`M${x + 8} 700 V600 L${x + 26} 578 L${x + 44} 600 V700 Z`} />
          ))}
        </g>
        {/* the lawn */}
        <rect y="690" width="1600" height="310" fill="url(#rym-lawn)" />
        <path d="M0 690 Q400 668 800 690 T1600 690 V706 H0 Z" fill="#7ACB5E" />
        {FLOWERS.map(([x, y, c]) => (
          <g key={x}>
            <path d={`M${x} ${y} V${y + 50}`} stroke="#3E9A3A" strokeWidth="6" />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle
                key={a}
                cx={x + 16 * Math.cos((a * Math.PI) / 180)}
                cy={y + 16 * Math.sin((a * Math.PI) / 180)}
                r="13"
                fill={c}
              />
            ))}
            <circle cx={x} cy={y} r="10" fill="#FFF3B0" />
          </g>
        ))}
      </svg>
    </div>
  );
});
