"use client";

import { memo } from "react";

/**
 * The little detective: a child in a checked cap and a long coat, holding up
 * a big magnifying glass towards the room. Drawn once; the round moves the
 * box it stands in (a "hmm" tilt on a wrong tap).
 */
export const Detective = memo(function Detective() {
  return (
    <svg viewBox="0 0 200 260" className="rdt-detective-svg" aria-hidden="true">
      {/* shadow on the floor */}
      <ellipse cx="92" cy="250" rx="62" ry="9" fill="rgba(60,30,10,0.22)" />
      {/* legs and shoes */}
      <rect x="66" y="196" width="18" height="46" rx="6" fill="#33406B" />
      <rect x="96" y="196" width="18" height="46" rx="6" fill="#33406B" />
      <ellipse cx="72" cy="244" rx="17" ry="8" fill="#5B3A22" />
      <ellipse cx="108" cy="244" rx="17" ry="8" fill="#5B3A22" />
      {/* the long coat */}
      <path d="M58 120 Q90 108 122 120 L134 206 Q90 216 46 206 Z" fill="#C99A5B" />
      <path d="M90 116 L90 210" stroke="#A67A42" strokeWidth="3" />
      <path d="M70 118 L90 150 L110 118" fill="#E9C48A" />
      <circle cx="82" cy="164" r="3.4" fill="#7A5228" />
      <circle cx="82" cy="184" r="3.4" fill="#7A5228" />
      <rect x="46" y="170" width="88" height="9" fill="#A67A42" />
      {/* the left arm, down */}
      <path
        d="M58 126 Q40 160 50 192"
        stroke="#C99A5B"
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="194" r="9" fill="#F2C29B" />
      {/* head */}
      <circle cx="90" cy="82" r="38" fill="#F2C29B" />
      <ellipse cx="74" cy="92" rx="7" ry="5" fill="#F59A8B" opacity="0.55" />
      <ellipse cx="108" cy="92" rx="7" ry="5" fill="#F59A8B" opacity="0.55" />
      <circle cx="78" cy="80" r="4.6" fill="#2B2235" />
      <circle cx="104" cy="80" r="4.6" fill="#2B2235" />
      <circle cx="79.5" cy="78.4" r="1.5" fill="#FFFFFF" />
      <circle cx="105.5" cy="78.4" r="1.5" fill="#FFFFFF" />
      <path
        d="M82 98 Q91 106 100 98"
        stroke="#8A3B2C"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* hair peeking out */}
      <path d="M54 76 Q56 54 72 50 L66 74 Z" fill="#6B3E1F" />
      {/* the checked cap and its brim */}
      <path d="M50 66 Q54 30 92 28 Q128 30 130 64 Z" fill="#8C5A2B" />
      <path d="M62 60 Q66 40 92 36" stroke="#6D431D" strokeWidth="3" fill="none" />
      <path
        d="M78 64 L80 32 M100 64 L102 32 M118 62 L116 40"
        stroke="#6D431D"
        strokeWidth="3"
        fill="none"
      />
      <path d="M50 64 Q90 56 136 62 Q150 64 156 70 Q120 72 50 70 Z" fill="#6D431D" />
      <circle cx="92" cy="27" r="5" fill="#6D431D" />
      {/* the right arm up, holding the big glass */}
      <path
        d="M120 126 Q150 132 150 106"
        stroke="#C99A5B"
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="143"
        y="88"
        width="13"
        height="40"
        rx="6"
        fill="#7A4A22"
        transform="rotate(-28 149 108)"
      />
      <circle cx="150" cy="104" r="9" fill="#F2C29B" />
      <circle cx="166" cy="62" r="30" fill="#CDEBFF" opacity="0.85" />
      <circle cx="166" cy="62" r="30" fill="none" stroke="#E2A93B" strokeWidth="9" />
      <path
        d="M152 50 Q158 42 168 41"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
});
