"use client";

import { memo, type Ref } from "react";
import {
  PIECE_COLORS,
  boxOf,
  figureBox,
  pointsAttr,
  type Figure,
  type Guide,
  type Slot,
} from "@games/tangram-town/constants/tangram";
import { svgUrl } from "@games/jigsaw-fun/utils/svgUrl";

const SILHOUETTE = "#56668A";

interface Shape {
  key: string;
  points: string;
  fill: string;
  fillOpacity?: number;
  stroke: string;
  strokeOpacity?: number;
  strokeWidth: number;
  dash?: string;
}

/**
 * What the board shows behind the pieces for one guide, as plain shapes —
 * the board draws them as SVG elements and the level plates as a CSS image
 * (`guideImage`), so both come from this one place:
 *   colour — each outline tinted and edged in the colour of its piece
 *   lines  — the dark silhouette with every outline dashed in white over it
 *   none   — the silhouette alone
 */
function guideShapes(fig: Figure, guide: Guide): Shape[] {
  const each = (make: (points: string, i: number) => Shape) =>
    fig.slots.map((s, i) => make(pointsAttr(s.pts), i));
  if (guide === "colour")
    return each((points, i) => ({
      key: `c${i}`,
      points,
      fill: PIECE_COLORS[i],
      fillOpacity: 0.32,
      stroke: PIECE_COLORS[i],
      strokeWidth: 0.08,
      dash: "0.22 0.14",
    }));
  const silhouette = each((points, i) => ({
    key: `s${i}`,
    points,
    fill: SILHOUETTE,
    stroke: SILHOUETTE,
    strokeWidth: 0.06,
  }));
  if (guide === "none") return silhouette;
  return [
    ...silhouette,
    ...each((points, i) => ({
      key: `g${i}`,
      points,
      fill: "none",
      stroke: "#FFFFFF",
      strokeOpacity: 0.6,
      strokeWidth: 0.07,
      dash: "0.22 0.16",
    })),
  ];
}

/**
 * A tangram figure on the board: the guide to fill (see `guideShapes`) and
 * the pieces placed (`filled[i]` is the piece in outline i, or null). `wave`
 * makes a finished figure's pieces bob one after another — the finale's
 * flourish. Memoised: dragging a piece must not redraw the board.
 */
export const FigureSvg = memo(function FigureSvg({
  fig,
  filled,
  guide,
  svgRef,
  wave = false,
}: {
  fig: Figure;
  filled: readonly (number | null)[];
  guide: Guide;
  svgRef?: Ref<SVGSVGElement>;
  wave?: boolean;
}) {
  const b = figureBox(fig);
  return (
    <svg
      ref={svgRef}
      viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`}
      className={`tt-figure ${wave ? "tt-figure--wave" : ""}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {guideShapes(fig, guide).map(({ key, dash, ...shape }) => (
        <polygon key={key} {...shape} strokeDasharray={dash} strokeLinejoin="round" />
      ))}
      {fig.slots.map((s, i) =>
        filled[i] === null ? null : (
          <polygon
            key={`p${i}`}
            className="tt-placed"
            style={{ animationDelay: wave ? `${i * 0.12}s` : undefined }}
            points={pointsAttr(s.pts)}
            fill={PIECE_COLORS[filled[i]!]}
            stroke="#FFFFFF"
            strokeWidth={0.07}
            strokeLinejoin="round"
          />
        )
      )}
    </svg>
  );
});

/** One guide as a CSS image — the level plates' sample of the board. */
export function guideImage(fig: Figure, guide: Guide): string {
  const b = figureBox(fig);
  const attr = (k: string, v: string | number | undefined) =>
    v === undefined ? "" : ` ${k}='${v}'`;
  const body = guideShapes(fig, guide)
    .map(
      (s) =>
        `<polygon points='${s.points}'${attr("fill", s.fill)}${attr("fill-opacity", s.fillOpacity)}${attr("stroke", s.stroke)}${attr("stroke-opacity", s.strokeOpacity)}${attr("stroke-width", s.strokeWidth)}${attr("stroke-dasharray", s.dash)} stroke-linejoin='round'/>`
    )
    .join("");
  return svgUrl(`${b.x} ${b.y} ${b.w} ${b.h}`, body);
}

/** One piece on its own, sized by its box (the tray, the ghost, the glide,
 *  the rain). */
export const TanPiece = memo(function TanPiece({ slot, color }: { slot: Slot; color: string }) {
  const b = boxOf(slot.pts);
  const pad = 0.08;
  return (
    <svg
      viewBox={`${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}`}
      className="tt-tan"
      aria-hidden="true"
    >
      <polygon
        points={pointsAttr(slot.pts)}
        fill={color}
        stroke="rgba(0,0,0,0.22)"
        strokeWidth={0.06}
        strokeLinejoin="round"
      />
      <polygon
        points={pointsAttr(slot.pts)}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={0.05}
        strokeLinejoin="round"
        transform="translate(0 -0.04)"
      />
    </svg>
  );
});
