/**
 * Sorting Food — the five activities, in the reference's order, as data.
 *
 * Every activity is the same idea: some places (plates, trays, cards, rows),
 * each already holding a thing or two and a black SILHOUETTE for each thing
 * still to come; a few loose things; drag each one to the place whose
 * silhouette it matches. The silhouette is the rule — nothing on screen says
 * "red" or "big" in words, exactly as in the reference.
 *
 * What changed from the reference, and why:
 *  - Its characters are someone else's; the helper here is a chef, the
 *    kitchen's own grown-up, from the portal's picture set.
 *  - Every picture is one the portal already draws (Letter Treats' fruit,
 *    Numbers 1 – 5's green apple, Leo's Puzzles' shapes). So the apples sort
 *    RED from GREEN (there is no yellow apple in the portal), and the size
 *    round uses oranges, grapes and zucchini for its pumpkins, eggplants and
 *    watermelons — the same three colours, the same big-and-small pairs.
 *  - A place's silhouettes are what it still NEEDS, so a thing is right for
 *    a place exactly when that place has an empty silhouette of it. The
 *    answer is never stored anywhere else (see `homeOf`).
 */

/** Every picture this game shows. */
export type ArtId =
  | "apple-red"
  | "apple-green"
  | "banana"
  | "lemon"
  | "orange"
  | "grapes"
  | "zucchini"
  | "jam"
  | "cookie-round"
  | "cookie-square"
  | "cookie-triangle"
  | "cookie-rectangle"
  | "shape-circle"
  | "shape-square"
  | "shape-triangle"
  | "shape-rectangle"
  | "pineapple"
  | "jelly"
  | "juice"
  | "cake"
  | "soup"
  | "pizza"
  | "milk"
  | "ball"
  | "car"
  | "drum";

export interface Item {
  /** Unique within its activity. */
  id: string;
  art: ArtId;
  /** The size rounds draw the same thing bigger or smaller; no size is the
   *  middle size (the three-sizes table uses all three). */
  size?: "big" | "small";
  /** The word said when it lands (a recorded clip exists for every one). */
  word: string;
}

export interface Slot {
  item: Item;
  /** Already in place when the board opens — the worked example. */
  given?: boolean;
}

/** How a place is drawn. */
export type BinLook =
  "plate" | "tray" | "card" | "panel" | "row-yellow" | "row-green" | "row-red" | "row-orange";

export interface Bin {
  id: string;
  look: BinLook;
  /** A name for assistive tech only — never shown, the silhouettes teach. */
  aria: string;
  slots: readonly Slot[];
}

export type Scene = "apples" | "cookies" | "sizes" | "shapes" | "colours" | "kitchen";

export interface Activity {
  id: string;
  scene: Scene;
  /** Places side by side (two or three), or rows with a bank of things. */
  layout: "pair" | "rows";
  /** Where the chef watches from: between the places, the corner, or not
   *  at all (a busy board needs the room). */
  helper: "chef" | "chef-corner" | null;
  bins: readonly Bin[];
  /** The loose things, in the order they lie — the reference's order. Must be
   *  exactly the bins' empty silhouettes (checked by `checkActivity`). */
  loose: readonly string[];
  /** The bank cards wear their row's colour (the reference does). A harder
   *  table turns this off, so the child reads the food, not the border. */
  cardColours?: boolean;
}

/* ── Things ──────────────────────────────────────────────────────────────── */

const it = (id: string, art: ArtId, word: string, size?: "big" | "small"): Item => ({
  id,
  art,
  word,
  size,
});
const given = (item: Item): Slot => ({ item, given: true });
const wants = (item: Item): Slot => ({ item });

/* ── The five activities ─────────────────────────────────────────────────── */

/** 1. The chef at a table with two plates: red with red, green with green.
 *  At the end he tastes one. */
const APPLES: Activity = {
  id: "apples",
  scene: "apples",
  layout: "pair",
  helper: "chef",
  bins: [
    {
      id: "red-plate",
      look: "plate",
      aria: "The plate of red apples",
      slots: [
        given(it("r1", "apple-red", "apple")),
        given(it("r2", "apple-red", "apple")),
        wants(it("r3", "apple-red", "apple")),
      ],
    },
    {
      id: "green-plate",
      look: "plate",
      aria: "The plate of green apples",
      slots: [
        given(it("g1", "apple-green", "apple")),
        given(it("g2", "apple-green", "apple")),
        wants(it("g3", "apple-green", "apple")),
      ],
    },
  ],
  loose: ["r3", "g3"],
};

