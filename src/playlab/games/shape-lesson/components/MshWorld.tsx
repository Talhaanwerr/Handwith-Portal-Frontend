"use client";

import { memo } from "react";
import type { SceneId } from "@games/shape-lesson/constants/lessons";

/**
 * The five lessons' worlds — each one built from its own shape, so the
 * scene itself is part of the lesson: a park of round trees and balloons
 * (circle), a blue town of square windows (square), a camp of tents and pine
 * trees under pointed hills (triangle), an orange station of long buildings
 * and rails (rectangle), and a purple night sky full of stars (star). The
 * middle is kept calm for the board; the detail sits at the edges and along
 * the ground. Sliced to fill; nothing random.
 */
export const MshWorld = memo(function MshWorld({ scene }: { scene: SceneId }) {
  return (
    <div className={`msh-world msh-world--${scene}`} aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        {scene === "park" && <Park />}
        {scene === "town" && <Town />}
        {scene === "camp" && <Camp />}
        {scene === "station" && <Station />}
        {scene === "night" && <Night />}
      </svg>
    </div>
  );
});

/* ─── Circle: the park ──────────────────────────────────────────────────── */
const ROUND_TREES: readonly (readonly [number, number, number])[] = [
  [90, 700, 120],
  [250, 760, 90],
  [1360, 740, 100],
  [1520, 690, 130],
];
const BALLOONS: readonly (readonly [number, number, string])[] = [
  [1300, 250, "#F2463F"],
  [1380, 200, "#FFCE2E"],
  [1450, 270, "#2F86F0"],
];
const Park = memo(function Park() {
  return (
    <>
      <defs>
        <linearGradient id="msh-park-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9ED8FF" />
          <stop offset="1" stopColor="#E6F7FF" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#msh-park-sky)" />
      <circle cx="210" cy="190" r="86" fill="#FFE066" />
      <circle cx="210" cy="190" r="118" fill="#FFE066" opacity="0.25" />
      {[
        [520, 150],
        [1000, 110],
      ].map(([x, y]) => (
        <g key={x} fill="#FFFFFF">
          <circle cx={x} cy={y} r="42" />
          <circle cx={x + 50} cy={y - 18} r="52" />
          <circle cx={x + 104} cy={y} r="40" />
          <rect x={x} y={y} width="104" height="40" />
        </g>
      ))}
      {BALLOONS.map(([x, y, c]) => (
        <g key={x}>
          <path
            d={`M${x} ${y + 62} Q${x - 20} ${y + 150} ${x + 10} ${y + 250}`}
            stroke="#6B6B6B"
            strokeWidth="4"
            fill="none"
          />
          <circle cx={x} cy={y} r="58" fill={c} />
          <circle cx={x - 18} cy={y - 20} r="14" fill="#FFFFFF" opacity="0.5" />
        </g>
      ))}
      <path d="M0 640 Q300 560 640 620 T1240 600 T1600 590 V1000 H0 Z" fill="#8FD86A" />
      <path d="M0 760 Q400 700 820 750 T1600 730 V1000 H0 Z" fill="#6BC24A" />
      <path d="M560 1000 Q700 860 800 820 Q900 860 1040 1000 Z" fill="#F3DFA6" />
      {ROUND_TREES.map(([x, y, r]) => (
        <g key={x}>
          <rect x={x - 14} y={y} width="28" height={r * 1.4} rx="10" fill="#9A6234" />
          <circle cx={x} cy={y - r * 0.3} r={r} fill="#3E9E3A" />
          <circle cx={x - r * 0.3} cy={y - r * 0.6} r={r * 0.35} fill="#5DBE52" />
        </g>
      ))}
      {[440, 520, 1080, 1160, 1220].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={900 + (i % 2) * 30}
          r="16"
          fill={i % 2 ? "#FF6FB1" : "#F2463F"}
        />
      ))}
    </>
  );
});

