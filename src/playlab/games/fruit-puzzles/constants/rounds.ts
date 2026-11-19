/**
 * Fruit Puzzles — fine motor skills for three-year-olds.
 *
 * A big fruit lies in pieces round a plate. Its shape waits on the plate, a
 * soft shadow with dashed seams. The child DRAGS each piece onto the plate:
 * close to its place, it glides in; anywhere else it slides back to where it
 * was (no penalty, nothing is wrong). The last piece in: the fruit is whole,
 * its name is said, it does a happy bounce, and the next fruit comes.
 *
 *   • "easy"   — EASY PUZZLES: two or three big pieces (halves, thirds).
 *   • "tricky" — TRICKY PUZZLES: four pieces (quarters, pinwheels).
 *
 * Each module is now a game of its own (Fruit Puzzles, Tricky Fruit Puzzles —
 * NgShell `single`): all six fruits a run, each cut differently from how the
 * other game cuts it. The old two-module game plays the first four of each.
 *
 * The board is one square of 100 × 100 units; the fruit's picture fills PIC.
 * A cut is a few wavy seams running out from a centre to the board's edge
 * (`rays`, given as places round the edge — see `edgePoint`); each piece is
 * the slice between two seams next to each other.
 */

import { fluentSrc } from "@shared/constants/fluent3d";
import {
  distinct,
  roundChecker,
  shuffled,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "easy" | "tricky";
export const MODULE_IDS: readonly ModuleId[] = ["easy", "tricky"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "easy",
    name: "Easy Puzzles",
    tag: "Two or three pieces",
    accent: "#3DAB72",
    edge: "#2B8A57",
    clip: "frp-mode-easy",
  },
  {
    id: "tricky",
    name: "Tricky Puzzles",
    tag: "Four pieces",
    accent: "#F08A24",
    edge: "#C46A12",
    clip: "frp-mode-tricky",
  },
];

/** One module's card, typed as the only module of its own game. */
export function moduleOf<M extends ModuleId>(id: M): ModuleInfo<M> {
  const m = MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`no module ${id}`);
  return { ...m, id };
}

export const VOICE: GameVoice = { welcome: "frp-welcome", done: "frp-done" };

/** Said as every puzzle starts (and shown in the guide bar). */
export const PUT_CLIP = "frp-put";

/** The fruits with both a Fluent picture and a recorded name. */
export type FruitId = "apple" | "banana" | "grapes" | "lemon" | "orange" | "pineapple";

/** "apple!" — said the moment the fruit is whole. */
export const nameClip = (f: FruitId) => `treat-word-${f}`;

export interface Point {
  x: number;
  y: number;
}
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The board's own units. */
export const VB: Box = { x: 0, y: 0, w: 100, h: 100 };
/** Where the fruit's picture sits on the board (the plate's rim stays clear). */
export const PIC: Box = { x: 8, y: 8, w: 84, h: 84 };

/** How far a seam swings out of a straight line (board units). */
const WAVE = 5;

/** The cuts, as places round the board's edge (see `edgePoint`). */
const HALF_V = [50, 250];
const HALF_H = [150, 350];
const THIRDS = [50, 175, 325];
const THIRDS_SIDE = [25, 150, 275];
const QUARTERS = [50, 150, 250, 350];
/** Four corner pieces turned a little, like a pinwheel. */
const PINWHEEL = [25, 125, 225, 325];

/** Rounds a run of each one-module game: all six fruits. */
export const GAME_ROUNDS = 6;

export interface PuzzleRound {
  fruit: FruitId;
  rays: readonly number[];
}

