"use client";

import { memo } from "react";
import type { SceneId } from "@games/word-lesson/constants/lesson";

/**
 * The five lessons' rooms — one full-bleed scene each, sliced to fill, quiet
 * in the middle where the cards stand and busy only round the edges:
 *
 *   barn     Animals — green hills, a fence, hay and the sun (no barn
 *            building: page six's barn container stands in front)
 *   kitchen  Food — a warm yellow kitchen, tiles, a window, a wooden counter
 *   living   At Home — a teal living room, curtains, a sofa, a rug
 *   park     Out and About — a street of little houses, trees, a road
 *   bedroom  Clothes — a pink bedroom, a bed, a wardrobe, a starry rug
 *
 * Nothing moves (a calm room for a three-year-old).
 */
export const LessonWorld = memo(function LessonWorld({ scene }: { scene: SceneId }) {
  return (
    <div className={`wl-world wl-world--${scene}`} aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        {scene === "barn" && <Barn />}
        {scene === "kitchen" && <Kitchen />}
        {scene === "living" && <Living />}
        {scene === "park" && <Park />}
        {scene === "bedroom" && <Bedroom />}
      </svg>
    </div>
  );
});

const Cloud = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF">
    <ellipse cx="0" cy="0" rx="70" ry="34" />
    <ellipse cx="-50" cy="12" rx="46" ry="26" />
    <ellipse cx="54" cy="12" rx="50" ry="26" />
  </g>
);

function Barn() {
  return (
    <>
      <defs>
        <linearGradient id="wl-barn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FD3F7" />
          <stop offset="1" stopColor="#D8F3FF" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#wl-barn-sky)" />
      <circle cx="1420" cy="150" r="80" fill="#FFD84A" />
      <circle cx="1420" cy="150" r="104" fill="#FFD84A" opacity="0.25" />
      <Cloud x={420} y={140} />
      <Cloud x={980} y={100} s={0.8} />
      <path d="M0 640 Q300 520 640 610 T1250 590 T1600 600 V1000 H0 Z" fill="#9FD67A" />
      <path d="M0 720 Q400 650 820 700 T1600 690 V1000 H0 Z" fill="#7CC35E" />
      {/* the fence */}
      <g fill="#F4E3C1" stroke="#C9A877" strokeWidth="4">
        <rect x="0" y="770" width="1600" height="18" />
        <rect x="0" y="820" width="1600" height="18" />
        {Array.from({ length: 17 }, (_, i) => (
          <rect key={i} x={20 + i * 96} y="740" width="26" height="130" rx="6" />
        ))}
      </g>
      <path d="M0 880 Q500 850 1000 880 T1600 870 V1000 H0 Z" fill="#69B24E" />
      {/* hay */}
      <g transform="translate(1380 820)">
        <ellipse cx="80" cy="60" rx="110" ry="60" fill="#F2C94C" />
        <path d="M-20 60 Q80 30 180 60" stroke="#D9A82E" strokeWidth="8" fill="none" />
      </g>
    </>
  );
}

