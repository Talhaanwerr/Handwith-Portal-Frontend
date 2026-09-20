"use client";

/**
 * The prop of Letter Hunt's celebration — a detective's magnifying glass —
 * drawn in the portal's rounded pastel language, in the game's own plum and
 * gold.
 *
 * The LENS is centred at (86, 86) of the 200-box, handle to the bottom-right;
 * the CSS that places the glass centres on the lens, so whatever it is over
 * is what it is looking at.
 */
export function MagnifyingGlass() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="hunt-lens" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="70%" stopColor="rgba(221,213,245,0.16)" />
          <stop offset="100%" stopColor="rgba(124,92,191,0.28)" />
        </radialGradient>
      </defs>
      {/* the handle, under the rim */}
      <rect
        x="128"
        y="128"
        width="30"
        height="88"
        rx="15"
        fill="#5a3f9a"
        transform="rotate(-45 143 172)"
      />
      <rect
        x="132"
        y="150"
        width="22"
        height="12"
        rx="6"
        fill="#f2c94c"
        transform="rotate(-45 143 172)"
      />
      {/* the lens */}
      <circle cx="86" cy="86" r="62" fill="url(#hunt-lens)" />
      <path
        d="M46 70 Q60 40 96 34"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* the rim, with a gold inner band */}
      <circle cx="86" cy="86" r="66" fill="none" stroke="#7c5cbf" strokeWidth="14" />
      <circle cx="86" cy="86" r="59" fill="none" stroke="#f2c94c" strokeWidth="3" opacity="0.9" />
    </svg>
  );
}
