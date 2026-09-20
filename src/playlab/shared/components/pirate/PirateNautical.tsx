"use client";

import { useId } from "react";
import { P } from "@shared/components/pirate/palette";
import { AnchorShape } from "@shared/components/pirate/PirateShip";

/**
 * The nautical object library — every standalone prop a pirate screen
 * reaches for. Each is a self-contained SVG on the shared palette, sized by
 * its parent, still and quiet (movement belongs to scenes, not props).
 */

/** A polished old-world compass: brass case, red-north needle, rose. */
export function PirateCompass({ className = "" }: { className?: string }) {
  const uid = useId();
  const faceId = `${uid}-face`;
  return (
    <svg
      viewBox="0 0 140 140"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A nautical compass"
    >
      <defs>
        <radialGradient id={faceId} cx="0.35" cy="0.3" r="1">
          <stop offset="0" stopColor={P.PARCH} />
          <stop offset="1" stopColor={P.PARCH_DEEP} />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="62" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="4" />
      <circle
        cx="70"
        cy="70"
        r="50"
        fill={`url(#${faceId})`}
        stroke={P.GOLD_LINE}
        strokeWidth="3"
      />
      {/* cardinal ticks */}
      <g stroke={P.PARCH_EDGE} strokeWidth="3" strokeLinecap="round">
        <line x1="70" y1="26" x2="70" y2="36" />
        <line x1="70" y1="104" x2="70" y2="114" />
        <line x1="26" y1="70" x2="36" y2="70" />
        <line x1="104" y1="70" x2="114" y2="70" />
      </g>
      {/* needle */}
      <path
        d="M70 34 L79 70 L70 106 L61 70 Z"
        fill={P.PARCH}
        stroke={P.PARCH_EDGE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M70 34 L79 70 L61 70 Z"
        fill={P.PARROT_RED}
        stroke={P.PARROT_RED_DEEP}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="70" cy="70" r="7" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="2.5" />
      {/* glass highlight */}
      <path
        d="M40 42 q14 -12 30 -10"
        fill="none"
        stroke={P.WHITE}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/** A three-draw spyglass, recognizable at thumbnail size. */
export function PirateSpyglass({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 90"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A pirate spyglass"
    >
      <g transform="rotate(-12 100 45)">
        <rect
          x="8"
          y="34"
          width="52"
          height="34"
          rx="10"
          fill={P.GOLD}
          stroke={P.GOLD_LINE}
          strokeWidth="3.5"
        />
        <rect
          x="58"
          y="39"
          width="56"
          height="24"
          rx="9"
          fill={P.WOOD}
          stroke={P.WOOD_LINE}
          strokeWidth="3.5"
        />
        <rect
          x="112"
          y="43"
          width="52"
          height="16"
          rx="7"
          fill={P.GOLD}
          stroke={P.GOLD_LINE}
          strokeWidth="3.5"
        />
        <rect
          x="162"
          y="45"
          width="10"
          height="12"
          rx="4"
          fill={P.SEA_LIGHT}
          stroke={P.SEA_DEEP}
          strokeWidth="3"
        />
        <circle cx="20" cy="51" r="9" fill={P.SEA_LIGHT} stroke={P.GOLD_LINE} strokeWidth="3" />
        <path
          d="M66 45 h40"
          stroke={P.WOOD_LINE}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}

/** The standalone helm — the ship's wheel, drawn big. */
export function PirateHelm({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A wooden ship's wheel"
    >
      {/* handles */}
      <g stroke={P.WOOD_DEEP} strokeWidth="11" strokeLinecap="round">
        <line x1="80" y1="10" x2="80" y2="150" />
        <line x1="10" y1="80" x2="150" y2="80" />
        <line x1="31" y1="31" x2="129" y2="129" />
        <line x1="31" y1="129" x2="129" y2="31" />
      </g>
      <circle cx="80" cy="80" r="46" fill="none" stroke={P.WOOD} strokeWidth="16" />
      <circle
        cx="80"
        cy="80"
        r="46"
        fill="none"
        stroke={P.WOOD_LINE}
        strokeWidth="3"
        opacity="0.5"
      />
      <circle cx="80" cy="80" r="17" fill={P.WOOD_GOLD} stroke={P.WOOD_LINE} strokeWidth="3.5" />
      <circle cx="80" cy="80" r="6" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="2.5" />
    </svg>
  );
}

/** The standalone anchor — the same drawing the ship mounts. */
export function PirateAnchor({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={`pp-art ${className}`}
      role="img"
      aria-label="A ship's anchor"
    >
      <g transform="translate(70 66)">
        <AnchorShape />
      </g>
    </svg>
  );
}

/** Wooden barrels — one, or a stacked pair, same wood as the ship. */
export function PirateBarrel({
  stacked = false,
  className = "",
}: {
  stacked?: boolean;
  className?: string;
}) {
  const uid = useId();
  const woodId = `${uid}-wood`;
  const barrel = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M8 12 Q0 45 8 78 Q35 88 62 78 Q70 45 62 12 Q35 2 8 12 Z"
        fill={`url(#${woodId})`}
        stroke={P.WOOD_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M4 28 Q35 36 66 28" fill="none" stroke={P.IRON} strokeWidth="6" />
      <path d="M4 62 Q35 70 66 62" fill="none" stroke={P.IRON} strokeWidth="6" />
      <path
        d="M26 10 Q22 45 26 80"
        fill="none"
        stroke={P.WOOD_LINE}
        strokeWidth="2"
        opacity="0.4"
      />
      <path
        d="M44 10 Q48 45 44 80"
        fill="none"
        stroke={P.WOOD_LINE}
        strokeWidth="2"
        opacity="0.4"
      />
    </g>
  );
  return (
    <svg
      viewBox={stacked ? "0 0 150 150" : "0 0 70 90"}
      className={`pp-art ${className}`}
      role="img"
      aria-label={stacked ? "Stacked wooden barrels" : "A wooden barrel"}
    >
      <defs>
        <linearGradient id={woodId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.WOOD_LIGHT} />
          <stop offset="1" stopColor={P.WOOD_DEEP} />
        </linearGradient>
      </defs>
      {stacked ? (
        <>
          {barrel(4, 62)}
          {barrel(76, 62)}
          {barrel(40, -2)}
        </>
      ) : (
        barrel(0, 0)
      )}
    </svg>
  );
}

/** A coiled rope, for decks and corners. */
export function RopeCoil({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={`pp-art ${className}`} aria-hidden="true">
      <g fill="none" stroke={P.ROPE} strokeWidth="11" strokeLinecap="round">
        <ellipse cx="60" cy="46" rx="46" ry="22" />
        <ellipse cx="60" cy="40" rx="34" ry="16" />
        <ellipse cx="60" cy="35" rx="21" ry="10" />
      </g>
      <g fill="none" stroke={P.ROPE_DEEP} strokeWidth="2.5" opacity="0.7">
        <ellipse cx="60" cy="46" rx="46" ry="22" />
        <ellipse cx="60" cy="40" rx="34" ry="16" />
        <ellipse cx="60" cy="35" rx="21" ry="10" />
      </g>
      <path
        d="M100 58 q14 6 14 16"
        fill="none"
        stroke={P.ROPE}
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A deck lantern with a warm glass. */
export function PirateLantern({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={`pp-art ${className}`} aria-hidden="true">
      <path
        d="M28 10 q12 -10 24 0"
        fill="none"
        stroke={P.IRON_DEEP}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect
        x="22"
        y="14"
        width="36"
        height="10"
        rx="4"
        fill={P.IRON}
        stroke={P.IRON_DEEP}
        strokeWidth="3"
      />
      <path
        d="M24 24 h32 l6 56 h-44 Z"
        fill={P.GOLD}
        stroke={P.GOLD_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="40" cy="54" r="10" fill={P.WHITE} opacity="0.8" />
      <rect
        x="18"
        y="80"
        width="44"
        height="12"
        rx="5"
        fill={P.IRON}
        stroke={P.IRON_DEEP}
        strokeWidth="3"
      />
    </svg>
  );
}

/** A wooden pointing sign — parchment-free wayfinding for scenes. */
export function WoodenSign({ className = "" }: { className?: string }) {
  const uid = useId();
  const woodId = `${uid}-wood`;
  return (
    <svg viewBox="0 0 160 140" className={`pp-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={woodId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.WOOD_LIGHT} />
          <stop offset="1" stopColor={P.WOOD_DEEP} />
        </linearGradient>
      </defs>
      <rect
        x="72"
        y="46"
        width="14"
        height="90"
        rx="6"
        fill={P.WOOD_DEEP}
        stroke={P.WOOD_LINE}
        strokeWidth="3"
      />
      <path
        d="M18 22 h104 l22 20 l-22 20 H18 q-8 0 -8 -8 v-24 q0 -8 8 -8 Z"
        fill={`url(#${woodId})`}
        stroke={P.WOOD_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M26 42 h84" stroke={P.WOOD_LINE} strokeWidth="2.5" opacity="0.4" />
    </svg>
  );
}

/** A little message bottle for shorelines. */
export function MessageBottle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 120" className={`pp-art ${className}`} aria-hidden="true">
      <rect
        x="27"
        y="6"
        width="16"
        height="16"
        rx="4"
        fill={P.WOOD}
        stroke={P.WOOD_LINE}
        strokeWidth="3"
      />
      <path
        d="M25 22 h20 v14 q14 8 14 30 v34 q0 12 -12 12 h-24 q-12 0 -12 -12 v-34 q0 -22 14 -30 Z"
        fill={P.SEA_LIGHT}
        stroke={P.SEA_DEEP}
        strokeWidth="3.5"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <rect
        x="26"
        y="56"
        width="18"
        height="34"
        rx="4"
        fill={P.PARCH}
        stroke={P.PARCH_EDGE}
        strokeWidth="2.5"
        transform="rotate(8 35 73)"
      />
      <path
        d="M18 42 q6 -8 14 -10"
        fill="none"
        stroke={P.WHITE}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

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
