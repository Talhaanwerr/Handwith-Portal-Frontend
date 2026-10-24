import type { Brick, BrickKind } from "@games/brick-lab/engine/geometry";
import { fits, occupancy, type Plate } from "@games/brick-lab/engine/world";
import { B, STEP_MODELS } from "./models";

/**
 * COPY THE DESIGN — the guided Brick Lab activity. The child picks a design,
 * sees it drawn beside the plate, and rebuilds it. Eight designs, easiest
 * first: a two-colour pattern, a colour sequence, a shape, a tower, big and
 * small bricks together, steps, then two little objects.
 */
export interface Design {
  id: string;
  name: string;
  /** What kind of challenge it is — shown on its card. */
  kind: string;
  plate: Plate;
  bricks: Brick[];
}

const PLATE: Plate = { w: 8, d: 6 };

const fromModel = (id: string, kind: string): Design => {
  const m = STEP_MODELS.find((s) => s.id === id);
  if (!m) throw new Error(`no step model ${id}`);
  return { id: `copy-${id}`, name: m.name, kind, plate: m.plate, bricks: m.steps };
};

export const DESIGNS: readonly Design[] = [
  {
    id: "copy-redblue",
    name: "Red and Blue",
    kind: "Pattern",
    plate: PLATE,
    bricks: [
      B("a", 0, 2, 0, 2, 2, "red"),
      B("b", 2, 2, 0, 2, 2, "blue"),
      B("c", 4, 2, 0, 2, 2, "red"),
      B("d", 6, 2, 0, 2, 2, "blue"),
    ],
  },
  {
    id: "copy-rbr",
    name: "Red, Blue, Red",
    kind: "Colours",
    plate: PLATE,
    bricks: [
      B("a", 1, 2, 0, 2, 2, "red"),
      B("b", 3, 2, 0, 2, 2, "blue"),
      B("c", 5, 2, 0, 2, 2, "red"),
    ],
  },
  {
    id: "copy-square",
    name: "Square",
    kind: "Shape",
    plate: PLATE,
    bricks: [
      B("a", 2, 1, 0, 2, 2, "yellow"),
      B("b", 4, 1, 0, 2, 2, "yellow"),
      B("c", 2, 3, 0, 2, 2, "yellow"),
      B("d", 4, 3, 0, 2, 2, "yellow"),
    ],
  },
  {
    id: "copy-tall",
    name: "Tall Tower",
    kind: "Colours",
    plate: PLATE,
    bricks: [
      B("a", 3, 2, 0, 2, 2, "green"),
      B("b", 3, 2, 1, 2, 2, "yellow"),
      B("c", 3, 2, 2, 2, 2, "red"),
    ],
  },
  {
    id: "copy-bigsmall",
    name: "Big and Small",
    kind: "Sizes",
    plate: PLATE,
    bricks: [
      B("a", 2, 2, 0, 4, 2, "blue"),
      B("b", 2, 2, 1, 2, 2, "red"),
      B("c", 4, 2, 1, 2, 2, "yellow"),
    ],
  },
  {
    id: "copy-steps",
    name: "Steps",
    kind: "Structure",
    plate: PLATE,
    bricks: [
      B("a", 1, 2, 0, 2, 2, "orange"),
      B("b", 3, 2, 0, 2, 2, "orange"),
      B("c", 5, 2, 0, 2, 2, "orange"),
      B("d", 3, 2, 1, 2, 2, "yellow"),
      B("e", 5, 2, 1, 2, 2, "yellow"),
      B("f", 5, 2, 2, 2, 2, "red"),
    ],
  },
  fromModel("duck", "Object"),
  fromModel("house", "Object"),
];

/** The different bricks a design needs — the tray offers exactly these, plus
 *  one that never fits for the harder designs. */
export function designTray(d: Design, index: number): BrickKind[] {
  const seen = new Set<string>();
  const kinds: BrickKind[] = [];
  for (const b of d.bricks) {
    const key = `${Math.min(b.w, b.d)}x${Math.max(b.w, b.d)}-${b.color}`;
    if (seen.has(key)) continue;
    seen.add(key);
    kinds.push({ w: b.w, d: b.d, color: b.color });
  }
  if (index >= 3) {
    const spare = (["purple", "pink", "teal", "green"] as const).find(
      (c) => !d.bricks.some((b) => b.color === c)
    );
    if (spare) kinds.push({ w: 2, d: 2, color: spare });
  }
  return kinds;
}

/** Every stud-cell the bricks fill, with its level and colour, moved so the
 *  build starts at 0,0: where on the plate it stands does not matter. */
function cells(bricks: readonly Brick[]): Map<string, string> {
  const x0 = Math.min(...bricks.map((b) => b.x));
  const z0 = Math.min(...bricks.map((b) => b.z));
  const out = new Map<string, string>();
  for (const b of bricks)
    for (let i = 0; i < b.w; i++)
      for (let j = 0; j < b.d; j++) out.set(`${b.x - x0 + i},${b.z - z0 + j},${b.y}`, b.color);
  return out;
}

export interface CopyResult {
  same: boolean;
  /** How the child's build compares, in words the game can show. */
  hint: "empty" | "more" | "fewer" | "colours" | "shape";
}

/** Is the child's build the same as the design — same colours in the same
 *  places, wherever on the plate it stands? */
export function compareBuild(target: readonly Brick[], built: readonly Brick[]): CopyResult {
  if (built.length === 0) return { same: false, hint: "empty" };
  const a = cells(target);
  const b = cells(built);
  if (a.size === b.size && [...a].every(([k, c]) => b.get(k) === c)) {
    return { same: true, hint: "shape" };
  }
  if (b.size > a.size) return { same: false, hint: "more" };
  if (b.size < a.size) return { same: false, hint: "fewer" };
  const sameShape = [...a.keys()].every((k) => b.has(k));
  return { same: false, hint: sameShape ? "colours" : "shape" };
}

export function checkDesigns(): string[] {
  const errs: string[] = [];
  for (const d of DESIGNS) {
    const placed: Brick[] = [];
    for (const b of d.bricks) {
      if (!fits(occupancy(placed), d.plate, b)) errs.push(`${d.id}: ${b.id} cannot be placed`);
      placed.push(b);
    }
    if (!compareBuild(d.bricks, d.bricks.map((b) => ({ ...b, x: b.x, z: b.z })).reverse()).same)
      errs.push(`${d.id}: does not match itself`);
    if (designTray(d, 9).length < 1) errs.push(`${d.id}: empty tray`);
  }
  return errs;
}