/* ─── Square: the town ──────────────────────────────────────────────────── */
const BLOCKS: readonly (readonly [number, number, number, string])[] = [
  [0, 380, 230, "#5D8FD6"],
  [210, 300, 200, "#7FA9E6"],
  [1180, 340, 200, "#7FA9E6"],
  [1360, 260, 240, "#5D8FD6"],
];
const Town = memo(function Town() {
  return (
    <>
      <rect width="1600" height="1000" fill="#CFE6FF" />
      <circle cx="1460" cy="140" r="70" fill="#FFF3B0" />
      {/* far buildings, pale */}
      {[360, 520, 700, 880, 1040].map((x, i) => (
        <rect key={x} x={x} y={430 + (i % 3) * 40} width="150" height="400" fill="#B4CFF2" />
      ))}
      {BLOCKS.map(([x, top, w, c]) => (
        <g key={x}>
          <rect x={x} y={top} width={w} height={900 - top} fill={c} />
          {Array.from({ length: 4 }, (_, r) =>
            [0, 1].map((col) => (
              <rect
                key={`${r}-${col}`}
                x={x + 34 + col * (w / 2)}
                y={top + 40 + r * 110}
                width="60"
                height="60"
                rx="14"
                fill={r === 1 && col === 0 ? "#FFF0A8" : "#A9C8F2"}
              />
            ))
          )}
        </g>
      ))}
      <rect y="830" width="1600" height="40" fill="#D8DCE6" />
      <rect y="870" width="1600" height="130" fill="#5B6577" />
      {[80, 360, 640, 920, 1200, 1480].map((x) => (
        <rect key={x} x={x} y="928" width="120" height="16" rx="6" fill="#F5F5F5" />
      ))}
    </>
  );
});

/* ─── Triangle: the camp ────────────────────────────────────────────────── */
const PINES: readonly (readonly [number, number, number])[] = [
  [70, 760, 1.2],
  [230, 720, 0.9],
  [1380, 730, 1],
  [1530, 770, 1.25],
];
const Camp = memo(function Camp() {
  return (
    <>
      <rect width="1600" height="1000" fill="#DDF4FF" />
      <path d="M-40 640 L320 220 L700 640 Z" fill="#9BC7B4" />
      <path d="M220 340 L320 220 L420 340 L370 320 L320 350 L270 320 Z" fill="#FFFFFF" />
      <path d="M900 640 L1290 180 L1680 640 Z" fill="#86B8A3" />
      <path d="M1180 310 L1290 180 L1400 310 L1345 290 L1290 320 L1235 290 Z" fill="#FFFFFF" />
      <path d="M0 640 Q400 600 800 630 T1600 620 V1000 H0 Z" fill="#7ACB5C" />
      <path d="M0 800 Q500 760 900 790 T1600 780 V1000 H0 Z" fill="#5DB346" />
      {PINES.map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-12" y="40" width="24" height="70" fill="#8A5A2E" />
          <path d="M0 -190 L70 -80 H-70 Z" fill="#2F8F4A" />
          <path d="M0 -130 L90 0 H-90 Z" fill="#2F8F4A" />
          <path d="M0 -70 L110 60 H-110 Z" fill="#257A3E" />
        </g>
      ))}
      {/* two tents */}
      <g transform="translate(330 900)">
        <path d="M-150 0 L0 -220 L150 0 Z" fill="#FF9A1F" />
        <path d="M-40 0 L0 -120 L40 0 Z" fill="#7A3E06" />
        <path d="M0 -220 L150 0 H110 L0 -170 Z" fill="#E07A0A" />
      </g>
      <g transform="translate(1260 920)">
        <path d="M-130 0 L0 -190 L130 0 Z" fill="#F2463F" />
        <path d="M-34 0 L0 -100 L34 0 Z" fill="#7A1C18" />
        <path d="M0 -190 L130 0 H96 L0 -146 Z" fill="#C9302A" />
      </g>
      {/* a campfire */}
      <g transform="translate(1020 940)">
        <rect
          x="-60"
          y="-12"
          width="120"
          height="22"
          rx="10"
          fill="#8A5A2E"
          transform="rotate(12)"
        />
        <rect
          x="-60"
          y="-12"
          width="120"
          height="22"
          rx="10"
          fill="#9C6838"
          transform="rotate(-12)"
        />
        <path d="M0 -110 L40 -10 H-40 Z" fill="#FF9A1F" />
        <path d="M0 -60 L22 -10 H-22 Z" fill="#FFE066" />
      </g>
    </>
  );
});

