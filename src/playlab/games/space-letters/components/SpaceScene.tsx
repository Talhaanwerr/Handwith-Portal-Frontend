"use client";

import { useId } from "react";

/**
 * The space world every Space ABC screen sits in: deep-blue sky, a nebula
 * wash, a ringed planet, a moon, scattered stars and an astronaut drifting
 * past.
 *
 * TWO RULES SHAPE THIS DRAWING
 *
 * 1. It is STATIC. Nothing here moves — no drifting, no twinkling, no
 *    parallax. The puzzle is the only thing on screen that changes, so a
 *    child's eye is never pulled away from it by scenery.
 *
 * 2. The CENTRE IS EMPTY. Everything sits in the corners and along the
 *    edges, outside a generous clear zone around the middle, because that is
 *    exactly where the white container and the letter live. The scene sets
 *    the mood at the margins and hands the middle of the screen to the
 *    gameplay.
 *
 * TWO SHAPES OF SCREEN. The drawing is designed on a 400×300 sky and covers
 * the screen (`slice`), which on a portrait phone cropped the sides off — and
 * every planet and the astronaut live at the sides, so a phone saw nothing
 * but stars. The `tall` scene is the same drawing TRANSPOSED onto 300×400:
 * every placement mirrored across the diagonal, so the ring around the empty
 * centre is kept and every prop still hugs an edge. The backdrop renders both
 * and CSS shows whichever fits the screen's orientation.
 *
 * Entirely decorative — aria-hidden and pointer-events-none throughout, per
 * the project's rule for background layers.
 *
 * Palette is local and named, not hoisted into tokens.ts: these are art
 * direction for one drawing (a planet's ring colour is not a design token),
 * which is the same convention DinoArt and SharkArt already follow.
 */

const SKY = {
  deep: "#050814",
  night: "#0B1330",
  dusk: "#1B2B6B",
  nebulaA: "#4C4DDC",
  nebulaB: "#8B7CFF",
  star: "#DCE8FF",
  planetBody: "#3C56B8",
  planetDark: "#2C3F8C",
  planetRing: "#8FA6E8",
  moonBody: "#C2CFEA",
  moonCrater: "#A6B6D8",
  rustBody: "#C97B6A",
  rustDark: "#A85E50",
  suitLight: "#EDF2FF",
  suitShade: "#C9D6F0",
  visor: "#16224A",
  visorGlow: "#5B7FFF",
  pack: "#9FB2D8",
} as const;

/** Stars, hand-placed to ring the empty centre. [x, y, r, opacity] */
const STARS: readonly [number, number, number, number][] = [
  [22, 26, 1.6, 0.9],
  [58, 14, 1.1, 0.7],
  [96, 40, 1.3, 0.55],
  [140, 20, 1.5, 0.8],
  [188, 12, 1, 0.6],
  [236, 26, 1.4, 0.75],
  [286, 16, 1.1, 0.6],
  [330, 34, 1.6, 0.85],
  [374, 18, 1.2, 0.65],
  [16, 78, 1.3, 0.7],
  [44, 118, 1, 0.5],
  [382, 84, 1.4, 0.75],
  [356, 124, 1, 0.5],
  [12, 162, 1.2, 0.6],
  [390, 156, 1.1, 0.55],
  [26, 214, 1.5, 0.7],
  [66, 262, 1.2, 0.6],
  [140, 288, 1.1, 0.5],
  [214, 294, 1.3, 0.6],
  [268, 276, 1, 0.45],
  [318, 286, 1.4, 0.65],
  [368, 250, 1.2, 0.55],
];

/** Four-point sparkles, a little brighter than the round stars. [x, y, size] */
const SPARKLES: readonly [number, number, number][] = [
  [78, 60, 3.4],
  [344, 72, 2.8],
  [40, 250, 3],
];

