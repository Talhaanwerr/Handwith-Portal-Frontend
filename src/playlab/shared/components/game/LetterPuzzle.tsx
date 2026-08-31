"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cssVars } from "@shared/styles/cssVars";
import {
  JIGSAW_LAYOUTS,
  PIECE_ORDER,
  type JigsawCuts,
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
const GLYPH_TARGET = 88;
/** Nominal font-size the glyph is measured at; the fit transform scales from it. */
const MEASURE_SIZE = 100;
/** Resolution the glyph is rasterised at to read its ink profile. 128 is
 *  ample: the cuts only need to land within a percent or so, and the whole
 *  sample is one 128×128 read per letter. */
const RASTER = 128;

/**
 * Where the letter's INK divides into thirds, and along which axis.
 *
 * Splitting the bounding box into equal thirds does not split the letter into
 * equal pieces — the ink is not spread evenly inside the box. A "C" keeps its
 * whole thick back in the left third and gives the other two only the thin
 * tips of its arcs, which is 58% / 26% / 16% of the letter.
 *
 * So the glyph is drawn once to an offscreen canvas and its alpha is summed
 * per column and per row. Each axis is then scored on two things: how evenly
 * the equal-ink cuts divide the glyph's extent, and how square the resulting
 * pieces are. The better axis wins — which is why a "C" comes out as three
 * stacked bands while an "A" still comes out as left leg, apex + crossbar and
 * right leg. Returns null if the glyph cannot be sampled, and the caller
 * falls back to thirds of the box.
 */
function measureCuts(letter: string, font: string, box: PieceBox): JigsawCuts | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = RASTER;
  canvas.height = RASTER;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.fillStyle = "#000";
  ctx.fillText(letter, RASTER / 2, RASTER / 2);

  let pixels: Uint8ClampedArray;
  try {
    pixels = ctx.getImageData(0, 0, RASTER, RASTER).data;
  } catch {
    return null; // tainted or unsupported — fall back
  }

  const cols = new Float64Array(RASTER);
  const rows = new Float64Array(RASTER);
  let total = 0;
  for (let y = 0; y < RASTER; y += 1) {
    for (let x = 0; x < RASTER; x += 1) {
      const alpha = pixels[(y * RASTER + x) * 4 + 3];
      if (alpha === 0) continue;
      cols[x] += alpha;
      rows[y] += alpha;
      total += alpha;
    }
  }
  if (total === 0) return null;

  /** Fractions of the glyph's extent at which the running ink hits 1/3, 2/3. */
  const splitAt = (profile: Float64Array): [number, number] | null => {
    let first = -1;
    let last = -1;
    for (let i = 0; i < RASTER; i += 1) {
      if (profile[i] > 0) {
        if (first < 0) first = i;
        last = i;
      }
    }
    if (first < 0 || last <= first) return null;
    const span = last - first + 1;
    const marks: number[] = [];
    let run = 0;
    for (let i = first; i <= last; i += 1) {
      run += profile[i];
      if (marks.length === 0 && run >= total / 3) marks.push((i + 1 - first) / span);
      else if (marks.length === 1 && run >= (2 * total) / 3) marks.push((i + 1 - first) / span);
    }
    if (marks.length < 2) return null;
    // Never let a cut sit hard against an edge — that would make an empty piece.
    const f1 = Math.min(Math.max(marks[0], 0.12), 0.6);
    const f2 = Math.min(Math.max(marks[1], f1 + 0.16), 0.88);
    return [f1, f2];
  };

  const byX = splitAt(cols);
  const byY = splitAt(rows);
  if (!byX && !byY) return null;

  /** Even shares score high; so do pieces that are not long thin ribbons. */
  const score = (marks: [number, number], along: number, across: number): number => {
    const shares = [marks[0], marks[1] - marks[0], 1 - marks[1]];
    const evenness = Math.min(...shares) / Math.max(...shares);
    const chunkiness =
      shares.reduce((sum, s) => {
        const a = s * along;
        return sum + Math.min(a, across) / Math.max(a, across);
      }, 0) / shares.length;
    return evenness * chunkiness;
  };

  const sx = byX ? score(byX, box.w, box.h) : -1;
  const sy = byY ? score(byY, box.h, box.w) : -1;

  // Ties go to a vertical cut: it is the established look for capitals.
  if (byX && sx >= sy * 0.98) {
    return { axis: "x", a: box.x + byX[0] * box.w, b: box.x + byX[1] * box.w };
  }
  if (byY) {
    return { axis: "y", a: box.y + byY[0] * box.h, b: box.y + byY[1] * box.h };
  }
  return null;
}

