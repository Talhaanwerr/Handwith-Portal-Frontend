"use client";

import { useId } from "react";
import { A } from "@shared/components/arctic/palette";

/**
 * THE ARCTIC LAND — ground, ice and structures, each a composable piece so
 * every screen builds its own frozen valley instead of inheriting one
 * enormous scene. Variant props replace file-per-shape: one Iceberg with
 * four silhouettes never looks duplicated the way four copies of one shape
 * would.
 */

/** The snow ground band — drifts and hollows, stretches to any width. */
export function SnowGround({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-snow`;
  return (
    <svg
      viewBox="0 0 800 160"
      preserveAspectRatio="none"
      className={`pl-art ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.WHITE} />
          <stop offset="0.5" stopColor={A.SNOW} />
          <stop offset="1" stopColor={A.SNOW_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M0 66 Q120 30 260 56 Q400 82 540 48 Q680 20 800 58 V160 H0 Z"
        fill={`url(#${gid})`}
      />
      <path
        d="M60 76 Q150 58 240 72"
        fill="none"
        stroke={A.SNOW_SHADE}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M420 84 Q520 62 620 76"
        fill="none"
        stroke={A.SNOW_SHADE}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M250 112 Q330 98 410 110"
        fill="none"
        stroke={A.SNOW_DEEP}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export type IcebergVariant = "tall" | "flat" | "jagged" | "round";

const BERG_PATHS: Record<IcebergVariant, string> = {
  tall: "M30 150 L44 64 L62 96 L78 20 L102 88 L118 52 L136 150 Z",
  flat: "M10 150 L26 96 L74 86 L128 92 L158 104 L150 150 Z",
  jagged: "M16 150 L34 92 L50 112 L64 54 L84 100 L102 42 L120 108 L140 84 L150 150 Z",
  round: "M20 150 Q26 74 82 66 Q140 72 146 150 Z",
};

/** An iceberg — pick a silhouette so a shoreline of them never repeats. */
export function Iceberg({
  variant = "tall",
  className = "",
}: {
  variant?: IcebergVariant;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-berg`;
  return (
    <svg viewBox="0 0 168 156" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.WHITE} />
          <stop offset="0.45" stopColor={A.ICE_LIGHT} />
          <stop offset="1" stopColor={A.ICE_MID} />
        </linearGradient>
      </defs>
      <path
        d={BERG_PATHS[variant]}
        fill={`url(#${gid})`}
        stroke={A.ICE_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* facet shading */}
      <path d={BERG_PATHS[variant]} fill={A.ICE_DEEP} opacity="0.12" transform="translate(6 4)" />
    </svg>
  );
}

/** A glacial cliff wall — the big vertical ice for scene edges. */
export function IceCliff({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-cliff`;
  return (
    <svg viewBox="0 0 260 220" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={A.ICE_LIGHT} />
          <stop offset="0.6" stopColor={A.ICE_MID} />
          <stop offset="1" stopColor={A.ICE_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M10 220 L18 60 Q20 40 44 42 L92 34 L134 48 L186 30 Q210 26 214 48 L250 64 L250 220 Z"
        fill={`url(#${gid})`}
        stroke={A.ICE_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* snow cap */}
      <path
        d="M14 66 Q60 36 132 50 Q196 20 248 62 L248 78 Q186 44 132 64 Q66 50 16 84 Z"
        fill={A.SNOW}
      />
      {/* vertical fissures */}
      <g stroke={A.ICE_CORE} strokeWidth="3" strokeLinecap="round" opacity="0.4">
        <path d="M74 66 L70 150" fill="none" />
        <path d="M150 62 L156 170" fill="none" />
        <path d="M204 74 L200 140" fill="none" />
      </g>
    </svg>
  );
}

/** The igloo — snow-block seams and a small glowing doorway. */
export function Igloo({ glow = true, className = "" }: { glow?: boolean; className?: string }) {
  const uid = useId();
  const gid = `${uid}-igloo`;
  return (
    <svg
      viewBox="0 0 200 130"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A snow igloo"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.WHITE} />
          <stop offset="1" stopColor={A.SNOW_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M18 122 Q18 40 100 38 Q182 40 182 122 Z"
        fill={`url(#${gid})`}
        stroke={A.SNOW_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* block seams */}
      <g stroke={A.SNOW_SHADE} strokeWidth="2.5" fill="none" opacity="0.9">
        <path d="M26 96 Q100 82 174 96" />
        <path d="M34 70 Q100 56 166 70" />
        <path d="M52 50 Q100 42 148 50" />
        <path d="M66 96 L64 118" />
        <path d="M100 82 L100 96" />
        <path d="M136 96 L138 118" />
        <path d="M84 70 L82 82" />
        <path d="M120 70 L122 82" />
        <path d="M100 56 L100 70" />
      </g>
      {/* entrance tunnel */}
      <path
        d="M76 122 Q76 88 100 88 Q124 88 124 122 Z"
        fill={A.SNOW_DEEP}
        stroke={A.SNOW_LINE}
        strokeWidth="3"
      />
      <path
        d="M84 122 Q84 96 100 96 Q116 96 116 122 Z"
        fill={glow ? A.GLOW : A.ICE_CORE}
        opacity={glow ? 0.95 : 0.8}
      />
    </svg>
  );
}
