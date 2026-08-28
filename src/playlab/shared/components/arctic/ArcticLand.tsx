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

/** A frozen lake sheet, optionally cracked. Lies flat in perspective. */
export function FrozenLake({
  cracked = false,
  className = "",
}: {
  cracked?: boolean;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-lake`;
  return (
    <svg viewBox="0 0 320 120" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0" stopColor={A.ICE_LIGHT} />
          <stop offset="0.7" stopColor={A.ICE_MID} />
          <stop offset="1" stopColor={A.ICE_DEEP} />
        </radialGradient>
      </defs>
      <ellipse
        cx="160"
        cy="60"
        rx="150"
        ry="52"
        fill={`url(#${gid})`}
        stroke={A.ICE_DEEP}
        strokeWidth="3"
      />
      <ellipse
        cx="160"
        cy="60"
        rx="118"
        ry="38"
        fill="none"
        stroke={A.WHITE}
        strokeWidth="2.5"
        opacity="0.5"
      />
      {cracked && (
        <g stroke={A.ICE_CORE} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6">
          <path d="M96 52 L142 62 L170 48 L214 58" />
          <path d="M142 62 L136 84" />
          <path d="M170 48 L182 32" />
        </g>
      )}
      {/* light glint */}
      <path
        d="M92 40 q30 -12 62 -8"
        fill="none"
        stroke={A.WHITE}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** A floating ice chunk for open water. */
export function FloatingIce({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 56" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M12 34 L30 18 L62 12 L94 20 L108 34 Q108 44 94 46 L26 46 Q12 44 12 34 Z"
        fill={A.ICE_LIGHT}
        stroke={A.ICE_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M30 18 L38 34 L62 12"
        fill="none"
        stroke={A.ICE_MID}
        strokeWidth="2.5"
        opacity="0.7"
      />
      <ellipse cx="60" cy="48" rx="46" ry="5" fill={A.ICE_CORE} opacity="0.18" />
    </svg>
  );
}

/** A snow mound — size via the wrapper, hollow shading built in. */
export function SnowMound({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-mound`;
  return (
    <svg viewBox="0 0 160 70" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.WHITE} />
          <stop offset="1" stopColor={A.SNOW_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M8 64 Q28 14 80 12 Q134 14 152 64 Z"
        fill={`url(#${gid})`}
        stroke={A.SNOW_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.98"
      />
      <path
        d="M40 44 Q80 30 122 44"
        fill="none"
        stroke={A.SNOW_SHADE}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

export type RockVariant = "flat" | "jagged" | "buried";

const ROCK_PATHS: Record<RockVariant, string> = {
  flat: "M10 56 Q12 30 42 26 Q86 22 104 34 Q118 42 114 56 Z",
  jagged: "M12 56 L26 30 L44 40 L58 18 L82 34 L104 26 L114 56 Z",
  buried: "M16 56 Q20 38 48 34 Q84 30 104 44 L108 56 Z",
};

/** A rock, snow-capped — three silhouettes so scatters never repeat. */
export function ArcticRock({
  variant = "flat",
  className = "",
}: {
  variant?: RockVariant;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 126 60" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d={ROCK_PATHS[variant]}
        fill={A.ROCK}
        stroke={A.ROCK_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* the snow cap follows the top of each silhouette loosely */}
      <path
        d={
          variant === "jagged"
            ? "M22 34 L44 40 L58 18 L82 34 L98 30 Q86 22 58 12 Q34 20 22 34 Z"
            : "M22 34 Q52 20 92 30 Q74 20 48 20 Q30 24 22 34 Z"
        }
        fill={A.SNOW}
      />
    </svg>
  );
}

/** A hanging icicle cluster — for cave mouths, tents and panel edges. */
export function Icicles({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 60" className={`pl-art ${className}`} aria-hidden="true">
      <rect width="140" height="10" rx="5" fill={A.ICE_LIGHT} />
      <g fill={A.ICE} stroke={A.ICE_DEEP} strokeWidth="2" strokeLinejoin="round">
        <path d="M14 8 L20 8 L17 36 Z" />
        <path d="M34 8 L42 8 L38 52 Z" />
        <path d="M58 8 L64 8 L61 28 Z" />
        <path d="M78 8 L86 8 L82 44 Z" />
        <path d="M104 8 L110 8 L107 32 Z" />
        <path d="M122 8 L128 8 L125 24 Z" />
      </g>
      <path
        d="M38 46 L38 50"
        stroke={A.WHITE}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

/** An ice crystal — single spike or a small cluster. */
export function IceCrystal({
  cluster = false,
  className = "",
}: {
  cluster?: boolean;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-crys`;
  const spike = (x: number, y: number, w: number, h: number, tilt: number) => (
    <path
      d={`M${x} ${y} L${x + w / 2} ${y - h} L${x + w} ${y} L${x + w / 2} ${y + h * 0.16} Z`}
      transform={`rotate(${tilt} ${x + w / 2} ${y})`}
      fill={`url(#${gid})`}
      stroke={A.ICE_DEEP}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );
  return (
    <svg viewBox="0 0 120 110" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={A.ICE_MID} />
          <stop offset="1" stopColor={A.CRYSTAL} />
        </linearGradient>
      </defs>
      {cluster && spike(14, 96, 30, 52, -14)}
      {spike(42, 100, 38, 84, 0)}
      {cluster && spike(76, 96, 28, 44, 12)}
      <path
        d="M58 44 L60 30"
        stroke={A.WHITE}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
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

/** An ice-cave mouth — translucent blue interior, icicles at the lip. */
export function IceCave({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-cave`;
  return (
    <svg viewBox="0 0 220 150" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="0.5" cy="0.9" r="0.9">
          <stop offset="0" stopColor={A.ICE_CORE} />
          <stop offset="0.6" stopColor={A.ICE_DEEP} />
          <stop offset="1" stopColor={A.ICE_MID} />
        </radialGradient>
      </defs>
      {/* the ice body */}
      <path
        d="M6 144 Q2 66 58 40 Q108 16 164 40 Q216 62 214 144 Z"
        fill={A.ICE}
        stroke={A.ICE_DEEP}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 74 Q60 34 110 30 Q164 32 210 76 L210 92 Q160 48 110 46 Q62 50 12 92 Z"
        fill={A.SNOW}
      />
      {/* the mouth */}
      <path
        d="M56 144 Q56 76 110 74 Q164 76 164 144 Z"
        fill={`url(#${gid})`}
        stroke={A.ICE_LINE}
        strokeWidth="3"
      />
      {/* icicles at the lip */}
      <g fill={A.ICE_LIGHT} stroke={A.ICE_DEEP} strokeWidth="2" strokeLinejoin="round">
        <path d="M74 80 L82 80 L78 102 Z" />
        <path d="M100 76 L108 76 L104 108 Z" />
        <path d="M128 78 L136 78 L132 96 Z" />
      </g>
    </svg>
  );
}
