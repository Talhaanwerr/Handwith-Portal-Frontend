"use client";

import { memo } from "react";

const JARS: readonly (readonly [number, number, string, string])[] = [
  [1130, 70, "#FF8A5C", "#E25A3A"],
  [1215, 92, "#7FD3A0", "#4BAF78"],
  [1300, 60, "#FFD23D", "#E0A91E"],
  [1380, 84, "#B38CF0", "#8A62D8"],
];
const TOOLS = [1180, 1250, 1320, 1390];
const DOORS = [40, 440, 840, 1240];

/**
 * THE KITCHEN — Silly Sandwich's world: a butter-yellow tiled wall, a window
 * with gingham curtains and a blue sky, a shelf of jam jars and a rail of
 * spoons, and a warm wooden counter with cupboard doors along the bottom
 * (in a round, the board's own counter top covers it and holds the tray).
 * Calm: nothing moves. Sliced to fill.
 */
export const SswWorld = memo(function SswWorld() {
  return (
    <div className="ssw-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="ssw-tiles" width="90" height="90" patternUnits="userSpaceOnUse">
            <rect width="90" height="90" fill="#FFE7B0" />
            <rect x="3" y="3" width="84" height="84" rx="10" fill="#FFF0CC" />
          </pattern>
          <pattern id="ssw-check" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#FFFFFF" />
            <rect width="20" height="40" fill="#F26B5B" opacity="0.55" />
            <rect width="40" height="20" fill="#F26B5B" opacity="0.55" />
          </pattern>
          <linearGradient id="ssw-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C9803F" />
            <stop offset="1" stopColor="#A8642C" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#ssw-tiles)" />
        {/* the window */}
        <rect x="150" y="110" width="400" height="330" rx="18" fill="#FFFFFF" />
        <rect x="172" y="132" width="356" height="286" rx="8" fill="#8FD6F6" />
        <ellipse cx="300" cy="230" rx="70" ry="22" fill="#FFFFFF" />
        <ellipse cx="330" cy="214" rx="38" ry="22" fill="#FFFFFF" />
        <circle cx="460" cy="190" r="34" fill="#FFE36E" />
        <path d="M172 360 Q300 320 420 350 T528 340 V418 H172 Z" fill="#8BD46E" />
        <rect x="343" y="132" width="14" height="286" fill="#FFFFFF" />
        <rect x="172" y="268" width="356" height="14" fill="#FFFFFF" />
        <rect x="130" y="430" width="440" height="24" rx="8" fill="#F4F0E6" />
        {/* the curtains */}
        <rect x="110" y="88" width="480" height="18" rx="9" fill="#B5652E" />
        <path d="M120 100 H250 Q230 290 196 470 Q150 470 120 470 Z" fill="url(#ssw-check)" />
        <path d="M580 100 H450 Q470 290 504 470 Q550 470 580 470 Z" fill="url(#ssw-check)" />
        {/* the shelf and its jars */}
        <rect x="1090" y="250" width="380" height="20" rx="6" fill="#B5652E" />
        {JARS.map(([x, h, c, d]) => (
          <g key={x}>
            <rect x={x - 30} y={250 - h} width="60" height={h} rx="12" fill={c} />
            <rect x={x - 30} y={250 - h} width="60" height="16" rx="6" fill={d} />
            <rect
              x={x - 18}
              y={250 - h + 30}
              width="36"
              height="26"
              rx="5"
              fill="#FFFFFF"
              opacity="0.8"
            />
          </g>
        ))}
        {/* the spoon rail */}
        <rect x="1140" y="380" width="290" height="10" rx="5" fill="#9AA3B5" />
        {TOOLS.map((x, i) => (
          <g key={x} fill="#C7CFDD">
            <rect x={x - 4} y="384" width="8" height="120" rx="4" />
            {i % 2 === 0 ? (
              <ellipse cx={x} cy="514" rx="20" ry="26" />
            ) : (
              <rect x={x - 20} y="496" width="40" height="44" rx="8" />
            )}
          </g>
        ))}
        {/* the counter */}
        <g className="ssw-world-counter">
          <rect y="760" width="1600" height="240" fill="url(#ssw-wood)" />
          <rect y="742" width="1600" height="34" rx="8" fill="#EBB070" />
          <rect y="770" width="1600" height="8" fill="#9C5A26" opacity="0.5" />
          {DOORS.map((x) => (
            <g key={x}>
              <rect x={x} y="806" width="320" height="180" rx="14" fill="#B8723A" />
              <rect x={x + 16} y="822" width="288" height="148" rx="10" fill="#C98445" />
              <circle cx={x + 160} cy="840" r="9" fill="#F4D9A6" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});
