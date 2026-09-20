"use client";

import { HUES, SHAPE_PATHS, type Piece } from "@games/shape-match/constants/shapes";

/**
 * THE SHAPES, drawn twice from one outline.
 *
 * `ShapeGlyph` is the solid piece a child picks up; `ShapeHole` is the gap it
 * belongs in. Both read the same path out of `SHAPE_PATHS`, so a piece can
 * never be a slightly different circle from the hole that wants it.
 *
 * Flat fills, one thick outline, a soft shadow under it and a single inner
 * highlight — the whole cartoon vocabulary of this game in four elements.
 * Corners are sharp in the data and rounded here by `stroke-linejoin`, so
 * every shape gets the same friendly edge for free.
 *
 * Everything fits a 40 x 40 box and fills its span: the layout decides how
 * big a shape is, the drawing never has to know.
 */

/** Scales a path about the middle of the box, for the inner highlight. */
const INNER = "translate(20 20) scale(0.78) translate(-20 -20)";

interface GlyphProps {
  piece: Piece;
  /** Degrees of tilt — used by the picture decorations, never by a piece the
   *  child has to match (a tilted triangle is a harder triangle). */
  spin?: number;
}

export function ShapeGlyph({ piece, spin = 0 }: GlyphProps) {
  const paint = HUES[piece.hue];
  const d = SHAPE_PATHS[piece.shape];
  const turn = spin ? "rotate(" + spin + " 20 20)" : undefined;

  return (
    <svg viewBox="0 0 40 40" className="sm-art" aria-hidden="true">
      <g transform={turn}>
        {/* the shadow the shape casts on whatever it is lying on */}
        <path d={d} fill={paint.edge} opacity="0.32" transform="translate(0 1.8)" />
        <path
          d={d}
          fill={paint.fill}
          stroke={paint.edge}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* one highlight, so a flat colour still reads as a solid object */}
        <path
          d={d}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeLinejoin="round"
          transform={INNER}
        />
      </g>
    </svg>
  );
}

interface HoleProps {
  piece: Piece;
  /**
   * The round is matched on COLOUR, so the hole has to show its colour
   * properly rather than as a hint of tint behind a dashed line.
   */
  strong?: boolean;
}

/** The gap in the board: the same silhouette, sunk and waiting. */
export function ShapeHole({ piece, strong = false }: HoleProps) {
  const paint = HUES[piece.hue];
  const d = SHAPE_PATHS[piece.shape];

  return (
    <svg viewBox="0 0 40 40" className="sm-art" aria-hidden="true">
      <path
        d={d}
        fill={strong ? paint.fill : paint.soft}
        fillOpacity={strong ? 0.55 : 1}
        stroke={paint.edge}
        strokeOpacity="0.75"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeDasharray="4.4 3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The green tick that lands on a hole once the right piece is in it. */
export function Tick() {
  return (
    <svg viewBox="0 0 40 40" className="sm-art" aria-hidden="true">
      <circle cx="20" cy="20" r="15.6" fill="#5FCB52" stroke="#ffffff" strokeWidth="3" />
      <path
        d="m12.6 20.4 5 5.2 10-11"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A four-point twinkle — what a correct answer throws in the air. */
export function Twinkle({ fill = "#FFC93C" }: { fill?: string }) {
  return (
    <svg viewBox="0 0 40 40" className="sm-art" aria-hidden="true">
      <path
        d="M20 2c2 11 5 14 16 18-11 4-14 7-16 18-2-11-5-14-16-18 11-4 14-7 16-18Z"
        fill={fill}
      />
    </svg>
  );
}
