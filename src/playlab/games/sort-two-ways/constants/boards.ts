import type { PictureId } from "@games/blend-read/components/PictureArt";
import { unit } from "@shared/utils/hash";
import manifest from "@shared/audio/manifest.json";

/**
 * Sort Two Ways — the boards, as data.
 *
 * "One collection can be organised by different attributes." Every module
 * deals out SETS of six things; each set is sorted TWICE, once by one rule
 * and then — the same six things, loose again — by another. Each board is two
 * trays; each tray opens with ONE worked example in it and black silhouettes
 * for what is still to come; the four loose things wait on the right.
 *
 * The rule is data (`criterion`). Which tray a thing belongs in is never
 * stored: it is DERIVED from the thing's attributes and the board's criterion
 * (`trayOf`). Change a criterion and every answer moves with it; that is the
 * whole point of the game, and `checkBoards` proves each board is fair.
 *
 * Nothing here is drawn new: shapes are Leo's Puzzles' shapes, animals and
 * things are the portal's Twemoji pictures (drawn at two sizes), sweets are
 * Letter Treats' peppermint and gumdrop (recoloured through their own `color`
 * prop), shoes are Letter Treats' trainer and the Twemoji shoe (turned blue
 * with a CSS hue filter).
 */

export type Criterion = "colour" | "shape" | "kind" | "size";
export type Colour = "red" | "blue" | "yellow";
export type Shape = "circle" | "square" | "triangle" | "star";
export type Size = "big" | "small";
export type Kind = "animal" | "thing" | "sweet" | "shoe";

/** What a thing is drawn as. A coloured shape draws its own `shape`. */
export type Look =
  | "shape"
  | "peppermint"
  | "gumdrop"
  | "trainer"
  | "sneaker"
  | Extract<PictureId, "frog" | "cat" | "hen" | "dog" | "ball" | "cup" | "drum" | "box">;

/** A look's kind follows from what it is — never typed per thing. */
const KIND_OF: Readonly<Record<Look, Kind | undefined>> = {
  shape: undefined,
  peppermint: "sweet",
  gumdrop: "sweet",
  trainer: "shoe",
  sneaker: "shoe",
  frog: "animal",
  cat: "animal",
  hen: "animal",
  dog: "animal",
  ball: "thing",
  cup: "thing",
  drum: "thing",
  box: "thing",
};

export interface Thing {
  /** Unique within its set. */
  id: string;
  look: Look;
  colour?: Colour;
  shape?: Shape;
  /** Drawn bigger or smaller; no size is drawn full size. */
  size?: Size;
  /** A name for assistive tech and the word said when a kind board places it. */
  name: string;
}

export interface Tray {
  /** The value of the board's criterion every thing in this tray shares. */
  value: string;
  /** The worked example already in the tray when the board opens. */
  example: string;
}

export interface Board {
  id: string;
  criterion: Criterion;
  /** The teacher's prompt: the recording, and (through `clipText`) the
   *  words in the bubble — "Let's sort them by colour!". */
  clip: string;
  /** Top tray, bottom tray. */
  trays: readonly [Tray, Tray];
}

export interface SortSet {
  id: string;
  things: readonly Thing[];
  /** The same things sorted two ways: first rule, then second. */
  boards: readonly [Board, Board];
}

export type ModuleId = "shapes" | "animals" | "sweets";

export interface SortModule {
  id: ModuleId;
  name: string;
  /** The card's line: the two rules in order. */
  tag: string;
  aria: string;
  sets: readonly [SortSet, SortSet];
}

/* ── Things ─────────────────────────────────────────────────────────────── */

const shape = (id: string, colour: Colour, s: Shape): Thing => ({
  id,
  look: "shape",
  colour,
  shape: s,
  name: `${colour} ${s}`,
});
const pic = (id: string, look: Look, size: Size): Thing => ({
  id,
  look,
  size,
  name: `${size} ${look}`,
});
const sweetOrShoe = (id: string, look: Look, colour: Colour): Thing => ({
  id,
  look,
  colour,
  name: `${colour} ${look === "sneaker" || look === "trainer" ? "shoe" : "sweet"}`,
});

/* ── The modules ────────────────────────────────────────────────────────── */

/*
 * The two examples of a board always AGREE on the other board's rule and
 * differ only on this one (a blue circle and a yellow circle to show "by
 * colour"; a yellow circle and a yellow square to show "by shape"), so the
 * trays themselves say which rule is meant. `checkBoards` holds every board
 * to that.
 */

