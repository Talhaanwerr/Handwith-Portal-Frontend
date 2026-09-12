/**
 * Count the Doors — every level, as data, plus the rules that read it.
 *
 * ONE SUBJECT: doors. A level is a row of open doors in a school corridor and
 * one question about them. The game is TWO MODULES, chosen from the home
 * screen, and each has exactly one thing to learn:
 *
 *   count    — "Find 3 apples": the child taps the door holding that many.
 *   compare  — "Which door has MORE apples?" and "Which door has FEWER
 *              apples?": the child turns the knob naming that door.
 *
 * Either way THE ANSWER IS A DOOR, named by its number. It is never stored:
 * `answerFor` derives it from the doors, so a level cannot disagree with
 * itself — change the apples behind a door and the right answer follows.
 *
 * Levels are grouped into corridors of LEVELS_PER_CORRIDOR. A corridor is
 * the unit of progress: one key per solved door, and a vault holding four
 * keys opens the corridor's double door.
 */

import { unit } from "@shared/utils/hash";

/** Nothing is ever counted past five — this is a 1–5 game. */
export const MAX_ITEMS = 5;

/** Doors solved per corridor = keys in the vault = the progress unit. */
export const LEVELS_PER_CORRIDOR = 4;

/** What the child counts. One flat drawing each, see DoorArt. */
export type ItemTheme = "apple" | "book" | "ball" | "pencil" | "star" | "flower";

/** Plural, for the question. */
export const ITEM_NAMES: Record<ItemTheme, string> = {
  apple: "apples",
  book: "books",
  ball: "balls",
  pencil: "pencils",
  star: "stars",
  flower: "flowers",
};

/** Singular, because "Find 1 books" is not a thing to teach a child. */
export const ITEM_NAME_ONE: Record<ItemTheme, string> = {
  apple: "apple",
  book: "book",
  ball: "ball",
  pencil: "pencil",
  star: "star",
  flower: "flower",
};

/** What to call the things when there are this many of them. */
export function itemName(theme: ItemTheme, count: number): string {
  return count === 1 ? ITEM_NAME_ONE[theme] : ITEM_NAMES[theme];
}

/**
 * One door: the number painted above it, and how many things are inside.
 * Every door in this game stands open — both questions are about what the
 * child can SEE, so nothing is ever hidden from them.
 */
export interface DoorSpec {
  label: number;
  count: number;
}

export type Ask =
  /** Count module: tap the door holding this many things. */
  | { kind: "find"; count: number }
  /** More & Less: turn the knob naming the door with the most, or the fewest. */
  | { kind: "which"; want: "more" | "fewer" };

export interface DoorLevel {
  id: string;
  theme: ItemTheme;
  doors: readonly DoorSpec[];
  ask: Ask;
}

/** Doors 1..n, each holding the number given. */
function row(...counts: readonly number[]): readonly DoorSpec[] {
  return counts.map((count, i) => ({ label: i + 1, count }));
}

/* ── Module one: COUNT ───────────────────────────────────────────────────
   The sign names a number; every door holds a different number of things;
   the child taps the door that holds that many. Three corridors: far-apart
   counts, then neighbouring counts, then four doors. The answer moves around
   the row so its position is never the clue, and the things change so the
   number is what is being read, not the picture. */

export const COUNT_LEVELS: readonly DoorLevel[] = [
  // ── Corridor 1 · three doors, counts far apart ──
  { id: "find-3-apples", theme: "apple", doors: row(1, 3, 5), ask: { kind: "find", count: 3 } },
  { id: "find-4-balls", theme: "ball", doors: row(4, 2, 1), ask: { kind: "find", count: 4 } },
  { id: "find-2-stars", theme: "star", doors: row(5, 4, 2), ask: { kind: "find", count: 2 } },
  { id: "find-1-book", theme: "book", doors: row(3, 1, 5), ask: { kind: "find", count: 1 } },

  // ── Corridor 2 · three doors, neighbouring counts ──
  { id: "find-3-flowers", theme: "flower", doors: row(3, 4, 2), ask: { kind: "find", count: 3 } },
  { id: "find-5-pencils", theme: "pencil", doors: row(3, 4, 5), ask: { kind: "find", count: 5 } },
  { id: "find-2-apples", theme: "apple", doors: row(1, 2, 3), ask: { kind: "find", count: 2 } },
  { id: "find-4-balls-close", theme: "ball", doors: row(4, 5, 3), ask: { kind: "find", count: 4 } },

  // ── Corridor 3 · four doors ──
  { id: "find-4-stars", theme: "star", doors: row(1, 2, 3, 4), ask: { kind: "find", count: 4 } },
  { id: "find-3-books", theme: "book", doors: row(5, 3, 4, 2), ask: { kind: "find", count: 3 } },
  {
    id: "find-5-flowers",
    theme: "flower",
    doors: row(1, 4, 5, 3),
    ask: { kind: "find", count: 5 },
  },
  {
    id: "find-2-pencils",
    theme: "pencil",
    doors: row(2, 4, 1, 3),
    ask: { kind: "find", count: 2 },
  },
];

