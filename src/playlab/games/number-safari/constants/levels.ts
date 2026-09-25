import type { PictureId } from "@games/blend-read/components/PictureArt";

/**
 * Number Safari — every level, as data.
 *
 * Two kinds of puzzle, both lifted from Numbers 1 – 5 because they are the two
 * that earn their keep, re-dressed with new things to count:
 *
 *   sequence — things in a line each wearing a number, one of them a black
 *              circle: pick the missing number and it flies into place.
 *   count    — a picture with some things in it: pick how many, and the right
 *              number lights up green.
 *
 * The three runs are three different NUMBER RANGES, which is what makes them
 * genuinely harder rather than merely fiddlier:
 *
 *   easy    1 – 5    counting one at a time
 *   medium  1 – 10   still one at a time, but past the first hand
 *   tricky  10 – 50  counting in fives and tens, where the line no longer
 *                    steps by one and a picture holds twenty things
 *
 * Nothing on these screens is drawn by this game: `ant` is Numbers 1 – 5's own
 * ant, every other theme is one of the seventy pictures Blend & Seek already
 * ships, and the grown-up is Key Quest's teacher.
 */

export type Difficulty = "easy" | "medium" | "hard";

/** The colour a run's number bubbles wear. */
export type Tone = "blue" | "purple" | "cyan" | "white";

/** The backdrop a level is set in — painted in the stylesheet. */
export type Scene = "leaf" | "meadow" | "shelf" | "sky";

/** What the child is counting. `ant` is drawn by Numbers 1 – 5's `Thing`;
 *  everything else is a Blend & Seek picture. */
export type Theme = "ant" | PictureId;

interface LevelBase {
  id: string;
  difficulty: Difficulty;
  scene: Scene;
  theme: Theme;
  tone: Tone;
  /** The teacher stands on this screen and jumps when it is solved. */
  teacher?: boolean;
}

export interface CountLevel extends LevelBase {
  kind: "count";
  /** How many of the theme's thing are shown — the answer. */
  count: number;
  choices: readonly number[];
  /** Which side the panel of choices sits on. */
  panel: "left" | "right";
  /**
   * A second kind of thing scattered in with the first. The child counts the
   * theme and ignores these — the reason the answer can never be "however many
   * things are on screen".
   */
  decoy?: { theme: Theme; count: number };
}

export interface SequenceLevel extends LevelBase {
  kind: "sequence";
  /** The first number in the line. */
  start: number;
  /** How many things are in the line. */
  length: number;
  /** What the line counts by — 1 on the easy runs, 5 or 10 on the tricky one. */
  step?: number;
  /** The one that is a black circle instead — the answer. */
  missing: number;
  choices: readonly number[];
  /** Where the choices sit, clear of the line. */
  choicesAt: "top-left" | "bottom-right";
}

export type Level = CountLevel | SequenceLevel;

/** The numbers a sequence level shows, left to right. One place that knows how
 *  a line is built, so a stepped line can never disagree with its own gap. */
export function numbersFor(level: SequenceLevel): number[] {
  const step = level.step ?? 1;
  return Array.from({ length: level.length }, (_, i) => level.start + i * step);
}

/** Past five, a picture holds too many things to scatter — they line up in
 *  rows instead, which is also how a child is taught to count a big group. */
export const SCATTER_MAX = 5;

/** EASY — ones to fives. Three things in a line, two numbers to choose from. */
const EASY: readonly Level[] = [
  {
    id: "easy-ants-3",
    kind: "count",
    difficulty: "easy",
    scene: "leaf",
    theme: "ant",
    tone: "blue",
    count: 3,
    choices: [3, 1],
    panel: "right",
    teacher: true,
  },
  {
    id: "easy-stars-missing-2",
    kind: "sequence",
    difficulty: "easy",
    scene: "sky",
    theme: "star",
    tone: "purple",
    start: 1,
    length: 3,
    missing: 2,
    choices: [2, 3],
    choicesAt: "top-left",
  },
  {
    id: "easy-apples-2",
    kind: "count",
    difficulty: "easy",
    scene: "shelf",
    theme: "apple",
    tone: "white",
    count: 2,
    choices: [2, 4],
    panel: "left",
    teacher: true,
  },
  {
    id: "easy-ants-missing-3",
    kind: "sequence",
    difficulty: "easy",
    scene: "leaf",
    theme: "ant",
    tone: "blue",
    start: 1,
    length: 3,
    missing: 3,
    choices: [3, 1],
    choicesAt: "top-left",
  },
  {
    id: "easy-cakes-4",
    kind: "count",
    difficulty: "easy",
    scene: "shelf",
    theme: "cake",
    tone: "white",
    count: 4,
    choices: [4, 2],
    panel: "right",
  },
  {
    id: "easy-cups-missing-5",
    kind: "sequence",
    difficulty: "easy",
    scene: "meadow",
    theme: "cup",
    tone: "cyan",
    start: 3,
    length: 3,
    missing: 5,
    choices: [5, 4],
    choicesAt: "bottom-right",
    teacher: true,
  },
];