/** 2. The chef and two trays: round cookies, square cookies. */
const COOKIES: Activity = {
  id: "cookies",
  scene: "cookies",
  layout: "pair",
  helper: "chef",
  bins: [
    {
      id: "round-tray",
      look: "tray",
      aria: "The tray of round cookies",
      slots: [given(it("c1", "cookie-round", "circle")), wants(it("c2", "cookie-round", "circle"))],
    },
    {
      id: "square-tray",
      look: "tray",
      aria: "The tray of square cookies",
      slots: [
        given(it("s1", "cookie-square", "square")),
        wants(it("s2", "cookie-square", "square")),
      ],
    },
  ],
  loose: ["s2", "c2"],
};

/** 3. Two white cards: the BIG things and the SMALL things. */
const SIZES: Activity = {
  id: "sizes",
  scene: "sizes",
  layout: "pair",
  helper: "chef-corner",
  bins: [
    {
      id: "big-card",
      look: "card",
      aria: "The card of big things",
      slots: [
        given(it("ob", "orange", "orange", "big")),
        wants(it("gb", "grapes", "grapes", "big")),
        wants(it("zb", "zucchini", "zucchini", "big")),
      ],
    },
    {
      id: "small-card",
      look: "card",
      aria: "The card of small things",
      slots: [
        given(it("gs", "grapes", "grapes", "small")),
        given(it("os", "orange", "orange", "small")),
        wants(it("zs", "zucchini", "zucchini", "small")),
      ],
    },
  ],
  loose: ["zs", "gb", "zb"],
};

/** 4. The checked tablecloth: cookies on one panel, blue shapes on the
 *  other — each missing two, and the loose four are one of each kind. */
const SHAPES: Activity = {
  id: "shapes",
  scene: "shapes",
  layout: "pair",
  helper: null,
  bins: [
    {
      id: "cookie-panel",
      look: "panel",
      aria: "The panel of cookies",
      slots: [
        given(it("kc", "cookie-round", "circle")),
        wants(it("kt", "cookie-triangle", "triangle")),
        given(it("kr", "cookie-rectangle", "rectangle")),
        wants(it("ks", "cookie-square", "square")),
      ],
    },
    {
      id: "shape-panel",
      look: "panel",
      aria: "The panel of blue shapes",
      slots: [
        wants(it("bc", "shape-circle", "circle")),
        wants(it("bs", "shape-square", "square")),
        given(it("bt", "shape-triangle", "triangle")),
        given(it("br", "shape-rectangle", "rectangle")),
      ],
    },
  ],
  loose: ["bs", "kt", "bc", "ks"],
};

/** 5. Three coloured rows and a bank of six fruit cards: yellow, green, red. */
const COLOURS: Activity = {
  id: "colours",
  scene: "colours",
  layout: "rows",
  helper: null,
  bins: [
    {
      id: "yellow-row",
      look: "row-yellow",
      aria: "The yellow row",
      slots: [wants(it("y1", "lemon", "lemon")), wants(it("y2", "banana", "banana"))],
    },
    {
      id: "green-row",
      look: "row-green",
      aria: "The green row",
      slots: [wants(it("n1", "zucchini", "zucchini")), wants(it("n2", "apple-green", "apple"))],
    },
    {
      id: "red-row",
      look: "row-red",
      aria: "The red row",
      slots: [wants(it("d1", "apple-red", "apple")), wants(it("d2", "jam", "jam"))],
    },
  ],
  loose: ["y1", "y2", "n1", "n2", "d1", "d2"],
};

/* ── More tables — every one built from pictures and words already recorded ── */

/** Yellow food or red food, three each. */
const YELLOW_RED: Activity = {
  id: "yellow-red",
  scene: "colours",
  layout: "pair",
  helper: "chef-corner",
  bins: [
    {
      id: "yellow-card",
      look: "card",
      aria: "The card of yellow food",
      slots: [
        given(it("ya", "banana", "banana")),
        wants(it("yb", "lemon", "lemon")),
        wants(it("yc", "pineapple", "pineapple")),
      ],
    },
    {
      id: "red-card",
      look: "card",
      aria: "The card of red food",
      slots: [
        given(it("ra", "apple-red", "apple")),
        wants(it("rb", "jam", "jam")),
        wants(it("rc", "jelly", "jelly")),
      ],
    },
  ],
  loose: ["rb", "yb", "rc", "yc"],
};

/** Four rows, eight things, and NO coloured borders on the cards: the
 *  hardest colour table, where the child has to look at the food itself. */
