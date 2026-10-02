/**
 * Rainbow Shapes — the three modules and every round in them.
 *
 * THREE MODULES, ONE MECHANIC EACH. A child picks one on the title screen
 * and then does the same thing, in the same layout, for every round — only
 * the content changes:
 *
 *   colors — four tiles on Berry's shelf: "Find the red one!"
 *   shapes — three easels: "Tap the triangle!"
 *   sorter — a sorter board and a toy box: put each block in its hole
 *
 * Rounds are DEALT, not stored by hand: a fixed list of targets plus the
 * shared `unit()` hash decides the distractors and their order, so every run
 * is the same (GAME_DEV.md's no-Math.random rule) and nothing is typed twice.
 * The ANSWER is never a field of its own either — `answerFor` derives it from
 * the criterion — and `checkAllRounds()` proves every round is fair: exactly
 * one right tile, only the asked-for property decides it, and no target twice
 * in a row (Math Maze's `checkMaze`, Sorting Food's `checkActivity`).
 */

import { unit } from "@shared/utils/hash";
import { clipText } from "@shared/audio/voice";
import type { HueId, ShapeId } from "@games/shape-match/constants/shapes";

/* ── The modules ─────────────────────────────────────────────────────────── */

export type ModuleId = "colors" | "shapes" | "sorter";

export interface ModuleInfo {
  id: ModuleId;
  name: string;
  /** One line under the name on the title card. */
  tag: string;
  /** Read out for screen readers on the card. */
  aria: string;
  /** Said when the card is tapped ("Colors! Find the color."). */
  clip: string;
  /** Said on the finish card, after the cheer. */
  doneClip: string;
}

export const MODULES: readonly ModuleInfo[] = [
  {
    id: "colors",
    name: "Colors",
    tag: "Find the color",
    aria: "Colors — find the color",
    clip: "friends-mode-colors",
    doneClip: "friends-done-colors",
  },
  {
    id: "shapes",
    name: "Shapes",
    tag: "Tap the shape",
    aria: "Shapes — tap the shape",
    clip: "friends-mode-shapes",
    doneClip: "friends-done-shapes",
  },
  {
    id: "sorter",
    name: "Sorter",
    tag: "Blocks in their holes",
    aria: "Sorter — put each block in its hole",
    clip: "friends-mode-sorter",
    doneClip: "friends-done-sorter",
  },
];

/** The title screen's two lines: Berry's hello, then the ask (also the plate). */
export const WELCOME_CLIP = "friends-welcome";
export const PICK_CLIP = "friends-pick-a-game";

export function moduleInfo(id: ModuleId): ModuleInfo {
  return MODULES.find((m) => m.id === id) ?? MODULES[0];
}

export function isModuleId(value: unknown): value is ModuleId {
  return value === "colors" || value === "shapes" || value === "sorter";
}

/* ── Tap rounds (colors, shapes) ────────────────────────────────────────── */

export interface TapOption {
  id: string;
  shape: ShapeId;
  hue: HueId;
}

export interface TapCriterion {
  shape?: ShapeId;
  hue?: HueId;
}

export interface TapRound {
  id: string;
  /** The recorded line that asks this round's question (manifest id). */
  clip: string;
  /** The line on the instruction plate — always `clipText(clip)`, so the
   *  plate and the voice can never say different things. */
  prompt: string;
  criterion: TapCriterion;
  options: readonly TapOption[];
}

/** The everyday colour word for each paint. */
export const HUE_WORDS: Record<HueId, string> = {
  sun: "yellow",
  mango: "orange",
  cherry: "red",
  rose: "pink",
  grape: "purple",
  sky: "blue",
  leaf: "green",
};

const ALL_HUES: readonly HueId[] = ["cherry", "mango", "sun", "leaf", "sky", "grape", "rose"];

/** The "That one is red." / "That one is a circle." line for a wrong tile:
 *  it names what the child TAPPED, by the property the module asks about. */
