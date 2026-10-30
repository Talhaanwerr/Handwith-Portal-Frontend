import { unit } from "@shared/utils/hash";
import { LEVELS, type Level, type Verdict } from "@games/jigsaw-fun/constants/levels";

/**
 * Tangram Town — the data.
 *
 * The seven classic tangram pieces (cut from a 4 × 4 square): two big
 * triangles, a medium one, two small ones, a square and a parallelogram. One
 * MODULE per picture, played at the level the child picks — how much of a
 * guide the board shows (see GUIDES). Every figure is written as
 * the polygon each piece fills (y grows downwards, integer grid). A piece
 * arrives in the tray already turned the way its outline needs, so the puzzle
 * is seeing WHICH shape goes WHERE — no rotating. Two pieces with the same
 * shape and the same turn are interchangeable.
 *
 * `checkTangram()` proves every figure can be built at every level: each
 * outline really is the piece it claims to be (edge lengths), each figure uses
 * the full set of seven, no two pieces overlap (sampled on a fine grid), and
 * every piece has an outline that takes it.
 */

export type Kind = "big" | "medium" | "small" | "square" | "para";
export type Pt = readonly [number, number];

export interface Slot {
  kind: Kind;
  pts: readonly Pt[];
}

export type ModuleId = "house" | "fish" | "cat" | "arrow" | "square";

export interface Figure {
  id: ModuleId;
  /** "Build the cat!" */
  name: string;
  accent: string;
  slots: readonly Slot[];
}

/**
 * How much the board shows, per level:
 *   colour — every outline tinted in the colour of the piece that fits it
 *   lines  — the dark silhouette with every piece's outline drawn in it
 *   none   — the silhouette alone
 */
export type Guide = "colour" | "lines" | "none";

export const GUIDES: Record<Level, Guide> = { easy: "colour", medium: "lines", hard: "none" };

/** How close (board units) a piece's centre must land to an outline's centre. */
const SNAP = 1.1;

/** The piece colours, one per slot in order — the classic bright set. */
export const PIECE_COLORS = [
  "#E5484D",
  "#2E7FD6",
  "#3DAB72",
  "#F5B820",
  "#F08A24",
  "#8E5BD9",
  "#E0457B",
] as const;

/** Every outline holding its own piece — a finished figure (all have seven). */
export const ALL_PLACED: readonly number[] = PIECE_COLORS.map((_, i) => i);

const B = (pts: Pt[]): Slot => ({ kind: "big", pts });
const M = (pts: Pt[]): Slot => ({ kind: "medium", pts });
const S = (pts: Pt[]): Slot => ({ kind: "small", pts });
const Q = (pts: Pt[]): Slot => ({ kind: "square", pts });
const P = (pts: Pt[]): Slot => ({ kind: "para", pts });

