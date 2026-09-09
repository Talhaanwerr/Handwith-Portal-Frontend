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
export type JigsawLayout = "split" | "stack" | "duo" | "dtrio" | "duoh" | "tsplit";

/**
 * PER-LETTER partitions. Most letters read best under their case's default —
 * capitals as three vertical pieces, small letters as two diagonal halves —
 * but some shapes have their own natural break lines, and those are declared
 * HERE, per glyph, as data. Adjusting how any letter is cut is one line in
 * this table:
 *
 *   "tsplit" TOP / BOTTOM-LEFT / BOTTOM-RIGHT (capital default — pieces are
 *            PLACES in the letter a child can name: an A is its apex and its
 *            two legs, an E its top arm, its corner and its bottom arm.
 *            Vertical slicing followed the ink but ignored the anatomy)
 *   "split"  three vertical pieces          (H: leg / crossbar / leg)
 *   "stack"  three horizontal bands         (I: top bar / stem / bottom bar)
 *   "dtrio"  three pieces, diagonal seams   (L)
 *   "duo"    two pieces, upright diagonal   (lowercase default)
 *   "duoh"   two pieces, flat diagonal      (i: the dot parts from the stem)
 */
const LETTER_LAYOUTS: Partial<Record<string, JigsawLayout>> = {
  H: "split",
  I: "stack",
  // L takes the capital DEFAULT (tsplit), which is its real anatomy: the upper
  // stem, the corner, and the foot — three pieces a child can point at. It
  // used to be "dtrio", whose leaning seams cut diagonally across a shape made
  // entirely of one vertical and one horizontal stroke, producing slivers that
  // matched nothing in the letter.
  i: "duoh",
};

/**
 * Glyphs cut at EXACT thirds rather than at measured ink.
 *
 * Ink-balanced cuts exist because most letters put uneven amounts of ink along
 * the cut axis — a C keeps its whole thick back in one third. A capital I is
 * the opposite case: one even stroke, where every row holds the same ink. For
 * that shape measuring adds nothing and the clamps and rounding inside the
 * measurement can only pull the cuts OFF the thirds they should already be,
 * which is how its three bands came out visibly unequal. Cut it geometrically
 * and the pieces are identical by construction.
 */
const EQUAL_THIRDS = new Set(["I"]);

/** Should this glyph skip ink measurement and use exact thirds? */
export function usesEqualThirds(glyph: string): boolean {
  return EQUAL_THIRDS.has(glyph);
}

/** The partition for a glyph: its own override, else its case's default. */
export function layoutForGlyph(glyph: string): JigsawLayout {
  return LETTER_LAYOUTS[glyph] ?? (glyph === glyph.toLowerCase() ? "duo" : "tsplit");
}

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
  /** "x" cuts vertically (three columns), "y" horizontally (three bands),
   *  "d" is ONE diagonal cut into two pieces — a/b are then the point the
   *  diagonal passes through (the glyph's ink centroid), not two cuts.
   *  "t" is the T-partition — a/b are then the vertical seam's x and the
   *  horizontal seam's y. */
  axis: "x" | "y" | "d" | "t";
  /** The two cut positions in the 0–100 letter square — or, for "d", the
   *  x and y of the point the diagonal runs through. */
  a: number;
  b: number;
}

export type PieceKey = "top" | "left" | "right";

/** Assembly / demonstration order. */
export const PIECE_ORDER: readonly PieceKey[] = ["top", "left", "right"];

/** The pieces a LAYOUT actually has, in demonstration order. The "duo" layout
 *  is two pieces, not three — completion, hints and carrier bubbles must all
 *  count THESE, never a hardcoded 3. Changing a game from three pieces to two
 *  (or back) is changing its layout choice; everything else follows. */
export function piecesFor(layout: JigsawLayout): readonly PieceKey[] {
  return layout === "duo" || layout === "duoh" ? DUO_ORDER : PIECE_ORDER;
}
const DUO_ORDER: readonly PieceKey[] = ["top", "right"];

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

