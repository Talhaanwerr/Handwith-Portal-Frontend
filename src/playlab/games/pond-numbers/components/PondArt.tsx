"use client";

import { FloatingClouds } from "@shared/components/animations/FloatingClouds";
import { cssVars } from "@shared/styles/cssVars";
import { Picture } from "@games/blend-read/components/PictureArt";
import { DICE } from "@games/pond-numbers/constants/rounds";

/**
 * The world: a sunny pond. Sky, hills, a grassy bank, the water, reeds and
 * lily pads, and a wooden dock along the bottom where the number tiles sit.
 * Pure paint — nothing here takes a tap.
 */
export function Pond() {
  return (
    <div className="pn-world" aria-hidden="true">
      <div className="pn-sky" />
      <span className="pn-sun" />
      <FloatingClouds />
      <span className="pn-hill pn-hill--far" />
      <span className="pn-hill pn-hill--near" />
      <div className="pn-bank" />
      <div className="pn-pond">
        <span className="pn-ripple pn-ripple--a" />
        <span className="pn-ripple pn-ripple--b" />
      </div>
      <span className="pn-pad-decor pn-pad-decor--a">
        <LilyPad flower />
      </span>
      <span className="pn-pad-decor pn-pad-decor--b">
        <LilyPad />
      </span>
      <span className="pn-reeds pn-reeds--l">
        <Reeds />
      </span>
      <span className="pn-reeds pn-reeds--r">
        <Reeds />
      </span>
      <div className="pn-dock" />
    </div>
  );
}

/** A lily pad with its notch, optionally with a pink flower on it. */
export function LilyPad({ flower = false }: { flower?: boolean }) {
  return (
    <svg viewBox="0 0 100 60" className="pn-svg">
      <path
        d="M50 30 L95.3 25.5 A46 26 0 1 1 85.2 13.3 Z"
        fill="#5DBB63"
        stroke="#3E9A4A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M50 30 L20 22 M50 30 L28 44 M50 30 L64 50" stroke="#48A452" strokeWidth="2" />
      {flower && (
        <g>
          <circle cx="34" cy="24" r="7" fill="#FF9EC4" />
          <circle cx="42" cy="21" r="7" fill="#FFB8D4" />
          <circle cx="38" cy="15" r="7" fill="#FF9EC4" />
          <circle cx="38" cy="21" r="4" fill="#FFD93D" />
        </g>
      )}
    </svg>
  );
}

/** A clump of reeds and bulrushes for the pond's edges. */
function Reeds() {
  return (
    <svg viewBox="0 0 60 100" className="pn-svg" preserveAspectRatio="xMidYMax meet">
      <g stroke="#3E8E3F" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M14 100 Q12 60 18 30" />
        <path d="M28 100 Q30 55 26 14" />
        <path d="M42 100 Q44 70 50 40" />
        <path d="M22 100 Q8 80 4 58" />
      </g>
      <rect x="21" y="10" width="9" height="24" rx="4.5" fill="#8A5A2E" />
      <rect x="46" y="34" width="8" height="20" rx="4" fill="#8A5A2E" />
    </svg>
  );
}

/** A frog — the Twemoji frog the word games already ship. */
export function Frog() {
  return (
    <span className="pn-frog-art" aria-hidden="true">
      <Picture id="frog" />
    </span>
  );
}

/** The face of the Quick Look card: `count` dots in the die pattern. */
export function DotFace({ count, color }: { count: number; color: string }) {
  return (
    <span className="pn-card-face pn-card-face--dots" style={cssVars({ "--dot": color })}>
      {(DICE[count] ?? []).map(([x, y], i) => (
        <span
          key={i}
          className="pn-dot"
          style={cssVars({ "--pl-x": `${x}%`, "--pl-y": `${y}%` })}
        />
      ))}
    </span>
  );
}

/** The back of the card — what the child sees once the dots are hidden. */
export function CardBack() {
  return (
    <span className="pn-card-face pn-card-face--back">
      <span className="pn-card-q font-rounded font-black">?</span>
    </span>
  );
}
