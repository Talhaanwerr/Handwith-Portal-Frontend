/**
 * Magic Colours' pictures — chunky, friendly vehicles of our own, drawn as
 * colouring-book line art in one 400 × 250 box, for the six Magic Colours
 * games (road, sea, sky, space, emergency, construction).
 *
 * Each vehicle is a short list of PARTS, painted in order (a later part sits
 * on top of an earlier one, so a window can sit inside a body). A part is
 * one closed shape — or several, like a bus's three windows, which fill
 * together — with the one colour it always becomes, and `at`, a point
 * inside it where the teaching hand taps. `details` are the lines that are
 * never coloured (a door, a rung, a mast); `trims` are small shapes drawn
 * already filled and never tapped (a wheel's hubcap).
 *
 * The colours are the real ones where it matters — a red fire engine with
 * black tyres, a white police car with blue doors and red and blue lights,
 * a yellow digger — so besides Color & Paint's seven, a part can be WHITE,
 * BLACK or GREY (each has its own "That one is …" line).
 *
 * Every part is at least 46 units across its narrowest way: the box is
 * shown about one unit to a pixel on a 568 × 320 phone, so each part is a
 * real tap target for a small finger. `checkRounds()` in rounds.ts holds
 * the drawings to that.
 */

import { PAINT_COLORS, type PaintColorId } from "@games/color-paint/constants/colors";

export const ART_W = 400;
export const ART_H = 250;

/** Color & Paint's seven, and the three a real vehicle needs besides. */
export type McColour = PaintColorId | "white" | "black" | "grey";

const EXTRA_FILL: Record<"white" | "black" | "grey", string> = {
  white: "#ffffff",
  black: "#3a3f4c",
  grey: "#a9b2be",
};

/** A colour's paint. */
export const mcFill = (c: McColour): string =>
  c === "white" || c === "black" || c === "grey" ? EXTRA_FILL[c] : PAINT_COLORS[c].fill;

/** A box: left, top, right, bottom. */
export type Box = readonly [number, number, number, number];

export interface Shape {
  d: string;
  box: Box;
}

export interface Part {
  id: string;
  /** What it is, for screen readers ("the window"). */
  name: string;
  colour: McColour;
  shape: Shape;
  /** Where the hand taps — a point well inside the part. */
  at: readonly [number, number];
}

/** How a finished vehicle comes alive. */
export type Exit = "drive" | "fly" | "rise" | "sail";

/** The scene a vehicle is played in. */
export type Terrain = "road" | "sea" | "sky" | "space" | "site";

export type VehicleId =
  // on the road
  | "car"
  | "bus"
  | "taxi"
  | "school-bus"
  | "ice-cream-van"
  | "scooter"
  // at sea
  | "boat"
  | "speedboat"
  | "fishing-boat"
  | "submarine"
  | "ship"
  | "ferry"
  // in the sky
  | "plane"
  | "helicopter"
  | "biplane"
  | "balloon"
  | "airship"
  // in space
  | "rocket"
  | "shuttle"
  | "satellite"
  | "moon-buggy"
  | "ufo"
  // emergency
  | "fire-engine"
  | "police-car"
  | "ambulance"
  | "rescue-helicopter"
  | "lifeboat"
  | "tow-truck"
  // construction
  | "digger"
  | "dump-truck"
  | "crane"
  | "cement-mixer"
  | "bulldozer"
  | "road-roller";

export interface Vehicle {
  id: VehicleId;
  /** Its plain name, as a three-year-old hears it ("fire engine"). */
  name: string;
  parts: readonly Part[];
  details: readonly string[];
  /** Small shapes drawn already filled, never tapped (hubcaps). */
  trims?: readonly Shape[];
  exit: Exit;
  terrain: Terrain;
  /** Stands on the ground (its wheels or hull at the bottom of the box) —
   *  or, false, floats in the middle of the sky. */
  grounded: boolean;
}

/* ── Shape helpers (absolute M/L/Q/Z paths only, so a box can be read off) ── */