/* ─── Rectangle: the station ────────────────────────────────────────────── */
const STATION_BLOCKS: readonly (readonly [number, number, number, string])[] = [
  [0, 420, 300, "#F0B37A"],
  [260, 500, 260, "#E79E5C"],
  [1100, 470, 260, "#E79E5C"],
  [1320, 380, 280, "#F0B37A"],
];
const Station = memo(function Station() {
  return (
    <>
      <defs>
        <linearGradient id="msh-station-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD59E" />
          <stop offset="1" stopColor="#FFF1DC" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#msh-station-sky)" />
      {/* long buildings behind */}
      {STATION_BLOCKS.map(([x, y, w, c]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={760 - y} fill={c} />
          {[0, 1, 2].map((r) => (
            <rect
              key={r}
              x={x + 30}
              y={y + 40 + r * 90}
              width={w - 60}
              height="44"
              rx="6"
              fill="#FFF4E0"
              stroke="#B8651E"
              strokeWidth="6"
            />
          ))}
        </g>
      ))}
      {/* the station roof and its sign */}
      <rect x="560" y="180" width="480" height="70" rx="14" fill="#BC610A" />
      <rect x="600" y="250" width="22" height="510" fill="#8C4A0C" />
      <rect x="978" y="250" width="22" height="510" fill="#8C4A0C" />
      {/* the platform and the rails */}
      <rect y="760" width="1600" height="80" fill="#C9B79C" />
      <rect y="760" width="1600" height="16" fill="#F7E3A5" />
      <rect y="840" width="1600" height="160" fill="#8F8578" />
      {Array.from({ length: 17 }, (_, i) => (
        <rect key={i} x={i * 100 - 10} y="890" width="60" height="90" rx="6" fill="#6B5240" />
      ))}
      <rect y="900" width="1600" height="14" fill="#D7D9DE" />
      <rect y="952" width="1600" height="14" fill="#D7D9DE" />
    </>
  );
});

/* ─── Star: the night ───────────────────────────────────────────────────── */
const NIGHT_STARS = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 467 + 83) % 1600,
  y: (i * 211 + 41) % 560,
  s: 7 + ((i * 5) % 4) * 4,
}));
const tinyStar = (x: number, y: number, s: number) =>
  `M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`;
const Night = memo(function Night() {
  return (
    <>
      <defs>
        <linearGradient id="msh-night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A1A66" />
          <stop offset="1" stopColor="#6A47C2" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#msh-night-sky)" />
      <g fill="#FFF3B0">
        {NIGHT_STARS.map((s, i) => (
          <path
            key={i}
            className={i % 4 === 0 ? "msh-twinkle" : undefined}
            style={i % 4 === 0 ? { animationDelay: `${(i % 7) * 0.4}s` } : undefined}
            d={tinyStar(s.x, s.y, s.s)}
          />
        ))}
      </g>
      <circle cx="1400" cy="170" r="90" fill="#FFF3B0" />
      <circle cx="1440" cy="140" r="80" fill="#3B2580" />
      <path d="M0 720 Q300 640 640 700 T1300 680 T1600 660 V1000 H0 Z" fill="#43307F" />
      <path d="M0 830 Q420 770 860 820 T1600 800 V1000 H0 Z" fill="#33246A" />
      {/* a little house with a lit window, and round trees */}
      <g transform="translate(180 760)">
        <rect x="-70" y="-90" width="140" height="110" fill="#5A3E9E" />
        <path d="M-90 -90 L0 -170 L90 -90 Z" fill="#7655C4" />
        <rect x="-26" y="-60" width="52" height="44" rx="6" fill="#FFE066" />
      </g>
      {[1300, 1440, 1540].map((x, i) => (
        <g key={x}>
          <rect x={x - 10} y={740 + i * 20} width="20" height="90" fill="#2A1A55" />
          <circle cx={x} cy={720 + i * 20} r={60 - i * 8} fill="#2E5E5A" />
        </g>
      ))}
    </>
  );
});
