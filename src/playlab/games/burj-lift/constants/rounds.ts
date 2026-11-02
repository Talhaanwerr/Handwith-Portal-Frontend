/**
 * Burj Lift — a thinking game (not a number game) for three-year-olds, with
 * the glass lift that runs up the outside of the Burj Khalifa, as data.
 *
 * The tower has six floors and a sign beside each one. Passengers ride the
 * lift one at a time — three in every round — and each one wants a floor:
 *
 *   • "updown" — UP OR DOWN? (direction, a sunny day): every floor's sign is
 *                a picture (the park, the pool, the ball, the pizza, the
 *                star, the moon). The passenger's bubble shows the picture
 *                of the floor they want; the lift waits on another floor.
 *                Two big buttons, up and down: the right one rides the lift
 *                all the way there; the wrong one shakes, "Try again!", and
 *                the right one glows.
 *   • "match"  — PICTURE FLOORS (matching colours, the evening): every
 *                floor's sign is a colour; the passenger holds a balloon of
 *                one colour. Tap the floor with the same colour and the lift
 *                rides there; a wrong floor shakes, "Try again!", and the
 *                right floor glows.
 *
 * Every passenger steps out happy on their floor; the next one gets in.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "updown" | "match";
export const MODULE_IDS: readonly ModuleId[] = ["updown", "match"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "updown",
    name: "Up or Down?",
    tag: "Take them up or down",
    accent: "#E3A12F",
    edge: "#B07415",
    clip: "bjl-mode-updown",
  },
  {
    id: "match",
    name: "Picture Floors",
    tag: "Match the balloon to its floor",
    accent: "#5D5FB8",
    edge: "#3F4190",
    clip: "bjl-mode-match",
  },
];

export const VOICE: GameVoice = { welcome: "bjl-welcome", done: "bjl-done" };

/** The tower's floors, always six (index 0 is the bottom floor). */
export const FLOORS = 6;
/** Passengers in one round. */
export const TRIPS = 3;

/** Up or Down?: each floor's picture, bottom to top (Fluent ids). */
export const FLOOR_PICS: readonly string[] = ["tree", "ocean", "ball", "pizza", "star", "moon"];

export type Colour = "red" | "orange" | "yellow" | "green" | "blue" | "purple";
/** Picture Floors: each floor's colour, bottom to top. */
export const FLOOR_COLOURS: readonly Colour[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
];
/** How each colour is painted (sign face, its darker edge). */
export const COLOUR_PAINT: Readonly<Record<Colour, { face: string; edge: string }>> = {
  red: { face: "#ef4a3c", edge: "#a92a20" },
  orange: { face: "#ff9a2e", edge: "#b9620c" },
  yellow: { face: "#ffd43b", edge: "#b8900a" },
  green: { face: "#3fbf5a", edge: "#21813a" },
  blue: { face: "#3a8ef0", edge: "#1d5daa" },
  purple: { face: "#9a5cd6", edge: "#64339a" },
};

/** Who may ride (Fluent ids). */
export const PASSENGERS = [
  "penguin",
  "owl",
  "duck",
  "hen",
  "turtle",
  "rabbit",
  "elephant",
  "kangaroo",
] as const;
export type Passenger = (typeof PASSENGERS)[number];

export interface Trip {
  who: Passenger;
  /** The floor they want, 1–6. */
  to: number;
}

export interface LiftRound {
  /** The floor the lift waits at when the round starts, 1–6. */
  start: number;
  trips: readonly Trip[];
}

