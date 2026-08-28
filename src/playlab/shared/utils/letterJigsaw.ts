/**
 * letterJigsaw.ts — the shape of a letter puzzle.
 *
 * The letter square (a shared 0–100 coordinate space) is cut into THREE
 * pieces by a T-shaped partition: one gently-sloped cut across the letter,
 * and one dropping from it to the bottom edge. That yields the three chunks
 * a child reads instantly —
 *
 *     the TOP of the letter, its BOTTOM-LEFT, and its BOTTOM-RIGHT
 *
 * — rather than shapes that need working out. Earlier versions gave the
 * cuts jigsaw tabs (first deep, then shallow rounded domes); every form of
 * tab rendered as wobble once the letter glyph was clipped through it, so
 * the cuts are now TABLESS — each one a single gentle arc, and each piece
 * simply a clean slice of the letter.
 *
 * Neighbouring pieces share the SAME curve (one generated forward, one
 * reversed), so the three outlines tile the square exactly: assembled, they
 * produce one clean letter with no seams or gaps.
 *
 * Geometry is static and letter-independent — computed once here, then the
 * letter glyph is clipped by each outline (see shared/components/game/LetterPuzzle.tsx). No
 * per-letter piece artwork exists anywhere, which is what keeps A–Z and a–z
 * working from one implementation.
 *
 * Lives in shared/ because two games now build letters from these pieces
 * (Space ABC and Ocean ABC). The geometry is pure maths with no theme in it —
 * colour and presentation belong to each game's own stylesheet.
 */

/**
 * Which way the letter is cut.
 *
 *   "split" — three VERTICAL bands, resolved against the glyph at runtime
 *             (see resolveJigsaw): an A becomes its left leg, its middle
 *             (apex + crossbar) and its right leg. Used for big letters.
 *   "stack" — three horizontal bands, one above the other. Used for small
 *             letters: their shapes hang on the x-height line, so stacked
 *             bands cut every one of them into three real pieces.
 *
 * The three keys are positional ids, not descriptions — in a stack, "top" is
 * the top band; in a split, "top" is the left band. Callers never care.
 */
export type JigsawLayout = "split" | "stack";

/**
 * Where to cut a particular letter, measured from the letter itself.
 *
 * Equal thirds of the BOUNDING BOX are not equal pieces: a "C" keeps its
 * whole thick back in the left third and leaves only thin arc tips for the
 * other two (58% / 26% / 16% of the ink). These positions come from the
 * glyph's actual ink profile instead, so each piece carries a similar amount
 * of letter — see measureCuts in LetterPuzzle.
 */
export interface JigsawCuts {
  /** "x" cuts vertically (three columns), "y" horizontally (three bands). */
  axis: "x" | "y";
  /** The two cut positions, in the 0–100 letter square. */
  a: number;
  b: number;
}

export type PieceKey = "top" | "left" | "right";

/** Assembly / demonstration order. */
export const PIECE_ORDER: readonly PieceKey[] = ["top", "left", "right"];

export interface PieceBox {
  /** Bounding box of the piece within the 0–100 letter square. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface JigsawPiece {
  key: PieceKey;
  /** SVG path `d` for the piece outline, in the 0–100 square. */
  outline: string;
  /** Tight bounding box of the shape — used for RENDERING (viewBox, size,
   *  and the placed piece's position). */
  box: PieceBox;
}

type Pt = readonly [number, number];

const f = (n: number): string => n.toFixed(2);
const pt = (p: Pt): string => `${f(p[0])} ${f(p[1])}`;

interface Edge {
  from: Pt;
  to: Pt;
  c1: Pt;
  c2: Pt;
}

/**
 * One internal boundary: a single GENTLE ARC from end to end — no tabs, no
 * knobs, nothing that can ever read as a spike. Jigsaw tabs (in both their
 * arrowhead and rounded-dome versions) kept rendering as wobble once the
 * letter glyph was clipped through them, because a bump that makes sense on
 * a boundary makes no sense mid-stroke of a W. A shallow bow is the whole
 * cut: the seam reads as one calm deliberate slice, and a piece's outline
 * is straight edges plus one soft curve — clean at any size.
 *
 * `side` bows the arc toward one side or the other, so neighbouring cuts
 * still curve differently and the three pieces stay visually distinct.
 * Storing the control points (rather than only a path string) is what lets
 * the same curve be emitted in reverse for the neighbouring piece, and lets
 * the bounding box come from the convex hull of the controls.
 */
