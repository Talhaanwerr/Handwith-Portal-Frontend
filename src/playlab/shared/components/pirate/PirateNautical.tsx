"use client";

import { P } from "@shared/components/pirate/palette";

/** A cut gem, on its own — reward decoration. */
export function TreasureGem({
  tone = "teal",
  className = "",
}: {
  tone?: "teal" | "red";
  className?: string;
}) {
  const fill = tone === "red" ? P.GEM_RED : P.GEM_TEAL;
  const line = tone === "red" ? P.PARROT_RED_DEEP : P.SEA_DEEP;
  return (
    <svg viewBox="0 0 90 80" className={`pp-art ${className}`} aria-hidden="true">
      <path
        d="M20 24 h50 l14 18 l-39 32 l-39 -32 Z"
        fill={fill}
        stroke={line}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <g fill="none" stroke={line} strokeWidth="2.5" opacity="0.6">
        <path d="M20 24 l25 18 l25 -18" />
        <path d="M6 42 h78" />
        <path d="M45 42 v32" />
      </g>
      <path
        d="M26 30 l10 -4"
        stroke={P.WHITE}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}
