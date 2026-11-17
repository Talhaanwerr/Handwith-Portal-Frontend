"use client";

import { memo } from "react";

const SCALLOPS = Array.from({ length: 17 }, (_, i) => i * 100);
const FLAGS = ["#FF8A65", "#FFD54F", "#81C784", "#64B5F6", "#BA68C8"];
const PLANKS = [790, 850, 920];

/**
 * THE SUNNY STAGE — Rhyme Time's world: a bright sky through an open-air
 * stage, red curtains drawn back at the sides, bunting, and warm wooden
 * boards where the two pictures stand. Calm: nothing moves. Sliced to fill
 * the stage at any size (upright, the curtains fall outside and the sky and
 * boards remain).
 */
export const RynWorld = memo(function RynWorld() {
  return (
    <div className="ryn-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ryn-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7FD3F7" />
            <stop offset="1" stopColor="#D9F3FF" />
          </linearGradient>
          <linearGradient id="ryn-boards" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4B66A" />
            <stop offset="1" stopColor="#D88A3D" />
          </linearGradient>
          <linearGradient id="ryn-drape" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#B8323B" />
            <stop offset="0.5" stopColor="#E0505A" />
            <stop offset="1" stopColor="#B8323B" />
          </linearGradient>
        </defs>

        <rect width="1600" height="1000" fill="url(#ryn-sky)" />
        {/* the sun and soft clouds */}
        <circle cx="1270" cy="250" r="86" fill="#FFE36E" />
        <circle cx="1270" cy="250" r="120" fill="#FFE36E" opacity="0.25" />
        <g fill="#FFFFFF" opacity="0.9">
          <ellipse cx="420" cy="290" rx="110" ry="34" />
          <ellipse cx="470" cy="266" rx="64" ry="36" />
          <ellipse cx="1000" cy="380" rx="90" ry="26" />
          <ellipse cx="1040" cy="362" rx="50" ry="28" />
        </g>
        {/* far hills behind the stage */}
        <path d="M0 640 Q300 560 620 620 T1220 600 T1600 620 V760 H0 Z" fill="#8FD18A" />
        <path d="M0 700 Q400 640 820 690 T1600 680 V780 H0 Z" fill="#6DBE6A" />

        {/* the boards */}
        <rect y="740" width="1600" height="260" fill="url(#ryn-boards)" />
        <rect y="728" width="1600" height="18" fill="#B86E2A" />
        {PLANKS.map((y) => (
          <rect key={y} y={y} width="1600" height="5" fill="#C27A35" opacity="0.6" />
        ))}
        {/* footlights along the front edge */}
        <rect y="968" width="1600" height="32" fill="#8E4F1E" />
        {[200, 500, 800, 1100, 1400].map((x) => (
          <ellipse key={x} cx={x} cy="968" rx="34" ry="12" fill="#FFF3B0" />
        ))}

        {/* the curtains, drawn back */}
        <path d="M0 0 H250 Q210 360 120 620 Q90 700 150 760 H0 Z" fill="url(#ryn-drape)" />
        <path
          d="M1600 0 H1350 Q1390 360 1480 620 Q1510 700 1450 760 H1600 Z"
          fill="url(#ryn-drape)"
        />
        <path d="M60 0 Q90 380 70 740" stroke="#9E2A33" strokeWidth="8" fill="none" />
        <path d="M1540 0 Q1510 380 1530 740" stroke="#9E2A33" strokeWidth="8" fill="none" />
        <circle cx="150" cy="560" r="16" fill="#F5C242" />
        <circle cx="1450" cy="560" r="16" fill="#F5C242" />

        {/* the valance: scallops along the top */}
        <rect width="1600" height="56" fill="#C93C46" />
        {SCALLOPS.map((x) => (
          <path key={x} d={`M${x} 56 Q${x + 50} 120 ${x + 100} 56 Z`} fill="#C93C46" />
        ))}
        <rect y="52" width="1600" height="8" fill="#F5C242" />

        {/* bunting */}
        <path d="M250 150 Q800 250 1350 150" stroke="#8E4F1E" strokeWidth="4" fill="none" />
        {Array.from({ length: 11 }, (_, i) => {
          const x = 300 + i * 100;
          const t = (x - 250) / 1100;
          const y = 150 + 200 * t * (1 - t) - 2;
          return (
            <path
              key={x}
              d={`M${x - 30} ${y} L${x + 30} ${y} L${x} ${y + 60} Z`}
              fill={FLAGS[i % FLAGS.length]}
            />
          );
        })}
      </svg>
    </div>
  );
});