/* ── Module two: MORE & LESS ─────────────────────────────────────────────
   Which door has MORE, and which has FEWER — the two questions, and nothing
   else. Nothing is hidden and nothing is asked that the child cannot see.
   Three corridors: MORE with the winner two clear, then FEWER with the piles
   only one apart, then four doors with both questions mixed. */

export const COMPARE_LEVELS: readonly DoorLevel[] = [
  // ── Corridor 1 · which door has MORE, the winner two clear ──
  { id: "more-1-2-4", theme: "apple", doors: row(1, 2, 4), ask: { kind: "which", want: "more" } },
  { id: "more-5-3-2", theme: "ball", doors: row(5, 3, 2), ask: { kind: "which", want: "more" } },
  { id: "more-2-1-4", theme: "flower", doors: row(2, 1, 4), ask: { kind: "which", want: "more" } },
  { id: "more-3-5-1", theme: "star", doors: row(3, 5, 1), ask: { kind: "which", want: "more" } },

  // ── Corridor 2 · which door has FEWER, and the piles are one apart ──
  { id: "fewer-2-4-3", theme: "apple", doors: row(2, 4, 3), ask: { kind: "which", want: "fewer" } },
  { id: "fewer-5-4-3", theme: "book", doors: row(5, 4, 3), ask: { kind: "which", want: "fewer" } },
  {
    id: "fewer-3-5-4",
    theme: "pencil",
    doors: row(3, 5, 4),
    ask: { kind: "which", want: "fewer" },
  },
  {
    id: "fewer-4-2-3",
    theme: "flower",
    doors: row(4, 2, 3),
    ask: { kind: "which", want: "fewer" },
  },

  // ── Corridor 3 · four doors, and the two questions mixed ──
  {
    id: "more-1-3-4-2",
    theme: "star",
    doors: row(1, 3, 4, 2),
    ask: { kind: "which", want: "more" },
  },
  {
    id: "fewer-4-2-5-3",
    theme: "ball",
    doors: row(4, 2, 5, 3),
    ask: { kind: "which", want: "fewer" },
  },
  {
    id: "more-2-5-1-4",
    theme: "book",
    doors: row(2, 5, 1, 4),
    ask: { kind: "which", want: "more" },
  },
  {
    id: "fewer-5-3-4-2",
    theme: "pencil",
    doors: row(5, 3, 4, 2),
    ask: { kind: "which", want: "fewer" },
  },
];

/* ── The two modules ─────────────────────────────────────────────────────── */

export type ModuleId = "count" | "compare";

export interface GameModule {
  id: ModuleId;
  /** On the door that opens it, and on the sign at the end. */
  title: string;
  /** One line beneath, for a grown-up. */
  blurb: string;
  /** What is behind the module's door on the home screen. */
  theme: ItemTheme;
  levels: readonly DoorLevel[];
}

export const MODULES: Record<ModuleId, GameModule> = {
  count: {
    id: "count",
    title: "Count",
    blurb: "Find that many",
    theme: "apple",
    levels: COUNT_LEVELS,
  },
  compare: {
    id: "compare",
    title: "More & Less",
    blurb: "Which has more?",
    theme: "star",
    levels: COMPARE_LEVELS,
  },
};

/** Left to right on the home screen. */
export const MODULE_ORDER: readonly ModuleId[] = ["count", "compare"];

/** How many doors a module holds. */
export function levelCount(id: ModuleId): number {
  return MODULES[id].levels.length;
}

/* ── Reading a level ─────────────────────────────────────────────────────── */

/**
 * THE answer: the number of the door that answers the question. Derived,
 * never authored.
 */
export function answerFor(level: DoorLevel): number {
  const { ask, doors } = level;
  if (ask.kind === "find") {
    const match = doors.find((d) => d.count === ask.count);
    return match ? match.label : doors[0].label;
  }
  const best = doors.reduce((a, b) =>
    ask.want === "more" ? (b.count > a.count ? b : a) : b.count < a.count ? b : a
  );
  return best.label;
}

export function isCorrect(level: DoorLevel, doorLabel: number): boolean {
  return doorLabel === answerFor(level);
}

/**
 * HOW THIS LEVEL IS ANSWERED.
 *
 * Counting is a question about one door, so the door itself is the button —
 * a child who can see three apples should be able to reach straight for
 * them. Comparing is a question about the whole row, so the answer moves
 * down to the knobs, one per door, where choosing is a deliberate act rather
 * than a reach for the thing already under the finger.
 */
export function answerBy(level: DoorLevel): "door" | "knob" {
  return level.ask.kind === "find" ? "door" : "knob";
}

/* ── The paint ───────────────────────────────────────────────────────────────
   The doors are a different colour EVERY ROUND, and every door in a row is a
   different colour from its neighbours — including the four-door rows, which
   is why a set holds five. Eight sets over twelve rounds means a set comes
   back only after eight rounds, by which time nobody could tell.

   The architrave is the corridor's woodwork rather than the door's, so it is
   named once per set instead of on every door. */

