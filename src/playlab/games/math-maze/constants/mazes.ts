/**
 * Math Maze — the mazes, as data, and the rules that read them.
 *
 * A maze is a grid of numbers with a START in one corner and a PRIZE (two by
 * two) in the other. Hidden in it is one path of numbers in order; the child
 * walks it by tapping the numbers one at a time. Every other cell is a
 * DECOY: the same numbers again, placed where they are no use.
 *
 * THE RULE, stricter than the reference on purpose: a tap counts only when it
 * is the next number AND it touches the last step (up, down, left or right).
 * "Find a 4 anywhere" teaches number recognition; "find the 4 next to your 3"
 * teaches counting on — which is what a maze is for. Because of that rule the
 * path is never stored separately from the grid: `pathOf` WALKS it, taking the
 * one neighbour that holds the next number, so a maze can never disagree with
 * its own answer. `checkMaze` proves every maze can be walked exactly one way
 * (run by `scratchpad/mmcheck` and safe to call anywhere).
 *
 * FOUR RUNS, THREE MAZES EACH. A child picks a run; each time they play it
 * they get the NEXT maze in its pool (see `mazeFor`), so a replay is a new
 * walk rather than a remembered one. The first maze of each of the first
 * three runs is hand-made (the 1 → 10 one is the reference's); the others
 * came out of a seeded generator (`scratchpad/mmgen.mjs`) and passed the same
 * check before they were pasted in — the data here is what ships.
 */

/** "S" is the start, "P" the prize, a number is a number. */
type Cell = number | "S" | "P";

/** A run: which way to count, and how far. */
export type LevelId = "one-five" | "one-ten" | "count-down" | "twos";

export interface Maze {
  /** Unique across every run. */
  id: string;
  /** What the title badges say. */
  from: number;
  to: number;
  /** How far each step counts: 1 by default, -1 counting down, 2 by twos. */
  step?: number;
  /** Rows of cells, top to bottom. */
  grid: readonly (readonly Cell[])[];
}

export interface Pos {
  r: number;
  c: number;
}

export interface Step extends Pos {
  value: number;
}

/* ── 1 → 5 on a 5 x 5 ────────────────────────────────────────────────────── */

const ONE_FIVE_A: Maze = {
  id: "one-five-a",
  from: 1,
  to: 5,
  grid: [
    ["S", 1, 5, 2, 3],
    [4, 2, 3, 1, 4],
    [1, 4, 4, 5, 2],
    [2, 5, 3, "P", "P"],
    [4, 1, 2, "P", "P"],
  ],
};

const ONE_FIVE_B: Maze = {
  id: "one-five-b",
  from: 1,
  to: 5,
  grid: [
    [3, 5, 3, "P", "P"],
    [4, 4, 1, "P", "P"],
    [1, 2, 4, 5, 2],
    [2, 2, 3, 3, 1],
    ["S", 1, 3, 3, 3],
  ],
};

const ONE_FIVE_C: Maze = {
  id: "one-five-c",
  from: 1,
  to: 5,
  grid: [
    [1, 2, 5, 1, "S"],
    [2, 3, 3, 2, 2],
    [3, 5, 4, 2, 4],
    ["P", "P", 1, 5, 3],
    ["P", "P", 5, 5, 1],
  ],
};

/* ── 1 → 10 on a 6 x 6 ───────────────────────────────────────────────────── */

/** The reference's maze: start top-left, prize bottom-right. (The
 *  reference's own grid steps diagonally once; here every step is a side
 *  step, so the one rule holds the whole way.) */
const ONE_TEN_A: Maze = {
  id: "one-ten-a",
  from: 1,
  to: 10,
  grid: [
    ["S", 1, 5, 8, 2, 7],
    [4, 2, 9, 4, 10, 6],
    [7, 3, 4, 6, 7, 3],
    [10, 6, 5, 2, 10, 1],
    [3, 7, 8, 1, "P", "P"],
    [5, 9, 9, 10, "P", "P"],
  ],
};

const ONE_TEN_B: Maze = {
  id: "one-ten-b",
  from: 1,
  to: 10,
  grid: [
    [2, 8, 9, 10, "P", "P"],
    [3, 7, 4, 5, "P", "P"],
    [5, 6, 8, 1, 7, 2],
    [4, 10, 4, 3, 5, 6],
    [3, 2, 6, 5, 7, 4],
    ["S", 1, 9, 3, 6, 8],
  ],
};