const SHAPES_A: SortSet = {
  id: "shapes-a",
  things: [
    shape("a1", "blue", "circle"),
    shape("a2", "blue", "square"),
    shape("a3", "blue", "square"),
    shape("a4", "yellow", "circle"),
    shape("a5", "yellow", "circle"),
    shape("a6", "yellow", "square"),
  ],
  boards: [
    {
      id: "shapes-a-colour",
      criterion: "colour",
      clip: "sort2-by-colour",
      trays: [
        { value: "blue", example: "a1" },
        { value: "yellow", example: "a4" },
      ],
    },
    {
      id: "shapes-a-shape",
      criterion: "shape",
      clip: "sort2-by-shape",
      trays: [
        { value: "circle", example: "a4" },
        { value: "square", example: "a6" },
      ],
    },
  ],
};

const SHAPES_B: SortSet = {
  id: "shapes-b",
  things: [
    shape("b1", "red", "triangle"),
    shape("b2", "red", "triangle"),
    shape("b3", "red", "star"),
    shape("b4", "yellow", "triangle"),
    shape("b5", "yellow", "star"),
    shape("b6", "yellow", "star"),
  ],
  boards: [
    {
      id: "shapes-b-colour",
      criterion: "colour",
      clip: "sort2-by-colour",
      trays: [
        { value: "red", example: "b3" },
        { value: "yellow", example: "b5" },
      ],
    },
    {
      id: "shapes-b-shape",
      criterion: "shape",
      clip: "sort2-by-shape",
      trays: [
        { value: "star", example: "b3" },
        { value: "triangle", example: "b1" },
      ],
    },
  ],
};

const ANIMALS_A: SortSet = {
  id: "animals-a",
  things: [
    pic("c1", "frog", "big"),
    pic("c2", "frog", "small"),
    pic("c3", "cat", "big"),
    pic("c4", "ball", "big"),
    pic("c5", "ball", "small"),
    pic("c6", "cup", "small"),
  ],
  boards: [
    {
      id: "animals-a-kind",
      criterion: "kind",
      clip: "sort2-by-kind-animals",
      trays: [
        { value: "animal", example: "c1" },
        { value: "thing", example: "c4" },
      ],
    },
    {
      id: "animals-a-size",
      criterion: "size",
      clip: "sort2-by-size",
      trays: [
        { value: "big", example: "c1" },
        { value: "small", example: "c2" },
      ],
    },
  ],
};

const ANIMALS_B: SortSet = {
  id: "animals-b",
  things: [
    pic("d1", "hen", "big"),
    pic("d2", "hen", "small"),
    pic("d3", "dog", "small"),
    pic("d4", "drum", "big"),
    pic("d5", "drum", "small"),
    pic("d6", "box", "big"),
  ],
  boards: [
    {
      id: "animals-b-kind",
      criterion: "kind",
      clip: "sort2-by-kind-animals",
      trays: [
        { value: "thing", example: "d5" },
        { value: "animal", example: "d2" },
      ],
    },
    {
      id: "animals-b-size",
      criterion: "size",
      clip: "sort2-by-size",
      trays: [
        { value: "small", example: "d5" },
        { value: "big", example: "d4" },
      ],
    },
  ],
};

const SWEETS_A: SortSet = {
  id: "sweets-a",
  things: [
    sweetOrShoe("e1", "peppermint", "red"),
    sweetOrShoe("e2", "peppermint", "blue"),
    sweetOrShoe("e3", "gumdrop", "blue"),
    sweetOrShoe("e4", "trainer", "red"),
    sweetOrShoe("e5", "sneaker", "red"),
    sweetOrShoe("e6", "trainer", "blue"),
  ],
  boards: [
    {
      id: "sweets-a-colour",
      criterion: "colour",
      clip: "sort2-by-colour",
      trays: [
        { value: "red", example: "e1" },
        { value: "blue", example: "e2" },
      ],
    },
    {
      id: "sweets-a-kind",
      criterion: "kind",
      clip: "sort2-by-kind-sweets",
      trays: [
        { value: "sweet", example: "e1" },
        { value: "shoe", example: "e4" },
      ],
    },
  ],
};