export const ROUNDS: Readonly<Record<ModuleId, readonly PuzzleRound[]>> = {
  easy: [
    { fruit: "apple", rays: HALF_V },
    { fruit: "lemon", rays: HALF_H },
    { fruit: "orange", rays: THIRDS },
    { fruit: "banana", rays: THIRDS_SIDE },
    { fruit: "pineapple", rays: HALF_V },
    { fruit: "grapes", rays: HALF_H },
  ],
  tricky: [
    { fruit: "pineapple", rays: QUARTERS },
    { fruit: "grapes", rays: PINWHEEL },
    { fruit: "apple", rays: PINWHEEL },
    { fruit: "orange", rays: QUARTERS },
    { fruit: "lemon", rays: PINWHEEL },
    { fruit: "banana", rays: QUARTERS },
  ],
};

/** The centre every seam starts from. */
const CENTRE: Point = { x: 50, y: 50 };

/**
 * A place round the board's edge, clockwise from the top-left corner: 0–100
 * along the top, 100–200 down the right, 200–300 back along the bottom,
 * 300–400 up the left.
 */
export function edgePoint(t: number): Point {
  const u = ((t % 400) + 400) % 400;
  if (u <= 100) return { x: u, y: 0 };
  if (u <= 200) return { x: 100, y: u - 100 };
  if (u <= 300) return { x: 300 - u, y: 100 };
  return { x: 0, y: 400 - u };
}

/** One seam from the centre to the edge: a gentle S (a cubic's two handles). */
function seam(to: Point, flip: boolean) {
  const dx = to.x - CENTRE.x;
  const dy = to.y - CENTRE.y;
  const len = Math.hypot(dx, dy) || 1;
  const w = flip ? -WAVE : WAVE;
  const nx = (-dy / len) * w;
  const ny = (dx / len) * w;
  return {
    c1: { x: CENTRE.x + dx / 3 + nx, y: CENTRE.y + dy / 3 + ny },
    c2: { x: CENTRE.x + (2 * dx) / 3 - nx, y: CENTRE.y + (2 * dy) / 3 - ny },
    to,
  };
}

const f = (n: number) => n.toFixed(2);
const pt = (p: Point) => `${f(p.x)} ${f(p.y)}`;

export interface Piece {
  /** Its outline, in board units. */
  path: string;
  /** Its drawing box (clipped to the picture), in board units. */
  box: Box;
  /** The middle of that box: where the piece's own middle goes. */
  centre: Point;
}

/**
 * The pieces of a cut: piece i is the slice between seam i and seam i + 1
 * (clockwise), closed along the board's edge round any corners between them.
 */
export function piecesOf(rays: readonly number[]): Piece[] {
  const ts = [...rays].sort((a, b) => a - b);
  const seams = ts.map((t, i) => seam(edgePoint(t), i % 2 === 1));
  return ts.map((t, i) => {
    const j = (i + 1) % ts.length;
    const a = seams[i];
    const b = seams[j];
    const end = j === 0 ? ts[0] + 400 : ts[j];
    const corners: Point[] = [];
    for (let k = Math.floor(t / 100) + 1; k * 100 < end; k++) corners.push(edgePoint(k * 100));
    const path =
      `M${pt(CENTRE)} C${pt(a.c1)} ${pt(a.c2)} ${pt(a.to)} ` +
      corners.map((c) => `L${pt(c)} `).join("") +
      `L${pt(b.to)} C${pt(b.c2)} ${pt(b.c1)} ${pt(CENTRE)} Z`;
    const xs = [CENTRE, a.c1, a.c2, a.to, b.to, b.c1, b.c2, ...corners];
    const x0 = Math.max(PIC.x, Math.min(...xs.map((p) => p.x)));
    const x1 = Math.min(PIC.x + PIC.w, Math.max(...xs.map((p) => p.x)));
    const y0 = Math.max(PIC.y, Math.min(...xs.map((p) => p.y)));
    const y1 = Math.min(PIC.y + PIC.h, Math.max(...xs.map((p) => p.y)));
    const box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    return { path, box, centre: { x: x0 + box.w / 2, y: y0 + box.h / 2 } };
  });
}

