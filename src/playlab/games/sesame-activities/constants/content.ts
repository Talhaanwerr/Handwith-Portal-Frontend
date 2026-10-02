import type { PictureId } from "@games/blend-read/components/PictureArt";
import { clipText } from "@shared/audio/voice";

/**
 * Level data for Play Street Pals — two modules, each ONE mechanic played
 * for six rounds with the same layout every round; only the content changes.
 * Everything is a plain constant (never `Math.random()` at render), every
 * answer is DERIVED from the data (never stored twice), and `checkRounds()`
 * proves each module solvable and fair — the same guarantee as Math Maze's
 * `checkMaze`.
 */

export type ModuleId = "colours" | "snack";

export const MODULE_IDS: readonly ModuleId[] = ["colours", "snack"];

export const MODULES: Record<
  ModuleId,
  {
    title: string;
    tag: string;
    /** Said when the card is tapped ("Colour Match! Find the ball …"). */
    clip: string;
    /** Said on the finish card, after the cheer. */
    doneClip: string;
  }
> = {
  colours: {
    title: "Colour Match",
    tag: "Find the ball Percy is holding",
    clip: "street-mode-colours",
    doneClip: "street-done-colours",
  },
  snack: {
    title: "Snack Time",
    tag: "Give the hungry pal their snack",
    clip: "street-mode-snack",
    doneClip: "street-done-snack",
  },
};

/** The home screen's hello: "Hi, pals! Pick a game to play." */
export const WELCOME_CLIP = "street-welcome";
/** After the "That one is blue." for a wrong ball. */
export const TRY_AGAIN_CLIP = "instr-try-again";

/** Rounds in every module. */
export const ROUNDS = 6;

/** Stars for a finished module, from the number of wrong taps. */
export function starsFor(misses: number): number {
  if (misses <= 0) return 3;
  return misses <= 3 ? 2 : 1;
}

// ─── Colour Match: Percy holds up a ball; tap the ball of the same colour ──

export const SA_COLORS: Record<string, { fill: string; edge: string; light: string }> = {
  red: { fill: "#F2665A", edge: "#B8392F", light: "#FFB3A8" },
  blue: { fill: "#4E9CF0", edge: "#2766B8", light: "#B5DAFF" },
  yellow: { fill: "#F7CB3F", edge: "#C9951A", light: "#FFF0A8" },
  green: { fill: "#5DBB5D", edge: "#337F33", light: "#BEEBB0" },
  purple: { fill: "#A97FF0", edge: "#6E47B8", light: "#DCCBFF" },
  orange: { fill: "#F59540", edge: "#C2621A", light: "#FFD2A3" },
};

export interface ColourRound {
  target: string;
  /** Four balls, left to right; exactly one is the target colour. */
  balls: readonly string[];
}

export const COLOUR_ROUNDS: readonly ColourRound[] = [
  { target: "red", balls: ["blue", "red", "yellow", "green"] },
  { target: "blue", balls: ["blue", "orange", "purple", "red"] },
  { target: "yellow", balls: ["green", "purple", "yellow", "orange"] },
  { target: "green", balls: ["red", "yellow", "blue", "green"] },
  { target: "purple", balls: ["purple", "green", "orange", "blue"] },
  { target: "orange", balls: ["yellow", "orange", "red", "purple"] },
];

// ─── Snack Time: a pal thinks of a food; tap the plate with that food ──────

export type PalId = "ruby" | "bo";

export const PAL_NAMES: Record<PalId, string> = { ruby: "Ruby", bo: "Bo" };

export interface SnackRound {
  who: PalId;
  food: PictureId;
  /** Four plates, left to right (top-left, top-right, bottom-left,
   *  bottom-right upright); exactly one holds `food`. */
  plates: readonly PictureId[];
}

export const SNACK_ROUNDS: readonly SnackRound[] = [
  { who: "ruby", food: "apple", plates: ["apple", "cupcake", "cheese", "juice"] },
  { who: "bo", food: "cupcake", plates: ["cheese", "juice", "cupcake", "apple"] },
  { who: "ruby", food: "cheese", plates: ["plum", "cheese", "cake", "meat"] },
  { who: "bo", food: "juice", plates: ["juice", "meat", "plum", "cupcake"] },
  { who: "ruby", food: "cake", plates: ["bowl", "apple", "juice", "cake"] },
  { who: "bo", food: "plum", plates: ["cake", "plum", "bowl", "cheese"] },
];

