"use client";

import { useId } from "react";
import { C } from "@shared/components/construction/palette";

/**
 * THE SITE ITSELF — sky, ground and the structures rising out of it. The
 * house is ONE component with a `stage` prop (foundation → walls → frame →
 * roofed) so a screen can show construction PROGRESS with the same asset.
 * Clouds are deliberately not redrawn — reuse ArcticCloud, clouds are
 * clouds (see README).
 */

/** The bright working-day sky with a soft sun. */
export function SiteSky({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-sky`;
  return (
    <div className={`ac-fill pointer-events-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 480" preserveAspectRatio="none" className="ac-fill">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.SKY_TOP} />
            <stop offset="1" stopColor={C.SKY_LOW} />
          </linearGradient>
        </defs>
        <rect width="800" height="480" fill={`url(#${gid})`} />
        <circle cx="668" cy="86" r="42" fill={C.SUN} opacity="0.95" />
        <circle cx="668" cy="86" r="58" fill={C.SUN} opacity="0.25" />
      </svg>
    </div>
  );
}

/** The dirt ground band — warm earth with sand patches and wheel ruts. */
export function DirtGround({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-dirt`;
  return (
    <svg
      viewBox="0 0 800 160"
      preserveAspectRatio="none"
      className={`pl-art ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.DIRT} />
          <stop offset="1" stopColor={C.DIRT_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M0 40 Q140 20 300 36 Q480 52 640 30 Q730 20 800 34 V160 H0 Z"
        fill={`url(#${gid})`}
      />
      {/* sand patches */}
      <ellipse cx="180" cy="86" rx="80" ry="16" fill={C.SAND} opacity="0.7" />
      <ellipse cx="560" cy="110" rx="100" ry="18" fill={C.SAND_DEEP} opacity="0.5" />
      {/* wheel ruts */}
      <g stroke={C.DIRT_LINE} strokeWidth="4" strokeLinecap="round" opacity="0.5">
        <path d="M320 70 Q420 62 520 72" fill="none" />
        <path d="M320 84 Q420 76 520 86" fill="none" />
      </g>
      {/* small stones */}
      <g fill={C.GRAVEL} opacity="0.8">
        <circle cx="96" cy="120" r="4" />
        <circle cx="418" cy="132" r="3.4" />
        <circle cx="700" cy="96" r="4.5" />
      </g>
    </svg>
  );
}

export type HouseStage = 1 | 2 | 3 | 4;

/**
 * THE HOUSE BUILD — one asset, four stages of visible progress:
 * 1 foundation · 2 walls rising · 3 roof frame · 4 roofed with door and
 * window. Perfect for progress-driven screens.
 */
