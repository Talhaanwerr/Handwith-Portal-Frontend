"use client";

import { memo } from "react";

/** Eight directions the sparkles fly out in (fixed, nothing random). */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const COLOURS = ["#FFE066", "#FFFFFF", "#FF6FB1", "#7FD3FF"];

/**
 * A ring of little four-point sparkles flying out of a shape that was just
 * tapped. CSS only (each ray is turned, then its sparkle slides outward and
 * fades), mounted fresh for every tap.
 */
export const Sparkles = memo(function Sparkles() {
  return (
    <span className="msh-sparkles" aria-hidden="true">
      {RAYS.map((deg, i) => (
        <span key={deg} className="msh-ray" style={{ transform: `rotate(${deg}deg)` }}>
          <svg viewBox="-10 -10 20 20" className="msh-spark">
            <path
              d="M0 -10 Q0 0 10 0 Q0 0 0 10 Q0 0 -10 0 Q0 0 0 -10 Z"
              fill={COLOURS[i % COLOURS.length]}
            />
          </svg>
        </span>
      ))}
    </span>
  );
});
