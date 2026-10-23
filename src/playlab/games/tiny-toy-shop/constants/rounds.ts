/**
 * Tiny Toy Shop — every round, as data, and the check that proves it fair.
 *
 * Counting and adding toys, 1 to 5, at a little shop on Sesame Street. Two
 * modules of four rounds, each repeating ONE mechanic:
 *
 *   • "pick" — PICK THE TOYS (tap to count). A customer wants N of one toy;
 *     six toys stand on the shelf; tap each one asked for and it hops into
 *     the basket. Exactly N in the basket wins.
 *   • "add"  — ADD THEM UP (tap the total). Two little groups of one toy on
 *     the counter, a + between; tap the total from three number buttons.
 */

import type { PictureId } from "@games/blend-read/components/PictureArt";
import {
  ROUND_COUNT,
  distinct,
  inRange,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "pick" | "add";
export const MODULE_IDS: readonly ModuleId[] = ["pick", "add"];

/** Add Them Up's three levels, picked after its card is tapped. */
export type AddLevel = "add1" | "add2" | "add3";
export const ADD_LEVEL_CHOICES: readonly { id: AddLevel; label: string; tag: string }[] = [
  { id: "add1", label: "Easy", tag: "1 + 1, 2 + 1" },
  { id: "add2", label: "Medium", tag: "3 + 1, 2 + 2" },
  { id: "add3", label: "Hard", tag: "2 + 3, 4 + 1" },
];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "pick",
    name: "Pick the Toys",
    tag: "Tap to count",
    accent: "#E8574F",
    edge: "#B83A34",
    clip: "tys-mode-pick",
  },
  {
    id: "add",
    name: "Add Them Up",
    tag: "Easy, medium or hard",
    accent: "#2E9E6A",
    edge: "#1F7A4F",
    clip: "tys-mode-add",
  },
];

export const VOICE: GameVoice = { welcome: "tys-welcome", done: "tys-done" };

export type ToyId = Extract<PictureId, "bear" | "ball" | "drum" | "train" | "horse">;
export const TOYS: readonly ToyId[] = ["bear", "ball", "drum", "train", "horse"];

/** Which sesame pal is shopping this round. */
export type Customer = "ruby" | "bo";

/* ── Pick the Toys ────────────────────────────────────────────────────────── */

export interface PickRound {
  customer: Customer;
  /** The toy asked for… */
  toy: ToyId;
  /** …and how many. */
  count: number;
  /** The six toys on the shelf, left to right, top row first. */
  shelf: readonly ToyId[];
}

export const PICK_ROUNDS: readonly PickRound[] = [
  {
    customer: "ruby",
    toy: "train",
    count: 1,
    shelf: ["ball", "train", "drum", "horse", "bear", "ball"],
  },
  {
    customer: "bo",
    toy: "ball",
    count: 2,
    shelf: ["ball", "horse", "drum", "bear", "ball", "train"],
  },
  {
    customer: "ruby",
    toy: "bear",
    count: 3,
    shelf: ["bear", "drum", "bear", "train", "ball", "bear"],
  },
  {
    customer: "bo",
    toy: "drum",
    count: 4,
    shelf: ["drum", "horse", "drum", "drum", "ball", "drum"],
  },
];

/** The clip that asks: "Ruby wants 2 balls!" */
export const pickAsk = (r: PickRound) => `tys-ask-${r.customer}-${r.count}-${r.toy}`;

/* ── Add Them Up ──────────────────────────────────────────────────────────── */

export interface AddRound {
  customer: Customer;
  toy: ToyId;
  a: number;
  b: number;
  /** The three number buttons, in the order shown. */
  choices: readonly number[];
}

/** Three easy levels, four rounds each, never past a total of 5: tiny totals
 *  (2–4), small ones (up to 5, starting low) and the biggest (4 and 5). */