function boxOf(d: string): Box {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const xs = n.filter((_, i) => i % 2 === 0);
  const ys = n.filter((_, i) => i % 2 === 1);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

const path = (d: string): Shape => ({ d, box: boxOf(d) });

function circle(cx: number, cy: number, r: number): Shape {
  return {
    d: `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`,
    box: [cx - r, cy - r, cx + r, cy + r],
  };
}

function rect(x: number, y: number, w: number, h: number, r: number): Shape {
  return path(
    `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} ` +
      `L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} ` +
      `L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} L${x},${y + r} Q${x},${y} ${x + r},${y} Z`
  );
}

/** Several shapes that fill as one part (the bus's windows). */
function union(...shapes: Shape[]): Shape {
  return {
    d: shapes.map((s) => s.d).join(" "),
    box: [
      Math.min(...shapes.map((s) => s.box[0])),
      Math.min(...shapes.map((s) => s.box[1])),
      Math.max(...shapes.map((s) => s.box[2])),
      Math.max(...shapes.map((s) => s.box[3])),
    ],
  };
}

const hub = (cx: number, cy: number, r = 11) => circle(cx, cy, r).d;

/** A black tyre (its hubcap is a trim: `hubcaps`). */
function wheel(id: string, cx: number, cy: number, r: number): Part {
  return {
    id,
    name: id.replace("-", " "),
    colour: "black",
    shape: circle(cx, cy, r),
    at: [cx, cy - r * 0.62],
  };
}

/** Two or three tyres that colour as one part. */
function wheels(...ws: readonly (readonly [number, number, number])[]): Part {
  const [cx, cy, r] = ws[0];
  return {
    id: "wheels",
    name: "wheels",
    colour: "black",
    shape: union(...ws.map(([x, y, rr]) => circle(x, y, rr))),
    at: [cx, cy - r * 0.62],
  };
}

/** The grey hubcaps of a vehicle's tyres. */
const hubcaps = (...ws: readonly (readonly [number, number, number])[]) =>
  ws.map(([x, y, r]) => circle(x, y, Math.round(r * 0.4)));

/* ── Shapes two vehicles share ──────────────────────────────────────────── */

const CAR_BODY = path(
  "M30,196 L30,150 Q30,124 56,122 L104,118 L144,60 Q152,46 170,46 L256,46 Q274,46 284,60 L322,118 L350,122 Q374,126 374,152 L374,196 Q374,208 362,208 L42,208 Q30,208 30,196 Z"
);
const CAR_WINDOW = path(
  "M166,64 L256,64 Q266,64 272,74 L300,116 L130,116 L154,74 Q158,64 166,64 Z"
);
const CAR_WHEELS = [
  [108, 206, 36],
  [296, 206, 36],
] as const;
const CAR_DETAILS = [
  "M215,64 L215,116",
  "M216,130 L216,196",
  "M236,146 L256,146",
  "M348,146 L364,146",
];

const BUS_BODY = path(
  "M38,30 L342,30 Q380,30 380,68 L380,192 Q380,208 364,208 L36,208 Q20,208 20,192 L20,48 Q20,30 38,30 Z"
);
const BUS_WINDOWS = union(
  rect(40, 50, 72, 60, 10),
  rect(128, 50, 72, 60, 10),
  rect(216, 50, 72, 60, 10)
);
const BUS_DOOR = rect(308, 50, 54, 132, 10);
const BUS_WHEELS = [
  [90, 206, 34],
  [252, 206, 34],
] as const;

const HELI_TAIL = path("M60,94 L190,100 L190,158 L60,144 Z");
const HELI_FIN = path("M24,70 Q24,56 38,58 L66,62 Q76,64 76,76 L76,140 L36,140 Q24,140 24,128 Z");
const HELI_BODY = path(
  "M176,96 Q176,62 214,62 L290,62 Q354,62 370,124 Q378,172 330,176 L214,176 Q176,176 176,140 Z"
);
const HELI_WINDOW = path(
  "M268,76 L290,76 Q340,76 352,124 L268,124 Q258,124 258,114 L258,86 Q258,76 268,76 Z"
);
const HELI_DETAILS = [
  "M262,62 L262,36",
  "M110,32 L396,32",
  "M80,36 L120,32",
  "M208,176 L196,206 M318,176 L330,206",
  "M164,210 Q170,206 184,206 L346,206 Q362,206 366,196",
];

/** A boat's hull, waterline to keel (the sailboat's, the fishing boat's). */
const HULL = path(
  "M20,160 L380,160 Q374,186 356,212 Q338,234 306,234 L96,234 Q62,234 46,212 Q28,186 20,160 Z"
);

/** A truck's cab, facing right (the dump truck's, the cement mixer's). */
const TRUCK_CAB = path(
  "M244,206 L244,80 Q244,64 260,64 L320,64 Q338,64 346,80 L376,136 Q382,146 382,160 L382,194 Q382,206 370,206 Z"
);
const TRUCK_WINDOW = path("M262,82 L314,82 Q324,82 328,90 L350,134 L262,134 Z");

/* ── On the road ────────────────────────────────────────────────────────── */

const CAR: Vehicle = {
  id: "car",
  name: "car",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    { id: "body", name: "body", colour: "red", shape: CAR_BODY, at: [206, 160] },
    { id: "window", name: "window", colour: "blue", shape: CAR_WINDOW, at: [182, 92] },
    wheel("back-wheel", 108, 206, 36),
    wheel("front-wheel", 296, 206, 36),
  ],
  details: CAR_DETAILS,
  trims: hubcaps(...CAR_WHEELS),
};

const BUS: Vehicle = {
  id: "bus",
  name: "bus",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    { id: "body", name: "body", colour: "red", shape: BUS_BODY, at: [170, 160] },
    { id: "windows", name: "windows", colour: "blue", shape: BUS_WINDOWS, at: [164, 80] },
    { id: "door", name: "door", colour: "yellow", shape: BUS_DOOR, at: [335, 120] },
    wheel("back-wheel", 90, 206, 34),
    wheel("front-wheel", 252, 206, 34),
  ],
  details: ["M20,136 L296,136", "M335,58 L335,174", "M20,170 L40,170", "M366,150 L380,150"],
  trims: hubcaps(...BUS_WHEELS),
};

const TAXI: Vehicle = {
  id: "taxi",
  name: "taxi",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    {
      id: "sign",
      name: "taxi sign",
      colour: "white",
      shape: rect(176, 0, 68, 48, 12),
      at: [210, 22],
    },
    { id: "body", name: "body", colour: "yellow", shape: CAR_BODY, at: [206, 160] },
    { id: "window", name: "window", colour: "blue", shape: CAR_WINDOW, at: [182, 92] },
    wheel("back-wheel", 108, 206, 36),
    wheel("front-wheel", 296, 206, 36),
  ],
  details: [...CAR_DETAILS, "M38,176 L156,176", "M260,176 L366,176"],
  trims: hubcaps(...CAR_WHEELS),
};

const SCHOOL_BUS: Vehicle = {
  id: "school-bus",
  name: "school bus",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    { id: "body", name: "body", colour: "yellow", shape: BUS_BODY, at: [150, 124] },
    { id: "windows", name: "windows", colour: "blue", shape: BUS_WINDOWS, at: [164, 80] },
    { id: "door", name: "door", colour: "blue", shape: BUS_DOOR, at: [335, 120] },
    {
      id: "stop",
      name: "stop sign",
      colour: "red",
      shape: path("M180,142 L200,142 L214,156 L214,176 L200,190 L180,190 L166,176 L166,156 Z"),
      at: [190, 166],
    },
    wheels(...BUS_WHEELS),
  ],
  details: ["M20,136 L162,136 M218,136 L296,136", "M335,58 L335,174", "M366,150 L380,150"],
  trims: hubcaps(...BUS_WHEELS),
};