/** De Casteljau: the two halves of a cubic split at parameter t. */
function splitCubic(e: Edge, t: number): [Edge, Edge, Pt] {
  const lerp = (a: Pt, b: Pt): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const p01 = lerp(e.from, e.c1);
  const p12 = lerp(e.c1, e.c2);
  const p23 = lerp(e.c2, e.to);
  const p012 = lerp(p01, p12);
  const p123 = lerp(p12, p23);
  const mid = lerp(p012, p123);
  return [
    { from: e.from, c1: p01, c2: p012, to: mid },
    { from: mid, c1: p123, c2: p23, to: e.to },
    mid,
  ];
}

/** Split a left-to-right edge at the parameter where its x reaches `x` —
 *  bisection is plenty, since x is monotone along these gentle bows. */
function splitEdgeAtX(e: Edge, x: number): [Edge, Edge, Pt] {
  const xAt = (t: number): number => {
    const u = 1 - t;
    return (
      u * u * u * e.from[0] +
      3 * u * u * t * e.c1[0] +
      3 * u * t * t * e.c2[0] +
      t * t * t * e.to[0]
    );
  };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (xAt(mid) < x) lo = mid;
    else hi = mid;
  }
  return splitCubic(e, (lo + hi) / 2);
}

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
// Static duo fallback: the diagonal through the square's centre — only used
// when a piece renders without a resolved outline.
const DUO_T: Pt = [61, 0];
const DUO_B: Pt = [39, 100];
const E_DUO = makeEdge(DUO_T, DUO_B, 1);
const DUO_RIGHT: JigsawPiece = {
  key: "right",
  outline: `M ${pt(DUO_T)} L ${pt(TR)} L ${pt(BR)} L ${pt(DUO_B)} ${rev(E_DUO)} Z`,
  box: boxOf([TR, BR, ...edgePoints(E_DUO)]),
};
export const JIGSAW_DUO: Record<PieceKey, JigsawPiece> = {
  top: {
    key: "top",
    outline: `M ${pt(TL)} L ${pt(DUO_T)} ${fwd(E_DUO)} L ${pt(BL)} Z`,
    box: boxOf([TL, BL, ...edgePoints(E_DUO)]),
  },
  right: DUO_RIGHT,
  left: DUO_RIGHT, // no third piece in a duo — see resolveJigsaw
};

// Static duoh fallback: flat diagonal through the square's centre.
const DUOH_L: Pt = [0, 42];
const DUOH_R: Pt = [100, 58];
const E_DUOH = makeEdge(DUOH_L, DUOH_R, 1);
const DUOH_BELOW: JigsawPiece = {
  key: "right",
  outline: `M ${pt(DUOH_L)} ${fwd(E_DUOH)} L ${pt(BR)} L ${pt(BL)} Z`,
  box: boxOf([...edgePoints(E_DUOH), BR, BL]),
};
export const JIGSAW_DUOH: Record<PieceKey, JigsawPiece> = {
  top: {
    key: "top",
    outline: `M ${pt(TL)} L ${pt(TR)} L ${pt(DUOH_R)} ${rev(E_DUOH)} Z`,
    box: boxOf([TL, TR, ...edgePoints(E_DUOH)]),
  },
  right: DUOH_BELOW,
  left: DUOH_BELOW, // no third piece in a duo — see resolveJigsaw
};

// Static tsplit fallback: the T through the square's centre.
const TS_HL: Pt = [0, 47];
const TS_HR: Pt = [100, 45];
const E_TS_H = makeEdge(TS_HL, TS_HR, 1);
const [E_TS_HL, E_TS_HR, TS_P] = splitEdgeAtX(E_TS_H, 50);
const TS_BV: Pt = [47, 100];
const E_TS_V = makeEdge(TS_P, TS_BV, 1);
export const JIGSAW_TSPLIT: Record<PieceKey, JigsawPiece> = {
  top: {
    key: "top",
    outline: `M ${pt(TL)} L ${pt(TR)} L ${pt(TS_HR)} ${rev(E_TS_HR)} ${rev(E_TS_HL)} Z`,
    box: boxOf([TL, TR, ...edgePoints(E_TS_HL), ...edgePoints(E_TS_HR)]),
  },
  left: {
    key: "left",
    outline: `M ${pt(TS_HL)} ${fwd(E_TS_HL)} ${fwd(E_TS_V)} L ${pt(BL)} Z`,
    box: boxOf([BL, ...edgePoints(E_TS_HL), ...edgePoints(E_TS_V)]),
  },
  right: {
    key: "right",
    outline: `M ${pt(TS_P)} ${fwd(E_TS_HR)} L ${pt(BR)} L ${pt(TS_BV)} ${rev(E_TS_V)} Z`,
    box: boxOf([BR, ...edgePoints(E_TS_HR), ...edgePoints(E_TS_V)]),
  },
};

