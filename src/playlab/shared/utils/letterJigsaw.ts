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
 * — rather than shapes that need working out. An earlier version radiated
 * three cuts from an off-centre junction with deep tabs; the silhouettes
 * were certainly distinct, but distinct is not the same as recognisable, and
 * a child could not tell at a glance which fragment went where. The cuts are
 * now simple and the tabs shallow, so each piece still interlocks and still
 * has its own outline, while plainly reading as a part of the letter.
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
 *   "split" — the T-partition: the TOP of the letter, its BOTTOM-LEFT and
 *             its BOTTOM-RIGHT. Used for BIG letters.
 *   "stack" — three horizontal bands, one above the other. Used for small
 *             letters: their shapes hang on the x-height line, so stacked
 *             slices (the cap, the body, the base) read more naturally on
 *             them than a T does.
 *
 * The three keys are positional ids, not descriptions — in a stack, "top" is
 * the top band, "left" the middle and "right" the bottom. Every consumer
 * iterates PIECE_ORDER and treats the keys as opaque, so the same drag and
 * assembly code runs both layouts unchanged.
 */
export type JigsawLayout = "split" | "stack";

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
  a: Pt;
  c1: Pt;
  c2: Pt;
  b: Pt;
}

/**
 * One internal boundary: a straight run, a rounded tab bulging to `side`,
 * then a straight run to the end point. Storing the control points (rather
 * than only a path string) is what lets the same curve be emitted in reverse
 * for the neighbouring piece, and lets the bounding box be derived without
 * flattening the beziers — a cubic never leaves the convex hull of its own
 * control points, so the hull is a safe (slightly generous) box.
 */
function makeEdge(from: Pt, to: Pt, side: 1 | -1): Edge {
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
  // Shallow: a tab deep enough to interlock, not deep enough to disguise
  // which part of the letter the piece is.
  const h = len * 0.11;
  return {
    from,
    to,
    a: at(0.37, 0),
    c1: at(0.3, h * 1.8),
    c2: at(0.7, h * 1.8),
    b: at(0.63, 0),
  };
}

/** Emit the edge from `from` → `to`. Assumes the pen is already at `from`. */
const fwd = (e: Edge): string => `L ${pt(e.a)} C ${pt(e.c1)} ${pt(e.c2)} ${pt(e.b)} L ${pt(e.to)}`;
/** Emit the SAME curve backwards. Assumes the pen is already at `to`. */
const rev = (e: Edge): string =>
  `L ${pt(e.b)} C ${pt(e.c2)} ${pt(e.c1)} ${pt(e.a)} L ${pt(e.from)}`;

// The cut across the letter is slightly sloped and its junction sits right
// of centre, so the three pieces are never mirror images of one another.
const J: Pt = [52, 41];
const CUT_LEFT_END: Pt = [0, 44];
const CUT_RIGHT_END: Pt = [100, 38];
const CUT_DOWN_END: Pt = [46, 100];

const TL: Pt = [0, 0];
const TR: Pt = [100, 0];
const BR: Pt = [100, 100];
const BL: Pt = [0, 100];

const E_LEFT = makeEdge(J, CUT_LEFT_END, 1);
const E_RIGHT = makeEdge(J, CUT_RIGHT_END, -1);
const E_DOWN = makeEdge(J, CUT_DOWN_END, 1);

function boxOf(points: readonly Pt[]): PieceBox {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.max(0, Math.min(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxX = Math.min(100, Math.max(...xs));
  const maxY = Math.min(100, Math.max(...ys));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

const edgePoints = (e: Edge): Pt[] => [e.from, e.a, e.c1, e.c2, e.b, e.to];

/** The whole top of the letter, above the cut. */
const TOP_BOX = boxOf([...edgePoints(E_LEFT), ...edgePoints(E_RIGHT), TR, TL]);
const TOP: JigsawPiece = {
  key: "top",
  outline: `M ${pt(CUT_LEFT_END)} ${rev(E_LEFT)} ${fwd(E_RIGHT)} L ${pt(TR)} L ${pt(TL)} Z`,
  box: TOP_BOX,
};

/** Bottom-left: under the cut, left of the drop. */
const LEFT_BOX = boxOf([...edgePoints(E_LEFT), ...edgePoints(E_DOWN), BL]);
const LEFT: JigsawPiece = {
  key: "left",
  outline: `M ${pt(CUT_LEFT_END)} ${rev(E_LEFT)} ${fwd(E_DOWN)} L ${pt(BL)} Z`,
  box: LEFT_BOX,
};

/** Bottom-right: under the cut, right of the drop. */
const RIGHT_BOX = boxOf([...edgePoints(E_RIGHT), ...edgePoints(E_DOWN), BR, CUT_DOWN_END]);
const RIGHT: JigsawPiece = {
  key: "right",
  outline: `M ${pt(J)} ${fwd(E_RIGHT)} L ${pt(BR)} L ${pt(CUT_DOWN_END)} ${rev(E_DOWN)} Z`,
  box: RIGHT_BOX,
};

export const JIGSAW: Record<PieceKey, JigsawPiece> = {
  top: TOP,
  left: LEFT,
  right: RIGHT,
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
  layout: JigsawLayout = "split"
): Record<PieceKey, { box: PieceBox; hit: PieceBox }> {
  const pieces = JIGSAW_LAYOUTS[layout];
  const out = {} as Record<PieceKey, { box: PieceBox; hit: PieceBox }>;
  for (const key of PIECE_ORDER) {
    const box = intersect(pieces[key].box, glyphBox);
    out[key] = { box, hit: hitBoxOf(box) };
  }
  return out;
}
