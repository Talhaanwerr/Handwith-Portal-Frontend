"use client";

/**
 * The props of Magnet Match's group celebration — the giant magnet and what
 * the soup throws — in the kitchen's own colours.
 */

/** A horseshoe magnet, poles down: the game's namesake, at last on screen.
 *  The poles sit at the bottom of the box, where the letters snap on. */
export function HorseshoeMagnet() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* the body: one thick U, edged darker */}
      <path
        d="M50 188 V96 A50 50 0 0 1 150 96 V188"
        fill="none"
        stroke="#c94f45"
        strokeWidth="50"
      />
      <path
        d="M50 188 V96 A50 50 0 0 1 150 96 V188"
        fill="none"
        stroke="#e8746a"
        strokeWidth="40"
      />
      {/* the gloss along the top of the arch */}
      <path
        d="M40 96 A60 60 0 0 1 160 96"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* silver poles */}
      <rect x="25" y="146" width="50" height="46" fill="#c3cdd6" />
      <rect x="125" y="146" width="50" height="46" fill="#c3cdd6" />
      <rect x="25" y="146" width="50" height="8" fill="#8c99a6" />
      <rect x="125" y="146" width="50" height="8" fill="#8c99a6" />
      <rect x="31" y="158" width="10" height="28" rx="4" fill="rgba(255,255,255,0.6)" />
      <rect x="131" y="158" width="10" height="28" rx="4" fill="rgba(255,255,255,0.6)" />
    </svg>
  );
}

/** What is in the soup — a carrot slice, a pea, a noodle. */
export function CarrotSlice() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="#f4a73e" />
      <circle cx="20" cy="20" r="11" fill="#f8ce7e" />
      <circle cx="20" cy="20" r="4" fill="#f4a73e" />
    </svg>
  );
}

export function Pea() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="#66cc94" />
      <circle cx="14" cy="14" r="5" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

export function Noodle() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <path
        d="M5 27 C10 4 17 36 22 14 C26 2 33 28 36 10"
        stroke="#f2c94c"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A spark — thrown when the letters clack onto the magnet. */
export function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="#ffd93d" />
      <circle cx="20" cy="20" r="4" fill="#ffffff" />
    </svg>
  );
}
