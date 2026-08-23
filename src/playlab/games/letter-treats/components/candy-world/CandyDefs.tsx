"use client";

/**
 * CandyDefs - the ONE lighting and material system for Candy ABC.
 *
 * Every illustration in the world (environment, vocabulary, Bee, UI sweets)
 * draws with these, so every form sits under the same light:
 *
 *   LIGHT: upper-left, slightly in front.
 *
 *   fill(key)   lit body gradient for a palette colour - pale towards the
 *               light, the colour itself in the middle, a deeper shade away
 *               from it. This is what makes a circle read as a sphere.
 *   <Spec/>     the specular: a soft white hot-spot on glossy materials
 *   <Sheen/>    a broad gloss band across the upper half (lollipops, glass)
 *   <Shade/>    a soft dark pool under an object (cast shadow)
 *   <Rim/>      a thin cool rim light on the shadow side for separation
 *
 * <CandyDefs/> is mounted once by CandyScene (every screen has it). SVG
 * `url(#id)` references resolve document-wide, so each picture stays a small
 * self-contained SVG with no defs of its own.
 *
 * Materials are expressed by HOW MANY of these a form uses, not by separate
 * systems: matte (fill only), soft (fill + Shade), glossy (fill + Spec +
 * Sheen), translucent (fill at reduced opacity + Spec).
 */

export const PALETTE = {
  // candy world
  pink: "#FF9EC4",
  pinkDeep: "#F06AA0",
  pinkLight: "#FFD3E4",
  strawberry: "#FF6F9F",
  lavender: "#C9B8F2",
  lavenderDeep: "#A98BE0",
  lavenderLight: "#E8DFFB",
  mint: "#A6E9CB",
  mintDeep: "#6FD1A6",
  mintLight: "#D8F7E8",
  peach: "#FFC9A3",
  peachDeep: "#FFA874",
  cream: "#FFF5E6",
  vanilla: "#FFE9B8",
  sky: "#BFE7FF",
  cyan: "#9FE8F5",
  purple: "#9B6FD6",
  turquoise: "#5FD0D6",
  candyRed: "#F24E6F",
  white: "#FFFFFF",
  chocolate: "#B07A5A",
  stick: "#FFF1DE",
  // vocabulary
  red: "#F25C6E",
  redDeep: "#D9405A",
  orange: "#FFA868",
  orangeDeep: "#F08A45",
  yellow: "#FFD93D",
  yellowDeep: "#F0B429",
  sand: "#F2D9B3",
  brown: "#B07A5A",
  brownDeep: "#8C5C40",
  green: "#7CCB8F",
  greenDeep: "#55A86D",
  skyDeep: "#4FB0F0",
  blue: "#74B9FF",
  blueDeep: "#4A8FE0",
  navy: "#3D3D5C",
  grey: "#C9CFDD",
  greyDeep: "#9AA3B8",
  ink: "#3D3D5C",
  gold: "#F5C542",
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** `url(#cg-pink)` - the lit gradient for a palette colour. */
export function fill(key: PaletteKey): string {
  return `url(#cg-${key})`;
}

/** Flat fills, for the few things that must stay flat (eyes, line work). */
export const F: Record<PaletteKey, string> = Object.fromEntries(
  (Object.keys(PALETTE) as PaletteKey[]).map((k) => [k, fill(k)])
) as Record<PaletteKey, string>;

function mix(hex: string, to: string, t: number): string {
  const a = hex.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const b = to.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return (
    "#" +
    a
      .map((v, i) =>
        Math.round(v + (b[i] - v) * t)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

/** The lit ramp for one colour: towards light / body / away from light. */
export function ramp(hex: string): [string, string, string] {
  return [mix(hex, "#FFFFFF", 0.42), hex, mix(hex, "#5A2E6E", 0.28)];
}

export function CandyDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {(Object.keys(PALETTE) as PaletteKey[]).map((k) => {
          const [lo, mid, hi] = ramp(PALETTE[k]);
          return (
            <radialGradient key={k} id={`cg-${k}`} cx="32%" cy="26%" r="82%" fx="28%" fy="22%">
              <stop offset="0" stopColor={lo} />
              <stop offset="0.48" stopColor={mid} />
              <stop offset="1" stopColor={hi} />
            </radialGradient>
          );
        })}
        {/* specular hot-spot */}
        <radialGradient id="cg-spec" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        {/* gloss band: bright at the top, gone by the middle */}
        <linearGradient id="cg-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* cast shadow pool */}
        <radialGradient id="cg-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#6B2D5C" stopOpacity="0.28" />
          <stop offset="0.7" stopColor="#6B2D5C" stopOpacity="0.1" />
          <stop offset="1" stopColor="#6B2D5C" stopOpacity="0" />
        </radialGradient>
        {/* soft ambient darkening for the underside of clouds / frosting */}
        <linearGradient id="cg-under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9A6E8" stopOpacity="0" />
          <stop offset="1" stopColor="#C9A6E8" stopOpacity="0.45" />
        </linearGradient>
        {/* sugar-crystal sparkle pattern for gumdrops */}
        <pattern
          id="cg-sugar"
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(25)"
        >
          <circle cx="2" cy="2" r="1" fill="#FFFFFF" opacity="0.55" />
          <circle cx="6.5" cy="6" r="0.7" fill="#FFFFFF" opacity="0.4" />
        </pattern>
      </defs>
    </svg>
  );
}

// ── Primitives ─────────────────────────────────────────────────────────────

interface Pt {
  x: number;
  y: number;
}

/** Specular hot-spot. Place it up-left of the form's centre. */
export const Spec = ({
  x,
  y,
  rx = 6,
  ry = 4,
  rotate = -20,
}: Pt & { rx?: number; ry?: number; rotate?: number }) => (
  <ellipse
    cx={x}
    cy={y}
    rx={rx}
    ry={ry}
    fill="url(#cg-spec)"
    transform={`rotate(${rotate} ${x} ${y})`}
  />
);

/** Broad gloss across the upper part of a rounded form (a path in the form's shape). */
export const Sheen = ({ d, opacity = 1 }: { d: string; opacity?: number }) => (
  <path d={d} fill="url(#cg-sheen)" opacity={opacity} />
);

/** Cast shadow pool under a form. */
export const Shade = ({ x, y, rx = 26, ry = 6 }: Pt & { rx?: number; ry?: number }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#cg-shadow)" />
);

/** Cool rim light on the shadow side: a thin stroke that lifts the form off
 *  the background without an outline. */
export const Rim = ({ d, width = 2 }: { d: string; width?: number }) => (
  <path
    d={d}
    stroke="#FFFFFF"
    strokeWidth={width}
    strokeOpacity="0.35"
    fill="none"
    strokeLinecap="round"
  />
);