export const FIGURES: readonly Figure[] = [
  {
    id: "house",
    name: "house",
    accent: "#E5484D",
    slots: [
      B([
        [0, 3],
        [4, 3],
        [2, 1],
      ]), // roof
      B([
        [0, 3],
        [4, 3],
        [2, 5],
      ]),
      M([
        [0, 3],
        [2, 5],
        [0, 5],
      ]),
      S([
        [4, 3],
        [4, 5],
        [3, 4],
      ]),
      S([
        [4, 5],
        [2, 5],
        [3, 4],
      ]),
      Q([
        [5, 3],
        [6, 4],
        [5, 5],
        [4, 4],
      ]), // the bush
      P([
        [3, 0],
        [4, 1],
        [4, 3],
        [3, 2],
      ]), // the chimney
    ],
  },
  {
    id: "fish",
    name: "fish",
    accent: "#2E7FD6",
    slots: [
      B([
        [2, 2],
        [6, 2],
        [4, 0],
      ]),
      B([
        [2, 2],
        [6, 2],
        [4, 4],
      ]),
      M([
        [2, 0],
        [4, 0],
        [2, 2],
      ]), // top fin
      S([
        [0, 0],
        [0, 2],
        [1, 1],
      ]),
      S([
        [0, 2],
        [0, 4],
        [1, 3],
      ]),
      Q([
        [1, 1],
        [2, 2],
        [1, 3],
        [0, 2],
      ]), // the tail's middle
      P([
        [3, 3],
        [4, 4],
        [4, 6],
        [3, 5],
      ]), // bottom fin
    ],
  },
  {
    id: "cat",
    name: "cat",
    accent: "#F08A24",
    slots: [
      B([
        [3, 3],
        [3, 7],
        [5, 5],
      ]),
      B([
        [3, 7],
        [7, 7],
        [5, 5],
      ]),
      M([
        [1, 7],
        [3, 7],
        [3, 5],
      ]), // front paws
      S([
        [2, 0],
        [3, 1],
        [2, 2],
      ]), // ear
      S([
        [4, 0],
        [4, 2],
        [3, 1],
      ]), // ear
      Q([
        [3, 1],
        [4, 2],
        [3, 3],
        [2, 2],
      ]), // head
      P([
        [8, 6],
        [10, 6],
        [9, 7],
        [7, 7],
      ]), // tail
    ],
  },
  {
    id: "arrow",
    name: "arrow",
    accent: "#3DAB72",
    slots: [
      B([
        [7, 0],
        [7, 4],
        [9, 2],
      ]), // the point
      B([
        [3, 1],
        [7, 1],
        [5, 3],
      ]),
      M([
        [3, 1],
        [5, 3],
        [3, 3],
      ]),
      S([
        [7, 1],
        [7, 3],
        [6, 2],
      ]),
      S([
        [7, 3],
        [5, 3],
        [6, 2],
      ]),
      Q([
        [1, 0],
        [2, 1],
        [1, 2],
        [0, 1],
      ]),
      P([
        [2, 0],
        [3, 1],
        [3, 3],
        [2, 2],
      ]),
    ],
  },
  {
    id: "square",
    name: "big square",
    accent: "#8E5BD9",
    slots: [
      B([
        [0, 0],
        [4, 0],
        [2, 2],
      ]),
      B([
        [0, 0],
        [2, 2],
        [0, 4],
      ]),
      M([
        [2, 4],
        [4, 4],
        [4, 2],
      ]),
      S([
        [4, 0],
        [4, 2],
        [3, 1],
      ]),
      S([
        [2, 2],
        [3, 3],
        [1, 3],
      ]),
      Q([
        [2, 2],
        [3, 1],
        [4, 2],
        [3, 3],
      ]),
      P([
        [0, 4],
        [1, 3],
        [3, 3],
        [2, 4],
      ]),
    ],
  },
];

export const MODULE_IDS = FIGURES.map((f) => f.id);

export function figureOf(id: ModuleId): Figure {
  return FIGURES.find((f) => f.id === id) ?? FIGURES[0];
}

