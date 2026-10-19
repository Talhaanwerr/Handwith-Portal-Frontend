"use client";

import { memo } from "react";
import {
  BRICK_H,
  project,
  viewDir,
  COLORS,
  PLATE_H,
  boxShape,
  pts,
  shade,
  type Brick,
  type BrickColor,
  type BoxShape,
  type View,
} from "./geometry";

/**
 * BRICK ENGINE — the look.
 *
 * Plastic reads as plastic from a handful of cues, all drawn here:
 *  • the faces are lit by one key light, so the two sides of a brick differ;
 *  • every side carries a gloss gradient — a bright band under the top edge
 *    where the moulded bevel catches light, darkening to an occluded foot;
 *  • the top's camera-facing edges carry a thin specular rim;
 *  • each stud is a real cylinder: a shaded wall, a lit cap, and a crescent
 *    highlight on the cap's far side;
 *  • edges are a darker tone of the brick's own colour, never black.
 * The gradients are defined ONCE (`BrickDefs`) in object-bounding-box units,
 * so a hundred bricks share six gradients instead of owning six hundred.
 * They are mounted once per game, in a zero-size SVG (`BrickDefsHost`), and
 * every board, tray and bin references them by id.
 */

export function BrickDefs({ id = "bk" }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
        <stop offset="0.12" stopColor="#fff" stopOpacity="0.08" />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0.04" />
        <stop offset="1" stopColor="#000" stopOpacity="0.07" />
      </linearGradient>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
        <stop offset="0.28" stopColor="#fff" stopOpacity="0.42" />
        <stop offset="0.6" stopColor="#000" stopOpacity="0.05" />
        <stop offset="1" stopColor="#000" stopOpacity="0.32" />
      </linearGradient>
      <radialGradient id={`${id}-cap`} cx="0.36" cy="0.32" r="0.75">
        <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0.1" />
        <stop offset="1" stopColor="#000" stopOpacity="0.08" />
      </radialGradient>
      <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#12324a" stopOpacity="0.36" />
        <stop offset="1" stopColor="#12324a" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.2" />
      </filter>
      {PALETTE.map((c) => {
        const hex = COLORS[c].hex;
        return (
          <g key={c}>
            <linearGradient id={`${id}-top-${c}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={shade(hex, 1.2)} />
              <stop offset="0.45" stopColor={shade(hex, 1.03)} />
              <stop offset="1" stopColor={shade(hex, 0.93)} />
            </linearGradient>
            <linearGradient id={`${id}-wall-${c}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={shade(hex, 0.92)} />
              <stop offset="0.28" stopColor={shade(hex, 1.3)} />
              <stop offset="0.6" stopColor={shade(hex, 0.82)} />
              <stop offset="1" stopColor={shade(hex, 0.58)} />
            </linearGradient>
            <radialGradient id={`${id}-cap-${c}`} cx="0.36" cy="0.32" r="0.75">
              <stop offset="0" stopColor={shade(hex, 1.45)} />
              <stop offset="0.45" stopColor={shade(hex, 1.1)} />
              <stop offset="1" stopColor={shade(hex, 0.95)} />
            </radialGradient>
          </g>
        );
      })}
    </defs>
  );
}

const PALETTE = Object.keys(COLORS) as BrickColor[];

/** The shared gradients, mounted once at the game root. */
export function BrickDefsHost() {
  return (
    <svg className="bk-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <BrickDefs />
    </svg>
  );
}

const n1 = (v: number) => v.toFixed(1);

/**
 * One shape (brick, plate) as SVG markup.
 *
 * Built as a string and handed to the DOM in one go, not as React elements:
 * a brick is 30–50 SVG nodes, a busy plate is thousands, and a camera turn
 * redraws all of them every frame. Creating that many React elements per
 * frame is what made turning stutter; one string per brick costs a fraction.
 * Every value in it is a number or a colour computed here — never user text.
 */
