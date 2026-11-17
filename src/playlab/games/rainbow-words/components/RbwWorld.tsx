"use client";

import { memo } from "react";
import { LESSONS, MODULE_IDS, type ModuleId } from "@games/rainbow-words/constants/rounds";

/** The rainbow's bands, outside in: [radius]. */
const BANDS = MODULE_IDS.map((id, i) => ({ id, r: 640 - i * 38 }));
const FLOWERS: readonly (readonly [number, string])[] = [
  [120, "#FF8FB1"],
  [330, "#FFD54F"],
  [1250, "#FF8FB1"],
  [1470, "#FFD54F"],
];

/**
 * THE RAINBOW MEADOW — Rainbow Words' world: a soft sky, a big rainbow rising
 * behind green hills, and a few flowers. The lesson's own band (and every
 * band before it) is painted in its colour; the bands still to come are pale,
 * so the rainbow fills in as the lessons are played. Calm: nothing moves.
 * Sliced to fill the stage.
 */
export const RbwWorld = memo(function RbwWorld({ lesson }: { lesson: ModuleId }) {
  const upTo = MODULE_IDS.indexOf(lesson);
  return (
    <div className="rbw-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rbw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8FD3F6" />
            <stop offset="1" stopColor="#E6F7FF" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#rbw-sky)" />
        <g fill="none" strokeWidth="38">
          {BANDS.map((b, i) => (
            <circle
              key={b.id}
              cx="800"
              cy="900"
              r={b.r}
              stroke={i <= upTo ? LESSONS[b.id].accent : "#FFFFFF"}
              opacity={i <= upTo ? 0.95 : 0.4}
            />
          ))}
        </g>
        <g fill="#FFFFFF" opacity="0.95">
          <ellipse cx="170" cy="700" rx="170" ry="70" />
          <ellipse cx="300" cy="650" rx="110" ry="70" />
          <ellipse cx="1430" cy="700" rx="170" ry="70" />
          <ellipse cx="1300" cy="650" rx="110" ry="70" />
        </g>
        <path d="M0 780 Q400 690 800 760 T1600 740 V1000 H0 Z" fill="#8FD18A" />
        <path d="M0 860 Q420 790 860 850 T1600 830 V1000 H0 Z" fill="#6DBE6A" />
        {FLOWERS.map(([x, c]) => (
          <g key={x}>
            <rect x={x - 3} y="900" width="6" height="50" fill="#3E8E45" />
            <circle cx={x} cy="896" r="20" fill={c} />
            <circle cx={x} cy="896" r="8" fill="#FFFFFF" />
          </g>
        ))}
      </svg>
    </div>
  );
});