function makeEdge(from: Pt, to: Pt, side: 1 | -1, bow?: number): Edge {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy * side;
  const ny = ux * side;
  const at = (t: number, off: number): Pt => [
    from[0] + ux * len * t + nx * off,
    from[1] + uy * len * t + ny * off,
  ];
  // The bow: 6% of the cut's length at its deepest — visible as a curve,
  // never deep enough to bite into a stroke. Callers cutting inside a
  // narrow glyph pass their own smaller bow so neighbouring cuts can never
  // reach each other.
  const h = bow ?? len * 0.06;
  return {
    from,
    to,
    c1: at(0.33, h),
    c2: at(0.67, h),
  };
}

/** Emit the edge from `from` → `to`. Assumes the pen is already at `from`. */
const fwd = (e: Edge): string => `C ${pt(e.c1)} ${pt(e.c2)} ${pt(e.to)}`;
/** Emit the SAME curve backwards. Assumes the pen is already at `to`. */
const rev = (e: Edge): string => `C ${pt(e.c2)} ${pt(e.c1)} ${pt(e.from)}`;

// Static fallback cuts for the vertical split — the REAL cuts are computed
// per-glyph in resolveJigsaw; these only serve callers with no glyph box.
const VS_A_T: Pt = [36, 0];
const VS_A_B: Pt = [32, 100];
const VS_B_T: Pt = [64, 0];
const VS_B_B: Pt = [68, 100];

const TL: Pt = [0, 0];
const TR: Pt = [100, 0];
const BR: Pt = [100, 100];
const BL: Pt = [0, 100];

const E_VS_A = makeEdge(VS_A_T, VS_A_B, 1);
const E_VS_B = makeEdge(VS_B_T, VS_B_B, 1);