function shapeMarkup(shape: BoxShape, hex: string, defs: string, color?: BrickColor): string {
  let out = "";
  for (const f of shape.faces) {
    const p = pts(f.points);
    // A palette colour's top is one node: its gradient already carries the colour.
    if (color && f.kind === "top") {
      out += `<polygon points="${p}" fill="url(#${defs}-top-${color})" stroke="${f.edge}" stroke-width="0.7" stroke-linejoin="round"/>`;
      continue;
    }
    out += `<polygon points="${p}" fill="${f.fill}" stroke="${f.edge}" stroke-width="0.7" stroke-linejoin="round"/>`;
    out += `<polygon points="${p}" fill="url(#${defs}-${f.kind})"/>`;
  }
  out += `<polyline points="${pts(shape.rim)}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (shape.studs.length === 0) return out;
  const wall = shade(hex, 0.86);
  const wallEdge = shade(hex, 0.6);
  const cap = shade(hex, 1.04);
  const capEdge = shade(hex, 0.74);
  for (const s of shape.studs) {
    const l = n1(s.cx - s.rx);
    const r = n1(s.cx + s.rx);
    const y = n1(s.cy);
    const t = n1(s.cy - s.hs);
    const rx = n1(s.rx);
    const ry = n1(s.ry);
    const d = `M${l},${y}A${rx},${ry} 0 0 0 ${r},${y}L${r},${t}L${l},${t}Z`;
    if (color) {
      out += `<path d="${d}" fill="url(#${defs}-wall-${color})" stroke="${wallEdge}" stroke-width="0.5"/>`;
      out += `<ellipse cx="${n1(s.cx)}" cy="${t}" rx="${rx}" ry="${ry}" fill="url(#${defs}-cap-${color})" stroke="${capEdge}" stroke-width="0.5"/>`;
    } else {
      out += `<path d="${d}" fill="${wall}" stroke="${wallEdge}" stroke-width="0.5"/>`;
      out += `<path d="${d}" fill="url(#${defs}-wall)"/>`;
      out += `<ellipse cx="${n1(s.cx)}" cy="${t}" rx="${rx}" ry="${ry}" fill="${cap}" stroke="${capEdge}" stroke-width="0.5"/>`;
      out += `<ellipse cx="${n1(s.cx)}" cy="${t}" rx="${rx}" ry="${ry}" fill="url(#${defs}-cap)"/>`;
    }
    // The crescent of light on the cap — too small to see on tiny studs.
    if (s.rx > 3) {
      const cy = s.cy - s.hs;
      const a = `M${n1(s.cx - s.rx * 0.72)},${n1(cy - s.ry * 0.1)}`;
      const b = `A${n1(s.rx * 0.72)},${n1(s.ry * 0.62)} 0 0 1 ${n1(s.cx + s.rx * 0.2)},${n1(cy - s.ry * 0.66)}`;
      out += `<path d="${a}${b}" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="${n1(Math.max(0.8, s.rx * 0.14))}" stroke-linecap="round"/>`;
    }
  }
  return out;
}

function ShapeBody({
  shape,
  hex,
  defs,
  color,
}: {
  shape: BoxShape;
  hex: string;
  defs: string;
  color?: BrickColor;
}) {
  return <g dangerouslySetInnerHTML={{ __html: shapeMarkup(shape, hex, defs, color) }} />;
}

export type BrickTone = "solid" | "ghost-ok" | "ghost-bad" | "hint";

interface BrickArtProps {
  brick: Pick<Brick, "w" | "d" | "x" | "z" | "y" | "color" | "tag" | "face">;
  view: View;
  defs?: string;
  tone?: BrickTone;
  lift?: number;
  /** Cells ("x,z") of this brick covered from above — their studs are skipped.
   *  A string so the memo compares it by value. */
  covered?: string;
}

/**
 * A letter (or mark) PRINTED on a brick, like a real printed brick: white ink
 * straight on the plastic, laid onto the side face that looks most at the
 * camera (or the face the brick asks for), skewed with that face so it sits
 * on it rather than floating in front. A thin rim in the brick's own dark
 * tone keeps white legible even on yellow; a white brick gets dark ink.
 */
function printMarkup(
  view: View,
  b: Pick<Brick, "w" | "d" | "x" | "z" | "y" | "color" | "tag" | "face">,
  hex: string,
  lift: number
): string {
  if (!b.tag) return "";
  const dir = viewDir(view);
  const normals: Array<[number, number, string]> = [
    [0, 1, "+z"],
    [1, 0, "+x"],
    [0, -1, "-z"],
    [-1, 0, "-x"],
  ];
  let n = normals[0];
  if (b.face) n = normals.find((c) => c[2] === b.face) ?? n;
  else
    for (const c of normals) if (c[0] * dir.x + c[1] * dir.z > n[0] * dir.x + n[1] * dir.z) n = c;
  if (n[0] * dir.x + n[1] * dir.z <= 0.05) return "";
  const [nx, nz] = n;
  // Across the face, left to right as the face is looked at.
  const ux = nz;
  const uz = -nx;
  const cx = b.x + b.w / 2 + (nx * b.w) / 2;
  const cz = b.z + b.d / 2 + (nz * b.d) / 2;
  const h = b.y * BRICK_H + lift + BRICK_H / 2;
  const o = project(view, cx, h, cz);
  const u = project(view, cx + ux, h, cz + uz);
  const v = project(view, cx, h - 1, cz);
  const m = [u.x - o.x, u.y - o.y, v.x - o.x, v.y - o.y, o.x, o.y].map((k) => k.toFixed(2));
  const ink = b.color === "white" ? shade(hex, 0.3) : "#fff";
  const rim = b.color === "white" ? "none" : shade(hex, 0.42);
  const text = b.tag.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<text transform="matrix(${m.join(" ")})" x="0" y="0" dy="0.36em" text-anchor="middle" font-size="1.02" font-weight="900" font-family="Nunito, 'Arial Rounded MT Bold', system-ui, sans-serif" fill="${ink}" stroke="${rim}" stroke-width="0.07" paint-order="stroke" stroke-linejoin="round">${text}</text>`;
}

