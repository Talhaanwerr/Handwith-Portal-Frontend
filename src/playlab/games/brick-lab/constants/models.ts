import type { Brick, BrickColor } from "@games/brick-lab/engine/geometry";
import { fits, occupancy, type Plate } from "@games/brick-lab/engine/world";

/** Shorthand: a brick at cell (x, z), level y, w × d studs. */
export const B = (
  id: string,
  x: number,
  z: number,
  y: number,
  w: number,
  d: number,
  color: BrickColor
): Brick => ({ id, x, z, y, w, d, color });

/* ── Title-screen models ─────────────────────────────────────────────── */

export const HERO_PLATE = { w: 8, d: 6 };

/** A little house with a tree: the Brick Lab title. */
export const HERO_HOUSE: Brick[] = [
  B("h1", 1, 1, 0, 4, 2, "red"),
  B("h2", 1, 3, 0, 2, 2, "red"),
  B("h3", 3, 3, 0, 2, 2, "white"),
  B("h4", 1, 1, 1, 2, 4, "yellow"),
  B("h5", 3, 1, 1, 2, 4, "yellow"),
  B("h6", 1, 2, 2, 4, 2, "blue"),
  B("t1", 6, 3, 0, 1, 1, "orange"),
  B("t2", 6, 3, 1, 1, 1, "orange"),
  B("t3", 5, 2, 2, 2, 2, "green"),
  B("t4", 6, 4, 0, 1, 1, "teal"),
];

export const HERO_TOWER: Brick[] = [1, 2, 3, 4, 5].map((n, i) =>
  B(`n${n}`, 3, 2, i, 2, 2, (["red", "orange", "yellow", "green", "blue"] as const)[i])
);

export const HERO_FACTORY: Brick[] = [
  B("f1", 0, 1, 0, 2, 2, "red"),
  B("f2", 3, 1, 0, 2, 2, "blue"),
  B("f3", 6, 1, 0, 2, 2, "yellow"),
  B("f4", 0, 1, 1, 2, 2, "red"),
  B("f5", 3, 1, 1, 2, 2, "blue"),
  B("f6", 0, 4, 0, 2, 1, "red"),
  B("f7", 3, 4, 0, 2, 1, "blue"),
  B("f8", 6, 4, 0, 2, 1, "yellow"),
];

export const HERO_PATTERN: Brick[] = (["red", "blue", "red", "blue"] as const).map((c, i) =>
  B(`p${i}`, i * 2, 2, 0, 2, 2, c)
);

/** C-A-T in letter bricks: the Spell Bricks title. */
export const HERO_SPELL: Brick[] = [
  { ...B("s1", 1, 2, 0, 2, 2, "red"), tag: "c" },
  { ...B("s2", 3, 2, 0, 2, 2, "yellow"), tag: "a" },
  { ...B("s3", 5, 2, 0, 2, 2, "blue"), tag: "t" },
];

/* ── Build Steps: models built one brick at a time ───────────────────── */

export interface StepModel {
  id: string;
  name: string;
  plate: Plate;
  /** In build order; each brick must be placeable when its turn comes. */
  steps: Brick[];
}

export const STEP_MODELS: StepModel[] = [
  {
    id: "tower",
    name: "Tower",
    plate: { w: 6, d: 6 },
    steps: [
      B("a", 2, 2, 0, 2, 2, "red"),
      B("b", 2, 2, 1, 2, 2, "yellow"),
      B("c", 2, 2, 2, 2, 2, "blue"),
    ],
  },
  {
    id: "duck",
    name: "Duck",
    plate: { w: 6, d: 6 },
    steps: [
      B("a", 1, 2, 0, 4, 2, "yellow"),
      B("b", 1, 2, 1, 2, 2, "yellow"),
      B("c", 3, 2, 1, 3, 2, "yellow"),
      B("d", 3, 2, 2, 2, 2, "yellow"),
      B("e", 5, 2, 2, 1, 2, "orange"),
    ],
  },
  {
    id: "car",
    name: "Car",
    plate: { w: 8, d: 6 },
    steps: [
      B("a", 1, 2, 0, 1, 2, "black"),
      B("b", 6, 2, 0, 1, 2, "black"),
      B("c", 1, 2, 1, 6, 2, "red"),
      B("d", 2, 2, 2, 2, 2, "teal"),
      B("e", 4, 2, 2, 2, 2, "red"),
    ],
  },
  {
    id: "house",
    name: "House",
    plate: { w: 8, d: 6 },
    steps: [
      B("a", 2, 1, 0, 4, 2, "white"),
      B("b", 2, 3, 0, 4, 2, "white"),
      B("c", 2, 1, 1, 2, 4, "blue"),
      B("d", 4, 1, 1, 2, 4, "white"),
      B("e", 2, 2, 2, 4, 2, "red"),
      B("f", 3, 2, 3, 2, 2, "red"),
    ],
  },
  {
    id: "tree",
    name: "Tree",
    plate: { w: 6, d: 6 },
    steps: [
      B("a", 2, 2, 0, 2, 2, "orange"),
      B("b", 2, 2, 1, 2, 2, "orange"),
      B("c", 1, 1, 2, 4, 2, "green"),
      B("d", 1, 3, 2, 4, 2, "green"),
      B("e", 2, 2, 3, 2, 2, "green"),
    ],
  },
  {
    id: "robot",
    name: "Robot",
    plate: { w: 6, d: 6 },
    steps: [
      B("a", 1, 2, 0, 1, 2, "blue"),
      B("b", 4, 2, 0, 1, 2, "blue"),
      B("c", 1, 2, 1, 4, 2, "teal"),
      B("d", 1, 2, 2, 4, 2, "teal"),
      B("e", 2, 2, 3, 2, 2, "white"),
      B("f", 2, 2, 4, 2, 1, "red"),
    ],
  },
];

