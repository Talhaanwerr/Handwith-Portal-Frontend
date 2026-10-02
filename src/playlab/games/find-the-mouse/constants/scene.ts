import { unit } from "@shared/utils/hash";

/**
 * Where Is the Mouse? — the board's layout data.
 *
 * The stage is a big block of cheese on a kitchen counter. Its front face is
 * carved with six BURROWS (the mouse-holes a mouse pokes its head out of — the
 * tap targets) and a scatter of small decorative holes for texture.
 *
 * Two modes share that board:
 *   • "peek"  — one mouse peeks out of a burrow, ducks back in, and the child
 *               taps the hole it hid in (memory + attention).
 *   • "count" — several mice peek out and stay; the child counts them (tapping
 *               each one counts it aloud) and then taps the number.
 *
 * Every position is a percentage of the cheese's FRONT FACE, with one layout
 * for landscape (3 across × 2 down) and one for portrait (2 across × 3 down).
 * Index i is the same burrow in both. Everything is deterministic — no
 * Math.random anywhere, per GAME_DEV.
 */

export const ROUND_COUNT = 6;

/** Largest count a "count" round asks for; the number tiles run 1..COUNT_MAX. */
export const COUNT_MAX = 5;

export interface Spot {
  x: number;
  y: number;
}

/**
 * The mouse-holes, scattered like the holes in real cheese: no grid, and each
 * one its own size (`s` scales the stage's hole diameter; the smallest is
 * still a 44px+ tap target on a 568×320 phone). `land` and `port` are the
 * same burrow in each orientation.
 */
export const BURROWS: readonly { land: Spot; port: Spot; s: number }[] = [
  { land: { x: 12, y: 30 }, port: { x: 25, y: 15 }, s: 1.08 },
  { land: { x: 36, y: 23 }, port: { x: 74, y: 18 }, s: 0.8 },
  { land: { x: 61, y: 37 }, port: { x: 73, y: 52 }, s: 1.18 },
  { land: { x: 88, y: 25 }, port: { x: 26, y: 49 }, s: 0.86 },
  { land: { x: 25, y: 75 }, port: { x: 24, y: 85 }, s: 0.92 },
  { land: { x: 79, y: 76 }, port: { x: 73, y: 86 }, s: 1 },
];

/** A decorative hole: centre in % of the front face, radius `k` × the hole
 *  diameter. Ones centred on an edge are cut off by it — the half-holes a
 *  cut block of cheese shows. Laid out by a best-candidate sampler and
 *  proved clear of every burrow (and its tail) at 568×320 … 1366×768 and
 *  360×740 … 768×1024, in both modes. */
export interface DecorHole {
  x: number;
  y: number;
  k: number;
}

export const DECOR_LAND: readonly DecorHole[] = [
  { x: 49, y: 99.1, k: 0.3 },
  { x: 7, y: 93.5, k: 0.26 },
  { x: 42.8, y: 56.5, k: 0.22 },
  { x: 99.3, y: 65, k: 0.2 },
  { x: 58.7, y: 81.1, k: 0.16 },
  { x: 41, y: 80.4, k: 0.14 },
  { x: 99.3, y: 97.8, k: 0.14 },
  { x: 77.1, y: 43.7, k: 0.12 },
  { x: 73.6, y: 7.1, k: 0.11 },
  { x: 0.3, y: 1.2, k: 0.1 },
  { x: 10.2, y: 65.8, k: 0.09 },
  { x: 34, y: 50.5, k: 0.08 },
  { x: 99.4, y: 1.9, k: 0.08 },
  { x: 54.4, y: 66.5, k: 0.07 },
  { x: 91.4, y: 55.8, k: 0.07 },
  { x: 50.4, y: 6, k: 0.06 },
  { x: 92.6, y: 93.2, k: 0.06 },
];