/** Is a piece whose middle is let go at `p` (board units) close enough to snap in? */
export function snapsIn(piece: Piece, p: Point): boolean {
  return (
    Math.abs(p.x - piece.centre.x) <= Math.max(16, piece.box.w * 0.45) &&
    Math.abs(p.y - piece.centre.y) <= Math.max(16, piece.box.h * 0.45)
  );
}

/** The gap between two loose pieces on one side, in board units. */
export const SIDE_GAP = 8;
/** The cloth each side's pieces lie on reaches this far past them (board units). */
export const CLOTH_PAD = 6;

/**
 * Where the loose pieces lie: alternately left and right of the plate (on a
 * phone held upright, above and below), in a shuffle that never matches the
 * pieces' own order. And the sizes that make it all fit (fruit-puzzles.css):
 *   k / kp   loose pieces' size, as a share of the plate's (sideways / upright)
 *   wide     the whole board's width, in plates (sideways)
 *   tall     the whole board's height, in plates (upright)
 *   sw / sh  the widest and the tallest piece (board units): each side's
 *            cloth is that wide sideways (that tall upright) plus CLOTH_PAD
 *            round it, so both sides match and the plate stays in the middle
 */
export function layoutOf(pieces: readonly Piece[], seed: number) {
  const order = shuffled(
    pieces.map((_, i) => i),
    seed
  );
  const sides: [number[], number[]] = [[], []];
  order.forEach((p, i) => sides[i % 2].push(p));
  const along = (s: number[], dim: "w" | "h") =>
    s.reduce((sum, p) => sum + pieces[p].box[dim], 0) + SIDE_GAP * (s.length - 1);
  const across = (dim: "w" | "h") => Math.max(...pieces.map((p) => p.box[dim]));
  const colH = Math.max(...sides.map((s) => along(s, "h"))) + 2 * CLOTH_PAD;
  const rowW = Math.max(...sides.map((s) => along(s, "w"))) + 2 * CLOTH_PAD;
  const k = Math.min(0.9, 96 / colH);
  const kp = Math.min(0.9, 96 / rowW);
  return {
    order,
    sides,
    k,
    kp,
    wide: 1 + (2 * (across("w") + 2 * CLOTH_PAD) * k) / 100 + 0.14,
    tall: 1 + (2 * (across("h") + 2 * CLOTH_PAD) * kp) / 100 + 0.14,
    sw: across("w"),
    sh: across("h"),
  };
}

/** The shuffle's seed for a round. */
export const seedOf = (module: ModuleId, round: number) =>
  MODULE_IDS.indexOf(module) * 10 + round + 3;

/**
 * Self-check: six rounds a module, six different fruits in each, the right
 * number of pieces, every fruit has a picture and a recorded name, and every
 * loose piece is big enough to grab.
 */
export function checkRounds(has: (id: string) => boolean): string[] {
  const { problems, need } = roundChecker();
  need(has(PUT_CLIP), `${PUT_CLIP} is missing`);
  for (const id of MODULE_IDS) {
    const rs = ROUNDS[id];
    need(rs.length === GAME_ROUNDS, `${id}: ${rs.length} rounds`);
    need(distinct(rs.map((r) => r.fruit)), `${id}: a fruit repeats`);
    rs.forEach((r, i) => {
      const n = r.rays.length;
      need(id === "easy" ? n === 2 || n === 3 : n === 4, `${id} ${i}: ${n} pieces`);
      need(fluentSrc(r.fruit) !== null, `${r.fruit}: no picture`);
      need(has(nameClip(r.fruit)), `${r.fruit}: no recorded name`);
      const pieces = piecesOf(r.rays);
      for (const p of pieces) need(Math.min(p.box.w, p.box.h) >= 30, `${id} ${i}: a tiny piece`);
      const lay = layoutOf(pieces, seedOf(id, i));
      need(lay.order.join() !== pieces.map((_, j) => j).join(), `${id} ${i}: not shuffled`);
    });
  }
  return problems;
}