// ─── The answers, derived — and the proof every round is fair ──────────────

export function colourAnswer(r: ColourRound): number {
  return r.balls.indexOf(r.target);
}
export function snackAnswer(r: SnackRound): number {
  return r.plates.indexOf(r.food);
}

// ─── The recorded lines, derived from the same data ────────────────────────

/** "Percy has a red ball. Find the red ball!" — the round's prompt. */
export function colourClip(r: ColourRound): string {
  return `street-ball-${r.target}`;
}
/** "That one is blue." — names the ball that was tapped. */
export function ballClip(colorKey: string): string {
  return `friends-is-${colorKey}`;
}
/** "Ruby is hungry! Ruby wants an apple." — the round's prompt. */
export function snackClip(r: SnackRound): string {
  return `street-snack-${r.who}-${r.food}`;
}
/** "Not that one. What does Ruby want?" */
export function snackWrongClip(r: SnackRound): string {
  return `street-wrong-${r.who}`;
}
/** "Yum! Thank you!" — the pal thanks you (in place of a cheer). */
export function snackYumClip(r: SnackRound): string {
  return `street-yum-${r.who}`;
}

function missingClips(name: string, ids: readonly string[]): string[] {
  return ids.filter((id) => !clipText(id)).map((id) => `${name}: clip "${id}" not in manifest`);
}

/** One module's round list, checked: six rounds, four distinct choices,
 *  exactly one right answer, and never the same target (or, for snacks, the
 *  same pal) twice in a row. */
function checkList<T>(
  name: string,
  rounds: readonly T[],
  target: (r: T) => string,
  choices: (r: T) => readonly string[],
  extra?: (r: T, prev: T | undefined) => string | null
): string[] {
  const problems: string[] = [];
  if (rounds.length !== ROUNDS) problems.push(`${name}: ${rounds.length} rounds, want ${ROUNDS}`);
  rounds.forEach((r, i) => {
    const c = choices(r);
    const hits = c.filter((x) => x === target(r)).length;
    if (c.length !== 4) problems.push(`${name} ${i}: ${c.length} choices, want 4`);
    if (new Set(c).size !== c.length) problems.push(`${name} ${i}: repeated choice`);
    if (hits !== 1) problems.push(`${name} ${i}: ${hits} right answers, want 1`);
    const prev = rounds[i - 1];
    if (prev && target(prev) === target(r)) problems.push(`${name} ${i}: same target twice`);
    const more = extra?.(r, prev);
    if (more) problems.push(`${name} ${i}: ${more}`);
  });
  return problems;
}

/** Proves both modules are solvable and fair. Not called at runtime
 *  (same as `checkMaze`); the harness calls it and expects `[]`. */
export function checkRounds(): string[] {
  return [
    ...checkList(
      "colours",
      COLOUR_ROUNDS,
      (r) => r.target,
      (r) => r.balls,
      (r) => (SA_COLORS[r.target] ? null : `unknown colour ${r.target}`)
    ),
    ...COLOUR_ROUNDS.flatMap((r, i) =>
      missingClips(`colours ${i}`, [colourClip(r), ...r.balls.map(ballClip)])
    ),
    ...SNACK_ROUNDS.flatMap((r, i) =>
      missingClips(`snack ${i}`, [snackClip(r), snackWrongClip(r), snackYumClip(r)])
    ),
    ...missingClips("fixed", [
      WELCOME_CLIP,
      TRY_AGAIN_CLIP,
      ...MODULE_IDS.flatMap((id) => [MODULES[id].clip, MODULES[id].doneClip]),
    ]),
    ...checkList(
      "snack",
      SNACK_ROUNDS,
      (r) => r.food,
      (r) => r.plates,
      (r, prev) => (prev && prev.who === r.who ? "same pal twice" : null)
    ),
  ];
}