/** MEDIUM — all the way to ten. Five in a line, three numbers to choose from. */
const MEDIUM: readonly Level[] = [
  {
    id: "med-ants-missing-4",
    kind: "sequence",
    difficulty: "medium",
    scene: "leaf",
    theme: "ant",
    tone: "blue",
    start: 1,
    length: 5,
    missing: 4,
    choices: [4, 5, 3],
    choicesAt: "top-left",
  },
  {
    id: "med-stars-7",
    kind: "count",
    difficulty: "medium",
    scene: "sky",
    theme: "star",
    tone: "white",
    count: 7,
    choices: [7, 9, 5],
    panel: "right",
    teacher: true,
  },
  {
    id: "med-boxes-missing-8",
    kind: "sequence",
    difficulty: "medium",
    scene: "shelf",
    theme: "box",
    tone: "purple",
    start: 6,
    length: 5,
    missing: 8,
    choices: [8, 9, 7],
    choicesAt: "bottom-right",
  },
  {
    // the ants' own screen, counting instead of ordering
    id: "med-ants-10",
    kind: "count",
    difficulty: "medium",
    scene: "leaf",
    theme: "ant",
    tone: "blue",
    count: 10,
    choices: [10, 8, 6],
    panel: "right",
    teacher: true,
  },
  {
    id: "med-crabs-missing-10",
    kind: "sequence",
    difficulty: "medium",
    scene: "meadow",
    theme: "crab",
    tone: "cyan",
    start: 6,
    length: 5,
    missing: 10,
    choices: [10, 9, 8],
    choicesAt: "bottom-right",
  },
  {
    id: "med-cupcakes-6",
    kind: "count",
    difficulty: "medium",
    scene: "shelf",
    theme: "cupcake",
    tone: "white",
    count: 6,
    choices: [6, 8, 4],
    panel: "left",
    teacher: true,
  },
];

/** TRICKY — tens and fives, from ten to fifty. The line steps by more than one
 *  and a picture holds a group worth counting in rows. */
const HARD: readonly Level[] = [
  {
    id: "hard-ants-missing-30",
    kind: "sequence",
    difficulty: "hard",
    scene: "leaf",
    theme: "ant",
    tone: "blue",
    start: 10,
    length: 5,
    step: 10,
    missing: 30,
    choices: [30, 40, 20, 50],
    choicesAt: "top-left",
  },
  {
    id: "hard-stars-20",
    kind: "count",
    difficulty: "hard",
    scene: "sky",
    theme: "star",
    tone: "white",
    count: 20,
    choices: [20, 30, 10, 40],
    panel: "right",
    teacher: true,
  },
  {
    id: "hard-cubes-missing-35",
    kind: "sequence",
    difficulty: "hard",
    scene: "shelf",
    theme: "cube",
    tone: "purple",
    start: 25,
    length: 4,
    step: 5,
    missing: 35,
    choices: [35, 30, 40, 45],
    choicesAt: "bottom-right",
  },
  {
    id: "hard-ants-30",
    kind: "count",
    difficulty: "hard",
    scene: "leaf",
    theme: "ant",
    tone: "blue",
    count: 30,
    choices: [30, 20, 40, 50],
    panel: "right",
    teacher: true,
  },
  {
    id: "hard-crowns-missing-45",
    kind: "sequence",
    difficulty: "hard",
    scene: "meadow",
    theme: "crown",
    tone: "cyan",
    start: 30,
    length: 5,
    step: 5,
    missing: 45,
    choices: [45, 40, 50, 35],
    choicesAt: "bottom-right",
  },
  {
    id: "hard-balls-10",
    kind: "count",
    difficulty: "hard",
    scene: "meadow",
    theme: "ball",
    tone: "white",
    count: 10,
    decoy: { theme: "acorn", count: 2 },
    choices: [10, 20, 30, 40],
    panel: "left",
    teacher: true,
  },
];

export const RUNS: Record<Difficulty, readonly Level[]> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
};

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/** What each run counts — shown on its plate, so the choice is honest. */
export const DIFFICULTY_RANGE: Record<Difficulty, string> = {
  easy: "1 – 5",
  medium: "1 – 10",
  hard: "10 – 50",
};

/** How many levels a run is. */
export function runLength(difficulty: Difficulty): number {
  return RUNS[difficulty].length;
}

/**
 * Stars for a finished run. A clean run is three; every couple of wrong
 * answers costs one, and the floor is one — finishing is always worth
 * something, which is the portal's rule everywhere.
 */
export function starsFor(misses: number): number {
  if (misses === 0) return 3;
  if (misses <= 2) return 2;
  return 1;
}
