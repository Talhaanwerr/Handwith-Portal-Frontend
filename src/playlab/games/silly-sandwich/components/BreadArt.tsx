"use client";

import { memo } from "react";

/** The bottom slice, from the side: a golden crust and a soft top. */
export const BreadBase = memo(function BreadBase() {
  return (
    <svg viewBox="0 0 160 40" className="ssw-bread-svg" aria-hidden="true">
      <rect x="0" y="8" width="160" height="30" rx="14" fill="#C98538" />
      <rect x="0" y="6" width="160" height="26" rx="13" fill="#E3A653" />
      <rect x="7" y="4" width="146" height="15" rx="7.5" fill="#FBE1A4" />
    </svg>
  );
});

/** The lid: a domed top slice with sesame seeds. */
export const BreadLid = memo(function BreadLid() {
  return (
    <svg viewBox="0 0 160 64" className="ssw-bread-svg" aria-hidden="true">
      <path d="M2 60 Q2 4 80 2 Q158 4 158 60 Z" fill="#C98538" />
      <path d="M2 56 Q2 2 80 0 Q158 2 158 56 Z" fill="#E8AC58" />
      <path
        d="M22 40 Q30 14 70 10"
        stroke="#F6CB82"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      {[
        [56, 26, -20],
        [84, 18, 10],
        [108, 30, 30],
        [74, 40, -10],
        [126, 44, 40],
        [40, 46, -40],
      ].map(([x, y, r]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx="4.5"
          ry="2.4"
          fill="#FFF6DD"
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <rect x="2" y="52" width="156" height="10" rx="5" fill="#B9762E" />
    </svg>
  );
});