const ICE_CREAM_VAN: Vehicle = {
  id: "ice-cream-van",
  name: "ice cream van",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    {
      id: "cone",
      name: "cone",
      colour: "orange",
      shape: path("M222,48 L314,48 L268,112 Z"),
      at: [268, 86],
    },
    { id: "scoop", name: "ice cream", colour: "pink", shape: circle(268, 34, 32), at: [268, 30] },
    {
      id: "body",
      name: "van",
      colour: "white",
      shape: path(
        "M40,104 L300,104 Q318,104 326,118 L350,156 L360,158 Q380,162 380,180 L380,194 Q380,208 366,208 L36,208 Q20,208 20,194 L20,124 Q20,104 40,104 Z"
      ),
      at: [272, 150],
    },
    {
      id: "hatch",
      name: "hatch",
      colour: "blue",
      shape: rect(52, 118, 156, 50, 10),
      at: [130, 143],
    },
    wheel("back-wheel", 96, 206, 34),
    wheel("front-wheel", 302, 206, 34),
  ],
  details: [
    "M248,74 L270,102",
    "M288,74 L266,102",
    "M232,118 L232,196",
    "M244,156 L258,156",
    "M362,182 L378,182",
  ],
  trims: hubcaps([96, 206, 34], [302, 206, 34]),
};

const SCOOTER: Vehicle = {
  id: "scooter",
  name: "scooter",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    {
      id: "body",
      name: "body",
      colour: "green",
      shape: path(
        "M96,70 Q96,56 110,56 L130,56 Q142,56 142,70 L142,166 L228,166 L236,128 Q242,104 270,104 L318,104 Q350,104 354,136 L358,190 Q358,206 342,206 L110,206 Q96,206 96,192 Z"
      ),
      at: [200, 186],
    },
    {
      id: "seat",
      name: "seat",
      colour: "black",
      shape: path("M232,106 Q232,60 276,60 L326,60 Q352,60 352,84 L352,106 Z"),
      at: [292, 84],
    },
    {
      id: "light",
      name: "headlight",
      colour: "yellow",
      shape: circle(119, 104, 23),
      at: [119, 104],
    },
    wheel("front-wheel", 119, 206, 36),
    wheel("back-wheel", 316, 206, 36),
  ],
  details: ["M119,56 L119,28", "M96,28 L146,28"],
  trims: hubcaps([119, 206, 36], [316, 206, 36]),
};

/* ── At sea ─────────────────────────────────────────────────────────────── */

const BOAT: Vehicle = {
  id: "boat",
  name: "sailboat",
  exit: "sail",
  terrain: "sea",
  grounded: true,
  parts: [
    {
      id: "sail",
      name: "big sail",
      colour: "white",
      shape: path("M196,64 L196,160 L66,160 Q118,112 196,64 Z"),
      at: [160, 132],
    },
    {
      id: "front-sail",
      name: "little sail",
      colour: "orange",
      shape: path("M216,70 Q296,112 336,160 L216,160 Z"),
      at: [250, 136],
    },
    {
      id: "flag",
      name: "flag",
      colour: "red",
      shape: path("M212,6 L286,32 L212,58 Z"),
      at: [234, 32],
    },
    {
      id: "hull",
      name: "boat",
      colour: "blue",
      shape: path(
        "M22,172 L378,172 Q372,190 358,208 Q342,232 312,232 L92,232 Q62,232 46,210 Q30,190 22,172 Z"
      ),
      at: [200, 200],
    },
  ],
  details: ["M206,6 L206,172", hub(110, 200, 9), hub(290, 200, 9)],
};

const SPEEDBOAT: Vehicle = {
  id: "speedboat",
  name: "speedboat",
  exit: "sail",
  terrain: "sea",
  grounded: true,
  parts: [
    {
      id: "engine",
      name: "engine",
      colour: "black",
      shape: rect(8, 100, 54, 100, 14),
      at: [30, 130],
    },
    { id: "seat", name: "seat", colour: "white", shape: rect(96, 88, 96, 56, 16), at: [144, 112] },
    {
      id: "windscreen",
      name: "windscreen",
      colour: "blue",
      shape: path("M204,142 L238,88 L290,88 L272,142 Z"),
      at: [252, 118],
    },
    {
      id: "hull",
      name: "boat",
      colour: "red",
      shape: path(
        "M40,140 L320,140 Q376,140 388,152 L358,204 Q348,222 320,222 L70,222 Q48,222 44,200 Z"
      ),
      at: [200, 186],
    },
  ],
  details: ["M58,176 L360,176", "M62,196 L340,196"],
};

const FISHING_BOAT: Vehicle = {
  id: "fishing-boat",
  name: "fishing boat",
  exit: "sail",
  terrain: "sea",
  grounded: true,
  parts: [
    {
      id: "cabin",
      name: "cabin",
      colour: "white",
      shape: rect(170, 76, 170, 88, 10),
      at: [208, 130],
    },
    {
      id: "window",
      name: "window",
      colour: "blue",
      shape: rect(250, 96, 70, 50, 10),
      at: [285, 121],
    },
    {
      id: "roof",
      name: "roof",
      colour: "red",
      shape: path("M156,84 L354,84 L334,34 L176,34 Z"),
      at: [255, 60],
    },
    { id: "hull", name: "boat", colour: "green", shape: HULL, at: [110, 196] },
  ],
  details: ["M96,160 L96,30", "M96,52 L150,150", "M96,80 L130,150"],
};

const SUBMARINE: Vehicle = {
  id: "submarine",
  name: "submarine",
  exit: "sail",
  terrain: "sea",
  grounded: true,
  parts: [
    {
      id: "tower",
      name: "tower",
      colour: "orange",
      shape: path("M166,124 L170,74 Q172,58 188,58 L248,58 Q264,58 268,74 L282,124 Z"),
      at: [222, 90],
    },
    {
      id: "propeller",
      name: "propeller",
      colour: "grey",
      shape: rect(8, 132, 48, 92, 16),
      at: [32, 178],
    },
    {
      id: "hull",
      name: "submarine",
      colour: "yellow",
      shape: path(
        "M104,120 L318,120 Q386,120 386,178 Q386,236 318,236 L104,236 Q62,236 62,178 Q62,120 104,120 Z"
      ),
      at: [96, 178],
    },
    {
      id: "windows",
      name: "windows",
      colour: "blue",
      shape: union(circle(158, 178, 26), circle(230, 178, 26), circle(302, 178, 26)),
      at: [230, 178],
    },
  ],
  details: ["M236,58 L236,22 L268,22", "M56,178 L62,178"],
};