export const JIGSAW_LAYOUTS: Record<JigsawLayout, Record<PieceKey, JigsawPiece>> = {
  split: JIGSAW,
  stack: JIGSAW_STACK,
  duo: JIGSAW_DUO,
  dtrio: JIGSAW, // static fallback shares the vertical partition; the lean is applied when resolved
  duoh: JIGSAW_DUOH,
  tsplit: JIGSAW_TSPLIT,
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
  for (const key of piecesFor(layout)) {
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

  // ── "tsplit": TOP / BOTTOM-LEFT / BOTTOM-RIGHT ──
  // One gently-sloped cut across the letter and one dropping from it to the
  // bottom edge. The drop must begin ON the sloped curve — not merely near it
  // — or the three outlines stop tiling and a hairline of letter goes missing
  // along the junction. So the horizontal edge is split AT the junction with
  // de Casteljau, and each bottom piece takes its own exact half.
  if (layout === "tsplit") {
    const xMid = cuts?.axis === "t" ? cuts.a : gx + gw / 2;
    const yMid = cuts?.axis === "t" ? cuts.b : gy + gh * 0.45;
    const slope = gh * 0.02;
    const bow = Math.min(5, gh * 0.1);

    const HL: Pt = [0, Math.min(96, Math.max(4, yMid + slope))];
    const HR: Pt = [100, Math.min(96, Math.max(4, yMid - slope))];
    const eH = makeEdge(HL, HR, 1, bow);

    const [eHL, eHR, P] = splitEdgeAtX(eH, Math.min(94, Math.max(6, xMid)));

    const BV: Pt = [Math.min(96, Math.max(4, xMid - gw * 0.03)), 100];
    const eV = makeEdge(P, BV, 1, Math.min(5, gw * 0.1));

    return {
      top: {
        key: "top",
        outline: `M ${pt(TL)} L ${pt(TR)} L ${pt(HR)} ${rev(eHR)} ${rev(eHL)} Z`,
        box: boxOf([TL, TR, ...edgePoints(eHL), ...edgePoints(eHR)]),
      },
      left: {
        key: "left",
        outline: `M ${pt(HL)} ${fwd(eHL)} ${fwd(eV)} L ${pt(BL)} Z`,
        box: boxOf([BL, ...edgePoints(eHL), ...edgePoints(eV)]),
      },
      right: {
        key: "right",
        outline: `M ${pt(P)} ${fwd(eHR)} L ${pt(BR)} L ${pt(BV)} ${rev(eV)} Z`,
        box: boxOf([BR, ...edgePoints(eHR), ...edgePoints(eV)]),
      },
    };
  }

  // ── "duoh": one FLAT diagonal, two pieces (above / below) ──
  // The cut runs left-to-right through the ink centroid with a gentle lean —
  // for a glyph like "i" it passes between the dot and the stem, which is the
  // letter's own natural break.
  if (layout === "duoh") {
    const cx = cuts?.axis === "d" ? cuts.a : gx + gw / 2;
    const cy = cuts?.axis === "d" ? cuts.b : gy + gh / 2;
    const lean = Math.min(0.45, (gh / 200) * 1.6);
    const yL = Math.min(96, Math.max(4, cy - lean * cx));
    const yR = Math.min(96, Math.max(4, cy + lean * (100 - cx)));
    const L: Pt = [0, yL];
    const R: Pt = [100, yR];
    const e = makeEdge(L, R, 1, Math.min(6, gh * 0.1));
    const above: JigsawPiece = {
      key: "top",
      outline: `M ${pt(TL)} L ${pt(TR)} L ${pt(R)} ${rev(e)} Z`,
      box: boxOf([TL, TR, ...edgePoints(e)]),
    };
    const below: JigsawPiece = {
      key: "right",
      outline: `M ${pt(L)} ${fwd(e)} L ${pt(BR)} L ${pt(BL)} Z`,
      box: boxOf([...edgePoints(e), BR, BL]),
    };
    return { top: above, right: below, left: below };
  }

  // ── "duo": ONE diagonal cut, TWO pieces ──
  // The cut runs top-to-bottom through the glyph's ink centroid at a fixed
  // lean, so the two halves hold similar amounts of letter and the seam always
  // reads as a deliberate slash rather than a straight split. Used for small
  // letters: two big diagonal halves are easier for small hands than three
  // bands.
  if (layout === "duo") {
    const cx = cuts?.axis === "d" ? cuts.a : gx + gw / 2;
    const cy = cuts?.axis === "d" ? cuts.b : gy + gh / 2;
    // dx-per-dy: how far the cut leans. Scaled to the glyph so a narrow "l"
    // still gets a visible diagonal without the cut escaping the square.
    const lean = Math.min(0.45, (gw / 200) * 1.6);
    const xT = Math.min(96, Math.max(4, cx + lean * cy));
    const xB = Math.min(96, Math.max(4, cx - lean * (100 - cy)));
    const T: Pt = [xT, 0];
    const B: Pt = [xB, 100];
    const e = makeEdge(T, B, 1, Math.min(6, gw * 0.1));
    return {
      top: {
        key: "top",
        outline: `M ${pt(TL)} L ${pt(T)} ${fwd(e)} L ${pt(BL)} Z`,
        box: boxOf([TL, BL, ...edgePoints(e)]),
      },
      right: {
        key: "right",
        outline: `M ${pt(T)} L ${pt(TR)} L ${pt(BR)} L ${pt(B)} ${rev(e)} Z`,
        box: boxOf([TR, BR, ...edgePoints(e)]),
      },
      // The duo has no third piece; "left" aliases the right half purely so the
      // record type stays total. piecesFor("duo") never hands this key out.
      left: {
        key: "left",
        outline: `M ${pt(T)} L ${pt(TR)} L ${pt(BR)} L ${pt(B)} ${rev(e)} Z`,
        box: boxOf([TR, BR, ...edgePoints(e)]),
      },
    };
  }

  // Measured cuts when the glyph could be sampled; thirds of the box only as
  // the pre-measurement fallback (and in tests / non-DOM environments).
  const axis =
    cuts && cuts.axis !== "d"
      ? cuts.axis
      : layout === "split" || layout === "dtrio" || gw >= gh
        ? "x"
        : "y";

  if (axis === "x") {
    const measured = cuts && cuts.axis === "x";
    const c1 = measured ? cuts.a : gx + gw / 3;
    const c2 = measured ? cuts.b : gx + (2 * gw) / 3;
    // "dtrio" leans the same two cuts hard, so the seams read as deliberate
    // diagonals — capped so the leaning cuts can never cross each other.
    const slope =
      layout === "dtrio" ? Math.min(gh * 0.28, Math.max(2, (c2 - c1) / 2 - 2)) : gw * 0.02;
    const bow = Math.min(6, gw * 0.12);
    const cl = (n: number): number => Math.min(99, Math.max(1, n));

    const aT: Pt = [cl(c1 + slope), 0];
    const aB: Pt = [cl(c1 - slope), 100];
    const bT: Pt = [cl(c2 - slope), 0];
    const bB: Pt = [cl(c2 + slope), 100];

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
  const measuredY = cuts && cuts.axis === "y";
  const c1 = measuredY ? cuts.a : gy + gh / 3;
  const c2 = measuredY ? cuts.b : gy + (2 * gh) / 3;
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