export interface DoorPaint {
  /** The door leaf. */
  leaf: string;
  /** Its sunken panels. */
  panel: string;
  /** The architrave around the doorway. */
  frame: string;
}

interface Palette {
  frame: string;
  /** Five, so the widest row never repeats a colour. */
  doors: readonly { leaf: string; panel: string }[];
}

const PALETTES: readonly Palette[] = [
  {
    frame: "#D9D3C4",
    doors: [
      { leaf: "#3FA33A", panel: "#2E8A2A" },
      { leaf: "#E05A6E", panel: "#C8455B" },
      { leaf: "#A97FD8", panel: "#8E64C2" },
      { leaf: "#2E7FD6", panel: "#1F63B0" },
      { leaf: "#E8B33D", panel: "#C9941A" },
    ],
  },
  {
    frame: "#EADFC8",
    doors: [
      { leaf: "#2E7FD6", panel: "#1F63B0" },
      { leaf: "#F0A32E", panel: "#D4861A" },
      { leaf: "#35B4A0", panel: "#229185" },
      { leaf: "#D6456B", panel: "#B32F54" },
      { leaf: "#8E44C4", panel: "#7331A8" },
    ],
  },
  {
    frame: "#E7DCCB",
    doors: [
      { leaf: "#D6456B", panel: "#B32F54" },
      { leaf: "#6FB043", panel: "#55932F" },
      { leaf: "#5B6FD6", panel: "#4355B0" },
      { leaf: "#E8912E", panel: "#C9731A" },
      { leaf: "#27A3C9", panel: "#1784A8" },
    ],
  },
  {
    frame: "#DED6C4",
    doors: [
      { leaf: "#E8912E", panel: "#C9731A" },
      { leaf: "#8E44C4", panel: "#7331A8" },
      { leaf: "#27A3C9", panel: "#1784A8" },
      { leaf: "#49A86B", panel: "#318F53" },
      { leaf: "#E05A8E", panel: "#C23F72" },
    ],
  },
  {
    frame: "#F0E6D2",
    doors: [
      { leaf: "#4FA8E0", panel: "#3788C0" },
      { leaf: "#E05A8E", panel: "#C23F72" },
      { leaf: "#8FC23F", panel: "#72A327" },
      { leaf: "#C95B3F", panel: "#A8432A" },
      { leaf: "#B06AD6", panel: "#9350BD" },
    ],
  },
  {
    frame: "#E4D9C2",
    doors: [
      { leaf: "#C95B3F", panel: "#A8432A" },
      { leaf: "#3FA38E", panel: "#2A8A76" },
      { leaf: "#B06AD6", panel: "#9350BD" },
      { leaf: "#5E8AD6", panel: "#446FB8" },
      { leaf: "#8FC23F", panel: "#72A327" },
    ],
  },
  {
    frame: "#EFE3CC",
    doors: [
      { leaf: "#5E8AD6", panel: "#446FB8" },
      { leaf: "#E8B32E", panel: "#C9941A" },
      { leaf: "#D65B9E", panel: "#B53F82" },
      { leaf: "#3FA38E", panel: "#2A8A76" },
      { leaf: "#D64F4F", panel: "#B53838" },
    ],
  },
  {
    frame: "#E6DBC6",
    doors: [
      { leaf: "#49A86B", panel: "#318F53" },
      { leaf: "#D64F4F", panel: "#B53838" },
      { leaf: "#4F7AD6", panel: "#3860B8" },
      { leaf: "#F0A32E", panel: "#D4861A" },
      { leaf: "#A97FD8", panel: "#8E64C2" },
    ],
  },
];

/** The paint for one door of one round. The module shifts the set, so the
 *  two modules never open on the same colours. */
export function paintFor(moduleId: ModuleId, levelIndex: number, doorIndex: number): DoorPaint {
  const offset = moduleId === "compare" ? 3 : 0;
  const set = PALETTES[(levelIndex + offset) % PALETTES.length];
  const door = set.doors[doorIndex % set.doors.length];
  return { leaf: door.leaf, panel: door.panel, frame: set.frame };
}

/** A colour for the module's own door on the home screen, off the same
 *  palettes so nothing is invented twice. */
export function modulePaint(id: ModuleId): DoorPaint {
  return paintFor(id, 0, id === "count" ? 0 : 1);
}

/* ── Corridors ───────────────────────────────────────────────────────────── */

/** 1-based corridor number for a level. */
export function corridorOf(levelIndex: number): number {
  return Math.floor(levelIndex / LEVELS_PER_CORRIDOR) + 1;
}

/** Keys already in the vault when this level starts. */
export function keysBefore(levelIndex: number): number {
  return levelIndex % LEVELS_PER_CORRIDOR;
}

/** Did finishing this level fill the vault? */
export function clearsCorridor(levelIndex: number): boolean {
  return keysBefore(levelIndex) === LEVELS_PER_CORRIDOR - 1;
}

/** A deterministic wobble for the home screen's doors, so the two are not
 *  mechanically identical. */
export function homeTilt(index: number): number {
  return Number(((unit(index) - 0.5) * 3).toFixed(2));
}
