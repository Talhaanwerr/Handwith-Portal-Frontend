import { unit } from "@shared/utils/hash";
import type { PictureId } from "@games/blend-read/components/PictureArt";
import { LEVELS, type Level, type Verdict } from "@games/jigsaw-fun/constants/levels";

/**
 * Jigsaw Fun — the data.
 *
 * One MODULE per picture, played at the level the child picks: Easy cuts it
 * into 4 pieces, Medium 6, Hard 9. Pieces are square cells whose shared
 * edges carry a knob on one side and the matching hole on the other.
 *
 * Picture units: every cell is CELL × CELL; knobs reach 28 units past an
 * edge (KNOB_PATH).
 */

export const CELL = 100;
/** The margin a piece's own drawing keeps around its cell, for its knobs. */
export const PIECE_PAD = 30;

export type ModuleId = "lion" | "whale" | "unicorn" | "train" | "cake" | "planet";

export interface Scene {
  id: ModuleId;
  /** The card's name and the "You made the …!" line. */
  name: string;
  picture: PictureId;
  sky: [string, string];
  far: string;
  ground: string;
  sun: string;
  /** Night scenes get a few stars. */
  stars?: boolean;
  /** The card's accent. */
  accent: string;
}

export const MODULES: readonly Scene[] = [
  {
    id: "lion",
    name: "lion",
    picture: "lion",
    sky: ["#FFD27A", "#FFB35C"],
    far: "#E8BD5C",
    ground: "#D9A441",
    sun: "#FFF1B8",
    accent: "#E8912A",
  },
  {
    id: "whale",
    name: "whale",
    picture: "whale",
    sky: ["#9BDCFF", "#5EB8F2"],
    far: "#4C9BDB",
    ground: "#2F7FC7",
    sun: "#FFE680",
    accent: "#2E7FD6",
  },
  {
    id: "unicorn",
    name: "unicorn",
    picture: "unicorn",
    sky: ["#FFD6EE", "#D9C4FF"],
    far: "#BFE8A9",
    ground: "#9ED98B",
    sun: "#FFF4B8",
    accent: "#B35FD9",
  },
  {
    id: "train",
    name: "train",
    picture: "train",
    sky: ["#BFE9FF", "#8FD3FF"],
    far: "#9ED98B",
    ground: "#6CC05F",
    sun: "#FFD93D",
    accent: "#3DAB72",
  },
  {
    id: "cake",
    name: "cake",
    picture: "cake",
    sky: ["#FFE8C2", "#FFC7D9"],
    far: "#FF9EBC",
    ground: "#E0457B",
    sun: "#FFFFFF",
    accent: "#E0457B",
  },
  {
    id: "planet",
    name: "planet",
    picture: "planet",
    sky: ["#1F2A5C", "#34468C"],
    far: "#4A5BA8",
    ground: "#7C6BD8",
    sun: "#FFF6C8",
    stars: true,
    accent: "#5B4BC4",
  },
];

export const MODULE_IDS = MODULES.map((m) => m.id);

/** Where a picture's Twemoji drawing is served from. */
export const pictureSrc = (id: PictureId) => `/games/blend-read/icons/${id}.svg`;

export function sceneOf(id: ModuleId): Scene {
  return MODULES.find((m) => m.id === id) ?? MODULES[0];
}

/** The three cuts, one per level in LEVELS order (Easy, Medium, Hard). */
export const GRIDS: readonly { cols: number; rows: number }[] = [
  { cols: 2, rows: 2 },
  { cols: 3, rows: 2 },
  { cols: 3, rows: 3 },
];

/** A level's cut — its index into GRIDS. */
export const cutOf = (level: Level): number => LEVELS.indexOf(level);

export function gridOf(level: Level): { cols: number; rows: number } {
  return GRIDS[cutOf(level)];
}

/** A different cut for every picture AND every level. */
export function seedOf(module: ModuleId, cut: number): number {
  return MODULE_IDS.indexOf(module) * 10 + cut;
}

