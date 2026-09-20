/**
 * Leo's Puzzles — the eight modules, as data, plus the rules that read
 * them.
 *
 * A MODULE is one outing, and it has the same six beats every time:
 *
 *   1  MATCH     put each shape on the one that is the same — triangle on
 *                triangle, square on square. The warm-up, and where the child
 *                meets this module's three shapes for the first time.
 *   2  COMBINE   [shape] + [shape] + [shape] = [?]. Four answer cards; one has
 *                all three. The main puzzle.
 *   3  COMBINE   again, with a different three.
 *   4  JIGSAW    the picture in three tall pieces, one missing.
 *   5  PICTURE   the picture missing its things — sun, tree, ball — put back.
 *   6  MEET      four animals wander in from four edges to be said hello to.
 *
 * The same six beats, eight times: a three-year-old learns a game once and
 * then wants to play it. What changes is the shapes, the picture and the
 * animals, never the rules.
 */

import { SCENES, type SceneId } from "@games/shape-match/constants/scenes";
import { SETS, type PieceSet } from "@games/shape-match/constants/sets";
import { unit } from "@shared/utils/hash";

/** Rounds in a module. */
export const ROUNDS_PER_MODULE = 6;

/** How many tall pieces a picture is cut into for the jigsaw. Three: one to
 *  find, and two either side of it to hold the picture together. */
export const JIGSAW_PIECES = 3;

interface MatchRound {
  kind: "match";
  id: string;
  /** The shapes to pair up. */
  pieces: PieceSet["parts"];
}

interface CombineRound {
  kind: "combine";
  id: string;
  /** Which three shapes the question asks about. */
  set: PieceSet;
}

interface JigsawRound {
  kind: "jigsaw";
  id: string;
  scene: SceneId;
}

export interface SceneRound {
  kind: "scene";
  id: string;
  scene: SceneId;
}

interface VisitorsRound {
  kind: "visitors";
  id: string;
  scene: SceneId;
}

export type Round = MatchRound | CombineRound | JigsawRound | SceneRound | VisitorsRound;

export interface Module {
  id: string;
  /** What the child taps on the start screen. */
  title: string;
  /** The picture this module fills in — and the picture on its card. */
  scene: SceneId;
  /** The two sets of three its combining rounds ask about, by id. */
  asks: readonly [string, string];
}

/**
 * THE EIGHT MODULES.
 *
 * The sets get harder down the list: the early ones are three shapes that
 * differ in every way, the last ones share a colour or repeat a shape, so the
 * child has to hold all three in their head rather than spot one.
 */
export const MODULES: readonly Module[] = [
  {
    id: "park",
    title: "The Park",
    scene: "park",
    asks: ["rect-circle-triangle", "circle-square-triangle"],
  },
  {
    id: "farm",
    title: "The Farm",
    scene: "farm",
    asks: ["square-star-circle", "oval-square-heart"],
  },
  {
    id: "beach",
    title: "The Beach",
    scene: "beach",
    asks: ["triangle-oval-square", "star-rect-oval"],
  },
  {
    id: "garden",
    title: "The Garden",
    scene: "garden",
    asks: ["heart-diamond-rect", "pentagon-circle-star"],
  },
  {
    id: "pond",
    title: "The Pond",
    scene: "pond",
    asks: ["circle-square-triangle", "diamond-triangle-pentagon"],
  },
  {
    id: "forest",
    title: "The Forest",
    scene: "forest",
    asks: ["heart-star-diamond", "triangle-oval-square"],
  },
  {
    id: "snow",
    title: "The Snow",
    scene: "snow",
    asks: ["square-circle-oval", "heart-diamond-rect"],
  },
  {
    id: "night",
    title: "The Night",
    scene: "night",
    // the set with two triangles in it is this module's SECOND: the first
    // becomes the matching round, where two of the same shape would be a
    // riddle rather than a warm-up
    asks: ["star-rect-oval", "triangle-triangle-square"],
  },
];

export const TOTAL_MODULES = MODULES.length;

