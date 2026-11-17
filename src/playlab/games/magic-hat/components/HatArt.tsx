"use client";

import { memo } from "react";

/**
 * The magic top hat, turned upside down so its open crown faces up — the
 * place a letter is dropped into: a deep indigo crown with a gold band and
 * stars, a wide brim around a dark opening. Fills its box (200 × 200).
 */
export const HatArt = memo(function HatArt() {
  return (
    <svg viewBox="0 0 200 200" className="mht-hat-svg" aria-hidden="true">
      {/* the crown, narrowing a little to its top (now the bottom) */}
      <path d="M44 62 L52 178 Q100 194 148 178 L156 62 Z" fill="#3A2A8C" />
      <path d="M44 62 L48 120 Q100 134 152 120 L156 62 Z" fill="#4A37A8" />
      <path d="M45 74 Q100 90 155 74 L153 100 Q100 116 47 100 Z" fill="#FFC93D" />
      <path d="M47 100 Q100 116 153 100" stroke="#C98E12" strokeWidth="3" fill="none" />
      {/* stars on the crown */}
      {[
        [78, 136, 9],
        [124, 128, 8],
        [102, 160, 7],
      ].map(([x, y, r]) => (
        <path
          key={x}
          d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`}
          fill="#FFE68A"
        />
      ))}
      {/* the brim and the opening */}
      <ellipse cx="100" cy="62" rx="92" ry="26" fill="#2A1D6E" />
      <ellipse cx="100" cy="58" rx="92" ry="24" fill="#5B47C4" />
      <ellipse cx="100" cy="60" rx="58" ry="14" fill="#140C38" />
      <ellipse cx="100" cy="64" rx="48" ry="8" fill="#2A1D6E" opacity="0.8" />
    </svg>
  );
});
