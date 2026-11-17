"use client";

import { memo } from "react";

/**
 * The engine, facing left (the way the train leaves): a navy boiler with a
 * red band, a tall chimney, a round lamp, a cab with a window, a cowcatcher
 * and three red wheels. `puff` shows the steam of a toot. Fills its box
 * (130 × 120).
 */
export const EngineArt = memo(function EngineArt({ puff }: { puff: boolean }) {
  return (
    <svg viewBox="0 0 130 120" className="rtr-engine-svg" aria-hidden="true">
      {puff && (
        <g className="rtr-steam" fill="#FFFFFF">
          <circle cx="34" cy="14" r="10" />
          <circle cx="48" cy="8" r="8" />
          <circle cx="22" cy="6" r="7" />
        </g>
      )}
      {/* chimney */}
      <path d="M26 24 H44 L41 52 H29 Z" fill="#26304F" />
      <rect x="22" y="20" width="26" height="8" rx="3" fill="#E2553F" />
      {/* boiler */}
      <rect x="10" y="50" width="78" height="40" rx="18" fill="#2B3A6B" />
      <rect x="36" y="50" width="8" height="40" fill="#E2553F" />
      <rect x="60" y="50" width="8" height="40" fill="#E2553F" />
      <circle cx="16" cy="70" r="11" fill="#FFE68A" stroke="#26304F" strokeWidth="4" />
      {/* cab */}
      <rect x="78" y="26" width="46" height="66" rx="6" fill="#E2553F" />
      <rect x="74" y="20" width="54" height="10" rx="4" fill="#26304F" />
      <rect
        x="88"
        y="38"
        width="26"
        height="22"
        rx="4"
        fill="#BDE8F5"
        stroke="#FFF1DA"
        strokeWidth="3"
      />
      {/* frame, cowcatcher, wheels */}
      <rect x="6" y="88" width="120" height="10" rx="3" fill="#26304F" />
      <path d="M8 88 L0 106 H20 Z" fill="#E2553F" />
      {[30, 62, 100].map((x) => (
        <g key={x}>
          <circle
            cx={x}
            cy="104"
            r={x === 100 ? 15 : 12}
            fill="#E2553F"
            stroke="#26304F"
            strokeWidth="4"
          />
          <circle cx={x} cy="104" r="4" fill="#26304F" />
        </g>
      ))}
    </svg>
  );
});