export function wrongClipFor(module: "colors" | "shapes", option: TapOption): string {
  return module === "colors" ? `friends-is-${HUE_WORDS[option.hue]}` : `friends-is-${option.shape}`;
}

/** The "Red block!" line for a lifted sorter block. */
export function blockClipFor(hue: BlockHue): string {
  return `friends-block-${hue}`;
}

/** For screen readers: "red square", not the palette's "cherry square". */
export function optionLabel(option: TapOption): string {
  return `${HUE_WORDS[option.hue]} ${option.shape}`;
}

function matches(option: TapOption, criterion: TapCriterion): boolean {
  if (criterion.shape !== undefined && option.shape !== criterion.shape) return false;
  if (criterion.hue !== undefined && option.hue !== criterion.hue) return false;
  return true;
}

/** The one option a round's criterion picks out (`checkTapRound` proves
 *  there is exactly one). */
export function answerFor(round: TapRound): TapOption {
  return round.options.find((o) => matches(o, round.criterion)) ?? round.options[0];
}

/** A fixed shuffle: the same items and seed always come out the same way. */
function dealt<T>(items: readonly T[], seed: number): T[] {
  return items
    .map((value, k) => ({ value, key: unit(seed * 131 + k * 7) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.value);
}

/** Put the answer at a fixed place among the dealt distractors. */
function placed<T>(answer: T, others: readonly T[], at: number): T[] {
  const out = [...others];
  out.splice(at, 0, answer);
  return out;
}

/* colors: six different target colours; four tiles, four different colours
   AND four different shapes, so only the colour can pick the answer */
const COLOR_TARGETS: readonly HueId[] = ["cherry", "sky", "sun", "leaf", "grape", "mango"];
const TILE_SHAPES: readonly ShapeId[] = [
  "circle",
  "square",
  "triangle",
  "star",
  "heart",
  "diamond",
];

/** Where the answer sits in each round — never the same place twice running. */
const COLOR_SLOTS = [1, 3, 0, 2, 3, 1] as const;

const COLOR_ROUNDS: readonly TapRound[] = COLOR_TARGETS.map((target, i) => {
  const hues = placed(
    target,
    dealt(
      ALL_HUES.filter((h) => h !== target),
      100 + i
    ).slice(0, 3),
    COLOR_SLOTS[i]
  );
  const shapes = dealt(TILE_SHAPES, 200 + i).slice(0, 4);
  const options = hues.map((hue, k) => ({ id: `c${i}-${k}`, hue, shape: shapes[k] }));
  const clip = `friends-find-${HUE_WORDS[target]}`;
  return {
    id: `colors-${i}`,
    clip,
    prompt: clipText(clip),
    criterion: { hue: target },
    options,
  };
});

/* shapes: six different target shapes; three easels, three different shapes
   AND three different colours. A square is never set against a rectangle
   (too close for a first shapes game). */
const SHAPE_TARGETS: readonly ShapeId[] = [
  "triangle",
  "circle",
  "square",
  "star",
  "heart",
  "rectangle",
];
const EASEL_SHAPES: readonly ShapeId[] = [
  "triangle",
  "circle",
  "square",
  "star",
  "heart",
  "rectangle",
  "diamond",
];
const TOO_CLOSE: Partial<Record<ShapeId, ShapeId>> = { square: "rectangle", rectangle: "square" };

const SHAPE_SLOTS = [0, 2, 1, 2, 0, 1] as const;

const SHAPE_ROUNDS: readonly TapRound[] = SHAPE_TARGETS.map((target, i) => {
  const others = dealt(
    EASEL_SHAPES.filter((s) => s !== target && s !== TOO_CLOSE[target]),
    400 + i
  ).slice(0, 2);
  const hues = dealt(ALL_HUES, 500 + i).slice(0, 3);
  const options = placed(target, others, SHAPE_SLOTS[i]).map((shape, k) => ({
    id: `s${i}-${k}`,
    shape,
    hue: hues[k],
  }));
  const clip = `friends-tap-${target}`;
  return {
    id: `shapes-${i}`,
    clip,
    prompt: clipText(clip),
    criterion: { shape: target },
    options,
  };
});

export const TAP_ROUNDS: Record<"colors" | "shapes", readonly TapRound[]> = {
  colors: COLOR_ROUNDS,
  shapes: SHAPE_ROUNDS,
};

/* ── Sorter boards ──────────────────────────────────────────────────────── */

export type BlockHue = "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink";

export const BLOCK_COLORS: Record<BlockHue, { fill: string; edge: string }> = {
  red: { fill: "#F4553D", edge: "#C32E18" },
  orange: { fill: "#FF8A3D", edge: "#D3610F" },
  yellow: { fill: "#FFC93C", edge: "#D99A11" },
  green: { fill: "#5FCB52", edge: "#38982F" },
  teal: { fill: "#2FB6A8", edge: "#1D7A70" },
  blue: { fill: "#3DA5F4", edge: "#1476C0" },
  purple: { fill: "#9B5DE5", edge: "#6F35BC" },
  pink: { fill: "#FF7EB6", edge: "#D44C8B" },
};

const BLOCK_HUES = Object.keys(BLOCK_COLORS) as BlockHue[];

export interface BlockSlot {
  id: string;
  hue: BlockHue;
}

export interface BlockPiece {
  id: string;
  hue: BlockHue;
}

export interface SorterBoard {
  id: string;
  slots: readonly BlockSlot[];
  /** The blocks in the toy box — never in the same place as their hole. */
  blocks: readonly BlockPiece[];
}

export const SORTER_PROMPT_CLIP = "friends-sorter-prompt";
/** Said after the prompt on the first board only. */
export const SORTER_HOW_CLIP = "friends-sorter-how";
export const SORTER_PROMPT = clipText(SORTER_PROMPT_CLIP);
export const SORTER_FITS_CLIP = "friends-sorter-fits";
export const SORTER_WRONG_CLIP = "friends-sorter-wrong";
const BOARD_COUNT = 4;
/** A fixed derangement of four: block k sits where hole SCRAMBLE[k] is. */
const SCRAMBLE = [2, 0, 3, 1] as const;

export const SORTER_BOARDS: readonly SorterBoard[] = Array.from({ length: BOARD_COUNT }, (_, i) => {
  const hues = dealt(BLOCK_HUES, 700 + i).slice(0, 4);
  return {
    id: `sorter-${i}`,
    slots: hues.map((hue) => ({ id: `b${i}-slot-${hue}`, hue })),
    blocks: SCRAMBLE.map((k) => ({ id: `b${i}-block-${hues[k]}`, hue: hues[k] })),
  };
});

/* ── Round counts and the prompt for any round ──────────────────────────── */

export function roundCount(module: ModuleId): number {
  return module === "sorter" ? SORTER_BOARDS.length : TAP_ROUNDS[module].length;
}

export function promptFor(module: ModuleId, round: number): string {
  if (module === "sorter") return SORTER_PROMPT;
  return TAP_ROUNDS[module][round]?.prompt ?? "";
}

/** 0 wrong taps → 3 stars, up to 3 → 2, more → 1. */
export function starsFor(misses: number): number {
  if (misses <= 0) return 3;
  if (misses <= 3) return 2;
  return 1;
}

/* ── Self-check ─────────────────────────────────────────────────────────── */

function distinct<T>(values: readonly T[]): boolean {
  return new Set(values).size === values.length;
}

export function checkTapRound(round: TapRound, decides: "hue" | "shape"): string[] {
  const problems: string[] = [];
  const { options } = round;
  if (!distinct(options.map((o) => o.id))) problems.push(`${round.id}: duplicate option ids`);
  if (!round.prompt) problems.push(`${round.id}: clip "${round.clip}" is not in the manifest`);
  options.forEach((o) => {
    const wrong = wrongClipFor(decides === "hue" ? "colors" : "shapes", o);
    if (!clipText(wrong)) problems.push(`${round.id}: clip "${wrong}" is not in the manifest`);
  });
  if (options.length < 2) problems.push(`${round.id}: needs at least one wrong option`);
  const hits = options.filter((o) => matches(o, round.criterion));
  if (hits.length !== 1) problems.push(`${round.id}: criterion matches ${hits.length} options`);
  // fair: the property being asked about is different on every tile, and
  // so is the OTHER property — it can never give the answer away
  if (!distinct(options.map((o) => o.hue))) problems.push(`${round.id}: two tiles share a colour`);
  if (!distinct(options.map((o) => o.shape))) problems.push(`${round.id}: two tiles share a shape`);
  if (decides === "hue" && round.criterion.shape !== undefined)
    problems.push(`${round.id}: a colors round must ask about colour only`);
  if (decides === "shape" && round.criterion.hue !== undefined)
    problems.push(`${round.id}: a shapes round must ask about shape only`);
  return problems;
}

export function checkSorterBoard(board: SorterBoard): string[] {
  const problems: string[] = [];
  if (board.slots.length < 3 || board.slots.length > 4)
    problems.push(`${board.id}: needs 3–4 blocks`);
  if (!distinct(board.slots.map((s) => s.hue))) problems.push(`${board.id}: two holes match`);
  const need = board.slots.map((s) => s.hue).sort();
  const have = board.blocks.map((b) => b.hue).sort();
  if (need.join() !== have.join()) problems.push(`${board.id}: blocks do not fit the holes`);
  board.blocks.forEach((b, k) => {
    if (board.slots[k]?.hue === b.hue) problems.push(`${board.id}: a block starts over its hole`);
    if (!clipText(blockClipFor(b.hue)))
      problems.push(`${board.id}: clip "${blockClipFor(b.hue)}" is not in the manifest`);
  });
  return problems;
}

function noRepeats(targets: readonly string[], label: string): string[] {
  const problems: string[] = [];
  targets.forEach((t, k) => {
    if (k > 0 && targets[k - 1] === t) problems.push(`${label}: "${t}" twice in a row`);
  });
  return problems;
}

export function checkAllRounds(): string[] {
  const fixedClips = [
    WELCOME_CLIP,
    PICK_CLIP,
    SORTER_PROMPT_CLIP,
    SORTER_HOW_CLIP,
    SORTER_FITS_CLIP,
    SORTER_WRONG_CLIP,
    ...MODULES.flatMap((m) => [m.clip, m.doneClip]),
  ];
  return [
    ...fixedClips.filter((id) => !clipText(id)).map((id) => `clip "${id}" is not in the manifest`),
    ...COLOR_ROUNDS.flatMap((r) => checkTapRound(r, "hue")),
    ...SHAPE_ROUNDS.flatMap((r) => checkTapRound(r, "shape")),
    ...SORTER_BOARDS.flatMap(checkSorterBoard),
    ...noRepeats(
      COLOR_ROUNDS.map((r) => r.criterion.hue ?? ""),
      "colors"
    ),
    ...noRepeats(
      SHAPE_ROUNDS.map((r) => r.criterion.shape ?? ""),
      "shapes"
    ),
    ...noRepeats(
      COLOR_ROUNDS.map((r) => String(r.options.indexOf(answerFor(r)))),
      "colors answer position"
    ),
    ...noRepeats(
      SHAPE_ROUNDS.map((r) => String(r.options.indexOf(answerFor(r)))),
      "shapes answer position"
    ),
    ...noRepeats(
      SORTER_BOARDS.map((b) =>
        b.slots
          .map((s) => s.hue)
          .sort()
          .join()
      ),
      "sorter"
    ),
  ];
}

// Development only: a data typo shouts on the first reload instead of
// shipping an unfair round.
if (process.env.NODE_ENV !== "production") {
  const problems = checkAllRounds();
  if (problems.length > 0) {
    console.error("[color-shape-friends] round data failed its own check:", problems);
  }
}