export const ADD_LEVELS: Readonly<Record<AddLevel, readonly AddRound[]>> = {
  add1: [
    { customer: "bo", toy: "ball", a: 1, b: 1, choices: [3, 2, 1] },
    { customer: "ruby", toy: "drum", a: 2, b: 1, choices: [2, 4, 3] },
    { customer: "bo", toy: "bear", a: 1, b: 2, choices: [3, 1, 2] },
    { customer: "ruby", toy: "horse", a: 2, b: 2, choices: [3, 5, 4] },
  ],
  add2: [
    { customer: "ruby", toy: "train", a: 3, b: 1, choices: [5, 3, 4] },
    { customer: "bo", toy: "bear", a: 1, b: 3, choices: [4, 3, 5] },
    { customer: "ruby", toy: "ball", a: 2, b: 2, choices: [2, 4, 3] },
    { customer: "bo", toy: "drum", a: 3, b: 2, choices: [5, 3, 4] },
  ],
  add3: [
    { customer: "bo", toy: "horse", a: 2, b: 3, choices: [4, 5, 3] },
    { customer: "ruby", toy: "bear", a: 4, b: 1, choices: [3, 5, 4] },
    { customer: "bo", toy: "train", a: 1, b: 4, choices: [4, 5, 3] },
    { customer: "ruby", toy: "ball", a: 3, b: 2, choices: [5, 4, 3] },
  ],
};

/** The full spoken asks that were recorded ("2 drums and 1 drum. How many?"). */
const RECORDED_ADD = new Set(["1-1-ball", "2-1-drum", "1-3-bear", "2-3-horse"]);

/** What is said when an add round opens: the recorded ask where there is one,
 *  otherwise the sum itself, "two … plus … one". */
export function addAskLines(r: AddRound): string[] {
  return RECORDED_ADD.has(`${r.a}-${r.b}-${r.toy}`)
    ? [addAsk(r)]
    : [`number-${r.a}`, "math-plus", `number-${r.b}`];
}

export const addAsk = (r: AddRound) => `tys-add-${r.a}-${r.b}-${r.toy}`;

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();

  need(PICK_ROUNDS.length === ROUND_COUNT, `pick: ${PICK_ROUNDS.length} rounds`);
  for (const [lvl, rs] of Object.entries(ADD_LEVELS))
    need(rs.length === ROUND_COUNT, `${lvl}: ${rs.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  // pick: six toys, at least N of the one asked for, at least one other kind
  PICK_ROUNDS.forEach((r, i) => {
    const have = r.shelf.filter((t) => t === r.toy).length;
    need(r.shelf.length === 6, `pick ${i}: not six toys on the shelf`);
    need(inRange(r.count), `pick ${i}: count outside 1–5`);
    need(have >= r.count, `pick ${i}: only ${have} ${r.toy} for ${r.count}`);
    need(
      r.shelf.some((t) => t !== r.toy),
      `pick ${i}: no wrong toy to tell apart`
    );
  });
  need(
    PICK_ROUNDS.map((r) => r.count).join() === "1,2,3,4",
    "pick: the counts should be 1, 2, 3, 4"
  );
  need(distinct(PICK_ROUNDS.map((r) => r.toy)), "pick: the same toy asked for twice");

  // add: three easy levels — tiny, small and bigger totals — each with three
  // distinct choices holding the total, the others close
  const top = { add1: 4, add2: 5, add3: 5 } as const;
  for (const [lvl, rs] of Object.entries(ADD_LEVELS) as [keyof typeof top, readonly AddRound[]][]) {
    rs.forEach((r, i) => {
      const sum = r.a + r.b;
      const name = `${lvl} ${i}`;
      need(inRange(r.a) && inRange(r.b) && inRange(sum), `${name}: a number outside 1–5`);
      need(sum <= top[lvl], `${name}: total ${sum} is past ${top[lvl]}`);
      need(r.choices.length === 3 && distinct(r.choices), `${name}: not three different choices`);
      need(r.choices.filter((c) => c === sum).length === 1, `${name}: the total is not a choice`);
      need(r.choices.every(inRange), `${name}: a choice outside 1–5`);
      need(
        r.choices.every((c) => Math.abs(c - sum) <= 2),
        `${name}: a wrong choice is not close`
      );
      need(r.choices.join() !== [...r.choices].sort().join(), `${name}: choices in counting order`);
    });
    noRepeats(
      lvl,
      rs.map((r) => `${r.a}+${r.b}`)
    );
    need(distinct(rs.map((r) => r.toy)), `${lvl}: the same toy twice`);
  }

  return problems;
}