/* ─── Cutting ─────────────────────────────────────────────────────────────── */

function tabH(seed: number, r: number, c: number): 1 | -1 {
  return unit(seed * 97 + r * 13 + c * 7 + 1) < 0.5 ? 1 : -1;
}
function tabV(seed: number, r: number, c: number): 1 | -1 {
  return unit(seed * 89 + r * 11 + c * 5 + 3) < 0.5 ? 1 : -1;
}

/** One knob along an edge (u along it, v out of the cell). Symmetric in u,
 *  so the two cells sharing an edge draw the very same curve. */
const KNOB_PATH: readonly (readonly [number, number])[][] = [
  [[0.34, 0]],
  [
    [0.4, 0],
    [0.42, 0.06],
    [0.38, 0.12],
  ],
  [
    [0.34, 0.2],
    [0.4, 0.28],
    [0.5, 0.28],
  ],
  [
    [0.6, 0.28],
    [0.66, 0.2],
    [0.62, 0.12],
  ],
  [
    [0.58, 0.06],
    [0.6, 0],
    [0.66, 0],
  ],
  [[1, 0]],
];

function edge(x0: number, y0: number, x1: number, y1: number, dir: -1 | 0 | 1): string {
  if (dir === 0) return `L${x1},${y1}`;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const ox = dy / len; // outward normal of a clockwise walk, y down
  const oy = -dx / len;
  const at = ([u, v]: readonly [number, number]) =>
    `${+(x0 + u * dx + v * len * ox * dir).toFixed(2)},${+(y0 + u * dy + v * len * oy * dir).toFixed(2)}`;
  return KNOB_PATH.map((seg) =>
    seg.length === 1 ? `L${at(seg[0])}` : `C${seg.map(at).join(" ")}`
  ).join(" ");
}

/** The outline of the piece at (col, row), in picture units, clockwise. */
export function piecePath(
  seed: number,
  cols: number,
  rows: number,
  col: number,
  row: number
): string {
  const x = col * CELL;
  const y = row * CELL;
  const top = row === 0 ? 0 : (-tabH(seed, row - 1, col) as -1 | 1);
  const right = col === cols - 1 ? 0 : tabV(seed, row, col);
  const bottom = row === rows - 1 ? 0 : tabH(seed, row, col);
  const left = col === 0 ? 0 : (-tabV(seed, row, col - 1) as -1 | 1);
  return [
    `M${x},${y}`,
    edge(x, y, x + CELL, y, top),
    edge(x + CELL, y, x + CELL, y + CELL, right),
    edge(x + CELL, y + CELL, x, y + CELL, bottom),
    edge(x, y + CELL, x, y, left),
    "Z",
  ].join(" ");
}

const PATHS = new Map<string, readonly string[]>();

/** Every piece outline of one picture at one level, in picture order —
 *  worked out once and kept, not again on every render of the board. */
export function cutPaths(module: ModuleId, level: Level): readonly string[] {
  const key = `${module}/${level}`;
  let paths = PATHS.get(key);
  if (!paths) {
    const { cols, rows } = gridOf(level);
    const seed = seedOf(module, cutOf(level));
    paths = Array.from({ length: cols * rows }, (_, i) =>
      piecePath(seed, cols, rows, i % cols, Math.floor(i / cols))
    );
    PATHS.set(key, paths);
  }
  return paths;
}

/** Where piece i clicks in: the centre of its cell, in picture units. */
export function cellCentre(level: Level, i: number): { x: number; y: number } {
  const { cols } = gridOf(level);
  return { x: ((i % cols) + 0.5) * CELL, y: (Math.floor(i / cols) + 0.5) * CELL };
}

/**
 * Where a dropped piece goes (picture units): anywhere in its OWN cell takes
 * it home — a cell is the piece's whole place, and its edge is as far as a
 * finger can go before it is in a neighbour's; in another EMPTY cell it is a
 * miss; anywhere else (a filled cell, off the picture) it just goes back.
 */
