/**
 * Burj Lift — a thinking game for three-year-olds with the glass lift that
 * runs up the outside of the Burj Khalifa, as data.
 *
 * The tower has a ground floor (where the lift waits, doors open) and FOUR
 * floors above it, each with a sign beside it: the floor's number, big, and
 * its picture or its colour. Two children, a girl and a boy, take turns to
 * ride — three rides a round. A ride is always the same three steps:
 *
 *   1. DRAG the child, waiting on the sand, into the open lift;
 *   2. press UP once for every floor — each press rides one floor and says
 *      its number — until the lift stops at the child's floor, where they
 *      step out happy (it never rides past it);
 *   3. press DOWN once for every floor to bring the empty lift back to the
 *      ground for the next child (not after the last ride: the round is won).
 *
 * A wrong button (down while a child rides up, up while the empty lift should
 * come down) shakes, "Try again!", and the right one glows.
 *
 *   • "updown" — UP OR DOWN? (a sunny day): every sign has a picture (the
 *                tree, the ball, the pizza, the moon) beside the number, and
 *                the child's bubble shows the picture and the number of the
 *                floor they want.
 *   • "match"  — COLOUR FLOORS (the evening): every sign has a colour beside
 *                the number, and the child holds a balloon of their floor's
 *                colour.
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
    tag: "Take each child up to their floor and bring the lift back down",
    accent: "#E3A12F",
    edge: "#B07415",
    clip: "bjl-mode-updown",
  },
  {
    id: "match",
    name: "Colour Floors",
    tag: "Ride up to the floor of the balloon's colour",
    accent: "#5D5FB8",
    edge: "#3F4190",
    clip: "bjl-mode-colour",
  },
];

export const VOICE: GameVoice = { welcome: "bjl-welcome", done: "bjl-done" };

/** The floors above the ground, numbered 1–4 (the lift's stops 1–4; the
 *  ground is stop 0). */
export const FLOORS = 4;
/** Rides in one round. */
export const TRIPS = 3;

/** Up or Down?: each floor's picture, floor 1 to floor 4 (Fluent ids). */
export const FLOOR_PICS: readonly string[] = ["tree", "ball", "pizza", "moon"];

export type Colour = "red" | "yellow" | "green" | "blue";
/** Colour Floors: each floor's colour, floor 1 to floor 4. */
export const FLOOR_COLOURS: readonly Colour[] = ["red", "yellow", "green", "blue"];
/** How each colour is painted (sign face, its darker edge). */
export const COLOUR_PAINT: Readonly<Record<Colour, { face: string; edge: string }>> = {
  red: { face: "#ef4a3c", edge: "#a92a20" },
  yellow: { face: "#ffd43b", edge: "#b8900a" },
  green: { face: "#3fbf5a", edge: "#21813a" },
  blue: { face: "#3a8ef0", edge: "#1d5daa" },
};

/** Who rides: a girl and a boy, taking turns. */
export type Kid = "girl" | "boy";

export interface Trip {
  who: Kid;
  /** The floor they want, 1–4. */
  to: number;
}

/** Three rides, one after another; the lift starts every round on the ground. */
export type LiftRound = readonly [Trip, Trip, Trip];

const g = (to: number): Trip => ({ who: "girl", to });
const b = (to: number): Trip => ({ who: "boy", to });

export const ROUNDS: Readonly<Record<ModuleId, readonly LiftRound[]>> = {
  updown: [
    [g(2), b(1), g(3)],
    [b(3), g(4), b(1)],
    [g(4), b(2), g(1)],
    [b(1), g(3), b(4)],
  ],
  match: [
    [g(1), b(3), g(2)],
    [b(4), g(2), b(3)],
    [g(3), b(1), g(4)],
    [b(2), g(4), b(1)],
  ],
};

/** "Drag her (him) into the lift!" — said when the child is waiting. */
export const dragClip = (k: Kid): string => (k === "girl" ? "bjl-drag-her" : "bjl-drag-him");
/** "Press up to her (his) floor!" — said once the child is in. */
export const upClip = (k: Kid): string => (k === "girl" ? "bjl-up-her" : "bjl-up-his");
/** "Now bring the lift down!" — said once the child has stepped out. */
export const DOWN_CLIP = "bjl-bring-down";
/** The floor's number, said as the lift rides to it. */
export const numberClip = (n: number): string => `number-${n}`;

/** Self-check: four different rounds a module, three rides a round to three
 *  different floors, the girl and the boy taking turns, every floor visited
 *  in every module, every picture there, and a line for everything said. */
export function checkRounds(
  has: (id: string) => boolean,
  hasPic: (id: string) => boolean
): string[] {
  const { problems, need, noRepeats } = roundChecker();
  need(
    FLOOR_PICS.length === FLOORS && distinct(FLOOR_PICS),
    "a floor picture repeats or is missing"
  );
  need(
    FLOOR_COLOURS.length === FLOORS && distinct(FLOOR_COLOURS),
    "a floor colour repeats or is missing"
  );
  for (const p of FLOOR_PICS) need(hasPic(p), `no Fluent picture "${p}"`);
  const lines = [
    DOWN_CLIP,
    "instr-try-again",
    ...(["girl", "boy"] as const).flatMap((k) => [dragClip(k), upClip(k)]),
    ...Array.from({ length: FLOORS }, (_, i) => numberClip(i + 1)),
  ];
  for (const id of lines) need(has(id), `no line "${id}"`);

  for (const id of MODULE_IDS) {
    const rs = ROUNDS[id];
    const info = MODULES.find((m) => m.id === id);
    need(!!info && has(info.clip), `${id}: no title-card line`);
    need(rs.length === ROUND_COUNT, `${id}: ${rs.length} rounds`);
    noRepeats(
      id,
      rs.map((r) => r.map((t) => `${t.who}${t.to}`).join())
    );
    const seen = new Set<number>();
    rs.forEach((r, k) => {
      need(r.length === TRIPS, `${id} ${k}: ${r.length} rides`);
      need(distinct(r.map((t) => t.to)), `${id} ${k}: two children want the same floor`);
      r.forEach((t, i) => {
        need(
          Number.isInteger(t.to) && t.to >= 1 && t.to <= FLOORS,
          `${id} ${k}: floor ${t.to} is not on the tower`
        );
        if (i > 0) need(t.who !== r[i - 1].who, `${id} ${k}: the same child rides twice running`);
        seen.add(t.to);
      });
    });
    for (let n = 1; n <= FLOORS; n++) need(seen.has(n), `${id}: nobody goes to floor ${n}`);
  }
  return problems;
}
