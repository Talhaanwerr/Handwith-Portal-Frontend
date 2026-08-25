"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cssVars } from "@shared/styles/cssVars";
import {
  JIGSAW_LAYOUTS,
  PIECE_ORDER,
  type JigsawLayout,
  type PieceKey,
  type PieceBox,
} from "@shared/utils/letterJigsaw";

export { PIECE_ORDER };
export type { JigsawLayout, PieceKey, PieceBox };

/**
 * LetterPuzzle — a letter broken into draggable pieces, shared by every game
 * that builds letters this way (Space ABC, Ocean ABC).
 *
 * A piece is a FRAGMENT OF THE LETTER, not a tile with some letter on it:
 * the glyph clipped to its region, so the piece's outer edge is the letter's
 * own contour (the curve of a C, the shoulder of a B) and only its inner
 * edges are cuts. Three of these read as a letter that has been broken, and
 * nothing else.
 *
 * Structure and geometry live here; COLOUR DOES NOT. Every element carries a
 * stable `pl-lp-*` class whose layout rules are in shared/styles/utilities.css,
 * and each game paints those classes from its own stylesheet, scoped under
 * its own root. That is what lets one puzzle be indigo-on-white in Space ABC
 * and gold-on-seabed in Ocean ABC without forking the component.
 */

/** Fraction of the 0–100 square the glyph is fitted into. */
const GLYPH_TARGET = 78;
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
 * The transform is computed ONCE per letter and handed to every piece, so the
 * pieces are always in exact register; pieces derived from independently
 * fitted glyphs would not reassemble cleanly. The returned `glyphBox` is
 * where the fitted letter actually sits, which is what lets each piece be
 * sized to the letter it contains rather than to its whole square region.
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
    <svg className="pl-lp-measure" aria-hidden="true" focusable="false">
      <text ref={ref} className="font-rounded" x="0" y="0" fontSize={MEASURE_SIZE} fontWeight="900">
        {letter}
      </text>
    </svg>
  );

  return { ...state, measure };
}

/** The glyph at the measured fit. Identical attributes everywhere it is used
 *  — including inside <clipPath> — so the shape, the clip and the outline can
 *  never drift apart. */
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
 * One puzzle piece.
 *
 * Two clips do the work:
 *   - the REGION clip decides which part of the letter this piece owns,
 *   - the LETTER clip keeps the cut lines inside the glyph, so a seam never
 *     draws out across empty space.
 */
export function LetterPiece({
  letter,
  piece,
  fit,
  box,
  layout = "split",
  className = "",
}: {
  letter: string;
  piece: PieceKey;
  fit: string;
  box: PieceBox;
  /** Which partition the piece is cut from — "split" (the T) for big
   *  letters, "stack" (three horizontal bands) for small ones. Must match
   *  the layout the boxes were computed with. */
  layout?: JigsawLayout;
  className?: string;
}) {
  const { outline } = JIGSAW_LAYOUTS[layout][piece];
  const uid = useId();
  const regionId = `${uid}-region`;
  const letterId = `${uid}-letter`;

  return (
    <svg
      viewBox={`${box.x.toFixed(2)} ${box.y.toFixed(2)} ${box.w.toFixed(2)} ${box.h.toFixed(2)}`}
      className={`pl-lp-piece ${className}`}
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
        <Glyph letter={letter} fit={fit} className="pl-lp-ink" />
        {/* the cut, drawn only where it crosses the letter */}
        <g clipPath={`url(#${letterId})`}>
          <path d={outline} className="pl-lp-cut" />
        </g>
        {/* the letter's own contour, giving the piece its outer edge */}
        <Glyph letter={letter} fit={fit} className="pl-lp-rim" />
      </g>
    </svg>
  );
}

/**
 * The target: a pale outline of the whole letter with the puzzle's seams
 * showing through it, plus every already-placed piece drawn solid in its
 * exact position. The letter fills in as pieces land.
 *
 * Sized by its PARENT — give the wrapper a square width/height and this
 * fills it, so each game controls how big its letter is.
 */
export function LetterAssembly({
  letter,
  fit,
  placed,
  boxes,
  layout = "split",
  preview,
}: {
  letter: string;
  fit: string;
  placed: readonly PieceKey[];
  boxes: Record<PieceKey, { box: PieceBox }>;
  /** Which partition this letter uses — see LetterPiece. */
  layout?: JigsawLayout;
  /** The held piece, shown faintly where it would seat. Null when the child
   *  is not close enough for it to go in. This is the "it will fit here" cue,
   *  and it is deliberately the PIECE'S OWN SHAPE — lighting up the slot's
   *  bounding rectangle instead puts a floating square on screen and reads as
   *  a glitch rather than as a recess. */
  preview?: PieceKey | null;
}) {
  const uid = useId();
  const letterId = `${uid}-letter`;

  return (
    <div className="pl-lp-assembly">
      <svg viewBox="0 0 100 100" className="pl-lp-guide" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={letterId}>
            <Glyph letter={letter} fit={fit} />
          </clipPath>
        </defs>
        <Glyph letter={letter} fit={fit} className="pl-lp-guide-ink" />
        <g clipPath={`url(#${letterId})`}>
          {PIECE_ORDER.map((key) => (
            <path key={key} d={JIGSAW_LAYOUTS[layout][key].outline} className="pl-lp-guide-seam" />
          ))}
        </g>
        <Glyph letter={letter} fit={fit} className="pl-lp-guide-rim" />
      </svg>

      {preview && !placed.includes(preview) && (
        <div
          className="pl-lp-placed pl-lp-preview pl-at"
          style={cssVars({
            "--pl-x": `${boxes[preview].box.x.toFixed(2)}%`,
            "--pl-y": `${boxes[preview].box.y.toFixed(2)}%`,
            "--pl-w": `${boxes[preview].box.w.toFixed(2)}%`,
            "--pl-h": `${boxes[preview].box.h.toFixed(2)}%`,
          })}
        >
          <LetterPiece
            letter={letter}
            piece={preview}
            fit={fit}
            box={boxes[preview].box}
            layout={layout}
          />
        </div>
      )}

      {placed.map((key) => {
        const { box } = boxes[key];
        return (
          <div
            key={key}
            className="pl-lp-placed pl-at"
            style={cssVars({
              "--pl-x": `${box.x.toFixed(2)}%`,
              "--pl-y": `${box.y.toFixed(2)}%`,
              "--pl-w": `${box.w.toFixed(2)}%`,
              "--pl-h": `${box.h.toFixed(2)}%`,
            })}
          >
            <LetterPiece letter={letter} piece={key} fit={fit} box={box} layout={layout} />
          </div>
        );
      })}
    </div>
  );
}
