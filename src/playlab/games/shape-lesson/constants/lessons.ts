/**
 * MY SHAPES — five lessons, one shape each, for 3–4-year-olds. Every lesson
 * plays the same six pages in the same order, so a child learns the routine
 * once; each lesson brings its own shape, colour, scene and pictures.
 *
 *   0 MEET        one big shape — tap it, hear its name
 *   1 WHICH ONE?  two shapes — tap the lesson's shape
 *   2 TAP ALL     five shapes — tap the three of the lesson's shape
 *   3 PUZZLE      drag the shape into its own outline (one wrong outline)
 *   4 MY WORLD    three real things — tap the one with the lesson's shape
 *   5 BUILD       drag the shapes into the gaps of a picture
 *
 * Recorded clips reused: `leo-shape-<shape>` (the name), `friends-tap-<shape>`
 * ("Tap the circle!"), `friends-is-<shape>` ("That one is a circle."),
 * `instr-try-again`, and the word clips of the pictures (`wordClip`).
 * New lines are `msh-…` (see each lesson's NEW-CLIPS.json).
 */

import { fluentSrc } from "@shared/constants/fluent3d";
import { wordClip } from "@shared/audio/wordClips";
import { distinct } from "@games/number-groups/constants/kit";
import type { GameVoice, ModuleInfo } from "@games/number-groups/constants/kit";

/** The shapes a lesson can show (heart only ever as a distractor). */
export type ShapeId = "circle" | "square" | "triangle" | "rectangle" | "star" | "heart";
/** The five lessons. */
export type LessonId = "circle" | "square" | "triangle" | "rectangle" | "star";
export const LESSON_IDS: readonly LessonId[] = [
  "circle",
  "square",
  "triangle",
  "rectangle",
  "star",
];

export type Hue = "red" | "blue" | "green" | "orange" | "purple" | "yellow" | "pink";
/** A shape's paint: its face and the darker slab under it. */
export const HUES: Readonly<Record<Hue, { fill: string; edge: string }>> = {
  red: { fill: "#F2463F", edge: "#A92621" },
  blue: { fill: "#2F86F0", edge: "#1A519E" },
  green: { fill: "#3CC152", edge: "#1F7A2F" },
  orange: { fill: "#FF9A1F", edge: "#BC610A" },
  purple: { fill: "#9C5CF2", edge: "#5F2FAE" },
  yellow: { fill: "#FFCE2E", edge: "#B8870A" },
  pink: { fill: "#FF6FB1", edge: "#B23674" },
};

export type SceneId = "park" | "town" | "camp" | "station" | "night";
export type PictureId = "car" | "house" | "boat" | "train" | "sky";

/** Page 3: one shape on the field. x/y are the landscape spot (% of the
 *  field), px/py the upright-phone spot; size 0 small · 1 middle · 2 big. */
export interface FieldShape {
  shape: ShapeId;
  hue: Hue;
  size: 0 | 1 | 2;
  x: number;
  y: number;
  px: number;
  py: number;
}

/** Page 6: a gap in the picture, its centre in the picture's 400 × 300 box. */
export interface Gap {
  x: number;
  y: number;
}

export interface Lesson {
  id: LessonId;
  /** The game's id and name in the Library. */
  gameId: string;
  title: string;
  scene: SceneId;
  /** The lesson's own colour. */
  hue: Hue;
  /** Page 2: the other shape, its colour, and whether the right one is left. */
  which: { other: ShapeId; otherHue: Hue; rightLeft: boolean };
  /** Page 3: five shapes, three of them the lesson's. */
  field: readonly FieldShape[];
  /** Page 4: the wrong outline and whether the right outline comes first. */
  puzzle: { wrong: ShapeId; rightFirst: boolean };
  /** Page 5: three real things (word ids), which has the lesson's shape, and
   *  how far its glowing outline turns to sit on the picture (degrees). */
  world: { words: readonly [string, string, string]; answer: number; turn: number };
  /** Page 6: the picture and its gaps, left to right. */
  build: { picture: PictureId; gaps: readonly Gap[] };
}

/** Side of a page-6 gap (and piece), in the picture's 400 × 300 box. */
export const GAP_BOX = 88;

