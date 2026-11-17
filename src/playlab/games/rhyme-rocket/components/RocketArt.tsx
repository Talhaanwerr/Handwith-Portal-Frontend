"use client";

import { memo } from "react";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import type { Word } from "@games/rhyme-or-not/constants/words";

/**
 * THE RHYME ROCKET — a chubby white rocket with a red nose and fins, and one
 * big round window where its word's picture rides. `flame` lights the
 * engine (carried, docking, blasting off). Fills its box (2 wide : 3 tall);
 * the picture sits over the window (`.rrk-rocket-pic`).
 */
export const RocketArt = memo(function RocketArt({
  word,
  flame = false,
}: {
  word: Word;
  flame?: boolean;
}) {
  return (
    <span className="rrk-art">
      <svg viewBox="0 0 100 150" className="rrk-art-svg" aria-hidden="true">
        {flame && (
          <g>
            <path d="M34 120 Q50 168 66 120 Z" fill="#FF8A3D" />
            <path d="M41 120 Q50 152 59 120 Z" fill="#FFE066" />
          </g>
        )}
        {/* side fins */}
        <path d="M22 84 Q4 100 4 128 L24 118 Z" fill="#E8414B" />
        <path d="M78 84 Q96 100 96 128 L76 118 Z" fill="#E8414B" />
        <path d="M22 84 Q4 100 4 128 L10 125 Q12 104 24 92 Z" fill="#B82F38" />
        {/* the body */}
        <path
          d="M50 4 C76 18 84 48 82 82 C81 104 76 118 70 124 H30 C24 118 19 104 18 82 C16 48 24 18 50 4 Z"
          fill="#FFFFFF"
          stroke="#C9D3EE"
          strokeWidth="2.5"
        />
        <path
          d="M70 124 C76 118 81 104 82 82 C83 66 81 52 77 40 C80 70 76 104 64 124 Z"
          fill="#DCE3F7"
        />
        {/* the nose */}
        <path d="M50 4 C64 11 72 22 76 33 C60 27 40 27 24 33 C28 22 36 11 50 4 Z" fill="#E8414B" />
        {/* the middle fin and the engine */}
        <path d="M44 106 H56 L54 132 H46 Z" fill="#E8414B" />
        <rect x="32" y="120" width="36" height="9" rx="4" fill="#5B6A9A" />
        {/* the window */}
        <circle cx="50" cy="72" r="28" fill="#2F6FD6" />
        <circle cx="50" cy="72" r="23.5" fill="#FFFFFF" />
        <circle cx="50" cy="72" r="23.5" fill="#EAF3FF" opacity="0.6" />
        {[0, 90, 180, 270].map((a) => (
          <circle
            key={a}
            cx={50 + 25.8 * Math.cos((a * Math.PI) / 180)}
            cy={72 + 25.8 * Math.sin((a * Math.PI) / 180)}
            r="1.6"
            fill="#BFD6FF"
          />
        ))}
      </svg>
      <span className="rrk-rocket-pic">
        <RhymePic word={word} />
      </span>
    </span>
  );
});