export const ROUNDS: Readonly<Record<ModuleId, readonly LiftRound[]>> = {
  updown: [
    {
      start: 1,
      trips: [
        { who: "penguin", to: 4 },
        { who: "owl", to: 2 },
        { who: "duck", to: 6 },
      ],
    },
    {
      start: 6,
      trips: [
        { who: "hen", to: 3 },
        { who: "turtle", to: 5 },
        { who: "rabbit", to: 1 },
      ],
    },
    {
      start: 3,
      trips: [
        { who: "elephant", to: 5 },
        { who: "penguin", to: 2 },
        { who: "kangaroo", to: 6 },
      ],
    },
    {
      start: 4,
      trips: [
        { who: "owl", to: 1 },
        { who: "duck", to: 5 },
        { who: "turtle", to: 2 },
      ],
    },
  ],
  match: [
    {
      start: 1,
      trips: [
        { who: "penguin", to: 3 },
        { who: "owl", to: 5 },
        { who: "duck", to: 1 },
      ],
    },
    {
      start: 6,
      trips: [
        { who: "hen", to: 2 },
        { who: "turtle", to: 4 },
        { who: "rabbit", to: 6 },
      ],
    },
    {
      start: 2,
      trips: [
        { who: "elephant", to: 6 },
        { who: "kangaroo", to: 1 },
        { who: "penguin", to: 4 },
      ],
    },
    {
      start: 5,
      trips: [
        { who: "owl", to: 3 },
        { who: "duck", to: 2 },
        { who: "hen", to: 5 },
      ],
    },
  ],
};

/** Where the lift is when trip `t` begins (the start, or the last stop). */
export const fromOf = (r: LiftRound, t: number): number => (t === 0 ? r.start : r.trips[t - 1].to);

/** Up or Down?'s question, said for every new passenger. */
export const ASK_UPDOWN = "bjl-up-or-down";
/** Picture Floors' question: "Find the red one!" (Color & Shape's lines). */
export const findClip = (c: Colour): string => `friends-find-${c}`;
/** Said as the lift sets off. */
export const goClip = (up: boolean): string => (up ? "bjl-going-up" : "bjl-going-down");

/** Self-check: four different rounds a module, three different passengers
 *  a round, every trip really goes somewhere (and Up or Down? asks both
 *  ways), every picture exists, and a line for everything said. */
export function checkRounds(
  has: (id: string) => boolean,
  hasPic: (id: string) => boolean
): string[] {
  const { problems, need } = roundChecker();
  need(
    FLOOR_PICS.length === FLOORS && distinct(FLOOR_PICS),
    "a floor picture repeats or is missing"
  );
  need(
    FLOOR_COLOURS.length === FLOORS && distinct(FLOOR_COLOURS),
    "a floor colour repeats or is missing"
  );
  for (const p of [...FLOOR_PICS, ...PASSENGERS]) need(hasPic(p), `no Fluent picture "${p}"`);
  for (const c of FLOOR_COLOURS) need(has(findClip(c)), `no line for finding ${c}`);
  for (const id of [ASK_UPDOWN, goClip(true), goClip(false), "instr-try-again"])
    need(has(id), `no line "${id}"`);

  for (const id of MODULE_IDS) {
    const rs = ROUNDS[id];
    need(has(`bjl-mode-${id}`), `${id}: no title-card line`);
    need(rs.length === ROUND_COUNT, `${id}: ${rs.length} rounds`);
    need(
      distinct(rs.map((r) => `${r.start}:${r.trips.map((t) => t.to).join()}`)),
      `${id}: a round repeats`
    );
    rs.forEach((r, k) => {
      need(r.trips.length === TRIPS, `${id} ${k}: ${r.trips.length} passengers`);
      need(distinct(r.trips.map((t) => t.who)), `${id} ${k}: a passenger rides twice`);
      need(r.start >= 1 && r.start <= FLOORS, `${id} ${k}: the lift starts off the tower`);
      const dirs = new Set<boolean>();
      r.trips.forEach((t, i) => {
        const from = fromOf(r, i);
        need(t.to >= 1 && t.to <= FLOORS, `${id} ${k}: floor ${t.to} is off the tower`);
        need(t.to !== from, `${id} ${k}: passenger ${i + 1} is already on floor ${t.to}`);
        dirs.add(t.to > from);
      });
      if (id === "updown") need(dirs.size === 2, `${id} ${k}: never asks both up and down`);
    });
  }
  return problems;
}