function Kitchen() {
  return (
    <>
      <rect width="1600" height="1000" fill="#FFE6A6" />
      {/* tiles */}
      <rect y="470" width="1600" height="300" fill="#FFF6DD" />
      <g stroke="#F2D79A" strokeWidth="4">
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h${i}`} x1="0" x2="1600" y1={470 + i * 75} y2={470 + i * 75} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <line key={`v${i}`} x1={i * 75} x2={i * 75} y1="470" y2="770" />
        ))}
      </g>
      {/* the window */}
      <g transform="translate(110 90)">
        <rect width="330" height="300" rx="20" fill="#FFFFFF" />
        <rect x="18" y="18" width="294" height="264" rx="10" fill="#A6DDF7" />
        <circle cx="230" cy="90" r="40" fill="#FFD84A" />
        <path d="M18 230 Q120 180 312 220 V282 H18 Z" fill="#8ED07A" />
        <rect x="157" y="18" width="16" height="264" fill="#FFFFFF" />
        <rect x="18" y="142" width="294" height="16" fill="#FFFFFF" />
        <path d="M-20 -10 H350 V40 Q165 80 -20 40 Z" fill="#F07B5A" />
      </g>
      {/* the shelf with jars */}
      <g transform="translate(1180 170)">
        <rect x="0" y="150" width="340" height="22" rx="6" fill="#B8743A" />
        <rect x="20" y="60" width="70" height="90" rx="14" fill="#F7B267" />
        <rect x="16" y="48" width="78" height="20" rx="6" fill="#E0703C" />
        <rect x="120" y="80" width="64" height="70" rx="14" fill="#9AD27A" />
        <rect x="116" y="68" width="72" height="18" rx="6" fill="#5FAE45" />
        <rect x="214" y="40" width="80" height="110" rx="16" fill="#F6E27A" />
        <rect x="210" y="28" width="88" height="20" rx="6" fill="#E3B92F" />
      </g>
      {/* the counter */}
      <rect y="770" width="1600" height="40" fill="#E9A65A" />
      <rect y="810" width="1600" height="190" fill="#C9813F" />
      <g fill="#B06F33">
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={40 + i * 270} y="840" width="230" height="140" rx="14" />
        ))}
      </g>
      <g fill="#FFE3A6">
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={135 + i * 270} y="860" width="40" height="12" rx="6" />
        ))}
      </g>
    </>
  );
}

function Living() {
  return (
    <>
      <rect width="1600" height="1000" fill="#BFE7E1" />
      <g fill="#AEDCD5">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 140} y="0" width="60" height="760" />
        ))}
      </g>
      {/* the window with its curtains */}
      <g transform="translate(1110 90)">
        <rect width="320" height="320" rx="16" fill="#FFFFFF" />
        <rect x="16" y="16" width="288" height="288" rx="8" fill="#BFE6FF" />
        <Cloud x={160} y={120} s={0.7} />
        <rect x="152" y="16" width="16" height="288" fill="#FFFFFF" />
        <path d="M-50 -20 H90 Q60 180 110 360 H-50 Z" fill="#F28C8C" />
        <path d="M370 -20 H230 Q260 180 210 360 H370 Z" fill="#F28C8C" />
        <rect x="-70" y="-34" width="460" height="22" rx="10" fill="#8A5A3B" />
      </g>
      {/* a picture on the wall */}
      <g transform="translate(160 140)">
        <rect width="240" height="180" rx="12" fill="#F7C548" />
        <rect x="16" y="16" width="208" height="148" rx="6" fill="#FFF6DD" />
        <path d="M30 150 L95 70 L140 120 L170 90 L210 150 Z" fill="#7CC35E" />
        <circle cx="170" cy="55" r="18" fill="#F28C8C" />
      </g>
      {/* the floor and the rug */}
      <rect y="760" width="1600" height="240" fill="#E3AE72" />
      <g stroke="#C98F55" strokeWidth="5">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={i * 200} x2={i * 200 - 60} y1="760" y2="1000" />
        ))}
      </g>
      <ellipse cx="800" cy="900" rx="560" ry="80" fill="#F59E8B" />
      <ellipse cx="800" cy="900" rx="480" ry="58" fill="none" stroke="#FFF0DF" strokeWidth="10" />
      {/* the sofa, at the side */}
      <g transform="translate(0 560)">
        <rect x="-40" y="60" width="330" height="160" rx="40" fill="#5DA9A0" />
        <rect x="-40" y="0" width="300" height="110" rx="40" fill="#4C948B" />
        <rect x="230" y="70" width="80" height="150" rx="34" fill="#4C948B" />
      </g>
      {/* a plant */}
      <g transform="translate(1440 620)">
        <path d="M20 60 Q-40 -40 30 -90 Q40 0 60 60 Z" fill="#5FAE45" />
        <path d="M60 60 Q120 -30 70 -100 Q50 0 40 60 Z" fill="#7CC35E" />
        <path d="M0 60 H100 L86 150 H14 Z" fill="#E0703C" />
      </g>
    </>
  );
}

function Park() {
  const houses: readonly (readonly [number, string, string])[] = [
    [60, "#F7B267", "#D9772A"],
    [330, "#8EC5FC", "#4C82C9"],
    [1080, "#F4A6C6", "#D0628E"],
    [1340, "#B6E388", "#6FAE45"],
  ];
  return (
    <>
      <defs>
        <linearGradient id="wl-park-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7CCBF5" />
          <stop offset="1" stopColor="#CFEFFF" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#wl-park-sky)" />
      <circle cx="180" cy="130" r="70" fill="#FFD84A" />
      <Cloud x={700} y={120} />
      <Cloud x={1200} y={170} s={0.75} />
      <path d="M0 600 Q400 540 800 590 T1600 570 V760 H0 Z" fill="#9BD67D" />
      {houses.map(([x, wall, roof]) => (
        <g key={x} transform={`translate(${x} 430)`}>
          <path d="M-10 120 L110 30 L230 120 Z" fill={roof} />
          <rect x="10" y="115" width="200" height="190" fill={wall} />
          <rect x="85" y="200" width="54" height="105" rx="8" fill="#FFFFFF" opacity="0.85" />
          <rect x="30" y="145" width="44" height="40" rx="6" fill="#FFFFFF" />
          <rect x="150" y="145" width="44" height="40" rx="6" fill="#FFFFFF" />
        </g>
      ))}
      {/* trees */}
      {[620, 900].map((x) => (
        <g key={x} transform={`translate(${x} 470)`}>
          <rect x="-14" y="120" width="28" height="140" rx="10" fill="#9A6234" />
          <circle cx="0" cy="90" r="90" fill="#5FAE45" />
          <circle cx="-50" cy="130" r="60" fill="#6FBF52" />
          <circle cx="56" cy="128" r="62" fill="#6FBF52" />
        </g>
      ))}
      {/* the pavement and the road */}
      <rect y="735" width="1600" height="70" fill="#D9D4CC" />
      <g stroke="#C2BBB0" strokeWidth="5">
        {Array.from({ length: 17 }, (_, i) => (
          <line key={i} x1={i * 100} x2={i * 100} y1="735" y2="805" />
        ))}
      </g>
      <rect y="805" width="1600" height="195" fill="#5D6475" />
      <g fill="#FFFFFF">
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={30 + i * 190} y="895" width="110" height="16" rx="8" />
        ))}
      </g>
    </>
  );
}

function Bedroom() {
  return (
    <>
      <rect width="1600" height="1000" fill="#FAD3E0" />
      <g fill="#F7BFD2">
        {Array.from({ length: 48 }, (_, i) => (
          <circle
            key={i}
            cx={(i % 12) * 140 + ((i >> 2) % 2) * 70 + 40}
            cy={60 + (i % 4) * 170}
            r="12"
          />
        ))}
      </g>
      {/* the window, a sunny day */}
      <g transform="translate(640 70)">
        <rect width="320" height="250" rx="120" fill="#FFFFFF" />
        <rect x="18" y="18" width="284" height="214" rx="104" fill="#BFE6FF" />
        <circle cx="210" cy="96" r="34" fill="#FFD84A" />
        <rect x="152" y="18" width="16" height="214" fill="#FFFFFF" />
      </g>
      {/* the wardrobe, at the left */}
      <g transform="translate(40 250)">
        <rect width="330" height="540" rx="18" fill="#B98AD9" />
        <rect x="20" y="24" width="135" height="490" rx="10" fill="#C9A0E6" />
        <rect x="175" y="24" width="135" height="490" rx="10" fill="#C9A0E6" />
        <circle cx="140" cy="270" r="10" fill="#FFFFFF" />
        <circle cx="190" cy="270" r="10" fill="#FFFFFF" />
      </g>
      {/* the bed, at the right */}
      <g transform="translate(1180 520)">
        <rect x="0" y="0" width="40" height="300" rx="14" fill="#8E5BC7" />
        <rect x="30" y="120" width="420" height="140" rx="24" fill="#FFFFFF" />
        <rect x="150" y="110" width="320" height="170" rx="28" fill="#7FC8F0" />
        <ellipse cx="96" cy="120" rx="70" ry="38" fill="#FFF6DD" />
      </g>
      {/* the floor and a starry rug */}
      <rect y="790" width="1600" height="210" fill="#D7B9F0" />
      <ellipse cx="800" cy="900" rx="520" ry="76" fill="#FFF0A8" />
      <g fill="#F7B267">
        {[520, 700, 900, 1080].map((x) => (
          <path
            key={x}
            d={`M${x} 880 l10 22 24 2 -18 16 6 24 -22 -13 -22 13 6 -24 -18 -16 24 -2 Z`}
          />
        ))}
      </g>
    </>
  );
}