const SHIP: Vehicle = {
  id: "ship",
  name: "ship",
  exit: "sail",
  terrain: "sea",
  grounded: true,
  parts: [
    {
      id: "bridge",
      name: "bridge",
      colour: "white",
      shape: rect(24, 52, 66, 100, 8),
      at: [57, 120],
    },
    {
      id: "red-box",
      name: "red box",
      colour: "red",
      shape: rect(102, 94, 68, 56, 6),
      at: [136, 122],
    },
    {
      id: "green-box",
      name: "green box",
      colour: "green",
      shape: rect(178, 94, 68, 56, 6),
      at: [212, 122],
    },
    {
      id: "yellow-box",
      name: "yellow box",
      colour: "yellow",
      shape: rect(254, 94, 68, 56, 6),
      at: [288, 122],
    },
    {
      id: "hull",
      name: "ship",
      colour: "blue",
      shape: path("M14,150 L386,150 L360,216 Q352,232 330,232 L60,232 Q44,232 38,216 Z"),
      at: [200, 192],
    },
  ],
  details: [
    "M36,72 L78,72",
    "M36,92 L78,92",
    "M124,94 L124,150 M148,94 L148,150",
    "M200,94 L200,150 M224,94 L224,150",
    "M276,94 L276,150 M300,94 L300,150",
    hub(330, 182, 9),
  ],
};

const FERRY: Vehicle = {
  id: "ferry",
  name: "ferry",
  exit: "sail",
  terrain: "sea",
  grounded: true,
  parts: [
    {
      id: "funnel",
      name: "funnel",
      colour: "yellow",
      shape: path("M150,92 L162,30 L222,30 L234,92 Z"),
      at: [192, 62],
    },
    {
      id: "deck",
      name: "cabins",
      colour: "white",
      shape: path("M60,172 L60,104 Q60,90 74,90 L300,90 Q320,90 330,104 L356,172 Z"),
      at: [330, 150],
    },
    {
      id: "windows",
      name: "windows",
      colour: "blue",
      shape: union(
        rect(78, 110, 48, 48, 12),
        rect(140, 110, 48, 48, 12),
        rect(202, 110, 48, 48, 12),
        rect(264, 110, 48, 48, 12)
      ),
      at: [164, 134],
    },
    {
      id: "hull",
      name: "ferry",
      colour: "red",
      shape: path("M14,170 L386,170 L362,220 Q354,234 332,234 L62,234 Q46,234 40,220 Z"),
      at: [200, 204],
    },
  ],
  details: ["M159,46 L225,46", "M30,190 L372,190"],
};

/* ── In the sky ─────────────────────────────────────────────────────────── */

const PLANE: Vehicle = {
  id: "plane",
  name: "aeroplane",
  exit: "fly",
  terrain: "sky",
  grounded: false,
  parts: [
    {
      id: "tail",
      name: "tail",
      colour: "red",
      shape: path("M28,108 L42,40 Q46,26 62,28 L84,32 Q98,36 102,50 L122,108 Z"),
      at: [70, 70],
    },
    {
      id: "body",
      name: "body",
      colour: "white",
      shape: path("M40,100 L330,100 L330,172 L72,172 Q46,172 36,150 L22,118 Q16,100 40,100 Z"),
      at: [100, 150],
    },
    {
      id: "nose",
      name: "nose",
      colour: "red",
      shape: path("M316,100 Q382,104 382,136 Q382,168 316,172 Q334,136 316,100 Z"),
      at: [356, 136],
    },
    {
      id: "window",
      name: "cockpit window",
      colour: "blue",
      shape: path("M218,102 Q218,52 262,52 Q306,52 306,102 Z"),
      at: [262, 82],
    },
    {
      id: "wing",
      name: "wing",
      colour: "grey",
      shape: path("M138,140 L272,140 L248,220 Q244,230 232,230 L170,230 Q154,230 152,214 Z"),
      at: [204, 186],
    },
  ],
  details: [hub(132, 124, 10), hub(170, 124, 10), "M392,96 L392,176"],
};

const HELICOPTER: Vehicle = {
  id: "helicopter",
  name: "helicopter",
  exit: "rise",
  terrain: "sky",
  grounded: false,
  parts: [
    { id: "tail", name: "tail", colour: "green", shape: HELI_TAIL, at: [120, 122] },
    { id: "fin", name: "tail fin", colour: "yellow", shape: HELI_FIN, at: [50, 100] },
    { id: "body", name: "body", colour: "orange", shape: HELI_BODY, at: [220, 146] },
    { id: "window", name: "window", colour: "blue", shape: HELI_WINDOW, at: [298, 100] },
  ],
  details: HELI_DETAILS,
};

const BIPLANE: Vehicle = {
  id: "biplane",
  name: "biplane",
  exit: "fly",
  terrain: "sky",
  grounded: false,
  parts: [
    {
      id: "tail",
      name: "tail",
      colour: "blue",
      shape: path("M60,124 L26,70 Q22,58 36,58 L70,58 Q84,58 90,72 L104,100 Z"),
      at: [58, 74],
    },
    {
      id: "body",
      name: "body",
      colour: "red",
      shape: path(
        "M60,120 Q60,96 84,96 L300,96 Q340,96 344,130 Q340,164 300,164 L84,164 Q60,164 60,140 Z"
      ),
      at: [112, 130],
    },
    {
      id: "wings",
      name: "wings",
      colour: "yellow",
      shape: union(rect(150, 40, 150, 46, 14), rect(140, 150, 170, 46, 14)),
      at: [225, 63],
    },
    {
      id: "propeller",
      name: "propeller",
      colour: "grey",
      shape: path("M344,60 Q392,60 392,130 Q392,200 344,200 Q330,130 344,60 Z"),
      at: [366, 130],
    },
    wheels([150, 222, 25], [270, 222, 25]),
  ],
  details: ["M180,86 L180,96 M270,86 L270,96", "M150,196 L150,198 M270,196 L270,198"],
  trims: hubcaps([150, 222, 25], [270, 222, 25]),
};

