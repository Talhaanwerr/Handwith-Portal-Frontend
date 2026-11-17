"use client";

import { memo } from "react";

/**
 * One little house, drawn: chimney, a roof in its family's colour (the
 * `--ryh-roof` custom property, set on the house), a cream front with two
 * windows and a round white sign where the family's picture sits (laid over
 * it by the house). viewBox 100 × 120, filling the house's box.
 */
export const HouseArt = memo(function HouseArt() {
  return (
    <svg className="ryh-house-art" viewBox="0 0 100 120" aria-hidden="true">
      <rect x="68" y="8" width="12" height="26" rx="2" fill="#B5654A" />
      <rect x="10" y="44" width="80" height="74" rx="4" fill="#FFF4DD" />
      <rect x="10" y="108" width="80" height="10" rx="3" fill="#EAD7B4" />
      <path className="ryh-roof" d="M2 50 L50 6 L98 50 Q98 54 94 54 H6 Q2 54 2 50 Z" />
      <path d="M2 50 L50 6 L98 50" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="3" />
      <rect
        x="16"
        y="60"
        width="13"
        height="14"
        rx="2"
        fill="#BFE6FA"
        stroke="#E2C99C"
        strokeWidth="2"
      />
      <rect
        x="71"
        y="60"
        width="13"
        height="14"
        rx="2"
        fill="#BFE6FA"
        stroke="#E2C99C"
        strokeWidth="2"
      />
      <circle cx="50" cy="71" r="22" fill="#FFFFFF" stroke="#E2C99C" strokeWidth="2.5" />
    </svg>
  );
});