export function SpaceScene({ tall = false }: { tall?: boolean }) {
  // Gradient ids are document-global, so they are namespaced per instance —
  // the same guard the puzzle pieces use for their clip paths.
  const uid = useId();
  const skyId = `${uid}-sky`;
  const nebulaAId = `${uid}-nebula-a`;
  const nebulaBId = `${uid}-nebula-b`;
  const sphereId = `${uid}-sphere`;

  /** A placement in the wide drawing, or its transpose in the tall one. */
  const at = (x: number, y: number): readonly [number, number] => (tall ? [y, x] : [x, y]);
  const [w, h] = at(400, 300);
  const [nebulaAx, nebulaAy] = at(66, 52);
  const [nebulaArx, nebulaAry] = at(150, 96);
  const [nebulaBx, nebulaBy] = at(348, 248);
  const [nebulaBrx, nebulaBry] = at(140, 104);
  const [planetX, planetY] = at(46, 268);
  const [moonX, moonY] = at(356, 44);
  const [rustX, rustY] = at(384, 186);
  const [astronautX, astronautY] = at(62, 96);

  return (
    <svg
      className={`spl-scene ${tall ? "spl-scene--tall" : "spl-scene--wide"}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={SKY.deep} />
          <stop offset="55%" stopColor={SKY.night} />
          <stop offset="100%" stopColor={SKY.dusk} />
        </linearGradient>

        <radialGradient id={nebulaAId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={SKY.nebulaA} stopOpacity="0.5" />
          <stop offset="100%" stopColor={SKY.nebulaA} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={nebulaBId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={SKY.nebulaB} stopOpacity="0.42" />
          <stop offset="100%" stopColor={SKY.nebulaB} stopOpacity="0" />
        </radialGradient>

        {/* the lit side of a sphere — one gradient, reused by every planet */}
        <radialGradient id={sphereId} cx="0.34" cy="0.3" r="0.78">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width={w} height={h} fill={`url(#${skyId})`} />

      {/* nebula clouds, pushed into opposite corners */}
      <ellipse
        cx={nebulaAx}
        cy={nebulaAy}
        rx={nebulaArx}
        ry={nebulaAry}
        fill={`url(#${nebulaAId})`}
      />
      <ellipse
        cx={nebulaBx}
        cy={nebulaBy}
        rx={nebulaBrx}
        ry={nebulaBry}
        fill={`url(#${nebulaBId})`}
      />

      {/* stars */}
      <g fill={SKY.star}>
        {STARS.map(([x, y, r, o], i) => {
          const [cx, cy] = at(x, y);
          return <circle key={i} cx={cx} cy={cy} r={r} opacity={o} />;
        })}
      </g>

      {/* four-point sparkles */}
      <g fill={SKY.star} opacity="0.75">
        {SPARKLES.map(([sx, sy, s], i) => {
          const [x, y] = at(sx, sy);
          return (
            <path
              key={i}
              d={`M${x} ${y - s} Q${x + s * 0.28} ${y - s * 0.28} ${x + s} ${y}
                Q${x + s * 0.28} ${y + s * 0.28} ${x} ${y + s}
                Q${x - s * 0.28} ${y + s * 0.28} ${x - s} ${y}
                Q${x - s * 0.28} ${y - s * 0.28} ${x} ${y - s} Z`}
            />
          );
        })}
      </g>

      {/* ── the ringed planet, on an edge and partly off-canvas ── */}
      <g transform={`translate(${planetX} ${planetY})`} opacity="0.92">
        {/* back half of the ring, drawn before the body so it passes behind */}
        <ellipse
          cx="0"
          cy="0"
          rx="96"
          ry="26"
          fill="none"
          stroke={SKY.planetRing}
          strokeWidth="7"
          opacity="0.42"
          transform="rotate(-18)"
        />
        <circle cx="0" cy="0" r="62" fill={SKY.planetBody} />
        {/* banding */}
        <path d="M-58 -18 Q0 -30 58 -18 Q0 -6 -58 -18 Z" fill={SKY.planetDark} opacity="0.55" />
        <path d="M-60 8 Q0 -4 60 8 Q0 20 -60 8 Z" fill={SKY.planetDark} opacity="0.4" />
        <circle cx="0" cy="0" r="62" fill={`url(#${sphereId})`} />
        {/* front half of the ring */}
        <path
          d="M-96 0 A96 26 0 0 0 96 0"
          fill="none"
          stroke={SKY.planetRing}
          strokeWidth="7"
          opacity="0.7"
          transform="rotate(-18)"
        />
      </g>

      {/* ── the moon ── */}
      <g transform={`translate(${moonX} ${moonY})`} opacity="0.9">
        <circle cx="0" cy="0" r="27" fill={SKY.moonBody} />
        <circle cx="-9" cy="-7" r="6" fill={SKY.moonCrater} opacity="0.75" />
        <circle cx="7" cy="6" r="4.4" fill={SKY.moonCrater} opacity="0.7" />
        <circle cx="11" cy="-11" r="3" fill={SKY.moonCrater} opacity="0.6" />
        <circle cx="-6" cy="12" r="2.6" fill={SKY.moonCrater} opacity="0.55" />
        <circle cx="0" cy="0" r="27" fill={`url(#${sphereId})`} />
      </g>

      {/* ── a small rusty planet on an edge ── */}
      <g transform={`translate(${rustX} ${rustY})`} opacity="0.82">
        <circle cx="0" cy="0" r="16" fill={SKY.rustBody} />
        <path d="M-14 -5 Q0 -12 14 -5 Q0 1 -14 -5 Z" fill={SKY.rustDark} opacity="0.6" />
        <circle cx="0" cy="0" r="16" fill={`url(#${sphereId})`} />
      </g>

      {/* ── the astronaut, drifting near a corner ── */}
      <g
        transform={`translate(${astronautX} ${astronautY}) rotate(-12) scale(1.05)`}
        opacity="0.95"
      >
        {/* tether, trailing off toward the corner */}
        <path
          d="M-16 16 Q-40 30 -58 26"
          fill="none"
          stroke={SKY.suitShade}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* backpack */}
        <rect x="-13" y="-8" width="26" height="26" rx="7" fill={SKY.pack} />

        {/* legs */}
        <rect x="-11" y="14" width="9" height="20" rx="4.5" fill={SKY.suitLight} />
        <rect x="2" y="14" width="9" height="20" rx="4.5" fill={SKY.suitLight} />
        <rect x="-11.5" y="29" width="10" height="7" rx="3.5" fill={SKY.suitShade} />
        <rect x="1.5" y="29" width="10" height="7" rx="3.5" fill={SKY.suitShade} />

        {/* arms */}
        <rect
          x="-25"
          y="-2"
          width="9"
          height="21"
          rx="4.5"
          fill={SKY.suitLight}
          transform="rotate(24 -20.5 8.5)"
        />
        <rect
          x="16"
          y="-2"
          width="9"
          height="21"
          rx="4.5"
          fill={SKY.suitLight}
          transform="rotate(-30 20.5 8.5)"
        />

        {/* torso */}
        <rect x="-14" y="-6" width="28" height="26" rx="9" fill={SKY.suitLight} />
        <rect x="-14" y="6" width="28" height="14" rx="7" fill={SKY.suitShade} opacity="0.55" />
        {/* chest control panel */}
        <rect x="-6" y="2" width="12" height="8" rx="2.5" fill={SKY.visor} opacity="0.5" />
        <circle cx="-2.5" cy="6" r="1.3" fill={SKY.visorGlow} />
        <circle cx="2.5" cy="6" r="1.3" fill={SKY.star} opacity="0.8" />

        {/* helmet */}
        <circle cx="0" cy="-15" r="15" fill={SKY.suitLight} />
        <circle cx="0" cy="-15" r="11" fill={SKY.visor} />
        <path d="M-8 -20 Q-4 -25 3 -24 Q-3 -21 -6 -16 Z" fill={SKY.visorGlow} opacity="0.55" />
      </g>
    </svg>
  );
}