export const LESSONS: Readonly<Record<LessonId, Lesson>> = {
  circle: {
    id: "circle",
    gameId: "shape-circle",
    title: "My Shapes: Circle",
    scene: "park",
    hue: "red",
    which: { other: "square", otherHue: "blue", rightLeft: false },
    field: [
      { shape: "circle", hue: "red", size: 2, x: 12, y: 32, px: 28, py: 16 },
      { shape: "triangle", hue: "green", size: 1, x: 31, y: 70, px: 74, py: 30 },
      { shape: "circle", hue: "yellow", size: 1, x: 50, y: 34, px: 30, py: 52 },
      { shape: "square", hue: "blue", size: 1, x: 69, y: 68, px: 72, py: 66 },
      { shape: "circle", hue: "purple", size: 0, x: 88, y: 32, px: 34, py: 86 },
    ],
    puzzle: { wrong: "triangle", rightFirst: false },
    world: { words: ["banana", "ball", "shoe"], answer: 1, turn: 0 },
    build: {
      picture: "car",
      gaps: [
        { x: 124, y: 222 },
        { x: 284, y: 222 },
      ],
    },
  },
  square: {
    id: "square",
    gameId: "shape-square",
    title: "My Shapes: Square",
    scene: "town",
    hue: "blue",
    which: { other: "circle", otherHue: "red", rightLeft: true },
    field: [
      { shape: "circle", hue: "orange", size: 1, x: 12, y: 32, px: 30, py: 14 },
      { shape: "square", hue: "blue", size: 2, x: 31, y: 70, px: 72, py: 22 },
      { shape: "square", hue: "pink", size: 1, x: 50, y: 34, px: 30, py: 46 },
      { shape: "star", hue: "yellow", size: 1, x: 69, y: 68, px: 72, py: 62 },
      { shape: "square", hue: "green", size: 0, x: 88, y: 32, px: 38, py: 84 },
    ],
    puzzle: { wrong: "circle", rightFirst: true },
    world: { words: ["fish", "banana", "box"], answer: 2, turn: 0 },
    build: {
      picture: "house",
      gaps: [
        { x: 152, y: 150 },
        { x: 252, y: 150 },
        { x: 152, y: 238 },
      ],
    },
  },
  triangle: {
    id: "triangle",
    gameId: "shape-triangle",
    title: "My Shapes: Triangle",
    scene: "camp",
    hue: "green",
    which: { other: "circle", otherHue: "orange", rightLeft: false },
    field: [
      { shape: "triangle", hue: "green", size: 1, x: 12, y: 32, px: 30, py: 14 },
      { shape: "square", hue: "red", size: 1, x: 31, y: 70, px: 74, py: 24 },
      { shape: "triangle", hue: "orange", size: 2, x: 50, y: 34, px: 34, py: 46 },
      { shape: "circle", hue: "blue", size: 1, x: 69, y: 68, px: 72, py: 62 },
      { shape: "triangle", hue: "purple", size: 0, x: 88, y: 32, px: 32, py: 84 },
    ],
    puzzle: { wrong: "square", rightFirst: false },
    world: { words: ["pizza", "duck", "shoe"], answer: 0, turn: -100 },
    build: {
      picture: "boat",
      gaps: [
        { x: 152, y: 128 },
        { x: 252, y: 128 },
      ],
    },
  },
  rectangle: {
    id: "rectangle",
    gameId: "shape-rectangle",
    title: "My Shapes: Rectangle",
    scene: "station",
    hue: "orange",
    which: { other: "square", otherHue: "green", rightLeft: true },
    field: [
      { shape: "rectangle", hue: "orange", size: 2, x: 12, y: 32, px: 30, py: 14 },
      { shape: "square", hue: "purple", size: 1, x: 31, y: 70, px: 74, py: 28 },
      { shape: "rectangle", hue: "blue", size: 1, x: 50, y: 34, px: 30, py: 46 },
      { shape: "rectangle", hue: "pink", size: 0, x: 69, y: 68, px: 70, py: 64 },
      { shape: "circle", hue: "yellow", size: 1, x: 88, y: 32, px: 34, py: 84 },
    ],
    puzzle: { wrong: "square", rightFirst: true },
    world: { words: ["duck", "door", "banana"], answer: 1, turn: 90 },
    build: {
      picture: "train",
      gaps: [
        { x: 74, y: 184 },
        { x: 178, y: 184 },
      ],
    },
  },
  star: {
    id: "star",
    gameId: "shape-star",
    title: "My Shapes: Star",
    scene: "night",
    hue: "purple",
    which: { other: "heart", otherHue: "pink", rightLeft: false },
    field: [
      { shape: "heart", hue: "pink", size: 1, x: 12, y: 32, px: 30, py: 14 },
      { shape: "star", hue: "yellow", size: 2, x: 31, y: 70, px: 72, py: 24 },
      { shape: "star", hue: "purple", size: 1, x: 50, y: 34, px: 32, py: 46 },
      { shape: "circle", hue: "green", size: 1, x: 69, y: 68, px: 72, py: 64 },
      { shape: "star", hue: "orange", size: 0, x: 88, y: 32, px: 36, py: 85 },
    ],
    puzzle: { wrong: "heart", rightFirst: false },
    world: { words: ["fish", "shoe", "star"], answer: 2, turn: 0 },
    build: {
      picture: "sky",
      gaps: [
        { x: 86, y: 92 },
        { x: 206, y: 62 },
        { x: 318, y: 112 },
      ],
    },
  },
};

