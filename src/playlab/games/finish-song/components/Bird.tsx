"use client";

import { memo } from "react";

/**
 * The singing bird: a round little robin, orange breast, brown wings, a tuft
 * on its head. `singing` opens its beak. The round moves the box it sits in
 * (the happy hop); the gentle sway while it sings is CSS on this svg.
 */
export const Bird = memo(function Bird({ singing }: { singing: boolean }) {
  return (
    <svg
      viewBox="0 0 200 180"
      className={`fms-bird-svg ${singing ? "is-singing" : ""}`}
      aria-hidden="true"
    >
      {/* tail */}
      <path d="M40 104 L4 84 Q2 112 22 128 Z" fill="#7A4E2E" />
      {/* feet on the branch */}
      <path
        d="M86 150 V172 M78 172 H96 M112 150 V172 M104 172 H122"
        stroke="#C9822B"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* body and breast */}
      <ellipse cx="100" cy="104" rx="66" ry="56" fill="#8A5A34" />
      <ellipse cx="116" cy="118" rx="44" ry="38" fill="#F2873A" />
      <ellipse cx="122" cy="128" rx="26" ry="20" fill="#F7A762" />
      {/* wing */}
      <path d="M48 96 Q78 70 104 102 Q86 136 54 128 Q40 114 48 96 Z" fill="#6B4223" />
      <path d="M58 108 Q76 100 92 110" stroke="#8A5A34" strokeWidth="4" fill="none" />
      {/* head */}
      <circle cx="132" cy="62" r="40" fill="#8A5A34" />
      <path d="M118 26 Q124 6 138 16 Q132 22 130 30 Z" fill="#6B4223" />
      <ellipse cx="146" cy="76" rx="22" ry="18" fill="#F2873A" />
      <circle cx="146" cy="56" r="8" fill="#1F1A24" />
      <circle cx="149" cy="53" r="2.6" fill="#FFFFFF" />
      <ellipse cx="160" cy="74" rx="7" ry="4.5" fill="#F7A6B8" opacity="0.7" />
      {/* beak: shut, or open in song */}
      {singing ? (
        <>
          <path d="M166 58 L194 54 L170 66 Z" fill="#F6C33B" />
          <path d="M168 70 L190 80 L166 76 Z" fill="#E0A21F" />
          <path d="M168 66 L184 70 L168 72 Z" fill="#9C3B2E" />
        </>
      ) : (
        <path d="M166 58 L194 66 L166 74 Z" fill="#F6C33B" />
      )}
    </svg>
  );
});