export function HouseBuild({
  stage = 2,
  className = "",
}: {
  stage?: HouseStage;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-wall`;
  return (
    <svg
      viewBox="0 0 260 200"
      className={`pl-art ${className}`}
      role="img"
      aria-label={`A house under construction, stage ${stage}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.CONCRETE} />
          <stop offset="1" stopColor={C.CONCRETE_DEEP} />
        </linearGradient>
      </defs>

      {/* stage 1: the foundation slab */}
      <rect
        x="30"
        y="164"
        width="200"
        height="20"
        rx="5"
        fill={`url(#${gid})`}
        stroke={C.STEEL_LINE}
        strokeWidth="3"
      />
      <g stroke={C.STEEL_LINE} strokeWidth="2" opacity="0.4">
        <path d="M70 164 v20 M130 164 v20 M190 164 v20" fill="none" />
      </g>

      {stage >= 2 && (
        <g>
          {/* brick walls rising */}
          <rect
            x="42"
            y={stage >= 3 ? 96 : 124}
            width="176"
            height={stage >= 3 ? 68 : 40}
            fill={C.BRICK}
            stroke={C.BRICK_DEEP}
            strokeWidth="3"
          />
          {/* brick courses */}
          <g stroke={C.BRICK_DEEP} strokeWidth="2" opacity="0.6">
            <path d={`M42 ${stage >= 3 ? 118 : 140} h176`} fill="none" />
            <path d={`M42 ${stage >= 3 ? 140 : 156} h176`} fill="none" />
            {stage >= 3 && <path d="M42 158 h176" fill="none" />}
            <path
              d={`M86 ${stage >= 3 ? 96 : 124} v22 M130 ${stage >= 3 ? 118 : 140} v22 M174 ${stage >= 3 ? 96 : 124} v22`}
              fill="none"
            />
          </g>
        </g>
      )}

      {stage >= 3 && (
        // roof frame: rafters only
        <g stroke={C.WOOD_MID} strokeWidth="7" strokeLinecap="round">
          <path d="M36 96 L130 34 L224 96" fill="none" />
          <path
            d="M74 72 L74 96 M130 42 L130 96 M186 72 L186 96"
            stroke={C.WOOD}
            strokeWidth="5"
            fill="none"
          />
        </g>
      )}

      {stage >= 4 && (
        <g>
          {/* solid roof */}
          <path
            d="M28 98 L130 30 L232 98 L214 98 L130 44 L46 98 Z"
            fill={C.ROOF}
            stroke={C.WOOD_LINE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* door + window */}
          <rect
            x="70"
            y="120"
            width="34"
            height="44"
            rx="4"
            fill={C.WOOD_MID}
            stroke={C.WOOD_LINE}
            strokeWidth="3"
          />
          <circle cx="96" cy="144" r="2.6" fill={C.YELLOW} />
          <rect
            x="146"
            y="118"
            width="40"
            height="30"
            rx="4"
            fill={C.CAB_GLASS}
            stroke={C.WOOD_LINE}
            strokeWidth="3"
          />
          <path d="M166 118 v30 M146 133 h40" stroke={C.WOOD_LINE} strokeWidth="2.5" fill="none" />
        </g>
      )}
    </svg>
  );
}

/** Scaffolding — clean frame, planked platform, optional ladder. */
export function Scaffolding({
  ladder = true,
  className = "",
}: {
  ladder?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 180 220" className={`pl-art ${className}`} aria-hidden="true">
      {/* uprights */}
      <g stroke={C.STEEL} strokeWidth="8" strokeLinecap="round">
        <path d="M30 14 V206" fill="none" />
        <path d="M150 14 V206" fill="none" />
      </g>
      {/* cross bracing */}
      <g stroke={C.STEEL_DEEP} strokeWidth="4" strokeLinecap="round" opacity="0.9">
        <path d="M30 60 L150 130 M150 60 L30 130" fill="none" />
      </g>
      {/* platforms */}
      <rect
        x="20"
        y="52"
        width="140"
        height="12"
        rx="4"
        fill={C.WOOD}
        stroke={C.WOOD_LINE}
        strokeWidth="3"
      />
      <rect
        x="20"
        y="130"
        width="140"
        height="12"
        rx="4"
        fill={C.WOOD}
        stroke={C.WOOD_LINE}
        strokeWidth="3"
      />
      {/* safety railing on top */}
      <path d="M24 30 H156" stroke={C.ORANGE} strokeWidth="5" strokeLinecap="round" />
      {ladder && (
        <g stroke={C.WOOD_MID} strokeWidth="5" strokeLinecap="round">
          <path d="M76 64 V206 M104 64 V206" fill="none" />
          <path d="M76 88 h28 M76 116 h28 M76 144 h28 M76 172 h28" stroke={C.WOOD} fill="none" />
        </g>
      )}
    </svg>
  );
}

/** The little site office / tool shed. */
export function ToolShed({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 150" className={`pl-art ${className}`} aria-hidden="true">
      <rect
        x="22"
        y="56"
        width="136"
        height="84"
        rx="6"
        fill={C.SAND}
        stroke={C.WOOD_LINE}
        strokeWidth="3.5"
      />
      <path
        d="M14 60 L90 22 L166 60 Z"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect
        x="44"
        y="88"
        width="30"
        height="52"
        rx="4"
        fill={C.WOOD_MID}
        stroke={C.WOOD_LINE}
        strokeWidth="3"
      />
      <rect
        x="98"
        y="88"
        width="38"
        height="30"
        rx="4"
        fill={C.CAB_GLASS}
        stroke={C.WOOD_LINE}
        strokeWidth="3"
      />
      <path d="M117 88 v30" stroke={C.WOOD_LINE} strokeWidth="2.5" />
    </svg>
  );
}