const BALLOON: Vehicle = {
  id: "balloon",
  name: "hot-air balloon",
  exit: "rise",
  terrain: "sky",
  grounded: false,
  parts: [
    {
      id: "left",
      name: "left stripe",
      colour: "red",
      shape: path("M200,6 Q96,6 96,96 Q96,140 166,176 Q140,96 200,6 Z"),
      at: [130, 96],
    },
    {
      id: "middle",
      name: "middle stripe",
      colour: "yellow",
      shape: path("M200,6 Q140,96 166,176 L234,176 Q260,96 200,6 Z"),
      at: [200, 110],
    },
    {
      id: "right",
      name: "right stripe",
      colour: "blue",
      shape: path("M200,6 Q304,6 304,96 Q304,140 234,176 Q260,96 200,6 Z"),
      at: [270, 96],
    },
    {
      id: "basket",
      name: "basket",
      colour: "orange",
      shape: rect(164, 196, 72, 50, 8),
      at: [200, 222],
    },
  ],
  details: ["M170,176 L174,196", "M230,176 L226,196", "M164,214 L236,214"],
};

const AIRSHIP: Vehicle = {
  id: "airship",
  name: "airship",
  exit: "fly",
  terrain: "sky",
  grounded: false,
  parts: [
    {
      id: "fins",
      name: "fins",
      colour: "red",
      shape: union(
        path("M120,64 L46,10 Q30,2 30,22 L30,80 Z"),
        path("M120,156 L46,210 Q30,218 30,198 L30,140 Z")
      ),
      at: [48, 36],
    },
    {
      id: "balloon",
      name: "big balloon",
      colour: "grey",
      shape: path("M60,110 Q60,30 210,30 Q370,30 370,110 Q370,190 210,190 Q60,190 60,110 Z"),
      at: [170, 110],
    },
    {
      id: "nose",
      name: "nose",
      colour: "blue",
      shape: path("M300,42 Q370,52 370,110 Q370,168 300,178 Q326,110 300,42 Z"),
      at: [346, 110],
    },
    {
      id: "cabin",
      name: "cabin",
      colour: "yellow",
      shape: rect(166, 186, 112, 52, 14),
      at: [222, 212],
    },
  ],
  details: [
    "M190,186 L196,180 M254,186 L248,180",
    "M200,200 L200,224 M222,200 L222,224 M244,200 L244,224",
  ],
};

/* ── In space ───────────────────────────────────────────────────────────── */

const ROCKET: Vehicle = {
  id: "rocket",
  name: "rocket",
  exit: "rise",
  terrain: "space",
  grounded: false,
  parts: [
    {
      id: "flame",
      name: "flame",
      colour: "orange",
      shape: path("M172,190 L228,190 Q234,222 200,248 Q166,222 172,190 Z"),
      at: [200, 214],
    },
    {
      id: "fins",
      name: "fins",
      colour: "red",
      shape: union(
        path("M162,128 L114,184 Q104,206 128,206 L162,206 Z"),
        path("M238,128 L286,184 Q296,206 272,206 L238,206 Z")
      ),
      at: [138, 188],
    },
    { id: "body", name: "body", colour: "white", shape: rect(158, 70, 84, 130, 8), at: [200, 178] },
    {
      id: "nose",
      name: "nose",
      colour: "red",
      shape: path("M158,78 Q164,26 200,4 Q236,26 242,78 Z"),
      at: [200, 52],
    },
    { id: "window", name: "window", colour: "blue", shape: circle(200, 118, 25), at: [200, 118] },
  ],
  details: [hub(200, 118, 12), "M158,158 L242,158"],
};

const SHUTTLE: Vehicle = {
  id: "shuttle",
  name: "space shuttle",
  exit: "fly",
  terrain: "space",
  grounded: false,
  parts: [
    {
      id: "flame",
      name: "flame",
      colour: "orange",
      shape: path("M62,112 L62,188 Q6,176 0,150 Q6,124 62,112 Z"),
      at: [24, 150],
    },
    {
      id: "fin",
      name: "tail fin",
      colour: "white",
      shape: path("M52,110 L66,30 Q70,18 84,20 L112,24 Q124,26 128,40 L146,110 Z"),
      at: [96, 64],
    },
    {
      id: "body",
      name: "body",
      colour: "white",
      shape: path("M48,108 L290,108 Q360,112 388,150 Q360,188 290,192 L48,192 Z"),
      at: [200, 138],
    },
    {
      id: "nose",
      name: "nose",
      colour: "black",
      shape: path("M330,116 Q370,124 388,150 Q370,176 330,184 Q344,150 330,116 Z"),
      at: [362, 150],
    },
    {
      id: "wing",
      name: "wing",
      colour: "grey",
      shape: path("M118,166 L280,166 L334,198 Q340,212 324,212 L140,212 Z"),
      at: [230, 190],
    },
  ],
  details: ["M276,126 L300,126", "M310,130 L322,134", "M60,150 L100,150"],
};

const SATELLITE: Vehicle = {
  id: "satellite",
  name: "satellite",
  exit: "fly",
  terrain: "space",
  grounded: false,
  parts: [
    {
      id: "left-panel",
      name: "left solar panel",
      colour: "blue",
      shape: rect(20, 96, 120, 58, 8),
      at: [80, 110],
    },
    {
      id: "right-panel",
      name: "right solar panel",
      colour: "blue",
      shape: rect(260, 96, 120, 58, 8),
      at: [320, 110],
    },
    {
      id: "body",
      name: "body",
      colour: "yellow",
      shape: rect(160, 80, 80, 90, 10),
      at: [200, 125],
    },
    {
      id: "dish",
      name: "dish",
      colour: "white",
      shape: path("M150,60 Q150,10 200,10 Q250,10 250,60 Z"),
      at: [200, 38],
    },
  ],
  details: [
    "M140,125 L160,125 M240,125 L260,125",
    "M60,96 L60,154 M100,96 L100,154 M300,96 L300,154 M340,96 L340,154",
    "M20,125 L140,125 M260,125 L380,125",
    "M200,60 L200,80",
  ],
};