export const DECOR_PORT: readonly DecorHole[] = [
  { x: 101.8, y: -1.1, k: 0.28 },
  { x: 44, y: 69.8, k: 0.24 },
  { x: 91.2, y: 33.9, k: 0.2 },
  { x: -0.7, y: 65.7, k: 0.16 },
  { x: 53.9, y: 28.4, k: 0.14 },
  { x: 47.4, y: 43.8, k: 0.12 },
  { x: -0.7, y: 32.5, k: 0.11 },
  { x: 46.4, y: 90.2, k: 0.1 },
  { x: 53, y: 8, k: 0.09 },
  { x: 1.7, y: 7.2, k: 0.08 },
  { x: 92.9, y: 89.7, k: 0.07 },
  { x: 45.2, y: 33.9, k: 0.07 },
  { x: 0.8, y: 47.2, k: 0.06 },
  { x: 12.8, y: 66.1, k: 0.06 },
];

/* ─── Peek rounds ─────────────────────────────────────────────────────────── */

/** The burrow the mouse peeks from — hashed, and never the same hole twice in
 *  a row (two identical rounds back to back would feel broken). */
export function peekBurrow(round: number): number {
  const b = Math.floor(unit(round * 37 + 5) * BURROWS.length);
  if (round > 0 && b === peekBurrow(round - 1)) return (b + 2) % BURROWS.length;
  return b;
}

/** What the mouse leaves showing when it ducks back in — the child's clue to
 *  which hole it is in. Changes every round so the game stays a little
 *  surprising: its tail hanging over the lip, the top of its head (ears and
 *  eyes) just peeking over the rim, or one little foot. */
export type Clue = "tail" | "ears" | "foot";

const CLUES: readonly Clue[] = ["tail", "ears", "foot", "ears", "tail", "foot"];

export function peekClue(round: number): Clue {
  return CLUES[round % CLUES.length];
}

/** How long the mouse stays out, in ms: a generous first look, a little
 *  quicker each round, never shorter than a second. */
export function peekMs(round: number): number {
  return Math.max(1100, 1900 - round * 150);
}

/* ─── Count rounds ────────────────────────────────────────────────────────── */

/** How many mice each count round shows — every number 1..5 appears, an easy
 *  two to start, no number twice in a row. */
const COUNT_SEQUENCE = [2, 4, 1, 3, 5, 4] as const;

export interface CountRound {
  count: number;
  /** `count` distinct burrow indices. */
  burrows: number[];
}

export function countRound(round: number): CountRound {
  const count = COUNT_SEQUENCE[round % COUNT_SEQUENCE.length];
  // Rank the burrows by a per-round hash and take the first `count` — a
  // deterministic shuffle.
  const burrows = BURROWS.map((_, i) => i)
    .sort((a, b) => unit(round * 53 + a * 7) - unit(round * 53 + b * 7))
    .slice(0, count)
    .sort((a, b) => a - b);
  return { count, burrows };
}

/* ─── Self-check (GAME_DEV: level data proves itself) ─────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const problems: string[] = [];
  for (let r = 0; r < ROUND_COUNT; r++) {
    const p = peekBurrow(r);
    if (p < 0 || p >= BURROWS.length) problems.push(`peek ${r}: burrow ${p} out of range`);
    if (r > 0 && p === peekBurrow(r - 1)) problems.push(`peek ${r}: same hole as round ${r - 1}`);

    if (r > 0 && peekClue(r) === peekClue(r - 1)) problems.push(`peek ${r}: same clue twice`);

    const { count, burrows } = countRound(r);
    if (count < 1 || count > COUNT_MAX)
      problems.push(`count ${r}: ${count} outside 1..${COUNT_MAX}`);
    if (burrows.length !== count) problems.push(`count ${r}: ${burrows.length} mice for ${count}`);
    if (new Set(burrows).size !== burrows.length) problems.push(`count ${r}: repeated burrow`);
  }
  const clues = new Set(Array.from({ length: ROUND_COUNT }, (_, r) => peekClue(r)));
  for (const c of ["tail", "ears", "foot"] as const)
    if (!clues.has(c)) problems.push(`peek: the ${c} clue never shows`);
  const seen = new Set(Array.from({ length: ROUND_COUNT }, (_, r) => countRound(r).count));
  for (let n = 1; n <= COUNT_MAX; n++) if (!seen.has(n)) problems.push(`count: ${n} never asked`);
  return problems;
}

/** Stars for a finished run: no misses is three, a few is two, else one. */
export function starsFor(misses: number): number {
  if (misses === 0) return 3;
  if (misses <= 3) return 2;
  return 1;
}