const FOUR_COLOURS: Activity = {
  id: "four-colours",
  scene: "colours",
  layout: "rows",
  helper: null,
  cardColours: false,
  bins: [
    {
      id: "yellow-row-4",
      look: "row-yellow",
      aria: "The yellow row",
      slots: [wants(it("fy1", "lemon", "lemon")), wants(it("fy2", "pineapple", "pineapple"))],
    },
    {
      id: "green-row-4",
      look: "row-green",
      aria: "The green row",
      slots: [wants(it("fg1", "zucchini", "zucchini")), wants(it("fg2", "apple-green", "apple"))],
    },
    {
      id: "red-row-4",
      look: "row-red",
      aria: "The red row",
      slots: [wants(it("fr1", "jam", "jam")), wants(it("fr2", "jelly", "jelly"))],
    },
    {
      id: "orange-row-4",
      look: "row-orange",
      aria: "The orange row",
      slots: [wants(it("fo1", "orange", "orange")), wants(it("fo2", "juice", "juice"))],
    },
  ],
  loose: ["fy2", "fg2", "fo1", "fr1", "fy1", "fg1", "fr2", "fo2"],
};

/** Round things or pointed things — and a round cookie and a blue circle go
 *  on the SAME tray: the shape is the rule, not what the thing is. */
const CIRCLE_TRIANGLE: Activity = {
  id: "circle-triangle",
  scene: "cookies",
  layout: "pair",
  helper: "chef",
  bins: [
    {
      id: "circle-tray",
      look: "tray",
      aria: "The tray of circles",
      slots: [given(it("ca", "cookie-round", "circle")), wants(it("cb", "shape-circle", "circle"))],
    },
    {
      id: "triangle-tray",
      look: "tray",
      aria: "The tray of triangles",
      slots: [
        given(it("ta", "shape-triangle", "triangle")),
        wants(it("tb", "cookie-triangle", "triangle")),
      ],
    },
  ],
  loose: ["tb", "cb"],
};

/** Three trays, three shapes, cookies and blue shapes mixed on each. */
const THREE_SHAPES: Activity = {
  id: "three-shapes",
  scene: "cookies",
  layout: "rows",
  helper: null,
  bins: [
    {
      id: "circle-row",
      look: "tray",
      aria: "The tray of circles",
      slots: [
        given(it("tc1", "cookie-round", "circle")),
        wants(it("tc2", "shape-circle", "circle")),
      ],
    },
    {
      id: "square-row",
      look: "tray",
      aria: "The tray of squares",
      slots: [
        given(it("ts1", "shape-square", "square")),
        wants(it("ts2", "cookie-square", "square")),
      ],
    },
    {
      id: "triangle-row",
      look: "tray",
      aria: "The tray of triangles",
      slots: [
        given(it("tt1", "cookie-triangle", "triangle")),
        wants(it("tt2", "shape-triangle", "triangle")),
      ],
    },
  ],
  loose: ["ts2", "tt2", "tc2"],
};

/** Big and small again, with the fruit the size round did not use. */
const BIG_SMALL_FRUIT: Activity = {
  id: "big-small-fruit",
  scene: "sizes",
  layout: "pair",
  helper: "chef-corner",
  bins: [
    {
      id: "big-fruit",
      look: "card",
      aria: "The card of big things",
      slots: [
        given(it("ab", "apple-red", "apple", "big")),
        wants(it("bb", "banana", "banana", "big")),
        wants(it("lb", "lemon", "lemon", "big")),
      ],
    },
    {
      id: "small-fruit",
      look: "card",
      aria: "The card of small things",
      slots: [
        given(it("bs", "banana", "banana", "small")),
        wants(it("as", "apple-red", "apple", "small")),
        wants(it("ls", "lemon", "lemon", "small")),
      ],
    },
  ],
  loose: ["ls", "bb", "as", "lb"],
};

/** Big and small in the kitchen: a big cake and a little one. */
const BIG_SMALL_TREATS: Activity = {
  id: "big-small-treats",
  scene: "sizes",
  layout: "pair",
  helper: "chef-corner",
  bins: [
    {
      id: "big-treats",
      look: "card",
      aria: "The card of big things",
      slots: [
        given(it("kb", "cake", "cake", "big")),
        wants(it("pb", "pineapple", "pineapple", "big")),
        wants(it("jb", "juice", "juice", "big")),
      ],
    },
    {
      id: "small-treats",
      look: "card",
      aria: "The card of small things",
      slots: [
        given(it("ps", "pineapple", "pineapple", "small")),
        wants(it("ks", "cake", "cake", "small")),
        wants(it("js", "juice", "juice", "small")),
      ],
    },
  ],
  loose: ["ks", "pb", "js", "jb"],
};