/** Pre-measurement values — close enough that the first paint is not jarring. */
const FALLBACK_FIT = "translate(50 50) scale(0.78)";
const FALLBACK_GLYPH_BOX: PieceBox = { x: 6, y: 6, w: GLYPH_TARGET, h: GLYPH_TARGET };

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
  cuts: JigsawCuts | null;
  measure: React.ReactElement;
} {
  const ref = useRef<SVGTextElement>(null);
  const [state, setState] = useState<{
    fit: string;
    glyphBox: PieceBox;
    cuts: JigsawCuts | null;
  }>({
    fit: FALLBACK_FIT,
    glyphBox: FALLBACK_GLYPH_BOX,
    cuts: null,
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
    const glyphBox: PieceBox = { x: 50 - w / 2, y: 50 - h / 2, w, h };

    // Sample the same glyph, in the same face, to find where its ink divides.
    let cuts: JigsawCuts | null = null;
    try {
      const style = getComputedStyle(el);
      cuts = measureCuts(
        letter,
        `${style.fontWeight} ${MEASURE_SIZE}px ${style.fontFamily}`,
        glyphBox
      );
    } catch {
      cuts = null; // fall back to thirds of the box
    }

    setState({
      fit: `translate(${(50 - cx * scale).toFixed(3)} ${(50 - cy * scale).toFixed(3)}) scale(${scale.toFixed(4)})`,
      glyphBox,
      cuts,
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
  outline,
  className = "",
}: {
  letter: string;
  piece: PieceKey;
  fit: string;
  box: PieceBox;
  /** Which partition the piece is cut from — "split" (vertical thirds) for
   *  big letters, "stack" (three horizontal bands) for small ones. Must
   *  match the layout the boxes were computed with. */
  layout?: JigsawLayout;
  /** The piece's RESOLVED cut path from pieceGeometry — pass it whenever the
   *  boxes came from pieceGeometry, since the vertical split is placed
   *  against the actual glyph. Falls back to the static partition. */
  outline?: string;
  className?: string;
}) {
  const resolved = outline ?? JIGSAW_LAYOUTS[layout][piece].outline;
  const uid = useId();
  const regionId = `${uid}-region`;

  return (
    <svg
      viewBox={`${box.x.toFixed(2)} ${box.y.toFixed(2)} ${box.w.toFixed(2)} ${box.h.toFixed(2)}`}
      className={`pl-lp-piece ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={regionId}>
          <path d={resolved} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${regionId})`}>
        {/* the letter itself — this fill IS the piece's body */}
        <Glyph letter={letter} fit={fit} className="pl-lp-ink" />
        {/* the letter's own contour, giving the piece its outer edge. The
            cut edges stay UNSTROKED on purpose: a stroke across the face of
            a clipped glyph is exactly the wavy-fragment noise that made the
            pieces look broken. The clip itself draws the cut — cleanly. */}
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
  boxes: Record<PieceKey, { box: PieceBox; outline?: string }>;
  /** Which partition this letter uses — see LetterPiece. */
  layout?: JigsawLayout;
  /** The held piece, shown faintly where it would seat. Null when the child
   *  is not close enough for it to go in. This is the "it will fit here" cue,
   *  and it is deliberately the PIECE'S OWN SHAPE — lighting up the slot's
   *  bounding rectangle instead puts a floating square on screen and reads as
   *  a glitch rather than as a recess. */
  preview?: PieceKey | null;
}) {
  return (
    <div className="pl-lp-assembly">
      {/* the placeholder is ONE thing: the pale letter with a single
          outline. No seams — piece boundaries drawn on the target read as
          wobble inside the strokes, and the child doesn't need them: the
          held piece's own preview shows where it seats. */}
      <svg viewBox="0 0 100 100" className="pl-lp-guide" aria-hidden="true" focusable="false">
        <Glyph letter={letter} fit={fit} className="pl-lp-guide-ink" />
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
            outline={boxes[preview].outline}
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
            <LetterPiece
              letter={letter}
              piece={key}
              fit={fit}
              box={box}
              layout={layout}
              outline={boxes[key].outline}
            />
          </div>
        );
      })}
    </div>
  );
}
