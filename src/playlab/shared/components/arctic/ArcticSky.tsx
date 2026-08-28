"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { A } from "@shared/components/arctic/palette";
import { cssVars } from "@shared/styles/cssVars";

/**
 * THE ARCTIC SKY — the theme's backdrop, in layers a screen can compose:
 * ArcticSky (gradient + moon + stars + mountain silhouettes + mist band),
 * ArcticAurora over it when a screen earns some magic, ArcticCloud placed
 * freely, Snowfall on top. Vast, calm and spacious by construction — the
 * empty sky IS the majesty, so nothing here fills space for its own sake.
 */
export function ArcticSky({ moon = true, className = "" }: { moon?: boolean; className?: string }) {
  const uid = useId();
  const skyId = `${uid}-sky`;

  return (
    <div className={`ac-fill pointer-events-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 480" preserveAspectRatio="none" className="ac-fill">
        <defs>
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={A.SKY_TOP} />
            <stop offset="0.55" stopColor={A.SKY_MID} />
            <stop offset="1" stopColor={A.SKY_LOW} />
          </linearGradient>
        </defs>
        <rect width="800" height="480" fill={`url(#${skyId})`} />

        {moon && (
          <g>
            <circle cx="640" cy="88" r="34" fill={A.MOON} opacity="0.95" />
            <circle cx="628" cy="80" r="7" fill={A.SNOW_SHADE} opacity="0.5" />
            <circle cx="652" cy="98" r="5" fill={A.SNOW_SHADE} opacity="0.4" />
          </g>
        )}
        {/* a few small stars, high and quiet */}
        <g fill={A.STAR}>
          <circle cx="120" cy="60" r="2.4" opacity="0.9" />
          <circle cx="300" cy="40" r="1.8" opacity="0.7" />
          <circle cx="480" cy="70" r="2" opacity="0.8" />
          <circle cx="210" cy="120" r="1.6" opacity="0.6" />
          <circle cx="560" cy="150" r="1.8" opacity="0.6" />
          <circle cx="726" cy="180" r="2" opacity="0.7" />
        </g>

        {/* mountain layers, far to near — depth from tone alone */}
        <path
          d="M0 300 L90 212 L170 286 L268 196 L360 292 L470 214 L556 288 L664 206 L744 278 L800 238 V480 H0 Z"
          fill={A.MTN_FAR}
          opacity="0.85"
        />
        <path
          d="M0 352 L120 262 L226 344 L340 250 L470 350 L586 268 L706 348 L800 292 V480 H0 Z"
          fill={A.MTN_MID}
        />
        {/* snow caps on the near ridge */}
        <path d="M108 271 L120 262 L134 273 L120 280 Z" fill={A.SNOW} />
        <path d="M326 261 L340 250 L356 263 L340 271 Z" fill={A.SNOW} />
        <path d="M572 279 L586 268 L601 280 L586 288 Z" fill={A.SNOW} />
        {/* atmospheric mist where mountains meet the ground */}
        <rect y="356" width="800" height="70" fill={A.MIST} opacity="0.55" />
        <rect y="400" width="800" height="80" fill={A.MIST} opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * THE AURORA — optional, and deliberately a whisper: three pale translucent
 * ribbons. `shimmer` allows the one movement it earns (a slow sideways
 * breath); off by default, and never a centerpiece.
 */
export function ArcticAurora({
  shimmer = false,
  className = "",
}: {
  shimmer?: boolean;
  className?: string;
}) {
  const ribbons = (
    <g>
      <path
        d="M-40 150 Q160 60 340 128 Q540 200 840 96 L840 30 Q560 130 360 66 Q170 8 -40 92 Z"
        fill={A.AURORA_TEAL}
        opacity="0.16"
      />
      <path
        d="M-40 120 Q200 40 420 96 Q620 146 840 66 L840 22 Q610 96 430 52 Q220 2 -40 76 Z"
        fill={A.AURORA_BLUE}
        opacity="0.18"
      />
      <path
        d="M-40 96 Q240 24 470 66 Q670 100 840 44 L840 14 Q660 60 480 30 Q250 -8 -40 58 Z"
        fill={A.AURORA_VIOLET}
        opacity="0.12"
      />
    </g>
  );

  return (
    <div className={`ac-aurora pointer-events-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 800 260" preserveAspectRatio="none" className="ac-fill">
        {shimmer ? (
          <motion.g
            animate={{ x: [0, 22, 0, -16, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          >
            {ribbons}
          </motion.g>
        ) : (
          ribbons
        )}
      </svg>
    </div>
  );
}

/** A soft flat-bottomed Arctic cloud. */
export function ArcticCloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 70" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M22 54 Q6 54 8 40 Q10 26 28 28 Q32 10 54 12 Q72 12 78 26 Q96 18 106 32 Q126 26 132 40 Q152 38 152 50 Q152 56 140 56 L30 56 Q24 56 22 54 Z"
        fill={A.SNOW}
        opacity="0.9"
      />
      <path
        d="M30 56 L140 56"
        stroke={A.SNOW_SHADE}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/**
 * GENTLE SNOWFALL — the theme's one ambient motion. Flake geometry is
 * PRECOMPUTED from a fixed hash (the Confetti mixer — the one that
 * actually distributes) with fixed decimals: no Math.random, no hydration
 * drift, the same quiet snow every time. The fall itself is a CSS loop
 * (ac-flake in arctic.css); Framer is not involved, so flakes cost nothing.
 */
function unit(n: number): number {
  let t = (n + 1) * 0x9e3779b9;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const MAX_FLAKES = 40;
const FLAKES = Array.from({ length: MAX_FLAKES }, (_, i) => ({
  x: `${(unit(i * 5) * 100).toFixed(2)}%`,
  delay: `${(unit(i * 5 + 1) * -14).toFixed(2)}s`,
  dur: `${(9 + unit(i * 5 + 2) * 9).toFixed(2)}s`,
  s: (0.5 + unit(i * 5 + 3) * 0.9).toFixed(2),
}));

export function Snowfall({ count = 24 }: { count?: number }) {
  return (
    <div className="ac-fill pointer-events-none overflow-hidden" aria-hidden="true">
      {FLAKES.slice(0, Math.min(count, MAX_FLAKES)).map((f, i) => (
        <span
          key={i}
          className="ac-flake pl-at"
          style={cssVars({
            "--pl-x": f.x,
            "--ac-delay": f.delay,
            "--ac-dur": f.dur,
            "--ac-s": f.s,
          })}
        />
      ))}
    </div>
  );
}