const MOON_BUGGY: Vehicle = {
  id: "moon-buggy",
  name: "moon buggy",
  exit: "drive",
  terrain: "space",
  grounded: true,
  parts: [
    {
      id: "panel",
      name: "solar panel",
      colour: "blue",
      shape: rect(100, 52, 200, 46, 8),
      at: [150, 75],
    },
    {
      id: "body",
      name: "body",
      colour: "white",
      shape: rect(40, 110, 320, 70, 14),
      at: [200, 150],
    },
    { id: "lamp", name: "lamp", colour: "yellow", shape: circle(334, 88, 24), at: [334, 84] },
    wheel("back-wheel", 100, 200, 40),
    wheel("front-wheel", 300, 200, 40),
  ],
  details: ["M140,98 L140,110 M260,98 L260,110", "M150,52 L150,98 M200,52 L200,98 M250,52 L250,98"],
  trims: hubcaps([100, 200, 40], [300, 200, 40]),
};

const UFO: Vehicle = {
  id: "ufo",
  name: "flying saucer",
  exit: "fly",
  terrain: "space",
  grounded: false,
  parts: [
    {
      id: "dome",
      name: "glass dome",
      colour: "blue",
      shape: path("M130,110 Q130,30 200,30 Q270,30 270,110 Z"),
      at: [200, 66],
    },
    {
      id: "bottom",
      name: "bottom",
      colour: "purple",
      shape: path("M110,160 L290,160 L260,208 Q254,216 240,216 L160,216 Q146,216 140,208 Z"),
      at: [200, 192],
    },
    {
      id: "saucer",
      name: "saucer",
      colour: "grey",
      shape: path(
        "M20,130 Q20,96 120,96 L280,96 Q380,96 380,130 Q380,164 280,164 L120,164 Q20,164 20,130 Z"
      ),
      at: [145, 130],
    },
    {
      id: "lights",
      name: "lights",
      colour: "yellow",
      shape: union(circle(80, 130, 24), circle(200, 136, 24), circle(320, 130, 24)),
      at: [200, 136],
    },
  ],
  details: [],
};

/* ── Emergency ──────────────────────────────────────────────────────────── */

const FIRE_ENGINE: Vehicle = {
  id: "fire-engine",
  name: "fire engine",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    {
      id: "body",
      name: "body",
      colour: "red",
      shape: path(
        "M34,92 L272,92 L272,58 Q272,46 284,46 L330,46 Q346,46 354,60 L378,112 Q382,120 382,130 L382,194 Q382,208 368,208 L34,208 Q20,208 20,194 L20,106 Q20,92 34,92 Z"
      ),
      at: [230, 150],
    },
    {
      id: "window",
      name: "window",
      colour: "blue",
      shape: path("M290,62 L326,62 Q338,62 343,72 L362,114 L290,114 Z"),
      at: [318, 92],
    },
    {
      id: "ladder",
      name: "ladder",
      colour: "grey",
      shape: rect(30, 30, 224, 50, 10),
      at: [90, 55],
    },
    {
      id: "hose",
      name: "hose reel",
      colour: "yellow",
      shape: circle(160, 148, 32),
      at: [160, 134],
    },
    wheel("back-wheel", 82, 206, 34),
    wheel("front-wheel", 312, 206, 34),
  ],
  details: [
    "M72,30 L72,80",
    "M114,30 L114,80",
    "M156,30 L156,80",
    "M198,30 L198,80",
    "M60,80 L60,92",
    "M224,80 L224,92",
    hub(160, 148, 12),
    "M272,120 L272,190",
  ],
  trims: hubcaps([82, 206, 34], [312, 206, 34]),
};

const POLICE_CAR: Vehicle = {
  id: "police-car",
  name: "police car",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    {
      id: "red-light",
      name: "red light",
      colour: "red",
      shape: rect(162, 0, 48, 48, 12),
      at: [186, 22],
    },
    {
      id: "blue-light",
      name: "blue light",
      colour: "blue",
      shape: rect(212, 0, 48, 48, 12),
      at: [236, 22],
    },
    { id: "body", name: "body", colour: "white", shape: CAR_BODY, at: [70, 160] },
    { id: "window", name: "window", colour: "blue", shape: CAR_WINDOW, at: [182, 92] },
    {
      id: "doors",
      name: "doors",
      colour: "blue",
      shape: rect(136, 124, 156, 74, 10),
      at: [176, 148],
    },
    wheels(...CAR_WHEELS),
  ],
  details: ["M215,64 L215,116", "M216,130 L216,196", "M348,146 L364,146"],
  trims: hubcaps(...CAR_WHEELS),
};

const AMBULANCE: Vehicle = {
  id: "ambulance",
  name: "ambulance",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    {
      id: "light",
      name: "light",
      colour: "blue",
      shape: path("M132,64 L132,40 Q132,14 160,14 Q188,14 188,40 L188,64 Z"),
      at: [160, 38],
    },
    {
      id: "body",
      name: "body",
      colour: "white",
      shape: path(
        "M40,60 L286,60 Q300,60 308,72 L344,122 L360,124 Q380,128 380,152 L380,194 Q380,208 366,208 L36,208 Q20,208 20,194 L20,76 Q20,60 40,60 Z"
      ),
      at: [222, 116],
    },
    {
      id: "window",
      name: "window",
      colour: "blue",
      shape: path("M270,74 L292,74 Q298,74 302,80 L332,122 L270,122 Z"),
      at: [290, 100],
    },
    {
      id: "cross",
      name: "cross",
      colour: "red",
      shape: path(
        "M124,66 L156,66 L156,88 L178,88 L178,120 L156,120 L156,142 L124,142 L124,120 L102,120 L102,88 L124,88 Z"
      ),
      at: [140, 104],
    },
    {
      id: "stripe",
      name: "stripe",
      colour: "green",
      shape: path("M20,150 L380,150 L380,194 Q380,208 366,208 L36,208 Q20,208 20,194 Z"),
      at: [200, 166],
    },
    wheels([96, 206, 34], [302, 206, 34]),
  ],
  details: ["M254,72 L254,150", "M266,140 L282,140", "M20,150 L380,150"],
  trims: hubcaps([96, 206, 34], [302, 206, 34]),
};

