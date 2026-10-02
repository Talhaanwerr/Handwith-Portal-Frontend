"use client";

import { memo, type Ref } from "react";
import type { Level } from "@games/jigsaw-fun/constants/levels";
import {
  CELL,
  PIECE_PAD,
  STARS,
  cutPaths,
  gridOf,
  pictureSrc,
  sceneOf,
  type ModuleId,
} from "@games/jigsaw-fun/constants/jigsaw";

/**
 * The picture a jigsaw is cut from, w × h picture units. Flat colours only:
 * it is drawn once per piece, and shared gradient ids would tie every copy to
 * whichever one the document found first. Nothing is drawn outside the frame
 * — the mat letterboxes its SVG, so overflow would show beside the picture.
 * Memoised: a board holds a copy per placed piece, and placing one more must
 * not redraw the others.
 */
export const JigsawScene = memo(function JigsawScene({
  module,
  w,
  h,
}: {
  module: ModuleId;
  w: number;
  h: number;
}) {
  const s = sceneOf(module);
  const size = Math.min(w, h) * 0.66;
  const m = Math.min(w, h);
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill={s.sky[0]} />
      <rect x={0} y={h * 0.38} width={w} height={h * 0.62} fill={s.sky[1]} />
      {s.stars &&
        STARS.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x * w}
            cy={y * h}
            r={r * 1000 * (m / 300)}
            fill="#FFFFFF"
            opacity={0.85}
          />
        ))}
      <circle cx={w * 0.83} cy={h * 0.2} r={m * 0.1} fill={s.sun} />
      <path
        d={`M0,${h * 0.62} Q${w * 0.34},${h * 0.5} ${w * 0.74},${h * 0.8} L0,${h * 0.8} Z`}
        fill={s.far}
      />
      <rect x={0} y={h * 0.8} width={w} height={h * 0.2} fill={s.ground} />
      <image
        href={pictureSrc(s.picture)}
        x={(w - size) / 2}
        y={h * 0.88 - size}
        width={size}
        height={size}
      />
    </g>
  );
});

/** One piece on its own (the tray, the ghost, the glide into place): the
 *  picture cut to the piece's outline, in a box with room for its knobs. */
export const JigsawPieceSvg = memo(function JigsawPieceSvg({
  module,
  level,
  index,
  idPrefix,
}: {
  module: ModuleId;
  level: Level;
  index: number;
  idPrefix: string;
}) {
  const { cols, rows } = gridOf(level);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const d = cutPaths(module, level)[index];
  const id = `${idPrefix}-${module}-${level}-${index}`;
  return (
    <svg
      viewBox={`${col * CELL - PIECE_PAD} ${row * CELL - PIECE_PAD} ${CELL + PIECE_PAD * 2} ${
        CELL + PIECE_PAD * 2
      }`}
      className="jf-piece-art"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <JigsawScene module={module} w={cols * CELL} h={rows * CELL} />
      </g>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1.4} />
    </svg>
  );
});

/**
 * The puzzle on its board: the picture very faint (something to match), the
 * pieces in place, and every piece's outline on a layer of its own above.
 * `solved` fades that layer out so the finished picture reads as one picture
 * — an opacity fade of a whole layer, which the compositor runs on its own,
 * instead of re-painting the board on every frame of the celebration.
 */
export const JigsawBoard = memo(function JigsawBoard({
  module,
  level,
  placed,
  solved = false,
  svgRef,
  idPrefix = "jf-b",
}: {
  module: ModuleId;
  level: Level;
  placed: readonly boolean[];
  solved?: boolean;
  svgRef?: Ref<SVGSVGElement>;
  idPrefix?: string;
}) {
  const { cols, rows } = gridOf(level);
  const w = cols * CELL;
  const h = rows * CELL;
  const paths = cutPaths(module, level);
  const clip = (i: number) => `${idPrefix}-${module}-${level}-${i}`;
  const viewBox = `0 0 ${w} ${h}`;
  return (
    <span className="jf-board">
      <svg ref={svgRef} viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          {paths.map((d, i) => (
            <clipPath key={i} id={clip(i)}>
              <path d={d} />
            </clipPath>
          ))}
        </defs>
        <rect x={0} y={0} width={w} height={h} fill="#FBF6EC" />
        <g opacity={0.22}>
          <JigsawScene module={module} w={w} h={h} />
        </g>
        {paths.map((_, i) =>
          placed[i] ? (
            <g key={i} clipPath={`url(#${clip(i)})`}>
              <JigsawScene module={module} w={w} h={h} />
            </g>
          ) : null
        )}
      </svg>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className={`jf-seams ${solved ? "is-gone" : ""}`}
        aria-hidden="true"
      >
        {paths.map((d, i) => (
          <path
            key={i}
            className="jf-seam"
            d={d}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={placed[i] ? 0.5 : 0.95}
            strokeWidth={placed[i] ? 1.4 : 2.4}
            strokeDasharray={placed[i] ? undefined : "7 5"}
          />
        ))}
      </svg>
    </span>
  );
});