/** One brick at its place on the board. */
export const BrickArt = memo(function BrickArt({
  brick,
  view,
  defs = "bk",
  tone = "solid",
  lift = 0,
  covered = "",
}: BrickArtProps) {
  const hidden = covered ? new Set(covered.split("|")) : undefined;
  const hex = COLORS[brick.color].hex;
  const shape = boxShape(
    view,
    hex,
    brick.x,
    brick.z,
    brick.w,
    brick.d,
    brick.y * BRICK_H + lift,
    BRICK_H,
    true,
    hidden
  );
  const body = () =>
    shapeMarkup(shape, hex, defs, brick.color) + printMarkup(view, brick, hex, lift);
  if (tone === "solid") return <g dangerouslySetInnerHTML={{ __html: body() }} />;
  return (
    <g className={`bk-ghost bk-ghost--${tone}`}>
      {tone === "hint" && <g dangerouslySetInnerHTML={{ __html: body() }} />}
      {shape.faces.map((f, i) => (
        <polygon
          key={i}
          points={pts(f.points)}
          className={`bk-ghost-face bk-ghost-face--${f.kind}`}
        />
      ))}
    </g>
  );
});

/** A brick's footprint shadow on the plate, blurred by the shared filter. */
export function footprint(view: View, b: Pick<Brick, "x" | "z" | "w" | "d" | "y">, spread = 0) {
  // Higher bricks throw a slightly wider, further shadow (light up-left).
  const g = 0.04 + b.y * 0.05 + spread;
  const off = 0.18 + b.y * 0.12;
  const corners = [
    [b.x - g + off, b.z - g],
    [b.x + b.w + g + off, b.z - g],
    [b.x + b.w + g + off, b.z + b.d + g],
    [b.x - g + off, b.z + b.d + g],
  ];
  return corners.map(([x, z]) => {
    const c = Math.cos(view.yaw);
    const s = Math.sin(view.yaw);
    const dx = x - view.cx;
    const dz = z - view.cz;
    return {
      x: view.ox + (dx * c - dz * s) * view.scale,
      y: view.oy + (dx * s + dz * c) * view.scale * Math.sin(view.pitch),
    };
  });
}

interface PlateArtProps {
  /** Plate cells ("x,z") with a brick on them. */
  covered?: string;
  w: number;
  d: number;
  view: View;
  color?: string;
  defs?: string;
}

/** The baseplate: a thin slab, studded all over. */
export const PlateArt = memo(function PlateArt({
  w,
  d,
  view,
  color = "#4CB04F",
  defs = "bk",
  covered = "",
}: PlateArtProps) {
  const hidden = covered ? new Set(covered.split("|")) : undefined;
  const shape = boxShape(view, color, 0, 0, w, d, -PLATE_H, PLATE_H, true, hidden);
  return <ShapeBody shape={shape} hex={color} defs={defs} />;
});

/** A free-standing single brick for trays, belts and bins: its own little
 *  camera, sized to fit a box of `size` pixels. */
export const LooseBrick = memo(function LooseBrick({
  w,
  d,
  color,
  size,
  tag,
  yaw = 0.62,
  pitch = 0.6,
}: {
  w: number;
  d: number;
  color: BrickColor;
  size: number;
  /** Printed on the brick's side (a letter brick). */
  tag?: string;
  yaw?: number;
  pitch?: number;
}) {
  const span = Math.max(w, d, 2);
  const scale = size / (span * 1.5);
  const view: View = {
    yaw,
    pitch,
    scale,
    ox: size / 2,
    oy: size / 2 + BRICK_H * scale * Math.cos(pitch) * 0.45,
    cx: w / 2,
    cz: d / 2,
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="bk-loose" aria-hidden="true">
      <ellipse
        cx={size / 2 + scale * 0.12}
        cy={size / 2 + scale * 0.25}
        rx={scale * span * 0.62}
        ry={scale * span * 0.62 * Math.sin(pitch)}
        fill="url(#bk-shadow)"
      />
      <BrickArt brick={{ w, d, color, tag, x: 0, z: 0, y: 0 }} view={view} />
    </svg>
  );
});