/** THREE sizes: big, middle and small — the same two fruits on each card,
 *  so the only thing that tells the cards apart is how big the fruit is. */
const THREE_SIZES: Activity = {
  id: "three-sizes",
  scene: "sizes",
  layout: "pair",
  helper: null,
  bins: [
    {
      id: "big-three",
      look: "card",
      aria: "The card of big things",
      slots: [
        given(it("o3b", "orange", "orange", "big")),
        wants(it("a3b", "apple-red", "apple", "big")),
      ],
    },
    {
      id: "middle-three",
      look: "card",
      aria: "The card of middle-sized things",
      slots: [given(it("a3m", "apple-red", "apple")), wants(it("o3m", "orange", "orange"))],
    },
    {
      id: "small-three",
      look: "card",
      aria: "The card of small things",
      slots: [
        given(it("o3s", "orange", "orange", "small")),
        wants(it("a3s", "apple-red", "apple", "small")),
      ],
    },
  ],
  loose: ["a3s", "o3m", "a3b"],
};

/** Something to eat, or something to play with. */
const FOOD_TOYS: Activity = {
  id: "food-toys",
  scene: "kitchen",
  layout: "pair",
  helper: "chef",
  bins: [
    {
      id: "food-plate",
      look: "plate",
      aria: "The plate of food",
      slots: [
        given(it("fa", "apple-red", "apple")),
        wants(it("fb", "cake", "cake")),
        wants(it("fc", "banana", "banana")),
      ],
    },
    {
      id: "toy-box",
      look: "tray",
      aria: "The box of toys",
      slots: [
        given(it("ga", "ball", "ball")),
        wants(it("gb", "car", "car")),
        wants(it("gc", "drum", "drum")),
      ],
    },
  ],
  loose: ["gb", "fb", "gc", "fc"],
};

/** Something you drink, or something you eat. */
const DRINK_EAT: Activity = {
  id: "drink-eat",
  scene: "kitchen",
  layout: "pair",
  helper: "chef-corner",
  bins: [
    {
      id: "drinks-card",
      look: "card",
      aria: "The card of drinks",
      slots: [given(it("da", "juice", "juice")), wants(it("db", "milk", "milk"))],
    },
    {
      id: "eats-card",
      look: "card",
      aria: "The card of food to eat",
      slots: [
        given(it("ea", "pizza", "pizza")),
        wants(it("eb", "cake", "cake")),
        wants(it("ec", "apple-red", "apple")),
      ],
    },
  ],
  loose: ["eb", "db", "ec"],
};

/** Hot from the stove, or cold from the fridge. */
const HOT_COLD: Activity = {
  id: "hot-cold",
  scene: "kitchen",
  layout: "pair",
  helper: "chef-corner",
  bins: [
    {
      id: "hot-card",
      look: "card",
      aria: "The card of hot food",
      slots: [given(it("ha", "soup", "soup")), wants(it("hb", "pizza", "pizza"))],
    },
    {
      id: "cold-card",
      look: "card",
      aria: "The card of cold food",
      slots: [
        given(it("ka", "milk", "milk")),
        wants(it("kc", "jelly", "jelly")),
        wants(it("kd", "juice", "juice")),
      ],
    },
  ],
  loose: ["kc", "hb", "kd"],
};

/** Fruit, or a sweet treat. */
const FRUIT_TREATS: Activity = {
  id: "fruit-treats",
  scene: "kitchen",
  layout: "pair",
  helper: "chef",
  bins: [
    {
      id: "fruit-bowl",
      look: "plate",
      aria: "The plate of fruit",
      slots: [
        given(it("wa", "apple-red", "apple")),
        wants(it("wb", "banana", "banana")),
        wants(it("wc", "orange", "orange")),
      ],
    },
    {
      id: "treat-plate",
      look: "plate",
      aria: "The plate of treats",
      slots: [
        given(it("xa", "cake", "cake")),
        wants(it("xb", "jelly", "jelly")),
        wants(it("xc", "jam", "jam")),
      ],
    },
  ],
  loose: ["xb", "wb", "xc", "wc"],
};

/* ── The four modules ────────────────────────────────────────────────────── */

export type ModuleId = "colours" | "shapes" | "sizes" | "kitchen";

export interface FoodModule {
  id: ModuleId;
  /** What the picker plate says. */
  label: string;
  /** The big glyph on the plate — the rule in one look. */
  preview: string;
  aria: string;
  /** Easiest first; the last is the hardest of the module. */
  activities: readonly Activity[];
}

