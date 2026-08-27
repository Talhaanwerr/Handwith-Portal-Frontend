"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cssVars } from "@shared/styles/cssVars";
import {
  JIGSAW,
  PIECE_ORDER,
  type PieceKey,
  type PieceBox,
} from "@games/space-letters/constants/jigsaw";

export { PIECE_ORDER };
export type { PieceKey };

/** Fraction of the 0–100 square the glyph is fitted into. */
const GLYPH_TARGET = 94;
/** Nominal font-size the glyph is measured at; the fit transform scales from it. */
const MEASURE_SIZE = 100;
/** Pre-measurement values — close enough that the first paint is not jarring. */
const FALLBACK_FIT = "translate(50 50) scale(0.78)";
const FALLBACK_GLYPH_BOX: PieceBox = { x: 11, y: 11, w: GLYPH_TARGET, h: GLYPH_TARGET };

/**
 * Fits ANY glyph into the letter square, and reports where it landed.
 *
 * Uppercase and lowercase letters have wildly different metrics — "A" fills
 * the cap height, "a" only the x-height, "b" adds an ascender, "g" a
 * descender — so the glyph is measured at runtime (getBBox) and fitted,
 * which handles all 52 shapes with no per-letter data.
 *
 * The transform is computed ONCE per letter in the parent and handed to
 * every piece, so the pieces are always in exact register; pieces derived
 * from independently-fitted glyphs would not reassemble cleanly. The
 * returned `glyphBox` is where the fitted letter actually sits, which is
 * what lets each piece be sized to the letter it contains rather than to
 * its whole square region.
 */
export function useGlyphFit(letter: string): {
  fit: string;
  glyphBox: PieceBox;
  measure: React.ReactElement;
} {
  const ref = useRef<SVGTextElement>(null);
  const [state, setState] = useState<{ fit: string; glyphBox: PieceBox }>({
    fit: FALLBACK_FIT,
    glyphBox: FALLBACK_GLYPH_BOX,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let box: DOMRect | undefined;
    try {
      box = el.getBBox();
    } catch {
      return; // not laid out yet (or jsdom) — keep the fallback
    }
    if (!box || !box.width || !box.height) return;
    const scale = Math.min(GLYPH_TARGET / box.width, GLYPH_TARGET / box.height);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const w = box.width * scale;
    const h = box.height * scale;
    setState({
      fit: `translate(${(50 - cx * scale).toFixed(3)} ${(50 - cy * scale).toFixed(3)}) scale(${scale.toFixed(4)})`,
      glyphBox: { x: 50 - w / 2, y: 50 - h / 2, w, h },
    });
  }, [letter]);

  const measure = (
    <svg className="sap-measure" aria-hidden="true" focusable="false">
      <text ref={ref} className="font-rounded" x="0" y="0" fontSize={MEASURE_SIZE} fontWeight="900">
        {letter}
      </text>
    </svg>
  );

  return { ...state, measure };
}

/** The glyph at the measured fit. Identical attributes everywhere it is
 *  used — including inside <clipPath> — so the shape, the clip and the
 *  outline can never drift apart. */
function Glyph({ letter, fit, className }: { letter: string; fit: string; className?: string }) {
  return (
    <text
      className={`font-rounded ${className ?? ""}`}
      x="0"
      y="0"
      fontSize={MEASURE_SIZE}
      fontWeight="900"
      transform={fit}
    >
      {letter}
    </text>
  );
}

/**
 * One jigsaw piece — a FRAGMENT OF THE LETTER, not a tile with some letter
 * on it.
 *
 * The piece is the glyph clipped to its region, so its outer edge is the
 * letter's own contour (the curve of a C, the shoulder of a B) and only its
 * inner edges are cuts. That is the whole difference from a square tile:
 * three of these look like a letter that has been broken, and nothing else.
 *
 * Two clips do the work:
 *   - the REGION clip decides which part of the letter this piece owns,
 *   - the LETTER clip keeps the cut lines inside the glyph, so a seam never
 *     draws out across empty space.
 */
export function JigsawPieceArt({
  letter,
  piece,
  fit,
  box,
  className = "",
}: {
  letter: string;
  piece: PieceKey;
  fit: string;
  box: PieceBox;
  className?: string;
}) {
  const { outline } = JIGSAW[piece];
  const uid = useId();
  const regionId = `${uid}-region`;
  const letterId = `${uid}-letter`;

  return (
    <svg
      viewBox={`${box.x.toFixed(2)} ${box.y.toFixed(2)} ${box.w.toFixed(2)} ${box.h.toFixed(2)}`}
      className={`sap-piece-svg ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={regionId}>
          <path d={outline} />
        </clipPath>
        <clipPath id={letterId}>
          <Glyph letter={letter} fit={fit} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${regionId})`}>
        {/* the letter itself — this fill IS the piece's body */}
        <Glyph letter={letter} fit={fit} className="sap-piece-ink" />
        {/* the cut, drawn only where it crosses the letter */}
        <g clipPath={`url(#${letterId})`}>
          <path d={outline} className="sap-piece-cut" />
        </g>
        {/* the letter's own contour, giving the piece its outer edge */}
        <Glyph letter={letter} fit={fit} className="sap-piece-rim" />
      </g>
    </svg>
  );
}

/**
 * The target inside the container: a pale outline of the whole letter with
 * the puzzle's seams showing through it, plus every already-placed piece
 * drawn solid in its exact position. The letter fills in as pieces land.
 */
export function LetterAssembly({
  letter,
  fit,
  placed,
  boxes,
}: {
  letter: string;
  fit: string;
  placed: readonly PieceKey[];
  boxes: Record<PieceKey, { box: PieceBox }>;
}) {
  const uid = useId();
  const letterId = `${uid}-letter`;

  return (
    <div className="sap-assembly">
      <svg viewBox="0 0 100 100" className="sap-guide" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={letterId}>
            <Glyph letter={letter} fit={fit} />
          </clipPath>
        </defs>
        <Glyph letter={letter} fit={fit} className="sap-guide-ink" />
        <g clipPath={`url(#${letterId})`}>
          {PIECE_ORDER.map((key) => (
            <path key={key} d={JIGSAW[key].outline} className="sap-guide-seam" />
          ))}
        </g>
        <Glyph letter={letter} fit={fit} className="sap-guide-rim" />
      </svg>

      {placed.map((key) => {
        const { box } = boxes[key];
        return (
          <div
            key={key}
            className="sap-placed pl-at"
            style={cssVars({
              "--pl-x": `${box.x.toFixed(2)}%`,
              "--pl-y": `${box.y.toFixed(2)}%`,
              "--pl-w": `${box.w.toFixed(2)}%`,
              "--pl-h": `${box.h.toFixed(2)}%`,
            })}
          >
            <JigsawPieceArt letter={letter} piece={key} fit={fit} box={box} />
          </div>
        );
      })}
    </div>
  );
}
