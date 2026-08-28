"use client";

import { useId } from "react";
import { C } from "@shared/components/construction/palette";

/**
 * THE CREW — one friendly builder with pose variants (the DinoArt/parrot
 * convention: pose changes the DRAWING, never starts an animation). Always
 * wearing the hard hat and the hi-vis vest — the safety layer is part of
 * the character, not an accessory.
 */

export type WorkerPose = "standing" | "thumbsup" | "blueprint" | "carrying";

export function SiteWorker({
  pose = "standing",
  className = "",
}: {
  pose?: WorkerPose;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-vest`;

  return (
    <svg
      viewBox="0 0 160 210"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A friendly builder"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.VEST} />
          <stop offset="1" stopColor={C.ORANGE} />
        </linearGradient>
      </defs>

      {/* carried plank goes behind the body */}
      {pose === "carrying" && (
        <rect
          x="8"
          y="66"
          width="144"
          height="14"
          rx="5"
          fill={C.WOOD}
          stroke={C.WOOD_LINE}
          strokeWidth="3"
          transform="rotate(-8 80 73)"
        />
      )}

      {/* legs */}
      <g fill={C.PANTS} stroke={C.STEEL_LINE} strokeWidth="3">
        <rect x="56" y="142" width="20" height="46" rx="9" />
        <rect x="84" y="142" width="20" height="46" rx="9" />
      </g>
      {/* boots */}
      <g fill={C.WOOD_DEEP} stroke={C.WOOD_LINE} strokeWidth="2.5">
        <path d="M52 184 h24 v12 q-14 6 -24 0 Z" />
        <path d="M84 184 h24 v12 q-14 6 -24 0 Z" />
      </g>

      {/* torso with vest */}
      <path
        d="M48 88 Q46 66 80 64 Q114 66 112 88 L110 148 H50 Z"
        fill={C.SHIRT}
        stroke={C.STEEL_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M56 70 L74 66 V146 H54 Z"
        fill={`url(#${gid})`}
        stroke={C.ORANGE_DEEP}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M104 70 L86 66 V146 H106 Z"
        fill={`url(#${gid})`}
        stroke={C.ORANGE_DEEP}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* reflective stripes */}
      <g stroke={C.WHITE} strokeWidth="4" opacity="0.9">
        <path d="M56 108 h18 M86 108 h18" fill="none" />
      </g>

      {/* arms per pose */}
      {pose === "thumbsup" ? (
        <>
          <path
            d="M50 92 Q30 104 32 128 Q44 130 54 118 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M110 92 Q132 80 132 58 Q120 54 110 66 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* the thumb */}
          <g transform="translate(122 38)">
            <path
              d="M2 18 q-4 -14 8 -16 q8 0 8 10 v6 h8 q6 2 4 8 l-4 12 q-2 6 -8 6 h-12 q-6 0 -6 -8 Z"
              fill={C.SKIN}
              stroke={C.SKIN_DEEP}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        </>
      ) : pose === "blueprint" ? (
        <>
          <path
            d="M50 92 Q36 104 40 118 L64 112 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M110 92 Q124 104 120 118 L96 112 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* the open blueprint in both hands */}
          <rect
            x="42"
            y="106"
            width="76"
            height="46"
            rx="6"
            fill={C.BLUEPRINT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
          />
          <g stroke={C.BLUEPRINT_LINE} strokeWidth="2.5" fill="none" opacity="0.95">
            <path d="M56 142 V128 L74 118 L92 128 V142 Z" />
            <path d="M100 124 h10 M100 132 h10" />
          </g>
        </>
      ) : pose === "carrying" ? (
        <>
          <path
            d="M50 92 Q34 84 30 68 Q42 62 52 74 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M110 92 Q126 84 130 68 Q118 62 108 74 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="66" r="7" fill={C.SKIN} stroke={C.SKIN_DEEP} strokeWidth="2.5" />
          <circle cx="128" cy="66" r="7" fill={C.SKIN} stroke={C.SKIN_DEEP} strokeWidth="2.5" />
        </>
      ) : (
        <>
          <path
            d="M50 92 Q32 106 34 130 Q46 132 56 120 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M110 92 Q128 106 126 130 Q114 132 104 120 Z"
            fill={C.SHIRT}
            stroke={C.STEEL_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="36" cy="130" r="7" fill={C.SKIN} stroke={C.SKIN_DEEP} strokeWidth="2.5" />
          <circle cx="124" cy="130" r="7" fill={C.SKIN} stroke={C.SKIN_DEEP} strokeWidth="2.5" />
        </>
      )}

      {/* head */}
      <g transform="translate(48 6)">
        <circle cx="32" cy="34" r="24" fill={C.SKIN} stroke={C.SKIN_DEEP} strokeWidth="3" />
        <circle cx="24" cy="32" r="3" fill={C.INK} />
        <circle cx="42" cy="32" r="3" fill={C.INK} />
        <path
          d="M26 42 q6 5 13 0"
          fill="none"
          stroke={C.INK}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="16" cy="40" r="3.5" fill="#E56A6A" opacity="0.35" />
        <circle cx="48" cy="40" r="3.5" fill="#E56A6A" opacity="0.35" />
        {/* hard hat */}
        <path
          d="M6 22 Q8 0 32 0 Q56 0 58 22 Z"
          fill={C.YELLOW}
          stroke={C.YELLOW_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect
          x="2"
          y="20"
          width="60"
          height="8"
          rx="4"
          fill={C.YELLOW_DEEP}
          stroke={C.YELLOW_LINE}
          strokeWidth="2.5"
        />
        <path d="M28 4 h8 v16 h-8 Z" fill={C.YELLOW_DEEP} opacity="0.7" />
      </g>
    </svg>
  );
}

/** The hard hat on its own — badge, reward, menu icon. */
export function HardHat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M18 54 Q22 12 60 12 Q98 12 102 54 Z"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect
        x="10"
        y="52"
        width="100"
        height="12"
        rx="6"
        fill={C.YELLOW_DEEP}
        stroke={C.YELLOW_LINE}
        strokeWidth="3"
      />
      <path d="M54 16 h12 v36 h-12 Z" fill={C.YELLOW_DEEP} opacity="0.7" />
      <path
        d="M30 30 q10 -10 22 -12"
        fill="none"
        stroke={C.WHITE}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