/* ── Pattern Wall ────────────────────────────────────────────────────── */

export interface PatternLevel {
  /** The repeating unit. */
  unit: BrickColor[];
  /** How many bricks the finished row has. */
  length: number;
  /** How many are already in place when the level opens. */
  given: number;
}

export const PATTERNS: PatternLevel[] = [
  { unit: ["red", "blue"], length: 6, given: 4 },
  { unit: ["yellow", "green"], length: 6, given: 3 },
  { unit: ["orange", "orange", "purple"], length: 6, given: 3 },
  { unit: ["blue", "pink", "pink"], length: 6, given: 3 },
  { unit: ["red", "yellow", "blue"], length: 6, given: 3 },
  { unit: ["green", "teal", "green", "pink"], length: 8, given: 4 },
];

export const PATTERN_W = 2;

export const patternColor = (p: PatternLevel, i: number) => p.unit[i % p.unit.length];

/** The pattern's row on its plate: brick i sits at x = i * 2. */
export const patternPlate = (p: PatternLevel): Plate => ({ w: p.length * PATTERN_W, d: 4 });

/** Choices offered for a pattern: its own colours plus one that never fits. */
export function patternChoices(p: PatternLevel, li: number): BrickColor[] {
  const own = Array.from(new Set(p.unit));
  const spare = (["purple", "green", "orange", "teal", "pink", "red"] as const).find(
    (c) => !own.includes(c)
  );
  const all = spare ? [...own, spare] : own;
  // Rotate by level so the right answer is not always first.
  return all.map((_, i) => all[(i + li) % all.length]);
}

/* ── Number Tower ────────────────────────────────────────────────────── */

/** The targets, in order: start small, climb to ten. */
export const TOWER_TARGETS = [3, 5, 4, 7, 6, 10] as const;
export const TOWER_PLATE: Plate = { w: 4, d: 4 };
export const TOWER_SPOT = { x: 1, z: 1, w: 2, d: 2 };
export const TOWER_RAINBOW: BrickColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
  "red",
  "orange",
];

/* ── Color Sort Factory ──────────────────────────────────────────────── */

export interface FactoryRound {
  bins: BrickColor[];
  /** The bricks the belt brings, in order. */
  belt: Array<{ color: BrickColor; w: number; d: number }>;
}

const SHAPES = [
  [2, 2],
  [2, 4],
  [1, 2],
  [2, 3],
  [1, 4],
  [1, 1],
] as const;

function belt(bins: BrickColor[], n: number, seed: number) {
  return Array.from({ length: n }, (_, i) => {
    // A fixed, even shuffle: every bin gets bricks, no colour three in a row.
    const color = bins[(i * 7 + seed + Math.floor(i / bins.length)) % bins.length];
    const [w, d] = SHAPES[(i * 5 + seed) % SHAPES.length];
    return { color, w, d };
  });
}

export const FACTORY_ROUNDS: FactoryRound[] = [
  { bins: ["red", "blue"], belt: belt(["red", "blue"], 6, 1) },
  { bins: ["yellow", "green", "red"], belt: belt(["yellow", "green", "red"], 8, 2) },
  {
    bins: ["blue", "orange", "pink", "green"],
    belt: belt(["blue", "orange", "pink", "green"], 10, 3),
  },
];

/* ── Self-checks: every level is buildable and fair ──────────────────── */

/** Each step model can be built in its order, and needs no brick twice. */
export function checkStepModel(m: StepModel): string[] {
  const errs: string[] = [];
  const placed: Brick[] = [];
  for (const b of m.steps) {
    if (!fits(occupancy(placed), m.plate, b)) errs.push(`${m.id}: step ${b.id} cannot be placed`);
    placed.push(b);
  }
  return errs;
}

export function checkFactory(r: FactoryRound): string[] {
  const errs: string[] = [];
  for (const bin of r.bins)
    if (!r.belt.some((b) => b.color === bin)) errs.push(`factory: no ${bin} brick on the belt`);
  for (const b of r.belt)
    if (!r.bins.includes(b.color)) errs.push(`factory: ${b.color} brick has no bin`);
  return errs;
}

export function checkPattern(p: PatternLevel, li: number): string[] {
  const errs: string[] = [];
  if (p.given < p.unit.length) errs.push(`pattern ${li}: shows less than one full repeat`);
  if (p.given >= p.length) errs.push(`pattern ${li}: nothing left to build`);
  for (let i = p.given; i < p.length; i++)
    if (!patternChoices(p, li).includes(patternColor(p, i)))
      errs.push(`pattern ${li}: answer missing`);
  return errs;
}

export function checkAll(): string[] {
  return [
    ...STEP_MODELS.flatMap(checkStepModel),
    ...FACTORY_ROUNDS.flatMap(checkFactory),
    ...PATTERNS.flatMap(checkPattern),
    ...(TOWER_TARGETS.every((t) => t >= 1 && t <= 10) ? [] : ["tower: target outside 1..10"]),
  ];
}
