"use client";

import type { ReactNode } from "react";
import { cssVars } from "@shared/styles/cssVars";
import { Picture } from "@games/blend-read/components/PictureArt";
import { DECOR_LAND, DECOR_PORT, type DecorHole } from "@games/find-the-mouse/constants/scene";

/** One orientation's decorative holes; CSS shows the list that fits. */
function Holes({ holes, orient }: { holes: readonly DecorHole[]; orient: "land" | "port" }) {
  return (
    <div className={`ftm-dholes ftm-dholes--${orient}`} aria-hidden="true">
      {holes.map((h, i) => (
        <span
          key={i}
          className="ftm-dhole"
          style={cssVars({ "--x": `${h.x}%`, "--y": `${h.y}%`, "--k": h.k })}
        />
      ))}
    </div>
  );
}

/**
 * The world: a tiled kitchen wall, a wooden counter, and on it a big block of
 * cheese. Every screen of the game stands in this one kitchen.
 */

/** Wall + counter. Pure paint — `.ftm-wall` draws the tiles, `.ftm-counter`
 *  the worktop — so it costs nothing to keep behind every screen. */
export function Kitchen() {
  return (
    <div className="ftm-kitchen" aria-hidden="true">
      <div className="ftm-wall" />
      <div className="ftm-counter">
        <span className="ftm-counter-top" />
        <span className="ftm-counter-front" />
        <span className="ftm-towel" />
      </div>
    </div>
  );
}

/**
 * The cheese block: a top face, a front face and a side face drawn as one
 * stretchable SVG (so it fills whatever box the layout gives it), with the
 * front face's decorative holes and `children` (the burrows) laid over the
 * FRONT FACE in HTML — HTML so the holes stay perfectly round however the
 * block stretches.
 */
export function CheeseBlock({ children }: { children?: ReactNode }) {
  return (
    <div className="ftm-cheese">
      <svg
        className="ftm-cheese-body"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ftm-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD957" />
            <stop offset="1" stopColor="#F6AC22" />
          </linearGradient>
          <linearGradient id="ftm-top" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FFE27A" />
            <stop offset="1" stopColor="#FFF0B0" />
          </linearGradient>
          <linearGradient id="ftm-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#EFA11C" />
            <stop offset="1" stopColor="#D8890D" />
          </linearGradient>
        </defs>
        <polygon points="0,14 8,0 100,0 92,14" fill="url(#ftm-top)" />
        <polygon points="92,14 100,0 100,87 92,100" fill="url(#ftm-side)" />
        <rect x="0" y="14" width="92" height="86" fill="url(#ftm-front)" />
        {/* holes glimpsed on the top and side faces */}
        <g fill="#EBA521" opacity="0.8">
          <ellipse cx="26" cy="6" rx="3.6" ry="2" />
          <ellipse cx="55" cy="9" rx="2.4" ry="1.4" />
          <ellipse cx="77" cy="5" rx="3" ry="1.7" />
        </g>
        <g fill="#B8700A" opacity="0.55">
          <ellipse cx="96" cy="30" rx="1.6" ry="4" />
          <ellipse cx="96.4" cy="62" rx="1.3" ry="3" />
        </g>
        <path
          d="M0 14 L8 0 L100 0 L100 87 L92 100 L0 100 Z M0 14 L92 14 L92 100 M92 14 L100 0"
          fill="none"
          stroke="#C77D0A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="ftm-face">
        <Holes holes={DECOR_LAND} orient="land" />
        <Holes holes={DECOR_PORT} orient="port" />
        {children}
      </div>
    </div>
  );
}

/* ─── The clues a hiding mouse leaves showing ────────────────────────────── */

type Pt = readonly [number, number];

/** A tapered ribbon along a chain of cubic Béziers, as one filled outline —
 *  thick at the root, fine at the tip, like a real tail. Built once at load. */
function taperPath(segments: readonly (readonly [Pt, Pt, Pt, Pt])[], w0: number, w1: number) {
  const pts: Pt[] = [];
  for (const [p0, p1, p2, p3] of segments)
    for (let i = pts.length ? 1 : 0; i <= 12; i++) {
      const t = i / 12;
      const u = 1 - t;
      pts.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  const left: string[] = [];
  const right: string[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    const nx = (-(b[1] - a[1]) / len) * w;
    const ny = ((b[0] - a[0]) / len) * w;
    left.push(`${(p[0] + nx).toFixed(2)} ${(p[1] + ny).toFixed(2)}`);
    right.push(`${(p[0] - nx).toFixed(2)} ${(p[1] - ny).toFixed(2)}`);
  });
  return `M${left.join(" L")} L${right.reverse().join(" L")} Z`;
}

/** From the mouse's bottom, over the hole's lower lip, hanging down the
 *  cheese and curling at the tip. */
const TAIL_PATH = taperPath(
  [
    [
      [6, 4],
      [4, 24],
      [22, 30],
      [26, 44],
    ],
    [
      [26, 44],
      [30, 58],
      [14, 66],
      [18, 74],
    ],
    [
      [18, 74],
      [22, 80],
      [36, 78],
      [34, 68],
    ],
  ],
  14,
  3.4
);

/** The tail hanging out of the hole the mouse is hiding in (its bottom is
 *  drawn inside the hole by the burrow — see `.ftm-rump`). Pink and grey are
 *  the Twemoji mouse's own. */
export function MouseTail() {
  return (
    <svg className="ftm-tail-art" viewBox="0 0 40 80" aria-hidden="true">
      <path
        d={TAIL_PATH}
        fill="#F4ABBA"
        stroke="#C1697E"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One leg dangling over the hole's lip with a pink paw and three toes. */
export function MouseFoot() {
  return (
    <svg className="ftm-foot-art" viewBox="0 0 60 80" aria-hidden="true">
      <path
        d="M23 0 L39 0 L37 46 Q31 52 25 46 Z"
        fill="#99AAB5"
        stroke="#66757F"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <ellipse cx="31" cy="55" rx="19" ry="12" fill="#F4ABBA" stroke="#C1697E" strokeWidth="2.2" />
      <g fill="#F4ABBA" stroke="#C1697E" strokeWidth="2">
        <circle cx="16" cy="66" r="6.5" />
        <circle cx="31" cy="70" r="6.5" />
        <circle cx="46" cy="66" r="6.5" />
      </g>
    </svg>
  );
}

/** A mouse's face — the Twemoji mouse the word games already ship. */
export function MouseHead() {
  return (
    <span className="ftm-head-art" aria-hidden="true">
      <Picture id="mouse" />
    </span>
  );
}