const ONE_TEN_C: Maze = {
  id: "one-ten-c",
  from: 1,
  to: 10,
  grid: [
    [1, 7, 5, 3, 4, "S"],
    [3, 1, 7, 4, 6, 1],
    [5, 8, 8, 2, 8, 2],
    [4, 9, 1, 2, 10, 3],
    ["P", "P", 9, 8, 10, 4],
    ["P", "P", 10, 7, 6, 5],
  ],
};

/* ── 10 → 1, counting down ───────────────────────────────────────────────── */

/** Start bottom-left, prize top-right, the path doubling back on itself so it
 *  cannot be guessed by shape. */
const COUNT_DOWN_A: Maze = {
  id: "count-down-a",
  from: 10,
  to: 1,
  grid: [
    [7, 3, 9, 1, "P", "P"],
    [4, 6, 5, 2, "P", "P"],
    [2, 7, 4, 3, 8, 10],
    [9, 8, 1, 6, 5, 4],
    [10, 3, 7, 9, 2, 6],
    ["S", 5, 8, 10, 1, 3],
  ],
};

const COUNT_DOWN_B: Maze = {
  id: "count-down-b",
  from: 10,
  to: 1,
  grid: [
    ["S", 4, 7, 7, 1, 5],
    [10, 9, 2, 5, 1, 1],
    [7, 8, 6, 3, 10, 7],
    [6, 5, 4, 8, 9, 4],
    [7, 5, 3, 6, "P", "P"],
    [3, 5, 2, 1, "P", "P"],
  ],
};

const COUNT_DOWN_C: Maze = {
  id: "count-down-c",
  from: 10,
  to: 1,
  grid: [
    ["P", "P", 5, 2, 9, 4],
    ["P", "P", 9, 7, 1, 4],
    [1, 2, 3, 4, 6, 3],
    [1, 4, 6, 5, 9, 8],
    [5, 8, 6, 6, 9, 10],
    [10, 3, 3, 7, 8, "S"],
  ],
};

/* ── 2 → 20, counting in twos ────────────────────────────────────────────── */

/** Every decoy is an even number too, so the child must count in twos, not
 *  just spot the even ones. */
const TWOS_A: Maze = {
  id: "twos-a",
  from: 2,
  to: 20,
  step: 2,
  grid: [
    ["S", 4, 12, 2, 14, 16],
    [2, 2, 20, 10, 4, 14],
    [4, 18, 18, 8, 10, 12],
    [6, 8, 12, 6, 18, 10],
    [12, 10, 18, 6, "P", "P"],
    [14, 16, 18, 20, "P", "P"],
  ],
};

const TWOS_B: Maze = {
  id: "twos-b",
  from: 2,
  to: 20,
  step: 2,
  grid: [
    [14, 16, 18, 20, "P", "P"],
    [12, 6, 8, 12, "P", "P"],
    [10, 8, 20, 10, 18, 18],
    [4, 6, 16, 2, 2, 4],
    [2, 12, 14, 16, 20, 18],
    ["S", 14, 18, 18, 12, 8],
  ],
};

const TWOS_C: Maze = {
  id: "twos-c",
  from: 2,
  to: 20,
  step: 2,
  grid: [
    [10, 8, 6, 4, 2, "S"],
    [12, 14, 14, 8, 20, 16],
    [18, 16, 6, 10, 4, 16],
    [20, 2, 6, 18, 20, 12],
    ["P", "P", 10, 6, 20, 10],
    ["P", "P", 16, 8, 14, 16],
  ],
};

/** Each run's mazes, in the order they are dealt. */
export const MAZE_POOL: Record<LevelId, readonly Maze[]> = {
  "one-five": [ONE_FIVE_A, ONE_FIVE_B, ONE_FIVE_C],
  "one-ten": [ONE_TEN_A, ONE_TEN_B, ONE_TEN_C],
  "count-down": [COUNT_DOWN_A, COUNT_DOWN_B, COUNT_DOWN_C],
  twos: [TWOS_A, TWOS_B, TWOS_C],
};

export const LEVEL_ORDER: readonly LevelId[] = ["one-five", "one-ten", "count-down", "twos"];

/** The maze for this play of a run: the pool, dealt in turn and wrapping. */
export function mazeFor(level: LevelId, round: number): Maze {
  const pool = MAZE_POOL[level];
  const at = ((round % pool.length) + pool.length) % pool.length;
  return pool[at];
}

/* ── Reading a maze ──────────────────────────────────────────────────────── */