function boxOf(points: readonly Pt[]): PieceBox {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.max(0, Math.min(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxX = Math.min(100, Math.max(...xs));
  const maxY = Math.min(100, Math.max(...ys));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

const edgePoints = (e: Edge): Pt[] => [e.from, e.c1, e.c2, e.to];

/** Left band. */
const LEFT_BAND: JigsawPiece = {
  key: "top",
  outline: `M ${pt(TL)} L ${pt(VS_A_T)} ${fwd(E_VS_A)} L ${pt(BL)} Z`,
  box: boxOf([TL, BL, ...edgePoints(E_VS_A)]),
};

/** Middle band. */
const MID_BAND: JigsawPiece = {
  key: "left",
  outline: `M ${pt(VS_A_T)} L ${pt(VS_B_T)} ${fwd(E_VS_B)} L ${pt(VS_A_B)} ${rev(E_VS_A)} Z`,
  box: boxOf([...edgePoints(E_VS_A), ...edgePoints(E_VS_B)]),
};

/** Right band. */
const RIGHT_BAND: JigsawPiece = {
  key: "right",
  outline: `M ${pt(VS_B_T)} L ${pt(TR)} L ${pt(BR)} L ${pt(VS_B_B)} ${rev(E_VS_B)} Z`,
  box: boxOf([TR, BR, ...edgePoints(E_VS_B)]),
};

export const JIGSAW: Record<PieceKey, JigsawPiece> = {
  top: LEFT_BAND,
  left: MID_BAND,
  right: RIGHT_BAND,
};

/* ── The "stack" partition: three horizontal bands ──
   Two full-width cuts, slightly sloped in opposite directions and tabbed
   like the T-partition's cuts, so stacked pieces still interlock and share
   the same visual language — just sliced the way the very first version of
   this puzzle sliced letters. */

const STACK_A_L: Pt = [0, 35];
const STACK_A_R: Pt = [100, 32];
const STACK_B_L: Pt = [0, 66];
const STACK_B_R: Pt = [100, 69];

const E_STACK_A = makeEdge(STACK_A_L, STACK_A_R, 1);
// Both tabs bulge DOWNWARD (top knob into the middle, middle knob into the
// bottom — a classic jigsaw column), so the two cuts can never approach each
// other however deep the tabs are.
const E_STACK_B = makeEdge(STACK_B_L, STACK_B_R, 1);

/** The top band. */
const STACK_TOP_BOX = boxOf([TL, TR, ...edgePoints(E_STACK_A)]);
const STACK_TOP: JigsawPiece = {
  key: "top",
  outline: `M ${pt(TL)} L ${pt(TR)} L ${pt(STACK_A_R)} ${rev(E_STACK_A)} Z`,
  box: STACK_TOP_BOX,
};

/** The middle band ("left" positionally). */
const STACK_MID_BOX = boxOf([...edgePoints(E_STACK_A), ...edgePoints(E_STACK_B)]);
const STACK_MID: JigsawPiece = {
  key: "left",
  outline: `M ${pt(STACK_A_L)} ${fwd(E_STACK_A)} L ${pt(STACK_B_R)} ${rev(E_STACK_B)} Z`,
  box: STACK_MID_BOX,
};

/** The bottom band ("right" positionally). */
const STACK_BOTTOM_BOX = boxOf([...edgePoints(E_STACK_B), BR, BL]);
const STACK_BOTTOM: JigsawPiece = {
  key: "right",
  outline: `M ${pt(STACK_B_L)} ${fwd(E_STACK_B)} L ${pt(BR)} L ${pt(BL)} Z`,
  box: STACK_BOTTOM_BOX,
};

export const JIGSAW_STACK: Record<PieceKey, JigsawPiece> = {
  top: STACK_TOP,
  left: STACK_MID,
  right: STACK_BOTTOM,
};

/** Every partition, by layout. JIGSAW stays exported on its own for the
 *  callers that predate layouts. */
export const JIGSAW_LAYOUTS: Record<JigsawLayout, Record<PieceKey, JigsawPiece>> = {
  split: JIGSAW,
  stack: JIGSAW_STACK,
};

/**
 * How much of a piece's box becomes its drop zone.
 *
 * The zone's CENTRE is what matters now: a piece seats when it is set down
 * near its own zone's centre (see each game's SNAP_RATIO). Shrinking the
 * zone inside the bounding box puts that centre nearer the middle of the
 * shape itself, rather than the middle of a rectangle the shape only
 * partly fills.
 */
const HIT_SCALE = 0.6;

function hitBoxOf(box: PieceBox): PieceBox {
  const w = box.w * HIT_SCALE;
  const h = box.h * HIT_SCALE;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

/** Overlap of two boxes, or `a` when they somehow do not meet. */
function intersect(a: PieceBox, b: PieceBox): PieceBox {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const w = Math.min(a.x + a.w, b.x + b.w) - x;
  const h = Math.min(a.y + a.h, b.y + b.h) - y;
  return w > 0 && h > 0 ? { x, y, w, h } : a;
}

/**
 * The boxes a piece is actually drawn and dropped into, given where the
 * glyph sits in the square.
 *
 * A piece is the LETTER clipped to its region, not the region itself — so
 * its real extent is the region box narrowed to the part of the square the
 * glyph occupies. Sizing to the raw region box would surround every piece
 * with dead transparent space, which is what made loose pieces look smaller
 * than the gaps they fill. `glyphBox` is measured at runtime (see
 * useGlyphFit), so this adapts to a wide "W" and a narrow "i" alike.
 */
export function pieceGeometry(
  glyphBox: PieceBox,
  layout: JigsawLayout = "split",
  cuts?: JigsawCuts | null
): Record<PieceKey, { box: PieceBox; hit: PieceBox; outline: string }> {
  const pieces = resolveJigsaw(layout, glyphBox, cuts);
  const out = {} as Record<PieceKey, { box: PieceBox; hit: PieceBox; outline: string }>;
  for (const key of PIECE_ORDER) {
    const box = intersect(pieces[key].box, glyphBox);
    out[key] = { box, hit: hitBoxOf(box), outline: pieces[key].outline };
  }
  return out;
}

/**
 * The partition RESOLVED AGAINST THE GLYPH.
 *
 * A partition fixed to the SQUARE cannot cut a letter into equal pieces,
 * because the glyph only occupies part of the square and which part depends
 * on the letter's own metrics. Fixed cuts fail two ways:
 *
 *   - they can miss the glyph entirely — an "I" occupies the middle fifth of
 *     the square, so a cut at x=34 hands it an EMPTY piece, and an empty
 *     piece is an uncompletable puzzle;
 *   - they can land unevenly — the old horizontal cuts at y=35/66 sliced a
 *     wide "m" (which sits between y=25 and y=75) into bands of 10, 31 and 9.
 *
 * So both cuts are placed at THIRDS OF THE GLYPH's own extent. Every piece
 * then holds an equal share of the letter, whatever its shape.
 *
 * WHICH WAY to cut differs by case. A capital is always cut into vertical
 * thirds — that is what makes an "A" read as left leg / apex + crossbar /
 * right leg. A small letter is cut across its LONGER dimension, so a wide
 * x-height "a" becomes three columns rather than three thin ribbons, while a
 * tall "l" or "t" still becomes three bands.
 */
export function resolveJigsaw(
  layout: JigsawLayout,
  glyphBox: PieceBox,
  cuts?: JigsawCuts | null
): Record<PieceKey, JigsawPiece> {
  const gx = glyphBox.x;
  const gy = glyphBox.y;
  const gw = Math.max(glyphBox.w, 1);
  const gh = Math.max(glyphBox.h, 1);

  // Measured cuts when the glyph could be sampled; thirds of the box only as
  // the pre-measurement fallback (and in tests / non-DOM environments).
  const axis = cuts ? cuts.axis : layout === "split" || gw >= gh ? "x" : "y";

  if (axis === "x") {
    const c1 = cuts ? cuts.a : gx + gw / 3;
    const c2 = cuts ? cuts.b : gx + (2 * gw) / 3;
    const slope = gw * 0.02;
    const bow = Math.min(6, gw * 0.12);

    const aT: Pt = [c1 + slope, 0];
    const aB: Pt = [c1 - slope, 100];
    const bT: Pt = [c2 - slope, 0];
    const bB: Pt = [c2 + slope, 100];

    const eA = makeEdge(aT, aB, 1, bow);
    const eB = makeEdge(bT, bB, 1, bow);

    return {
      top: {
        key: "top",
        outline: `M ${pt(TL)} L ${pt(aT)} ${fwd(eA)} L ${pt(BL)} Z`,
        box: boxOf([TL, BL, ...edgePoints(eA)]),
      },
      left: {
        key: "left",
        outline: `M ${pt(aT)} L ${pt(bT)} ${fwd(eB)} L ${pt(aB)} ${rev(eA)} Z`,
        box: boxOf([...edgePoints(eA), ...edgePoints(eB)]),
      },
      right: {
        key: "right",
        outline: `M ${pt(bT)} L ${pt(TR)} L ${pt(BR)} L ${pt(bB)} ${rev(eB)} Z`,
        box: boxOf([TR, BR, ...edgePoints(eB)]),
      },
    };
  }

  // Three bands across the letter.
  const c1 = cuts ? cuts.a : gy + gh / 3;
  const c2 = cuts ? cuts.b : gy + (2 * gh) / 3;
  const slope = gh * 0.02;
  const bow = Math.min(6, gh * 0.12);

  const aL: Pt = [0, c1 + slope];
  const aR: Pt = [100, c1 - slope];
  const bL: Pt = [0, c2 - slope];
  const bR: Pt = [100, c2 + slope];

  const eA = makeEdge(aL, aR, 1, bow);
  const eB = makeEdge(bL, bR, 1, bow);

  return {
    top: {
      key: "top",
      outline: `M ${pt(TL)} L ${pt(TR)} L ${pt(aR)} ${rev(eA)} Z`,
      box: boxOf([TL, TR, ...edgePoints(eA)]),
    },
    left: {
      key: "left",
      outline: `M ${pt(aL)} ${fwd(eA)} L ${pt(bR)} ${rev(eB)} Z`,
      box: boxOf([...edgePoints(eA), ...edgePoints(eB)]),
    },
    right: {
      key: "right",
      outline: `M ${pt(bL)} ${fwd(eB)} L ${pt(BR)} L ${pt(BL)} Z`,
      box: boxOf([...edgePoints(eB), BR, BL]),
    },
  };
}
