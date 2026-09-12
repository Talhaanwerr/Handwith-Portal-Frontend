/**
 * Numbers 1 – 5 — every level, as data.
 *
 * Three kinds of puzzle, each the shape of one screen in the reference:
 *
 *   match     — cards of things (2 stars, 3 stars, 5 stars) over black
 *               circles, and the numbers in a strip below: put each number
 *               under its card.
 *   sequence  — things labelled in order with one number missing (a black
 *               circle): pick the missing number from the choices and it
 *               flies into place.
 *   count     — a picture with some things in it: pick how many from the
 *               choices, and the right one lights up green.
 *
 * Every level is a scene (the backdrop), a theme (what is drawn), the numbers
 * involved and where the choices sit. Adding a level is adding a row.
 */

export type Theme =
  | "star"
  | "apple"
  | "balloon"
  | "ant"
  | "door"
  | "bird"
  | "fish"
  | "flower"
  | "cupcake"
  | "duck"
  | "kite"
  | "block";

/** The backdrop a level is set in — colours and props, see the stylesheet. */
export type Scene = "field" | "park" | "hall" | "classroom" | "board" | "panel";

export type CharacterId = "pip" | "momo" | "nova" | "rusty" | "dot";

/** The colour a level's number bubbles wear — each screen in the reference
 *  has its own. */
export type Tone = "purple" | "blue" | "cyan" | "white";

interface LevelBase {
  id: string;
  scene: Scene;
  theme: Theme;
  tone: Tone;
  /** The friend on this screen, if any. */
  character?: CharacterId;
}

export interface CountLevel extends LevelBase {
  kind: "count";
  /** How many of the theme's thing are shown — the answer. */
  count: number;
  choices: readonly number[];
  /** Which side the choice panel sits on. */
  panel: "left" | "right";
}

export interface SequenceLevel extends LevelBase {
  kind: "sequence";
  /** The run of numbers shown, `start` to `start + length - 1`. */
  start: number;
  length: number;
  /** The one that is a black circle instead — the answer. */
  missing: number;
  choices: readonly number[];
  /** Where the choices sit. */
  choicesAt: "top-left" | "bottom-right";
}

export interface MatchLevel extends LevelBase {
  kind: "match";
  /** How many things each card shows, left to right. Distinct. */
  cards: readonly number[];
  /** The same numbers, in the order the strip shows them. */
  choices: readonly number[];
}

export type Level = CountLevel | SequenceLevel | MatchLevel;