/* ── Reading a module ────────────────────────────────────────────────────── */

/** One of the module's two sets of three. */
export function setOf(outing: Module, which: 0 | 1): PieceSet {
  const wanted = outing.asks[which];
  return SETS.find((set) => set.id === wanted) ?? SETS[0];
}

/**
 * The six rounds of a module — BUILT ONCE and kept.
 *
 * The rounds are pure data derived from a module that never changes, but a
 * fresh array of six fresh objects on every call gave every reader a new
 * `round` identity on every render, and every effect keyed on the round
 * re-fired whenever anything else in the game re-rendered. Eight modules, so
 * this map holds eight entries for the life of the page.
 */
const ROUNDS_BY_MODULE = new Map<string, readonly Round[]>();

export function roundsOf(outing: Module): readonly Round[] {
  const built = ROUNDS_BY_MODULE.get(outing.id);
  if (built) return built;
  const first = setOf(outing, 0);
  const rounds: readonly Round[] = [
    { kind: "match", id: outing.id + "-match", pieces: first.parts },
    { kind: "combine", id: outing.id + "-combine-a", set: first },
    { kind: "combine", id: outing.id + "-combine-b", set: setOf(outing, 1) },
    { kind: "jigsaw", id: outing.id + "-jigsaw", scene: outing.scene },
    { kind: "scene", id: outing.id + "-picture", scene: outing.scene },
    { kind: "visitors", id: outing.id + "-hello", scene: outing.scene },
  ];
  ROUNDS_BY_MODULE.set(outing.id, rounds);
  return rounds;
}

/** The round at this place in the game, or undefined past the end. */
export function roundAt(moduleIndex: number, roundIndex: number): Round | undefined {
  const outing = MODULES[moduleIndex];
  if (!outing) return undefined;
  return roundsOf(outing)[roundIndex];
}

/* ── Reading a jigsaw round ──────────────────────────────────────────────── */

/** Which tall piece of the picture has been taken out. */
export function missingPiece(scene: SceneId, seed: number): number {
  return Math.floor(unit(seed * 29) * JIGSAW_PIECES) % JIGSAW_PIECES;
}

/**
 * The pieces offered: the one that belongs, and the other two pieces of the
 * same picture — so every wrong answer is a real part of the picture and the
 * child has to look at what is actually missing.
 *
 * NEVER IN THE ORDER OF THE PICTURE. Laid out left to right, three pieces in
 * their own order join back up into the picture the child is looking at — and
 * then the tray answers the question instead of asking it.
 */
export function jigsawChoices(scene: SceneId, seed: number): readonly number[] {
  const missing = missingPiece(scene, seed);
  const others = Array.from({ length: JIGSAW_PIECES }, (_, i) => i).filter((i) => i !== missing);
  const choices = [...others];
  choices.splice((seed * 2 + missing) % (others.length + 1), 0, missing);
  const whole = choices.every((at, i) => at === i);
  return whole ? [...choices.slice(1), choices[0]] : choices;
}

/* ── Reading a picture round ─────────────────────────────────────────────── */

/** The missing things, loose in the tray — never in the order of the gaps. */
export function loosePieces(scene: SceneId, seed: number): readonly number[] {
  const count = SCENES[scene].pieces.length;
  const order = Array.from({ length: count }, (_, i) => i).sort(
    (a, b) => unit(seed * 53 + a * 7) - unit(seed * 53 + b * 7)
  );
  const aligned = order.every((piece, i) => piece === i);
  return aligned && order.length > 1 ? [...order.slice(1), order[0]] : order;
}

/* ── What the banner says ────────────────────────────────────────────────── */

/** The instruction for a round, derived from the round itself. */
export function askFor(round: Round): string {
  if (round.kind === "match") return "Put each shape on the same shape!";
  if (round.kind === "combine") return "Which one has all three?";
  if (round.kind === "jigsaw") return "Which piece is missing?";
  if (round.kind === "scene") return "Put everything back in the " + SCENES[round.scene].name + "!";
  return "Who is here? Say hello!";
}
