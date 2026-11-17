"use client";

import { memo } from "react";
import { HUES, type Hue, type ShapeId } from "@games/shape-lesson/constants/lessons";
import { SHAPE_PATHS, SHINE } from "@games/shape-lesson/constants/shapes";

/**
 * A MY SHAPES shape: a chunky sticker. A solid darker slab under it (its
 * bottom shadow), a thick white rim all round, a bright face and one glossy
 * blob — a toy you could pick up, not a flat outline. Fills its box.
 */
export const ShapeArt = memo(function ShapeArt({ shape, hue }: { shape: ShapeId; hue: Hue }) {
  const paint = HUES[hue];
  const d = SHAPE_PATHS[shape];
  const [sx, sy, rx, ry] = SHINE[shape];
  return (
    <svg viewBox="0 0 100 100" className="msh-art" aria-hidden="true">
      {/* the slab under it */}
      <path
        d={d}
        transform="translate(0 7)"
        fill={paint.edge}
        stroke={paint.edge}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {/* the white rim, then the face */}
      <path d={d} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="9" strokeLinejoin="round" />
      <path d={d} fill={paint.fill} />
      <ellipse
        cx={sx}
        cy={sy}
        rx={rx}
        ry={ry}
        fill="#FFFFFF"
        opacity="0.55"
        transform={`rotate(-30 ${sx} ${sy})`}
      />
    </svg>
  );
});

/**
 * The home a shape goes into: a sunken dark patch with a dashed white line
 * round it, the same outline as the piece so it can only take its own shape.
 * `glow` lights it gold (the right home, after a miss).
 */
export const ShapeHole = memo(function ShapeHole({
  shape,
  glow = false,
}: {
  shape: ShapeId;
  glow?: boolean;
}) {
  const d = SHAPE_PATHS[shape];
  return (
    <svg viewBox="0 0 100 100" className="msh-art" aria-hidden="true">
      <path
        d={d}
        fill={glow ? "rgba(255, 224, 102, 0.45)" : "rgba(30, 30, 60, 0.24)"}
        stroke={glow ? "#FFE066" : "#FFFFFF"}
        strokeWidth="5"
        strokeDasharray="10 7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
});

/** A shape's outline only, glowing gold — drawn round a picture on page 5. */
export const ShapeGlowLine = memo(function ShapeGlowLine({ shape }: { shape: ShapeId }) {
  return (
    <svg viewBox="0 0 100 100" className="msh-art msh-glowline" aria-hidden="true">
      <path
        d={SHAPE_PATHS[shape]}
        fill="none"
        stroke="#FFE066"
        strokeWidth="7"
        strokeLinejoin="round"
        pathLength={100}
      />
    </svg>
  );
});