/** Pages a lesson: the store's and NgShell's round count. */
export const LESSON_PAGES = 6;
/** Page 3 asks for this many of the lesson's shape. */
export const ALL_COUNT = 3;

/* ─── Clips ─────────────────────────────────────────────────────────────── */

/** The shape's name ("Circle."). */
export const nameClip = (s: ShapeId) => `leo-shape-${s}`;
/** "Tap the circle!" */
export const tapClip = (s: LessonId) => `friends-tap-${s}`;
/** "That one is a circle." */
export const isClip = (s: LessonId) => `friends-is-${s}`;
export const TRY = "instr-try-again";
/** "Put it in its home!" — page 4, after the shape's name. */
export const PUZZLE = "msh-puzzle";
/** "This is a circle! Tap it." */
export const meetClip = (s: LessonId) => `msh-meet-${s}`;
/** "Tap all the circles!" */
export const allClip = (s: LessonId) => `msh-all-${s}`;
/** "Which one is a circle?" */
export const whichClip = (s: LessonId) => `msh-which-${s}`;
/** "Put the wheels on the car!" */
export const buildClip = (s: LessonId) => `msh-build-${s}`;

/** A real thing's spoken word (only words that have a recording are used). */
export const wordOf = (w: string): string => wordClip(w) ?? TRY;
/** A real thing's 3D picture. */
export const pictureOf = (w: string): string => fluentSrc(w) ?? "";

/* ─── What NgShell needs ────────────────────────────────────────────────── */

export const VOICE_OF = (s: LessonId): GameVoice => ({
  welcome: "msh-welcome",
  done: `msh-done-${s}`,
});

export const ACCENT: Readonly<Record<LessonId, { accent: string; edge: string }>> = {
  circle: { accent: "#F2463F", edge: "#A92621" },
  square: { accent: "#2F86F0", edge: "#1A519E" },
  triangle: { accent: "#3CC152", edge: "#1F7A2F" },
  rectangle: { accent: "#FF9A1F", edge: "#BC610A" },
  star: { accent: "#9C5CF2", edge: "#5F2FAE" },
};

/** The one module of a lesson (id = the lesson's shape). */
export const moduleOf = (s: LessonId): ModuleInfo<LessonId> => ({
  id: s,
  name: LESSONS[s].title,
  tag: `Learn the ${s}`,
  accent: ACCENT[s].accent,
  edge: ACCENT[s].edge,
  clip: `msh-mode-${s}`,
});

/* ─── Self-check ────────────────────────────────────────────────────────── */

/** Every lesson's data, checked: run in a test or the console. */
export function checkLessons(): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };
  const pictures: PictureId[] = [];
  for (const id of LESSON_IDS) {
    const l = LESSONS[id];
    need(l.id === id, `${id}: id`);
    need(l.which.other !== id, `${id}: page 2 shows the lesson shape twice`);
    need(l.field.length === 5, `${id}: page 3 has ${l.field.length} shapes`);
    need(
      l.field.filter((f) => f.shape === id).length === ALL_COUNT,
      `${id}: page 3 needs ${ALL_COUNT} of the lesson shape`
    );
    need(
      distinct(l.field.filter((f) => f.shape === id).map((f) => f.hue)),
      `${id}: page 3's shapes share a colour`
    );
    need(l.puzzle.wrong !== id, `${id}: the wrong outline is the right shape`);
    need(distinct(l.world.words), `${id}: page 5 shows a thing twice`);
    for (const w of l.world.words) {
      need(wordClip(w) !== null, `${id}: "${w}" has no word clip`);
      need(fluentSrc(w) !== null, `${id}: "${w}" has no picture`);
    }
    need(l.world.answer >= 0 && l.world.answer < 3, `${id}: page 5 answer`);
    need(l.build.gaps.length >= 2 && l.build.gaps.length <= 3, `${id}: page 6 gaps`);
    for (const g of l.build.gaps)
      need(
        g.x - GAP_BOX / 2 >= 0 &&
          g.x + GAP_BOX / 2 <= 400 &&
          g.y - GAP_BOX / 2 >= 0 &&
          g.y + GAP_BOX / 2 <= 300,
        `${id}: a gap leaves the picture`
      );
    pictures.push(l.build.picture);
  }
  need(distinct(pictures), "two lessons build the same picture");
  need(
    new Set(LESSON_IDS.map((s) => LESSONS[s].world.answer)).size >= 2,
    "page 5's answer is always in one place"
  );
  return problems;
}