const SWEETS_B: SortSet = {
  id: "sweets-b",
  things: [
    sweetOrShoe("f1", "gumdrop", "red"),
    sweetOrShoe("f2", "peppermint", "red"),
    sweetOrShoe("f3", "gumdrop", "blue"),
    sweetOrShoe("f4", "sneaker", "red"),
    sweetOrShoe("f5", "sneaker", "blue"),
    sweetOrShoe("f6", "trainer", "blue"),
  ],
  boards: [
    {
      id: "sweets-b-colour",
      criterion: "colour",
      clip: "sort2-by-colour",
      trays: [
        { value: "blue", example: "f5" },
        { value: "red", example: "f4" },
      ],
    },
    {
      id: "sweets-b-kind",
      criterion: "kind",
      clip: "sort2-by-kind-sweets",
      trays: [
        { value: "shoe", example: "f6" },
        { value: "sweet", example: "f3" },
      ],
    },
  ],
};

export const MODULES: readonly SortModule[] = [
  {
    id: "shapes",
    name: "Colours & Shapes",
    tag: "By colour, then by shape",
    aria: "Colours and Shapes: sort shapes by colour, then the same shapes by shape",
    sets: [SHAPES_A, SHAPES_B],
  },
  {
    id: "animals",
    name: "Animals & Things",
    tag: "Animal or thing, then big or small",
    aria: "Animals and Things: sort animals from things, then the same things by size",
    sets: [ANIMALS_A, ANIMALS_B],
  },
  {
    id: "sweets",
    name: "Sweets & Shoes",
    tag: "By colour, then sweets or shoes",
    aria: "Sweets and Shoes: sort by colour, then sweets from shoes",
    sets: [SWEETS_A, SWEETS_B],
  },
];

export const MODULE_IDS: readonly ModuleId[] = MODULES.map((m) => m.id);

/** Boards per module: two sets, each sorted two ways. */
export const BOARDS = 4;
/** Loose things per board — the 2 × 2 bank. */
export const LOOSE = 4;

export function moduleById(id: ModuleId): SortModule {
  return MODULES.find((m) => m.id === id) ?? MODULES[0];
}

/** Board `n` (0–3) of a module: set n/2, sort n%2. */
export function boardAt(module: ModuleId, n: number): { set: SortSet; board: Board; sort: 0 | 1 } {
  const m = moduleById(module);
  const set = m.sets[Math.min(1, Math.floor(n / 2))];
  const sort = (n % 2) as 0 | 1;
  return { set, board: set.boards[sort], sort };
}

/* ── Reading a board ────────────────────────────────────────────────────── */

/** A thing's value under a rule (undefined: the thing has no such value). */
export function attr(thing: Thing, criterion: Criterion): string | undefined {
  switch (criterion) {
    case "colour":
      return thing.colour;
    case "shape":
      return thing.shape;
    case "size":
      return thing.size;
    case "kind":
      return KIND_OF[thing.look];
  }
}

/** THE ANSWER: the tray (0 top, 1 bottom) a thing belongs in on a board —
 *  derived from its attributes and the board's rule, stored nowhere. */
export function trayOf(board: Board, thing: Thing): number {
  const v = attr(thing, board.criterion);
  return board.trays.findIndex((t) => t.value === v);
}

/** The loose things of a board: every thing that is not an example. */
export function looseOf(set: SortSet, board: Board): Thing[] {
  const examples = new Set(board.trays.map((t) => t.example));
  return set.things.filter((t) => !examples.has(t.id));
}

/** What a tray shows, in order: its example, then a silhouette for each loose
 *  thing that belongs there. */
export function slotsOf(set: SortSet, board: Board, tray: 0 | 1): Thing[] {
  const ex = set.things.find((t) => t.id === board.trays[tray].example);
  const rest = looseOf(set, board).filter((t) => trayOf(board, t) === tray);
  return ex ? [ex, ...rest] : rest;
}

function seedOf(text: string): number {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 1000003;
  return h;
}

/** The order the loose things wait in: shuffled, but the SAME shuffle every
 *  time for a board (a hash, never Math.random), so the child sorts by the
 *  rule rather than by remembering where things were. */