const RESCUE_HELICOPTER: Vehicle = {
  id: "rescue-helicopter",
  name: "rescue helicopter",
  exit: "rise",
  terrain: "sky",
  grounded: false,
  parts: [
    { id: "tail", name: "tail", colour: "white", shape: HELI_TAIL, at: [120, 122] },
    { id: "fin", name: "tail fin", colour: "red", shape: HELI_FIN, at: [50, 100] },
    { id: "body", name: "body", colour: "red", shape: HELI_BODY, at: [220, 146] },
    { id: "window", name: "window", colour: "blue", shape: HELI_WINDOW, at: [298, 100] },
  ],
  details: HELI_DETAILS,
};

const LIFEBOAT: Vehicle = {
  id: "lifeboat",
  name: "lifeboat",
  exit: "sail",
  terrain: "sea",
  grounded: true,
  parts: [
    {
      id: "cabin",
      name: "cabin",
      colour: "orange",
      shape: path("M100,152 L100,90 Q100,74 116,74 L290,74 Q312,74 322,92 L352,152 Z"),
      at: [300, 130],
    },
    {
      id: "windows",
      name: "windows",
      colour: "black",
      shape: union(rect(124, 92, 64, 46, 10), rect(200, 92, 64, 46, 10)),
      at: [156, 115],
    },
    {
      id: "hull",
      name: "boat",
      colour: "blue",
      shape: path(
        "M20,150 L380,150 Q374,180 356,208 Q338,232 306,232 L96,232 Q62,232 46,208 Q28,180 20,150 Z"
      ),
      at: [150, 196],
    },
    { id: "ring", name: "life ring", colour: "white", shape: circle(320, 186, 24), at: [320, 172] },
  ],
  details: ["M200,74 L200,40", "M184,40 L216,40", hub(320, 186, 10)],
};

const TOW_TRUCK: Vehicle = {
  id: "tow-truck",
  name: "tow truck",
  exit: "drive",
  terrain: "road",
  grounded: true,
  parts: [
    {
      id: "beacon",
      name: "beacon",
      colour: "orange",
      shape: rect(270, 16, 52, 48, 14),
      at: [296, 40],
    },
    {
      id: "boom",
      name: "crane arm",
      colour: "red",
      shape: path("M170,140 L80,40 Q72,32 62,40 L40,60 Q32,68 40,76 L110,140 Z"),
      at: [100, 92],
    },
    {
      id: "bed",
      name: "back",
      colour: "grey",
      shape: path("M20,140 L240,140 L240,208 L34,208 Q20,208 20,194 Z"),
      at: [180, 172],
    },
    {
      id: "cab",
      name: "cab",
      colour: "yellow",
      shape: path(
        "M240,208 L240,80 Q240,64 256,64 L316,64 Q334,64 342,80 L372,140 Q380,150 380,166 L380,196 Q380,208 366,208 Z"
      ),
      at: [290, 154],
    },
    {
      id: "window",
      name: "window",
      colour: "blue",
      shape: path("M258,82 L312,82 Q322,82 326,90 L348,134 L258,134 Z"),
      at: [290, 108],
    },
    wheels([90, 206, 34], [300, 206, 34]),
  ],
  details: ["M50,70 L50,128 Q50,144 64,144 Q76,144 76,132", "M362,176 L378,176"],
  trims: hubcaps([90, 206, 34], [300, 206, 34]),
};

/* ── Construction ───────────────────────────────────────────────────────── */

const DIGGER: Vehicle = {
  id: "digger",
  name: "digger",
  exit: "drive",
  terrain: "site",
  grounded: true,
  parts: [
    {
      id: "tracks",
      name: "tracks",
      colour: "black",
      shape: rect(30, 190, 250, 52, 26),
      at: [155, 216],
    },
    {
      id: "body",
      name: "body",
      colour: "yellow",
      shape: path(
        "M40,190 L40,120 Q40,104 56,104 L150,104 L150,56 Q150,40 166,40 L226,40 Q244,40 250,58 L270,120 L270,190 Z"
      ),
      at: [96, 150],
    },
    {
      id: "window",
      name: "window",
      colour: "blue",
      shape: path("M168,58 L224,58 Q232,58 236,66 L252,118 L168,118 Z"),
      at: [204, 88],
    },
    {
      id: "arm",
      name: "arm",
      colour: "yellow",
      shape: path(
        "M260,150 L318,36 Q326,22 342,26 L366,34 Q382,40 380,58 L380,140 L340,140 L340,78 L300,168 Z"
      ),
      at: [360, 96],
    },
    {
      id: "bucket",
      name: "bucket",
      colour: "grey",
      shape: path("M330,140 L392,140 L392,190 Q392,214 368,214 L350,214 Q330,214 330,192 Z"),
      at: [361, 176],
    },
  ],
  details: [
    hub(56, 216, 12),
    hub(254, 216, 12),
    "M84,216 L226,216",
    "M340,214 L340,226 M362,214 L362,226 M384,212 L384,224",
  ],
};

const DUMP_TRUCK: Vehicle = {
  id: "dump-truck",
  name: "dump truck",
  exit: "drive",
  terrain: "site",
  grounded: true,
  parts: [
    {
      id: "load",
      name: "stones",
      colour: "grey",
      shape: path("M36,98 Q60,30 110,56 Q150,20 196,54 Q226,64 224,98 Z"),
      at: [130, 76],
    },
    {
      id: "bed",
      name: "tipper",
      colour: "orange",
      shape: path("M20,96 L236,96 L224,180 Q222,192 210,192 L44,192 Q32,192 30,180 Z"),
      at: [130, 150],
    },
    { id: "cab", name: "cab", colour: "yellow", shape: TRUCK_CAB, at: [290, 152] },
    { id: "window", name: "window", colour: "blue", shape: TRUCK_WINDOW, at: [294, 108] },
    wheels([90, 204, 38], [310, 204, 38]),
  ],
  details: ["M30,196 L244,196", "M60,120 L200,120", "M366,178 L380,178"],
  trims: hubcaps([90, 204, 38], [310, 204, 38]),
};