/** The numbers to tap, in order: 1..5, 1..10, 10..1, or 2, 4 .. 20. */
export function sequenceOf(maze: Maze): number[] {
  const step = maze.step ?? (maze.to >= maze.from ? 1 : -1);
  const out: number[] = [];
  for (let n = maze.from; step > 0 ? n <= maze.to : n >= maze.to; n += step) out.push(n);
  return out;
}

export function sizeOf(maze: Maze): number {
  return maze.grid.length;
}

export function cellAt(maze: Maze, p: Pos): Cell | undefined {
  return maze.grid[p.r]?.[p.c];
}

function find(maze: Maze, kind: "S" | "P"): Pos[] {
  const out: Pos[] = [];
  maze.grid.forEach((row, r) => row.forEach((cell, c) => cell === kind && out.push({ r, c })));
  return out;
}

export function startOf(maze: Maze): Pos {
  return find(maze, "S")[0];
}

/** The prize's top-left cell and its span (always square). */
export function prizeOf(maze: Maze): { r: number; c: number; span: number } {
  const cells = find(maze, "P");
  const r = Math.min(...cells.map((p) => p.r));
  const c = Math.min(...cells.map((p) => p.c));
  return { r, c, span: Math.round(Math.sqrt(cells.length)) };
}

/** Up, down, left, right — the only moves the maze allows. */
export function isNeighbour(a: Pos, b: Pos): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

function neighbours(maze: Maze, p: Pos): Pos[] {
  const n = sizeOf(maze);
  return [
    { r: p.r - 1, c: p.c },
    { r: p.r + 1, c: p.c },
    { r: p.r, c: p.c - 1 },
    { r: p.r, c: p.c + 1 },
  ].filter((q) => q.r >= 0 && q.c >= 0 && q.r < n && q.c < n);
}

/**
 * The path, WALKED from the start: each step is the one neighbour of the last
 * step that holds the next number. Throws if a step has no such neighbour or
 * more than one — a maze like that cannot be played fairly.
 */
export function pathOf(maze: Maze): Step[] {
  const path: Step[] = [];
  let at = startOf(maze);
  const used = new Set<string>([`${at.r},${at.c}`]);
  for (const value of sequenceOf(maze)) {
    const next = neighbours(maze, at).filter(
      (q) => cellAt(maze, q) === value && !used.has(`${q.r},${q.c}`)
    );
    if (next.length !== 1)
      throw new Error(
        `maze ${maze.id}: ${next.length} cells next to (${at.r},${at.c}) hold ${value}`
      );
    at = next[0];
    used.add(`${at.r},${at.c}`);
    path.push({ ...at, value });
  }
  return path;
}

/** Built once per maze: the path is pure data derived from a grid that
 *  never changes, and screens read it on every render. */
const PATHS = new Map<string, readonly Step[]>(
  Object.values(MAZE_POOL)
    .flat()
    .map((m) => [m.id, pathOf(m)])
);

export function pathFor(maze: Maze): readonly Step[] {
  return PATHS.get(maze.id) ?? pathOf(maze);
}

/**
 * Everything a fair maze must be, as a list of problems (empty = fair):
 * square, one start, a square prize, a path that walks one way only, a last
 * step touching the prize, and every number on the path planted at least once
 * more as a decoy — without decoys a maze is only a trail of numbers.
 */
export function checkMaze(maze: Maze): string[] {
  const problems: string[] = [];
  const n = sizeOf(maze);
  if (maze.grid.some((row) => row.length !== n)) problems.push("grid is not square");
  if (find(maze, "S").length !== 1) problems.push("needs exactly one start");
  const prize = prizeOf(maze);
  if (find(maze, "P").length !== prize.span * prize.span) problems.push("prize is not a square");
  let path: Step[] = [];
  try {
    path = pathOf(maze);
  } catch (e) {
    problems.push((e as Error).message);
    return problems;
  }
  const last = path[path.length - 1];
  const touches = find(maze, "P").some((p) => isNeighbour(p, last));
  if (!touches) problems.push("last step does not touch the prize");
  for (const step of path) {
    const copies = maze.grid.flat().filter((cell) => cell === step.value).length;
    if (copies < 2) problems.push(`${step.value} has no decoy`);
  }
  return problems;
}

/** Three stars for a clean walk, two after a slip or two, one for finishing
 *  — finishing always counts, as everywhere in the portal. */
export function starsFor(misses: number): number {
  if (misses === 0) return 3;
  if (misses <= 2) return 2;
  return 1;
}
