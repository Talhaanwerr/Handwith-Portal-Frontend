"use client";

import { memo } from "react";

const SCALLOPS = Array.from({ length: 27 }, (_, i) => i * 60);
const TILES = Array.from({ length: 17 }, (_, i) => i * 100);
const POSTS = [150, 1450] as const;

/**
 * THE STATION — Rhyme Train Station's world: a warm peach evening sky over
 * lilac hills, a red station canopy with a cream scalloped edge and a round
 * clock along the top, iron posts at the sides, and a tiled platform with a
 * yellow edge line across the bottom, where the passengers wait. The train
 * and its rails are the board's own. Calm: nothing moves. Sliced to fill.
 */
export const RtrWorld = memo(function RtrWorld() {
  return (
    <div className="rtr-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rtr-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFB98A" />
            <stop offset="1" stopColor="#FFEBD6" />
          </linearGradient>
          <linearGradient id="rtr-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D9C3B0" />
            <stop offset="1" stopColor="#BFA48E" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#rtr-sky)" />
        <circle cx="1240" cy="330" r="70" fill="#FFF3C4" opacity="0.9" />
        {/* hills */}
        <path d="M0 470 Q220 330 470 430 T980 400 T1600 420 V640 H0 Z" fill="#C9A6DC" />
        <path d="M0 520 Q300 430 640 500 T1260 470 T1600 500 V660 H0 Z" fill="#A988C8" />
        <g fill="#8A6AB0">
          <circle cx="260" cy="500" r="40" />
          <circle cx="1080" cy="470" r="46" />
          <circle cx="1380" cy="490" r="34" />
        </g>
        {/* the canopy */}
        <rect width="1600" height="120" fill="#C9372C" />
        <g fill="#A82A20">
          {TILES.map((x) => (
            <rect key={x} x={x} y="0" width="50" height="120" />
          ))}
        </g>
        <rect y="112" width="1600" height="18" fill="#FFF1DA" />
        <g fill="#FFF1DA">
          {SCALLOPS.map((x) => (
            <path key={x} d={`M${x} 128 a30 30 0 0 0 60 0 Z`} />
          ))}
        </g>
        {POSTS.map((x) => (
          <g key={x}>
            <rect x={x - 12} y="150" width="24" height="560" fill="#3C3F5A" />
            <rect x={x - 22} y="690" width="44" height="22" rx="4" fill="#2C2E44" />
            <path
              d={`M${x - 70} 150 Q${x} 230 ${x + 70} 150`}
              stroke="#3C3F5A"
              strokeWidth="12"
              fill="none"
            />
          </g>
        ))}
        {/* the station clock */}
        <rect x="796" y="128" width="8" height="40" fill="#3C3F5A" />
        <circle cx="800" cy="210" r="52" fill="#3C3F5A" />
        <circle cx="800" cy="210" r="42" fill="#FFFFFF" />
        <path
          d="M800 210 V180 M800 210 H822"
          stroke="#3C3F5A"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* the platform */}
        <rect y="700" width="1600" height="300" fill="url(#rtr-floor)" />
        <rect y="700" width="1600" height="22" fill="#FFD23D" />
        <g stroke="#A88B74" strokeWidth="4" opacity="0.7">
          {[790, 880].map((y) => (
            <path key={y} d={`M0 ${y} H1600`} />
          ))}
          {TILES.map((x) => (
            <path key={x} d={`M${x + 40} 722 L${x - 10} 1000`} />
          ))}
        </g>
      </svg>
    </div>
  );
});
