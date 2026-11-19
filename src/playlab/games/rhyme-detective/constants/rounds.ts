/**
 * Rhyme Detective — a search-and-tap rhyme game for three- to five-year-olds.
 * The case file shows one picture ("cat"); a cosy room is full of things on
 * shelves, a bed, a table and the floor. The detective's lens names each one
 * in turn, then the child taps the thing that rhymes (the hat). The last two
 * rounds hide TWO rhymes in the room.
 *
 * One module (the portal gives each activity one game), six rounds, two
 * rooms taking turns: the bedroom and the kitchen.
 */

import {
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "find";
export const MODULE_IDS: readonly ModuleId[] = ["find"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "find",
    name: "Rhyme Detective",
    tag: "Find the thing that rhymes",
    accent: "#7A5BC4",
    edge: "#553C93",
    clip: "rdt-mode-find",
  },
];

export const VOICE: GameVoice = { welcome: "rdt-welcome", done: "rdt-done" };

/** "Find something that rhymes with…" (then the word). */
export const FIND = "rdt-find";
/** "Find two things that rhyme with…" (then the word). */
export const FIND_TWO = "rdt-find-two";
/** "Find one more!" — after the first of two. */
export const MORE = "rdt-more";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const DETECTIVE_ROUNDS = 6;

export type Scene = "bedroom" | "kitchen";

/**
 * Where a thing can sit in a room, as a fraction of the room box (its
 * centre): the window sill, two on the wall shelf, the left surface (bedside
 * table / counter), the right surface (bed / table), the middle of the floor
 * and the floor at the left. The room's furniture is drawn around the same
 * seven places in both rooms, landscape and upright.
 */
export const SPOTS_WIDE: readonly (readonly [number, number])[] = [
  [800 / 1600, 270 / 900],
  [1250 / 1600, 160 / 900],
  [1460 / 1600, 160 / 900],
  [560 / 1600, 470 / 900],
  [1190 / 1600, 560 / 900],
  [860 / 1600, 780 / 900],
  [560 / 1600, 800 / 900],
];
export const SPOTS_TALL: readonly (readonly [number, number])[] = [
  [640 / 900, 300 / 1400],
  [140 / 900, 470 / 1400],
  [350 / 900, 470 / 1400],
  [750 / 900, 690 / 1400],
  [620 / 900, 1020 / 1400],
  [440 / 900, 1290 / 1400],
  [790 / 900, 1290 / 1400],
];

/**
 * Where the things stand in the simplified room: a tidy grid of picture
 * cards (no furniture), as fractions of the room box (each card's centre).
 * Wide: two rows to the right of the case file and the detective (3 + 3, or
 * 4 + 3). Upright: rows of three under the case file.
 */
export function gridSpot(i: number, n: number, tall: boolean): readonly [number, number] {
  if (!tall) {
    const top = Math.ceil(n / 2);
    const row = i < top ? 0 : 1;
    const inRow = row === 0 ? top : n - top;
    const col = row === 0 ? i : i - top;
    const gap = 0.19;
    const mid = 0.6;
    return [mid + (col - (inRow - 1) / 2) * gap, row === 0 ? 0.3 : 0.72];
  }
  const rows = Math.ceil(n / 3);
  const row = Math.floor(i / 3);
  const inRow = Math.min(3, n - row * 3);
  const col = i % 3;
  const first = rows === 2 ? 0.5 : 0.42;
  return [0.5 + (col - (inRow - 1) / 2) * 0.3, first + row * 0.2];
}

export interface Case {
  scene: Scene;
  /** The case file's picture. */
  target: Word;
  /** What rhymes with it, hidden in the room. */
  answers: readonly Word[];
  /** Everything in the room, in spot order (spot i holds things[i]). */
  things: readonly Word[];
}

export const ROUNDS: readonly Case[] = [
  {
    scene: "bedroom",
    target: "cat",
    answers: ["hat"],
    things: ["ball", "hat", "duck", "cup", "shoe", "apple"],
  },
  {
    scene: "kitchen",
    target: "moon",
    answers: ["spoon"],
    things: ["apple", "cup", "fish", "egg", "spoon", "banana"],
  },
  {
    scene: "bedroom",
    target: "frog",
    answers: ["dog"],
    things: ["drum", "bear", "key", "shoe", "duck", "dog"],
  },
  {
    scene: "kitchen",
    target: "snake",
    answers: ["cake"],
    things: ["mug", "egg", "cup", "cake", "banana", "fish"],
  },
  {
    scene: "bedroom",
    target: "car",
    answers: ["star", "jar"],
    things: ["ball", "star", "drum", "shoe", "jar", "duck", "key"],
  },
  {
    scene: "kitchen",
    target: "hen",
    answers: ["pen", "ten"],
    things: ["spoon", "pen", "cake", "mug", "apple", "fish", "ten"],
  },
];

/** Self-check: six rounds, each room 6–7 things in its seven spots, every
 *  answer in the room and rhyming, nothing else rhyming with the target or
 *  with an answer, and the rooms taking turns. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === DETECTIVE_ROUNDS, `${ROUNDS.length} rounds`);
  need(SPOTS_WIDE.length === SPOTS_TALL.length, "the two spot lists differ");
  const answerAt: number[] = [];
  ROUNDS.forEach((r, i) => {
    const n = r.things.length;
    need(n >= 6 && n <= SPOTS_WIDE.length, `round ${i}: ${n} things`);
    need(distinct(r.things), `round ${i}: a thing twice`);
    need(!r.things.includes(r.target), `round ${i}: the target is in the room`);
    need(r.answers.length === (i >= 4 ? 2 : 1), `round ${i}: ${r.answers.length} answers`);
    for (const a of r.answers) {
      need(r.things.includes(a), `round ${i}: ${a} is not in the room`);
      need(rhymes(a, r.target), `round ${i}: ${a} does not rhyme with ${r.target}`);
      answerAt.push(r.things.indexOf(a));
    }
    const others = r.things.filter((t) => !r.answers.includes(t));
    for (const t of others) {
      need(!rhymes(t, r.target), `round ${i}: ${t} rhymes with ${r.target} too`);
      for (const x of others) need(!rhymes(t, x), `round ${i}: ${t} and ${x} rhyme`);
    }
    need(
      r.scene === (i % 2 === 0 ? "bedroom" : "kitchen"),
      `round ${i}: the rooms do not take turns`
    );
  });
  // the answer is not always in the same place
  need(new Set(answerAt).size >= 4, "the answers sit in too few places");
  return problems;
}