/* ─── Geometry ────────────────────────────────────────────────────────────── */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function boxOf(pts: readonly Pt[]): Box {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** The whole figure's box, with `pad` units of board around it. */
export function figureBox(fig: Figure, pad = 0.6): Box {
  const b = boxOf(fig.slots.flatMap((s) => s.pts));
  return { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
}

export const pointsAttr = (pts: readonly Pt[]) => pts.map((p) => p.join(",")).join(" ");

/** Shape + turn, wherever it sits: two slots with the same form take the same piece. */
function formOf(slot: Slot): string {
  const b = boxOf(slot.pts);
  const norm = slot.pts.map(([x, y]) => `${x - b.x},${y - b.y}`).sort();
  return `${slot.kind}:${norm.join(";")}`;
}

/** The middle of an outline's box — where its piece is dropped. */
export function slotCentre(slot: Slot): { x: number; y: number } {
  const b = boxOf(slot.pts);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

/** The art box's order — a fixed shuffle per figure and level, never the
 *  figure's own order. */
export function trayOrder(fig: Figure, level: Level): number[] {
  const seed = FIGURES.indexOf(fig) * 7 + LEVELS.indexOf(level) * 3 + 1;
  const order = fig.slots
    .map((_, i) => i)
    .sort((a, b) => unit(seed * 41 + a * 5) - unit(seed * 41 + b * 5));
  if (order.every((v, i) => v === i)) order.push(order.shift()!);
  return order;
}

/**
 * Where a dropped piece goes (board units): into a FREE outline of its own
 * shape and turn that the point is inside, or whose centre it is within SNAP
 * of — the nearest such one, so twins (same form) are interchangeable; on any
 * other free outline it is a miss; anywhere else it just goes back.
 */
export function judgeDrop(
  fig: Figure,
  taken: readonly (number | null)[],
  piece: number,
  x: number,
  y: number
): Verdict {
  const form = formOf(fig.slots[piece]);
  let best = -1;
  let bestD = Infinity;
  fig.slots.forEach((s, i) => {
    if (taken[i] !== null || formOf(s) !== form) return;
    const c = slotCentre(s);
    const d = Math.hypot(x - c.x, y - c.y);
    if ((d < SNAP || inside(s.pts, x, y)) && d < bestD) {
      bestD = d;
      best = i;
    }
  });
  if (best >= 0) return best;
  return fig.slots.some((s, i) => taken[i] === null && inside(s.pts, x, y)) ? "miss" : null;
}

/** The free outline `piece` belongs in: its own, or else a free twin's (the
 *  outline its own twin may have taken). Where the teaching hand goes. */
export function placeFor(fig: Figure, taken: readonly (number | null)[], piece: number): number {
  if (taken[piece] === null) return piece;
  const form = formOf(fig.slots[piece]);
  const twin = fig.slots.findIndex((s, i) => taken[i] === null && formOf(s) === form);
  return twin >= 0 ? twin : piece;
}
/** Is (x, y) inside the polygon? (Even-odd rule — a drop on an outline.) */
export function inside(pts: readonly Pt[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/* ─── Self-check ──────────────────────────────────────────────────────────── */

const EDGES: Record<Kind, string> = {
  big: "8,8,16",
  medium: "4,4,8",
  small: "2,2,4",
  square: "2,2,2,2",
  para: "2,2,4,4",
};
const SET = "big,big,medium,para,small,small,square";

/** Points well inside a convex outline: its middle, and part-way to each corner. */
function spotsIn(pts: readonly Pt[]): [number, number][] {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const at = (t: number, p: Pt): [number, number] => [
    +(cx + (p[0] - cx) * t).toFixed(3),
    +(cy + (p[1] - cy) * t).toFixed(3),
  ];
  return [[+cx.toFixed(3), +cy.toFixed(3)], ...pts.map((p) => at(0.8, p))];
}

export function checkTangram(): string[] {
  const problems: string[] = [];
  for (const level of LEVELS)
    if (new Set(FIGURES.map((f) => trayOrder(f, level).join())).size !== FIGURES.length)
      problems.push(`${level}: two figures share a box order`);
  if (new Set(LEVELS.map((l) => GUIDES[l])).size !== LEVELS.length)
    problems.push("two levels show the same guide");
  if (new Set(PIECE_COLORS).size !== PIECE_COLORS.length)
    problems.push("two pieces share a colour (Easy matches by colour)");
  for (const fig of FIGURES) {
    if (fig.slots.length !== PIECE_COLORS.length)
      problems.push(`${fig.id}: not one colour per piece`);
    // every outline's drop point is on the board
    const vb = figureBox(fig);
    fig.slots.forEach((s, i) => {
      const c = slotCentre(s);
      if (c.x < vb.x || c.y < vb.y || c.x > vb.x + vb.w || c.y > vb.y + vb.h)
        problems.push(`${fig.id} slot ${i}: its drop point is off the board`);
    });
    for (const level of LEVELS) {
      const order = trayOrder(fig, level);
      if (new Set(order).size !== fig.slots.length || order.length !== fig.slots.length)
        problems.push(`${fig.id} ${level}: the box does not hold every piece once`);
      if (order.every((v, i) => v === i)) problems.push(`${fig.id} ${level}: box in figure order`);
      // build it the way the teaching hand shows: each piece from the box, in
      // the box's order, dropped on the middle of the free outline it belongs in
      const filled: (number | null)[] = fig.slots.map(() => null);
      for (const piece of order) {
        const c = slotCentre(fig.slots[placeFor(fig, filled, piece)]);
        const at = judgeDrop(fig, filled, piece, c.x, c.y);
        if (typeof at !== "number") problems.push(`${fig.id} ${level}: piece ${piece} → ${at}`);
        else filled[at] = piece;
      }
      if (filled.some((v) => v === null)) problems.push(`${fig.id} ${level}: cannot be finished`);
    }
    // on an empty board, a piece dropped ANYWHERE inside an outline of its own
    // form is taken (by an outline of that form); inside any other outline it
    // is a miss, never taken by the wrong shape
    const empty = fig.slots.map(() => null);
    fig.slots.forEach((piece, p) =>
      fig.slots.forEach((s, i) => {
        for (const [x, y] of spotsIn(s.pts)) {
          const v = judgeDrop(fig, empty, p, x, y);
          const ok =
            typeof v === "number"
              ? formOf(fig.slots[v]) === formOf(piece)
              : v === "miss" && formOf(s) !== formOf(piece);
          if (!ok) problems.push(`${fig.id}: piece ${p} at (${x}, ${y}) in outline ${i} → ${v}`);
        }
      })
    );
    // the teaching hand follows a twin that took the other's outline
    fig.slots.forEach((a, i) =>
      fig.slots.forEach((b, j) => {
        if (i === j || formOf(a) !== formOf(b)) return;
        const taken = fig.slots.map((_, k) => (k === j ? i : null));
        if (placeFor(fig, taken, j) !== i)
          problems.push(`${fig.id}: the hand takes piece ${j} to a filled outline`);
      })
    );
    const kinds = fig.slots
      .map((s) => s.kind)
      .sort()
      .join(",");
    if (kinds !== SET) problems.push(`${fig.id}: pieces are ${kinds}`);
    fig.slots.forEach((s, i) => {
      const e = s.pts
        .map((p, k) => {
          const q = s.pts[(k + 1) % s.pts.length];
          return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
        })
        .sort((a, b) => a - b)
        .join(",");
      if (e !== EDGES[s.kind]) problems.push(`${fig.id} slot ${i}: edges ${e} are not a ${s.kind}`);
    });
    // sample off the lattice by DIFFERENT x and y offsets — equal offsets put
    // samples exactly on 45° edges and read as false overlaps
    const b = boxOf(fig.slots.flatMap((s) => s.pts));
    let cells = 0;
    let overlaps = 0;
    for (let x = b.x + 0.013; x < b.x + b.w; x += 0.05)
      for (let y = b.y + 0.031; y < b.y + b.h; y += 0.05) {
        const n = fig.slots.filter((s) => inside(s.pts, x, y)).length;
        if (n > 0) cells++;
        if (n > 1) overlaps++;
      }
    if (overlaps > 0) problems.push(`${fig.id}: ${overlaps} overlapping samples`);
    const area = cells * 0.05 * 0.05;
    if (Math.abs(area - 16) > 0.2) problems.push(`${fig.id}: covers ${area.toFixed(2)}, not 16`);
  }
  return problems;
}

export function starsFor(misses: number): number {
  if (misses <= 1) return 3;
  if (misses <= 4) return 2;
  return 1;
}
