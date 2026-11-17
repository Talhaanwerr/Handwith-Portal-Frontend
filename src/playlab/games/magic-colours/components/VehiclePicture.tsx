"use client";

import { memo, useId, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { OUTLINE_INK } from "@games/color-paint/constants/colors";
import {
  ART_H,
  ART_W,
  mcFill,
  type Part,
  type Vehicle,
} from "@games/magic-colours/constants/vehicles";

/** The colouring-book line, in drawing units. */
const INK_W = 8;
/** A blank part: white paper with soft diagonal lines — so a part that is
 *  to become WHITE still visibly changes when it is coloured. */
const BLANK_LINE = "#dfe5ee";
/** The hubcaps and other trims, never coloured by the child. */
const TRIM_FILL = "#cfd6df";

/** How long a colour takes to spread through its part from the finger. */
const POP_S = 0.42;

/** Where a pop started, in drawing units. */
export type PopAt = readonly [number, number];

/** How far the paint must spread from `at` to reach every corner of the part. */
function reach(p: Part, [x, y]: PopAt): number {
  const [x0, y0, x1, y1] = p.shape.box;
  return Math.hypot(Math.max(x - x0, x1 - x), Math.max(y - y0, y1 - y)) + INK_W;
}

/** A click's point in the drawing's own units (a key press: the part's hand point). */
function pointIn(e: MouseEvent<SVGPathElement>, p: Part): PopAt {
  const svg = e.currentTarget.ownerSVGElement;
  const m = svg?.getScreenCTM();
  if (!svg || !m || e.detail === 0) return p.at;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(m.inverse());
  return [q.x, q.y];
}

/**
 * One vehicle, drawn. Each part is a blank (lined paper) shape with a thick ink line; a
 * coloured part is filled with its colour — and if it has just been tapped
 * (`pops`), the colour grows out of the finger as a circle clipped to the
 * part, so the paint spreads to the edges rather than appearing. The line is
 * drawn over the paint, like a real colouring book. Static (no `onTap`) it
 * is the home card's miniature; with `onTap` every blank part is a button.
 */
export const VehiclePicture = memo(function VehiclePicture({
  vehicle,
  coloured,
  pops,
  onTap,
  className,
}: {
  vehicle: Vehicle;
  /** The parts already coloured. */
  coloured: ReadonlySet<string>;
  /** Parts coloured by a tap this round, and where the tap was. */
  pops?: Readonly<Record<string, PopAt>>;
  onTap?: (part: Part, at: PopAt, el: Element) => void;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox={`0 0 ${ART_W} ${ART_H}`}
      className={className}
      preserveAspectRatio={vehicle.grounded ? "xMidYMax meet" : "xMidYMid meet"}
      role={onTap ? "group" : undefined}
      aria-label={onTap ? `the ${vehicle.name}` : undefined}
      aria-hidden={onTap ? undefined : true}
      focusable="false"
      overflow="visible"
    >
      <defs>
        <pattern
          id={`${uid}-blank`}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="14" height="14" fill="#ffffff" />
          <rect width="4" height="14" fill={BLANK_LINE} />
        </pattern>
      </defs>
      {vehicle.grounded && vehicle.exit === "drive" && (
        <ellipse cx="200" cy="244" rx="176" ry="6" fill="rgba(40, 50, 60, 0.16)" />
      )}
      {vehicle.parts.map((p) => {
        const on = coloured.has(p.id);
        const pop = pops?.[p.id];
        const fill = mcFill(p.colour);
        const clip = `${uid}-${p.id}`;
        const live = !!onTap && !on;
        return (
          <g key={p.id}>
            <path
              d={p.shape.d}
              fill={`url(#${uid}-blank)`}
              data-part={p.id}
              role={onTap ? "button" : undefined}
              tabIndex={live ? 0 : undefined}
              aria-label={
                onTap ? (on ? `the ${p.name}, ${p.colour}` : `colour the ${p.name}`) : undefined
              }
              aria-disabled={onTap && on ? true : undefined}
              style={{ cursor: live ? "pointer" : "default", outline: "none" }}
              onClick={live ? (e) => onTap(p, pointIn(e, p), e.currentTarget) : undefined}
              onKeyDown={
                live
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onTap(p, p.at, e.currentTarget);
                      }
                    }
                  : undefined
              }
            />
            {on && pop && (
              <>
                <clipPath id={clip}>
                  <path d={p.shape.d} />
                </clipPath>
                <motion.circle
                  cx={pop[0]}
                  cy={pop[1]}
                  fill={fill}
                  clipPath={`url(#${clip})`}
                  pointerEvents="none"
                  initial={{ r: 0 }}
                  animate={{ r: reach(p, pop) }}
                  transition={{ duration: POP_S, ease: [0.2, 0.8, 0.3, 1] }}
                />
              </>
            )}
            {on && !pop && <path d={p.shape.d} fill={fill} pointerEvents="none" />}
            <path
              d={p.shape.d}
              fill="none"
              stroke={OUTLINE_INK}
              strokeWidth={INK_W}
              strokeLinejoin="round"
              pointerEvents="none"
            />
            {/* the teaching hand's target */}
            <circle cx={p.at[0]} cy={p.at[1]} r="1" fill="none" data-at={p.id} />
          </g>
        );
      })}
      {vehicle.trims?.map((t) => (
        <path
          key={t.d}
          d={t.d}
          fill={TRIM_FILL}
          stroke={OUTLINE_INK}
          strokeWidth={INK_W * 0.75}
          pointerEvents="none"
        />
      ))}
      <g
        fill="none"
        stroke={OUTLINE_INK}
        strokeWidth={INK_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      >
        {vehicle.details.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
});
