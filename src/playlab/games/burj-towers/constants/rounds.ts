/**
 * Tallest Tower — a SIZE game (tall and short, putting in order) for
 * three-year-olds, with Burj Khalifa towers standing in Dubai. Not a number
 * game: the towers' heights are only how many floors are drawn, and they are
 * never shown or said as numbers.
 *
 *   • "tallshort" — TALL OR SHORT? (a sunny day): two towers of clearly
 *                   different heights, one gold glass and one silver. Two or
 *                   three questions a round, mixed: "Which tower is taller?" /
 *                   "Which tower is shorter?" — tap a tower (the whole tower
 *                   is the button). Right: it glows and a gold star pops on
 *                   its spire, then the next question. Wrong: it shakes, "Try
 *                   again!", and the right one glows.
 *   • "order"     — LINE THEM UP (the evening): three towers of different
 *                   heights in a jumbled row. "Put them in order, from short
 *                   to tall!" — tap the shortest and it slides onto the first
 *                   place of the stand, then the middle one, then the tallest.
 *                   A wrong pick shakes and the right one glows. Lined up,
 *                   their spires light one after another.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "tallshort" | "order";
export const MODULE_IDS: readonly ModuleId[] = ["tallshort", "order"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "tallshort",
    name: "Tall or Short?",
    tag: "Find the tall and the short tower",
    accent: "#3E8ED0",
    edge: "#2A679E",
    clip: "bjt-mode-tallshort",
  },
  {
    id: "order",
    name: "Line Them Up",
    tag: "Short to tall",
    accent: "#B4609E",
    edge: "#86407A",
    clip: "bjt-mode-order",
  },
];

export const VOICE: GameVoice = { welcome: "bjt-welcome", done: "bjt-done" };

/** Tower heights, in floors (drawing only). */
export const MIN_FLOORS = 2;
export const MAX_FLOORS = 6;
/** Line Them Up's towers stay a floor lower, so three of them, their spires
 *  and the stand fit under the pills on a 568 × 320 phone. */
export const MAX_ORDER_FLOORS = 5;
/** Tall or Short?'s two towers differ by at least this many floors. */
export const MIN_GAP = 2;

export type Side = "left" | "right";
export const SIDES: readonly Side[] = ["left", "right"];
export type Ask = "taller" | "shorter";

export interface TallShortRound {
  /** Floors in the left tower… */
  left: number;
  /** …and in the right one. */
  right: number;
  /** Which of the two is the gold tower (the other is silver). */
  gold: Side;
  /** The questions, in the order they are asked (two or three). */
  ask: readonly Ask[];
}

export interface OrderRound {
  /** The three towers' floors, in the jumbled row as it stands, left to right. */
  row: readonly [number, number, number];
  /** Which tower of the row is gold glass (the others are silver). */
  gold: 0 | 1 | 2;
}

export const TALLSHORT_ROUNDS: readonly TallShortRound[] = [
  { left: 5, right: 2, gold: "left", ask: ["taller", "shorter"] },
  { left: 2, right: 4, gold: "left", ask: ["shorter", "taller"] },
  { left: 3, right: 6, gold: "right", ask: ["taller", "shorter", "taller"] },
  { left: 6, right: 3, gold: "right", ask: ["shorter", "taller", "shorter"] },
];

/** The shortest stands in the middle, on the left, on the right, in the
 *  middle; the last round's towers are only a floor apart. */
export const ORDER_ROUNDS: readonly OrderRound[] = [
  { row: [5, 2, 3], gold: 0 },
  { row: [2, 5, 4], gold: 2 },
  { row: [3, 5, 2], gold: 1 },
  { row: [4, 2, 3], gold: 0 },
];

/** "Which tower is taller?" / "Which tower is shorter?" */
export const askClip = (ask: Ask): string => `bjt-which-${ask}`;
/** "Put them in order, from short to tall!" */
export const ORDER_CLIP = "bjt-order";
/** "Short, taller, tallest!" — said as the spires light up. */
export const LINED_CLIP = "bjt-in-order";

/** The tower a question asks for. */
export function answerFor(r: TallShortRound, ask: Ask): Side {
  const leftTaller = r.left > r.right;
  return (ask === "taller") === leftTaller ? "left" : "right";
}

/** The row's towers (by place in the row) from the shortest to the tallest. */
export function shortToTall(r: OrderRound): number[] {
  return [0, 1, 2].sort((i, j) => r.row[i] - r.row[j]);
}

const inFloors = (n: number, max: number) => Number.isInteger(n) && n >= MIN_FLOORS && n <= max;

/** Self-check: four rounds a module, all different, sizes in range and
 *  clearly different, both questions in every Tall or Short? round, the
 *  answer on both sides and in both colours, no row already in order. */
export function checkRounds(has: (id: string) => boolean): string[] {
  const { problems, need } = roundChecker();

  need(TALLSHORT_ROUNDS.length === ROUND_COUNT, `tallshort: ${TALLSHORT_ROUNDS.length} rounds`);
  need(
    distinct(TALLSHORT_ROUNDS.map((r) => `${r.left}|${r.right}|${r.ask.join()}`)),
    "tallshort: a round repeats"
  );
  need(has(askClip("taller")) && has(askClip("shorter")), "tallshort: a question has no line");
  const answers: Side[] = [];
  const goldRight: boolean[] = [];
  for (const r of TALLSHORT_ROUNDS) {
    const name = `tallshort ${r.left}|${r.right}`;
    need(inFloors(r.left, MAX_FLOORS) && inFloors(r.right, MAX_FLOORS), `${name}: out of range`);
    need(Math.abs(r.left - r.right) >= MIN_GAP, `${name}: not clearly different`);
    need(r.ask.length >= 2 && r.ask.length <= 3, `${name}: ${r.ask.length} questions`);
    need(r.ask.includes("taller") && r.ask.includes("shorter"), `${name}: questions not mixed`);
    for (const a of r.ask) {
      answers.push(answerFor(r, a));
      goldRight.push(answerFor(r, a) === r.gold);
    }
  }
  need(answers.includes("left") && answers.includes("right"), "tallshort: always the same side");
  need(goldRight.includes(true) && goldRight.includes(false), "tallshort: always the same colour");
  need(
    new Set(TALLSHORT_ROUNDS.map((r) => r.ask[0])).size === 2,
    "tallshort: every round starts with the same question"
  );

  need(ORDER_ROUNDS.length === ROUND_COUNT, `order: ${ORDER_ROUNDS.length} rounds`);
  need(distinct(ORDER_ROUNDS.map((r) => r.row.join())), "order: a round repeats");
  need(has(ORDER_CLIP) && has(LINED_CLIP), "order: a line is missing");
  const firsts = new Set<number>();
  for (const r of ORDER_ROUNDS) {
    const name = `order ${r.row.join()}`;
    need(
      r.row.every((n) => inFloors(n, MAX_ORDER_FLOORS)),
      `${name}: out of range (${MIN_FLOORS}–${MAX_ORDER_FLOORS})`
    );
    need(distinct(r.row), `${name}: two towers are the same height`);
    need(shortToTall(r).join() !== "0,1,2", `${name}: already in order`);
    firsts.add(shortToTall(r)[0]);
  }
  need(firsts.size === 3, "order: the shortest is not found in every place of the row");
  return problems;
}