export function judgeDrop(
  level: Level,
  taken: readonly (number | null)[],
  piece: number,
  x: number,
  y: number
): Verdict {
  const { cols, rows } = gridOf(level);
  const c = Math.floor(x / CELL);
  const r = Math.floor(y / CELL);
  if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
  const cell = r * cols + c;
  if (taken[cell] !== null) return null;
  return cell === piece ? cell : "miss";
}
/** The tray's order — a fixed shuffle, never the picture's own order. */
export function trayOrder(seed: number, n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => unit(seed * 71 + a * 3) - unit(seed * 71 + b * 3)
  );
  if (order.every((v, i) => v === i)) order.push(order.shift()!);
  return order;
}

/** A few stars for the night picture, placed once. */
export const STARS: readonly [number, number, number][] = Array.from({ length: 9 }, (_, i) => [
  +(0.06 + unit(i * 5 + 2) * 0.88).toFixed(3),
  +(0.05 + unit(i * 5 + 3) * 0.4).toFixed(3),
  +(0.006 + unit(i * 5 + 4) * 0.008).toFixed(4),
]);

/* ─── Self-check ──────────────────────────────────────────────────────────── */

/** Points across a cell (share of a cell from its corner), out to its edges. */
const SPOTS: readonly [number, number][] = [
  [0.5, 0.5],
  [0.03, 0.03],
  [0.97, 0.04],
  [0.04, 0.96],
  [0.96, 0.97],
  [0.5, 0.02],
  [0.98, 0.5],
];

/**
 * Proves every picture at every level can be finished: the level has its
 * own cut (more pieces the harder it is), the tray holds every piece once and
 * not in picture order, every outline is a real path, and it is built the way
 * the teaching hand shows — each piece in the tray's order dropped on its own
 * cell, at the middle AND right out by the edges, is taken; dropped in any
 * other empty cell it is a miss, never taken.
 */
export function checkJigsaw(): string[] {
  const problems: string[] = [];
  if (GRIDS.length !== LEVELS.length) problems.push("one cut per level is needed");
  LEVELS.forEach((level, i) => {
    const { cols, rows } = gridOf(level);
    if (i > 0 && cols * rows <= GRIDS[i - 1].cols * GRIDS[i - 1].rows)
      problems.push(`${level} has no more pieces than the level below`);
  });
  for (const m of MODULES)
    for (const level of LEVELS) {
      const { cols, rows } = gridOf(level);
      const n = cols * rows;
      const order = trayOrder(seedOf(m.id, cutOf(level)), n);
      if (order.length !== n || new Set(order).size !== n || order.some((v) => v < 0 || v >= n))
        problems.push(`${m.id} ${level}: tray does not hold every piece once`);
      if (order.every((v, i) => v === i)) problems.push(`${m.id} ${level}: tray in picture order`);
      cutPaths(m.id, level).forEach((d, i) => {
        if (d.includes("NaN")) problems.push(`${m.id} ${level} piece ${i}: bad path`);
      });
      const taken: (number | null)[] = Array(n).fill(null);
      for (const piece of order) {
        for (let cell = 0; cell < n; cell++)
          for (const [u, v] of SPOTS) {
            const x = ((cell % cols) + u) * CELL;
            const y = (Math.floor(cell / cols) + v) * CELL;
            const verdict = judgeDrop(level, taken, piece, x, y);
            const want = cell === piece ? piece : taken[cell] === null ? "miss" : null;
            if (verdict !== want)
              problems.push(
                `${m.id} ${level}: piece ${piece} at cell ${cell} (${u},${v}) → ${verdict}`
              );
          }
        taken[piece] = piece;
      }
    }
  if (new Set(MODULES.map((m) => m.picture)).size !== MODULES.length)
    problems.push("two modules share a picture");
  return problems;
}
/** Stars for one puzzle: a clean one is three, a few wrong drops two, else
 *  one. (Sort Two Ways scores its boards with this too.) */
export function starsFor(misses: number): number {
  if (misses <= 1) return 3;
  if (misses <= 5) return 2;
  return 1;
}
