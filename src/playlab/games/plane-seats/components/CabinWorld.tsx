"use client";

import { memo } from "react";

/**
 * PLANE SEATS' WORLD — inside an aeroplane cabin. Nothing in it moves.
 *
 * Built from layers sized in the `ng` container's units, so the parts line
 * up with the board whatever the screen: the overhead bins along the top, a
 * soft curved cabin wall with a row of round windows (sky and clouds), and
 * the carpet the seats stand on and the passengers walk along. The floor's
 * height comes from the same `--pls-*` sizes as the board (plane-seats.css),
 * so the seats' feet always stand on the carpet.
 */
export const CabinWorld = memo(function CabinWorld() {
  return (
    <div className="pls-cabin" aria-hidden="true">
      <span className="pls-cabin-curve" />
      <Bins />
      <div className="pls-cabin-windows">
        {WINDOWS.map((w, i) => (
          <span key={i} className="pls-cabin-window">
            <CabinWindow cloud={w.cloud} sun={w.sun} id={i} />
          </span>
        ))}
      </div>
      <span className="pls-cabin-rail" />
      <span className="pls-cabin-floor" />
    </div>
  );
});

/** Each window's view: where its cloud floats; one window has the sun. */
const WINDOWS = [
  { cloud: { x: 30, y: 52, s: 1 }, sun: false },
  { cloud: { x: 62, y: 38, s: 0.8 }, sun: true },
  { cloud: { x: 40, y: 66, s: 1.1 }, sun: false },
  { cloud: { x: 58, y: 48, s: 0.9 }, sun: false },
  { cloud: { x: 34, y: 40, s: 1 }, sun: false },
  { cloud: { x: 60, y: 62, s: 0.85 }, sun: false },
] as const;

/** One round cabin window: a chunky frame and a blind, sky and a cloud. */
function CabinWindow({
  cloud,
  sun,
  id,
}: {
  cloud: { x: number; y: number; s: number };
  sun: boolean;
  id: number;
}) {
  const clip = `pls-win-clip-${id}`;
  return (
    <svg viewBox="0 0 100 136" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`pls-win-sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5DB8F2" />
          <stop offset="1" stopColor="#C9ECFF" />
        </linearGradient>
        <clipPath id={clip}>
          <rect x="16" y="16" width="68" height="104" rx="34" />
        </clipPath>
      </defs>
      {/* the frame: a soft bevel with a solid lower edge */}
      <rect x="4" y="8" width="92" height="124" rx="46" fill="#D9CFBD" />
      <rect x="4" y="4" width="92" height="124" rx="46" fill="#FFFDF8" />
      <rect x="10" y="10" width="80" height="112" rx="40" fill="#E9E1D2" />
      <g clipPath={`url(#${clip})`}>
        <rect x="16" y="16" width="68" height="104" fill={`url(#pls-win-sky-${id})`} />
        {sun && (
          <>
            <circle cx="36" cy="64" r="15" fill="#FFE27A" opacity="0.55" />
            <circle cx="36" cy="64" r="10" fill="#FFD23F" />
          </>
        )}
        <g transform={`translate(${cloud.x} ${cloud.y}) scale(${cloud.s})`}>
          <ellipse cx="0" cy="8" rx="26" ry="9" fill="#FFFFFF" />
          <circle cx="-10" cy="2" r="9" fill="#FFFFFF" />
          <circle cx="5" cy="-2" r="12" fill="#FFFFFF" />
          <circle cx="17" cy="5" r="7" fill="#FFFFFF" />
        </g>
        <ellipse cx="74" cy="104" rx="20" ry="6" fill="#FFFFFF" opacity="0.8" />
        {/* the blind, pulled a little way down */}
        <rect x="16" y="16" width="68" height="22" fill="#F4EEE3" />
        <rect x="16" y="35" width="68" height="4" fill="#DCD2C0" />
        {/* a glint on the glass */}
        <path
          d="M66 50 Q74 62 72 80"
          stroke="#FFFFFF"
          strokeWidth="4"
          fill="none"
          opacity="0.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** The overhead bins: a long row of rounded lockers with handles and a
 *  strip of little reading lights under them. Drawn wide and cropped. */
function Bins() {
  const doors = Array.from({ length: 8 }, (_, i) => i);
  return (
    <svg className="pls-cabin-bins" viewBox="0 0 2400 220" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="pls-bin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2F4F7" />
          <stop offset="1" stopColor="#DCE1E8" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="2400" height="196" fill="#C9D0DA" />
      {doors.map((i) => (
        <g key={i} transform={`translate(${i * 300} 0)`}>
          <path d="M12 0 H288 V150 Q288 176 262 178 H38 Q12 176 12 150Z" fill="url(#pls-bin)" />
          <rect x="110" y="140" width="80" height="16" rx="8" fill="#AEB7C4" />
          <rect x="110" y="136" width="80" height="12" rx="6" fill="#C7CFDA" />
        </g>
      ))}
      <rect x="0" y="186" width="2400" height="22" fill="#AEB7C4" />
      <rect x="0" y="196" width="2400" height="24" fill="#E4DCCD" />
      {doors.map((i) => (
        <g key={i} transform={`translate(${i * 300 + 150} 207)`}>
          <circle cx="-26" cy="0" r="6" fill="#FFF3C4" />
          <circle cx="26" cy="0" r="6" fill="#FFF3C4" />
        </g>
      ))}
    </svg>
  );
}
