"use client";

import { memo } from "react";

/** The stone courses of the tower wall: [y, x-offset]. */
const COURSES = Array.from({ length: 9 }, (_, i) => [60 + i * 70, i % 2 ? 0 : -60] as const);
const STARS: readonly (readonly [number, number, number])[] = [
  [700, 150, 7],
  [780, 230, 5],
  [880, 140, 6],
  [940, 260, 4],
  [820, 330, 5],
  [730, 300, 4],
];
/** The potions on the shelf: [x, colour, height, round?]. */
const POTIONS: readonly (readonly [number, string, number, boolean])[] = [
  [1180, "#3FD1C2", 90, true],
  [1262, "#FF6FB1", 120, false],
  [1340, "#FFC93D", 80, true],
  [1418, "#8A6CFF", 110, false],
  [1496, "#5EE07A", 96, true],
];
const CANDLES: readonly (readonly [number, number])[] = [
  [130, 120],
  [210, 90],
  [290, 140],
];

/**
 * THE WIZARD'S TOWER ROOM — Magic Hat Swap's world: a purple stone wall, a
 * round window on a teal night with a moon and stars, a shelf of bright
 * potion bottles on the right, three candles on a ledge on the left and a
 * wooden floor with a star rug where the card and the hat stand. Calm:
 * nothing moves. Sliced to fill.
 */
export const MhtWorld = memo(function MhtWorld() {
  return (
    <div className="mht-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mht-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3B2470" />
            <stop offset="1" stopColor="#5B3A9E" />
          </linearGradient>
          <linearGradient id="mht-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0E5C6E" />
            <stop offset="1" stopColor="#1C8C97" />
          </linearGradient>
          <linearGradient id="mht-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8A5534" />
            <stop offset="1" stopColor="#5E3620" />
          </linearGradient>
          <radialGradient id="mht-glow">
            <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#mht-wall)" />
        {/* stone courses */}
        <g stroke="#2E1A5C" strokeWidth="5" opacity="0.55">
          {COURSES.map(([y, off]) => (
            <g key={y}>
              <path d={`M0 ${y} H1600`} />
              {Array.from({ length: 11 }, (_, k) => off + k * 160).map((x) => (
                <path key={x} d={`M${x} ${y} V${y + 70}`} />
              ))}
            </g>
          ))}
        </g>
        {/* the round window on the night */}
        <circle cx="820" cy="240" r="190" fill="#2E1A5C" />
        <circle cx="820" cy="240" r="166" fill="url(#mht-night)" />
        <circle cx="900" cy="190" r="48" fill="#FFF4C2" />
        <circle cx="922" cy="176" r="44" fill="#16707F" />
        {STARS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#FFFFFF" opacity="0.9" />
        ))}
        <path d="M654 240 H986 M820 74 V406" stroke="#2E1A5C" strokeWidth="14" />
        <circle cx="820" cy="240" r="166" fill="none" stroke="#C9A0FF" strokeWidth="6" />
        {/* the candle ledge */}
        <rect x="60" y="330" width="320" height="26" rx="8" fill="#7A4A2A" />
        <rect x="60" y="350" width="320" height="12" rx="6" fill="#5A321A" />
        {CANDLES.map(([x, h]) => (
          <g key={x}>
            <circle cx={x} cy={330 - h - 26} r="60" fill="url(#mht-glow)" />
            <rect x={x - 16} y={330 - h} width="32" height={h} rx="6" fill="#FFF1DA" />
            <path
              d={`M${x} ${330 - h - 46} Q${x + 16} ${330 - h - 18} ${x} ${330 - h - 6} Q${x - 16} ${330 - h - 18} ${x} ${330 - h - 46} Z`}
              fill="#FFC93D"
            />
            <path
              d={`M${x} ${330 - h - 30} Q${x + 7} ${330 - h - 16} ${x} ${330 - h - 8} Q${x - 7} ${330 - h - 16} ${x} ${330 - h - 30} Z`}
              fill="#FF7A3D"
            />
          </g>
        ))}
        {/* the potion shelf */}
        <rect x="1130" y="420" width="420" height="26" rx="8" fill="#7A4A2A" />
        <rect x="1130" y="440" width="420" height="12" rx="6" fill="#5A321A" />
        {POTIONS.map(([x, c, h, round]) => (
          <g key={x}>
            {round ? (
              <circle cx={x} cy={420 - h / 2} r={h / 2} fill={c} />
            ) : (
              <rect x={x - 26} y={420 - h} width="52" height={h} rx="14" fill={c} />
            )}
            <rect x={x - 11} y={420 - h - 30} width="22" height="34" rx="4" fill="#E8DDF8" />
            <rect x={x - 14} y={420 - h - 40} width="28" height="14" rx="5" fill="#A0673A" />
            <ellipse
              cx={x - 10}
              cy={420 - h * 0.62}
              rx="7"
              ry={h * 0.16}
              fill="#FFFFFF"
              opacity="0.5"
            />
          </g>
        ))}
        {/* floor and rug */}
        <rect y="700" width="1600" height="300" fill="url(#mht-floor)" />
        <g stroke="#4E2C18" strokeWidth="5" opacity="0.6">
          {[760, 830, 910].map((y) => (
            <path key={y} d={`M0 ${y} H1600`} />
          ))}
        </g>
        <rect y="694" width="1600" height="14" fill="#2E1A5C" opacity="0.5" />
        <ellipse cx="800" cy="880" rx="640" ry="110" fill="#1C8C97" />
        <ellipse cx="800" cy="880" rx="590" ry="88" fill="none" stroke="#FFC93D" strokeWidth="8" />
        {[460, 800, 1140].map((x) => (
          <path
            key={x}
            d={`M${x} 852 L${x + 10} 874 L${x + 34} 876 L${x + 15} 890 L${x + 22} 914 L${x} 900 L${x - 22} 914 L${x - 15} 890 L${x - 34} 876 L${x - 10} 874 Z`}
            fill="#FFC93D"
            opacity="0.85"
          />
        ))}
      </svg>
    </div>
  );
});