export const MODULES: readonly FoodModule[] = [
  {
    id: "colours",
    label: "Colours",
    preview: "🟡🔴",
    aria: "Colours — sort food by its colour",
    activities: [APPLES, YELLOW_RED, COLOURS, FOUR_COLOURS],
  },
  {
    id: "shapes",
    label: "Shapes",
    preview: "● ▲",
    aria: "Shapes — sort cookies and shapes by their shape",
    activities: [COOKIES, CIRCLE_TRIANGLE, SHAPES, THREE_SHAPES],
  },
  {
    id: "sizes",
    label: "Sizes",
    preview: "⬤ •",
    aria: "Sizes — sort food into big and small",
    activities: [SIZES, BIG_SMALL_FRUIT, BIG_SMALL_TREATS, THREE_SIZES],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    preview: "🍳",
    aria: "Kitchen — food or toys, hot or cold, drink or eat",
    activities: [FOOD_TOYS, DRINK_EAT, HOT_COLD, FRUIT_TREATS],
  },
];

export const MODULE_IDS: readonly ModuleId[] = MODULES.map((m) => m.id);

export function moduleById(id: ModuleId): FoodModule {
  return MODULES.find((m) => m.id === id) ?? MODULES[0];
}

/* ── What a table says as it opens ───────────────────────────────────────── */

/** The line that opens each module: the rule of the whole module, said once. */
const MODULE_START: Record<ModuleId, string> = {
  colours: "instr-food-colours",
  shapes: "instr-food-shapes",
  sizes: "instr-food-sizes",
  kitchen: "instr-food-kitchen",
};

/** Kitchen changes its rule every table, so each of its tables asks its own
 *  question; the other modules keep one rule and need no per-table line. */
const TABLE_ASK: Readonly<Record<string, string>> = {
  "food-toys": "instr-food-toys",
  "drink-eat": "instr-food-drink",
  "hot-cold": "instr-food-hot",
  "fruit-treats": "instr-food-fruit",
};

/** The spoken lines for a table as it opens, in order: the module's rule on
 *  its first table, then the table's own question if it has one. */
export function tableIntro(activity: Activity, index: number): string[] {
  const owner = MODULES.find((m) => m.activities.includes(activity));
  const lines: string[] = [];
  if (owner && index === 0) lines.push(MODULE_START[owner.id]);
  const ask = TABLE_ASK[activity.id];
  if (ask) lines.push(ask);
  return lines;
}

/** Every table in every module — for the checker and the stores. */
export const ACTIVITIES: readonly Activity[] = MODULES.flatMap((m) => m.activities);

/** The longest module — the ceiling on how far a saved progress can be. */
export const MAX_TABLES = Math.max(...MODULES.map((m) => m.activities.length));

/* ── Reading an activity ─────────────────────────────────────────────────── */

/** Every thing that can be picked up, by id. */
export function itemsOf(activity: Activity): Map<string, Item> {
  const out = new Map<string, Item>();
  for (const bin of activity.bins) for (const slot of bin.slots) out.set(slot.item.id, slot.item);
  return out;
}

/** The place a loose thing belongs — the bin holding its silhouette. */
export function homeOf(activity: Activity, itemId: string): Bin | undefined {
  return activity.bins.find((b) => b.slots.some((s) => !s.given && s.item.id === itemId));
}

/** The colour a bank card's border wears on the rows board: its row's
 *  (unless the table turns the hint off). */
export function rowColourOf(activity: Activity, itemId: string): string | null {
  if (activity.cardColours === false) return null;
  const home = homeOf(activity, itemId);
  return home && home.look.startsWith("row-") ? home.look.slice(4) : null;
}

/**
 * Everything a fair activity must be (empty = fair): unique ids, every loose
 * thing has exactly one home, every empty silhouette has a loose thing to fill
 * it, and no place is already full.
 */
export function checkActivity(activity: Activity): string[] {
  const problems: string[] = [];
  const ids = activity.bins.flatMap((b) => b.slots.map((s) => s.item.id));
  if (new Set(ids).size !== ids.length) problems.push("duplicate item ids");
  const empty = activity.bins.flatMap((b) => b.slots.filter((s) => !s.given).map((s) => s.item.id));
  const loose = [...activity.loose];
  if (empty.length !== loose.length || empty.some((id) => !loose.includes(id)))
    problems.push("loose things are not exactly the empty silhouettes");
  for (const id of loose) if (!homeOf(activity, id)) problems.push(`${id} has no home`);
  for (const b of activity.bins)
    if (b.slots.every((s) => s.given)) problems.push(`${b.id} has nothing left to fill`);
  return problems;
}
