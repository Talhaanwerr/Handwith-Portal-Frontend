"use client";

import { HUES, SHAPE_PATHS, type HueId, type ShapeId } from "@games/shape-match/constants/shapes";

type HeldCardProps = { kind: "color"; hue: HueId } | { kind: "shape"; shape: ShapeId };

/**
 * The card Berry holds up in his raised hand: the thing the child is looking
 * for, shown rather than only written, for a child who cannot read yet.
 *
 * It must never give away more than the question asks. A colour card shows a
 * paint splat — no shape — and a shape card shows the outline in plain ink —
 * no colour — so the other property still has to be ignored.
 */
export function HeldCard(props: HeldCardProps) {
  return (
    <div className="csf-held" aria-hidden="true">
      <span className="csf-held-card">
        <svg viewBox="0 0 40 40" className="csf-held-art">
          {props.kind === "color" ? (
            <path
              d="M20 5c4 0 5 4 8 4s6-1 7 3-2 5-1 8 4 5 1 9-6 1-8 4-3 5-7 5-4-4-7-5-7 0-8-4 2-6 2-9-4-5-1-9 5-1 7-2 3-4 8-4Z"
              fill={HUES[props.hue].fill}
              stroke={HUES[props.hue].edge}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d={SHAPE_PATHS[props.shape]}
              fill="#4B3F63"
              stroke="#2E2640"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </span>
    </div>
  );
}