const CRANE: Vehicle = {
  id: "crane",
  name: "crane",
  exit: "drive",
  terrain: "site",
  grounded: true,
  parts: [
    {
      id: "boom",
      name: "crane arm",
      colour: "orange",
      shape: path("M150,150 L50,30 Q42,18 56,14 L84,8 Q98,6 104,20 L210,150 Z"),
      at: [150, 116],
    },
    { id: "hook", name: "hook", colour: "grey", shape: rect(44, 96, 48, 48, 10), at: [68, 120] },
    {
      id: "carrier",
      name: "truck",
      colour: "yellow",
      shape: path("M20,150 L380,150 L380,196 Q380,208 366,208 L34,208 Q20,208 20,196 Z"),
      at: [244, 168],
    },
    {
      id: "cab",
      name: "cab",
      colour: "yellow",
      shape: path("M270,152 L270,70 Q270,56 286,56 L340,56 Q360,56 366,74 L384,130 L384,152 Z"),
      at: [320, 136],
    },
    {
      id: "window",
      name: "window",
      colour: "blue",
      shape: path("M290,72 L338,72 Q348,72 351,80 L364,118 L290,118 Z"),
      at: [322, 96],
    },
    wheels([80, 212, 28], [180, 212, 28], [320, 212, 28]),
  ],
  details: ["M68,22 L68,96", "M68,144 L68,152"],
  trims: hubcaps([80, 212, 28], [180, 212, 28], [320, 212, 28]),
};

const CEMENT_MIXER: Vehicle = {
  id: "cement-mixer",
  name: "cement mixer",
  exit: "drive",
  terrain: "site",
  grounded: true,
  parts: [
    {
      id: "drum",
      name: "drum",
      colour: "orange",
      shape: path(
        "M30,140 Q20,80 90,56 L200,40 Q250,36 256,90 Q262,150 210,166 L90,180 Q38,186 30,140 Z"
      ),
      at: [120, 110],
    },
    { id: "cab", name: "cab", colour: "red", shape: TRUCK_CAB, at: [290, 152] },
    { id: "window", name: "window", colour: "blue", shape: TRUCK_WINDOW, at: [294, 108] },
    wheels([80, 212, 30], [190, 212, 30], [314, 210, 34]),
  ],
  details: [
    "M24,190 L244,190",
    "M90,60 Q110,120 92,178",
    "M160,46 Q182,108 160,170",
    "M366,178 L380,178",
  ],
  trims: hubcaps([80, 212, 30], [190, 212, 30], [314, 210, 34]),
};

const BULLDOZER: Vehicle = {
  id: "bulldozer",
  name: "bulldozer",
  exit: "drive",
  terrain: "site",
  grounded: true,
  parts: [
    {
      id: "tracks",
      name: "tracks",
      colour: "black",
      shape: rect(40, 186, 250, 56, 28),
      at: [165, 214],
    },
    {
      id: "body",
      name: "body",
      colour: "yellow",
      shape: path(
        "M50,188 L50,120 Q50,106 66,106 L130,106 L130,50 Q130,36 146,36 L214,36 Q230,36 230,52 L230,106 L270,106 Q290,106 290,126 L290,188 Z"
      ),
      at: [96, 150],
    },
    {
      id: "window",
      name: "window",
      colour: "blue",
      shape: rect(146, 52, 68, 50, 8),
      at: [180, 77],
    },
    {
      id: "blade",
      name: "blade",
      colour: "grey",
      shape: path("M300,90 L340,90 Q360,90 362,110 L380,226 Q382,240 368,240 L300,240 Z"),
      at: [334, 170],
    },
  ],
  details: [
    "M290,150 L300,150",
    "M90,106 L90,70",
    hub(70, 214, 12),
    hub(260, 214, 12),
    "M96,214 L234,214",
  ],
};

const ROAD_ROLLER: Vehicle = {
  id: "road-roller",
  name: "road roller",
  exit: "drive",
  terrain: "site",
  grounded: true,
  parts: [
    { id: "roof", name: "roof", colour: "orange", shape: rect(60, 24, 140, 46, 12), at: [130, 47] },
    {
      id: "body",
      name: "body",
      colour: "yellow",
      shape: path("M30,196 L30,120 Q30,104 46,104 L250,104 Q270,104 270,124 L270,196 Z"),
      at: [190, 150],
    },
    { id: "roller", name: "roller", colour: "grey", shape: circle(306, 190, 52), at: [306, 160] },
    wheel("back-wheel", 90, 200, 42),
  ],
  details: ["M80,70 L80,104 M180,70 L180,104", hub(306, 190, 18), "M270,140 L300,140"],
  trims: hubcaps([90, 200, 42]),
};

export const VEHICLES: Readonly<Record<VehicleId, Vehicle>> = {
  car: CAR,
  bus: BUS,
  taxi: TAXI,
  "school-bus": SCHOOL_BUS,
  "ice-cream-van": ICE_CREAM_VAN,
  scooter: SCOOTER,
  boat: BOAT,
  speedboat: SPEEDBOAT,
  "fishing-boat": FISHING_BOAT,
  submarine: SUBMARINE,
  ship: SHIP,
  ferry: FERRY,
  plane: PLANE,
  helicopter: HELICOPTER,
  biplane: BIPLANE,
  balloon: BALLOON,
  airship: AIRSHIP,
  rocket: ROCKET,
  shuttle: SHUTTLE,
  satellite: SATELLITE,
  "moon-buggy": MOON_BUGGY,
  ufo: UFO,
  "fire-engine": FIRE_ENGINE,
  "police-car": POLICE_CAR,
  ambulance: AMBULANCE,
  "rescue-helicopter": RESCUE_HELICOPTER,
  lifeboat: LIFEBOAT,
  "tow-truck": TOW_TRUCK,
  digger: DIGGER,
  "dump-truck": DUMP_TRUCK,
  crane: CRANE,
  "cement-mixer": CEMENT_MIXER,
  bulldozer: BULLDOZER,
  "road-roller": ROAD_ROLLER,
};