export const LEVELS: readonly Level[] = [
  // ── the six screens of the reference, in order ──
  {
    id: "stars-2-3-5",
    kind: "match",
    scene: "board",
    theme: "star",
    tone: "purple",
    cards: [2, 3, 5],
    choices: [3, 5, 2],
    character: "rusty",
  },
  {
    id: "balloons-missing-4",
    kind: "sequence",
    scene: "park",
    theme: "balloon",
    tone: "purple",
    start: 1,
    length: 5,
    missing: 4,
    choices: [4, 5],
    choicesAt: "bottom-right",
    character: "dot",
  },
  {
    id: "birds-5",
    kind: "count",
    scene: "panel",
    theme: "bird",
    tone: "white",
    count: 5,
    choices: [5, 4, 2],
    panel: "right",
    character: "momo",
  },
  {
    id: "ants-missing-4",
    kind: "sequence",
    scene: "field",
    theme: "ant",
    tone: "blue",
    start: 1,
    length: 5,
    missing: 4,
    choices: [4, 5],
    choicesAt: "top-left",
  },
  {
    id: "doors-missing-4",
    kind: "sequence",
    scene: "hall",
    theme: "door",
    tone: "cyan",
    start: 2,
    length: 3,
    missing: 4,
    choices: [4, 5],
    choicesAt: "bottom-right",
    character: "momo",
  },
  {
    id: "apples-4",
    kind: "count",
    scene: "classroom",
    theme: "apple",
    tone: "white",
    count: 4,
    choices: [4, 2],
    panel: "left",
    character: "dot",
  },
  // ── and on: the same three puzzles with new things to count ──
  {
    id: "fish-1-4-3",
    kind: "match",
    scene: "board",
    theme: "fish",
    tone: "purple",
    cards: [1, 4, 3],
    choices: [4, 3, 1],
    character: "nova",
  },
  {
    id: "balloons-missing-2",
    kind: "sequence",
    scene: "park",
    theme: "balloon",
    tone: "purple",
    start: 1,
    length: 5,
    missing: 2,
    choices: [2, 3],
    choicesAt: "bottom-right",
    character: "pip",
  },
  {
    id: "flowers-3",
    kind: "count",
    scene: "panel",
    theme: "flower",
    tone: "white",
    count: 3,
    choices: [3, 5, 1],
    panel: "left",
    character: "pip",
  },
  {
    id: "ants-missing-3",
    kind: "sequence",
    scene: "field",
    theme: "ant",
    tone: "blue",
    start: 1,
    length: 5,
    missing: 3,
    choices: [3, 4],
    choicesAt: "top-left",
  },
  {
    id: "ducks-2",
    kind: "count",
    scene: "classroom",
    theme: "duck",
    tone: "white",
    count: 2,
    choices: [2, 4],
    panel: "left",
    character: "rusty",
  },
  {
    id: "doors-missing-2",
    kind: "sequence",
    scene: "hall",
    theme: "door",
    tone: "cyan",
    start: 1,
    length: 3,
    missing: 2,
    choices: [2, 5],
    choicesAt: "bottom-right",
    character: "nova",
  },
  {
    id: "cupcakes-3-1-2",
    kind: "match",
    scene: "board",
    theme: "cupcake",
    tone: "purple",
    cards: [3, 1, 2],
    choices: [1, 2, 3],
    character: "dot",
  },
  {
    id: "kites-5",
    kind: "count",
    scene: "panel",
    theme: "kite",
    tone: "white",
    count: 5,
    choices: [5, 3, 4],
    panel: "right",
    character: "nova",
  },
  {
    id: "balloons-missing-5",
    kind: "sequence",
    scene: "park",
    theme: "balloon",
    tone: "purple",
    start: 1,
    length: 5,
    missing: 5,
    choices: [5, 4],
    choicesAt: "bottom-right",
    character: "momo",
  },
  {
    id: "blocks-1",
    kind: "count",
    scene: "classroom",
    theme: "block",
    tone: "white",
    count: 1,
    choices: [1, 2],
    panel: "left",
    character: "rusty",
  },
  {
    id: "ants-missing-1",
    kind: "sequence",
    scene: "field",
    theme: "ant",
    tone: "blue",
    start: 1,
    length: 5,
    missing: 1,
    choices: [1, 2],
    choicesAt: "top-left",
  },
  {
    id: "stars-4-2-5",
    kind: "match",
    scene: "board",
    theme: "star",
    tone: "purple",
    cards: [4, 2, 5],
    choices: [2, 5, 4],
    character: "pip",
  },
  {
    id: "apples-3",
    kind: "count",
    scene: "classroom",
    theme: "apple",
    tone: "white",
    count: 3,
    choices: [3, 4],
    panel: "left",
    character: "dot",
  },
  {
    id: "doors-missing-5",
    kind: "sequence",
    scene: "hall",
    theme: "door",
    tone: "cyan",
    start: 3,
    length: 3,
    missing: 5,
    choices: [5, 4],
    choicesAt: "bottom-right",
    character: "momo",
  },
  {
    id: "birds-4",
    kind: "count",
    scene: "panel",
    theme: "bird",
    tone: "white",
    count: 4,
    choices: [4, 5, 2],
    panel: "right",
    character: "momo",
  },
  {
    id: "flowers-5-3-1",
    kind: "match",
    scene: "board",
    theme: "flower",
    tone: "purple",
    cards: [5, 3, 1],
    choices: [3, 1, 5],
    character: "rusty",
  },
];

export const TOTAL_LEVELS = LEVELS.length;

/** A friend pops up to celebrate after every this many levels. */
export const BREAK_EVERY = 4;