export function bankOrder(set: SortSet, board: Board): Thing[] {
  const out = looseOf(set, board);
  const seed = seedOf(board.id);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(unit(seed + i * 97) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The word said as a thing lands: the value of the rule it was sorted by
 *  ("blue", "circle", "big") — or, on a kind board, its own name ("frog"). */
export function landingWord(board: Board, thing: Thing): string {
  if (board.criterion !== "kind") return attr(thing, board.criterion) ?? "";
  return thing.look === "sneaker" || thing.look === "trainer" ? "shoe" : thing.look;
}

/** Stars for a module from its wrong drops — the puzzle games' scale. */
export { starsFor } from "@games/jigsaw-fun/constants/jigsaw";

/* ── The self-check ─────────────────────────────────────────────────────── */

const key = (ids: readonly string[]) => [...ids].sort().join(",");

/** Which things go together under a board — as a comparable string. */
function partitionOf(set: SortSet, board: Board): string {
  const groups = [0, 1].map((tray) =>
    key(set.things.filter((t) => trayOf(board, t) === tray).map((t) => t.id))
  );
  return groups.sort().join(" | ");
}

/**
 * Everything a fair module must be (empty list = fair):
 *  - two sets, each sorted two ways by two DIFFERENT rules, with a different
 *    grouping of the same things;
 *  - under every board, every thing has exactly one right tray;
 *  - each tray's example belongs in it, the two examples agree on the other
 *    rule (so the trays show which rule is meant), and every tray still has
 *    at least one loose thing to receive;
 *  - four loose things per board, unique ids everywhere.
 */
export function checkBoards(): string[] {
  const problems: string[] = [];
  const boardIds = new Set<string>();
  const setIds = new Set<string>();
  if (MODULES.length === 0) problems.push("no modules");
  if (new Set(MODULE_IDS).size !== MODULE_IDS.length) problems.push("duplicate module ids");

  for (const m of MODULES) {
    if (m.sets.length * 2 !== BOARDS) problems.push(`${m.id}: expected ${BOARDS / 2} sets`);
    for (const set of m.sets) {
      const where = `${m.id}/${set.id}`;
      if (setIds.has(set.id)) problems.push(`${where}: duplicate set id`);
      setIds.add(set.id);
      const ids = set.things.map((t) => t.id);
      if (new Set(ids).size !== ids.length) problems.push(`${where}: duplicate thing ids`);
      for (const t of set.things) {
        if (t.look === "shape" && (!t.colour || !t.shape))
          problems.push(`${where}: shape ${t.id} needs a colour and a shape`);
      }

      const [first, second] = set.boards;
      if (first.criterion === second.criterion)
        problems.push(`${where}: both sorts use the rule "${first.criterion}"`);
      if (partitionOf(set, first) === partitionOf(set, second))
        problems.push(`${where}: the second sort groups the things exactly as the first`);

      set.boards.forEach((board, k) => {
        const at = `${where}/${board.id}`;
        if (boardIds.has(board.id)) problems.push(`${at}: duplicate board id`);
        boardIds.add(board.id);
        if (!(board.clip in manifest.clips))
          problems.push(`${at}: prompt ${board.clip} is not recorded`);
        if (board.trays[0].value === board.trays[1].value)
          problems.push(`${at}: both trays take "${board.trays[0].value}"`);

        for (const t of set.things) {
          const v = attr(t, board.criterion);
          const homes = board.trays.filter((tray) => tray.value === v).length;
          if (homes !== 1) problems.push(`${at}: ${t.id} has ${homes} right trays`);
        }

        const other = set.boards[1 - k].criterion;
        const examples = board.trays.map((tray, i) => {
          const ex = set.things.find((t) => t.id === tray.example);
          if (!ex) problems.push(`${at}: example ${tray.example} is not in the set`);
          else if (trayOf(board, ex) !== i)
            problems.push(`${at}: example ${ex.id} does not belong in tray ${i}`);
          return ex;
        });
        if (examples[0] && examples[1]) {
          if (examples[0].id === examples[1].id) problems.push(`${at}: one example in both trays`);
          if (attr(examples[0], other) !== attr(examples[1], other))
            problems.push(`${at}: the examples differ on "${other}" too — the rule is ambiguous`);
        }

        const loose = looseOf(set, board);
        if (loose.length !== LOOSE)
          problems.push(`${at}: ${loose.length} loose things, expected ${LOOSE}`);
        for (const tray of [0, 1] as const)
          if (!loose.some((t) => trayOf(board, t) === tray))
            problems.push(`${at}: tray ${tray} gets no loose thing`);
        if (key(bankOrder(set, board).map((t) => t.id)) !== key(loose.map((t) => t.id)))
          problems.push(`${at}: the bank is not exactly the loose things`);
      });
    }
  }
  return problems;
}
