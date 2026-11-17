"use client";

import { memo, useId, type Ref } from "react";
import { motion } from "framer-motion";
import { fluentSrc } from "@shared/constants/fluent3d";
import { PIC, VB, type Box, type FruitId, type Piece } from "@games/fruit-puzzles/constants/rounds";

/**
 * The fruit's drawings: the board (the fruit's shape on the plate with its
 * dashed seams, the pieces that are in, the whole fruit at the end) and one
 * loose piece. All of it is the fruit's Fluent picture, clipped: a piece is
 * the picture seen through its outline, so the pieces always fit together.
 *
 * Every drawing makes its own SVG ids (`useId`) — the same piece can be on
 * the table, under the finger and gliding in at once.
 */

/** The fruit's picture, where it lies on the board. */
function FruitImage({ src }: { src: string }) {
  return (
    <image
      href={src}
      x={PIC.x}
      y={PIC.y}
      width={PIC.w}
      height={PIC.h}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

/** The fruit's own outline (its picture's see-through edge) as an SVG mask. */
function FruitMask({ id, src }: { id: string; src: string }) {
  return (
    <mask
      id={id}
      maskUnits="userSpaceOnUse"
      x={VB.x - 10}
      y={VB.y - 10}
      width={VB.w + 20}
      height={VB.h + 20}
      style={{ maskType: "alpha" }}
    >
      <FruitImage src={src} />
    </mask>
  );
}

/**
 * ONE LOOSE PIECE, drawn in `box` (its own box, or a bigger one around it): the
 * picture through the piece's outline, with a solid shadow under it.
 */
export const FruitPieceSvg = memo(function FruitPieceSvg({
  fruit,
  piece,
  className,
}: {
  fruit: FruitId;
  piece: Piece;
  className?: string;
}) {
  const uid = useId();
  const src = fluentSrc(fruit);
  if (!src) return null;
  const b: Box = piece.box;
  return (
    <svg
      viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`}
      className={className ?? "frp-piece-art"}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${uid}c`}>
          <path d={piece.path} />
        </clipPath>
        <FruitMask id={`${uid}m`} src={src} />
      </defs>
      {/* the solid shadow: the same piece, dark, a little lower */}
      <g transform="translate(0 2.4)">
        <g clipPath={`url(#${uid}c)`}>
          <rect
            x={VB.x}
            y={VB.y}
            width={VB.w}
            height={VB.h}
            fill="rgba(120, 70, 30, 0.28)"
            mask={`url(#${uid}m)`}
          />
        </g>
      </g>
      <g clipPath={`url(#${uid}c)`}>
        <FruitImage src={src} />
      </g>
    </svg>
  );
});

/**
 * THE BOARD — the fruit's shape on the plate, a soft warm shadow with white
 * dashed seams where the pieces meet, and every piece that is in. Once the
 * fruit is whole the seams go, the whole picture shows, and it bounces.
 */
export const FruitBoard = memo(function FruitBoard({
  fruit,
  pieces,
  placed,
  solved,
  svgRef,
}: {
  fruit: FruitId;
  pieces: readonly Piece[];
  placed: readonly boolean[];
  solved: boolean;
  svgRef: Ref<SVGSVGElement>;
}) {
  const uid = useId();
  const src = fluentSrc(fruit);
  if (!src) return null;
  return (
    <motion.span
      className="frp-plate-fruit"
      initial={false}
      animate={
        solved
          ? { y: ["0%", "-10%", "0%", "-4%", "0%"], scale: [1, 1.08, 0.97, 1.03, 1] }
          : { y: "0%", scale: 1 }
      }
      transition={solved ? { duration: 1.1, delay: 0.15, ease: "easeOut" } : { duration: 0 }}
    >
      <svg ref={svgRef} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="frp-plate-svg">
        <defs>
          <FruitMask id={`${uid}m`} src={src} />
          {pieces.map((p, i) => (
            <clipPath key={i} id={`${uid}c${i}`}>
              <path d={p.path} />
            </clipPath>
          ))}
        </defs>
        {!solved && (
          <g mask={`url(#${uid}m)`}>
            <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="#EADCC9" />
            {pieces.map((p, i) => (
              <path
                key={i}
                d={p.path}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1.3}
                strokeDasharray="3.2 2.4"
                strokeLinecap="round"
              />
            ))}
          </g>
        )}
        {solved ? (
          <FruitImage src={src} />
        ) : (
          pieces.map((_, i) =>
            placed[i] ? (
              <g key={i} clipPath={`url(#${uid}c${i})`}>
                <FruitImage src={src} />
              </g>
            ) : null
          )
        )}
      </svg>
    </motion.span>
  );
});

/**
 * A puzzle in miniature (home cards, the star card): the fruit on its plate,
 * its pieces pulled a little apart.
 */
export function FruitMiniSvg({ fruit, pieces }: { fruit: FruitId; pieces: readonly Piece[] }) {
  const uid = useId();
  const src = fluentSrc(fruit);
  if (!src) return null;
  return (
    <svg viewBox="-14 -14 128 128" className="frp-mini-svg" aria-hidden="true">
      <defs>
        {pieces.map((p, i) => (
          <clipPath key={i} id={`${uid}c${i}`}>
            <path d={p.path} />
          </clipPath>
        ))}
      </defs>
      <ellipse cx="50" cy="56" rx="58" ry="50" fill="#FFFFFF" />
      <ellipse cx="50" cy="56" rx="46" ry="39" fill="#F6EEE3" />
      {pieces.map((p, i) => {
        const dx = p.centre.x - 50;
        const dy = p.centre.y - 50;
        const len = Math.hypot(dx, dy) || 1;
        return (
          <g
            key={i}
            transform={`translate(${((dx / len) * 6).toFixed(2)} ${((dy / len) * 6).toFixed(2)})`}
          >
            <g clipPath={`url(#${uid}c${i})`}>
              <FruitImage src={src} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
