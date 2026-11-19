/**
 * Snack Time in the Sky — a thinking game (not a number game) for
 * three-year-olds, inside Plane Seats' aeroplane cabin, as data.
 *
 *   • "snacks" — SNACK TROLLEY (matching): three passengers sit in a row of
 *                seats; the silver trolley rolls down the aisle with three or
 *                four snacks on top. One passenger at a time thinks of a
 *                snack (a thought bubble); tap that snack on the trolley and
 *                it flies to them. Later rounds put look-alikes side by side
 *                (apple and orange, juice and milk, lemon and banana).
 *   • "window" — WINDOW SPY (attention, a short memory): one big plane
 *                window, the sky and the wing outside. Something flies past
 *                (a bird, a kite, a rocket…); then three pictures — tap the
 *                one that flew past. "Look again" plays it again, free.
 *                Rounds 3–4: it flies past more quickly, and the pictures to
 *                choose from look more alike.
 *
 * No numbers anywhere: the passengers, the snacks and the flyers are the
 * portal's Fluent pictures.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import type { Passenger } from "@games/plane-seats/constants/rounds";

export type ModuleId = "snacks" | "window";
export const MODULE_IDS: readonly ModuleId[] = ["snacks", "window"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "snacks",
    name: "Snack Trolley",
    tag: "Give each friend the snack they want",
    accent: "#E8735F",
    edge: "#B9503F",
    clip: "psn-mode-snacks",
  },
  {
    id: "window",
    name: "Window Spy",
    tag: "Spot what flies past the window",
    accent: "#2F7FD8",
    edge: "#1F5DA6",
    clip: "psn-mode-window",
  },
];

export const VOICE: GameVoice = { welcome: "psn-welcome", done: "psn-done" };

/* ── Snack Trolley ───────────────────────────────────────────────────────── */

/** What the trolley can carry (Fluent ids, each with a recorded name). */
export const SNACKS = [
  "apple",
  "orange",
  "banana",
  "lemon",
  "juice",
  "milk",
  "cake",
  "icecream",
  "pizza",
  "grapes",
] as const;
export type Snack = (typeof SNACKS)[number];

/** One passenger's wish. */
export interface Order {
  who: Passenger;
  want: Snack;
}

/** A round: what is on the trolley (left to right) and the three passengers
 *  in their seats, left to right — each asks in turn. A snack that is given
 *  away is put straight back on the trolley (there are plenty), so every
 *  question has the whole trolley to choose from. */
export interface SnackRound {
  tray: readonly Snack[];
  orders: readonly [Order, Order, Order];
}

export const SNACK_ROUNDS: readonly SnackRound[] = [
  {
    tray: ["apple", "juice", "pizza"],
    orders: [
      { who: "bear", want: "pizza" },
      { who: "rabbit", want: "apple" },
      { who: "panda", want: "juice" },
    ],
  },
  {
    tray: ["banana", "cake", "milk"],
    orders: [
      { who: "fox", want: "milk" },
      { who: "lion", want: "banana" },
      { who: "monkey", want: "cake" },
    ],
  },
  {
    // look-alikes: apple and orange, juice and milk
    tray: ["apple", "orange", "juice", "milk"],
    orders: [
      { who: "tiger", want: "orange" },
      { who: "dog", want: "milk" },
      { who: "bear", want: "apple" },
    ],
  },
  {
    // look-alikes: lemon, orange and banana; all fruit
    tray: ["lemon", "orange", "banana", "apple"],
    orders: [
      { who: "panda", want: "lemon" },
      { who: "fox", want: "banana" },
      { who: "rabbit", want: "orange" },
    ],
  },
];

/** The snack's name, said as it flies to the passenger (recorded words). */
export const snackName = (s: Snack): string => `treat-word-${s}`;
/** The passenger's thank-you (Street Pals' lines: "Yum! Thank you!"). */
export const yumClip = (k: number): string => (k % 2 ? "street-yum-bo" : "street-yum-ruby");
/** Asked for every passenger. */
export const ASK_SNACK = "psn-what-want";

/* ── Window Spy ──────────────────────────────────────────────────────────── */

/** What can fly past the window (Fluent ids). */
export const FLYERS = ["bird", "butterfly", "kite", "rocket", "jet", "owl", "duck"] as const;
export type Flyer = (typeof FLYERS)[number];

/** Things fly past right to left (the way the clouds go). The pictures that
 *  face right are mirrored so they fly nose first; those two also climb. */
export const FACES_RIGHT: ReadonlySet<Flyer> = new Set<Flyer>(["rocket", "jet"]);

/** One sighting: what flies past and the three pictures to choose from. */
export interface Sighting {
  flyer: Flyer;
  choices: readonly [Flyer, Flyer, Flyer];
}

export interface WindowRound {
  /** Rounds 3–4 fly past more quickly. */
  fast: boolean;
  sightings: readonly [Sighting, Sighting, Sighting];
}

export const WINDOW_ROUNDS: readonly WindowRound[] = [
  {
    fast: false,
    sightings: [
      { flyer: "bird", choices: ["bird", "rocket", "butterfly"] },
      { flyer: "kite", choices: ["owl", "kite", "jet"] },
      { flyer: "rocket", choices: ["duck", "butterfly", "rocket"] },
    ],
  },
  {
    fast: false,
    sightings: [
      { flyer: "butterfly", choices: ["jet", "butterfly", "duck"] },
      { flyer: "owl", choices: ["owl", "kite", "rocket"] },
      { flyer: "jet", choices: ["bird", "kite", "jet"] },
    ],
  },
  {
    fast: true,
    sightings: [
      { flyer: "duck", choices: ["jet", "duck", "owl"] },
      { flyer: "rocket", choices: ["rocket", "jet", "kite"] },
      { flyer: "butterfly", choices: ["kite", "bird", "butterfly"] },
    ],
  },
  {
    // look-alikes: three birds, two flying machines
    fast: true,
    sightings: [
      { flyer: "owl", choices: ["duck", "owl", "bird"] },
      { flyer: "jet", choices: ["jet", "rocket", "kite"] },
      { flyer: "bird", choices: ["owl", "duck", "bird"] },
    ],
  },
];

/** Said before each fly-past ("Watch carefully!") and after it ("Which
 *  one now?") — recorded lines from other games. */
export const LOOK_CLIP = "instr-watch-carefully";
export const ASK_FLYER = "leo-home-again";
/** The "Look again" button's line and label (Pond Numbers' recording). */
export const AGAIN_CLIP = "pond-look-again";

const VOICE_IDS = [
  VOICE.welcome,
  VOICE.done,
  ASK_SNACK,
  LOOK_CLIP,
  ASK_FLYER,
  AGAIN_CLIP,
  "instr-try-again",
  yumClip(0),
  yumClip(1),
];

/* ── Self-check ──────────────────────────────────────────────────────────── */

/** Four different rounds a module; three different passengers a round, each
 *  wanting a different snack that is on the trolley (which has no repeats);
 *  three different pictures a sighting with the flyer among them, the right
 *  one not always in the same place; two slow rounds then two fast; a picture
 *  for every id and a line for everything said. `has`/`hasPic` default to
 *  "yes" so the data alone can be checked. */
export function checkRounds(
  has: (id: string) => boolean = () => true,
  hasPic: (id: string) => boolean = () => true
): string[] {
  const { problems, need, noRepeats } = roundChecker();

  for (const id of [...VOICE_IDS, ...MODULES.map((m) => m.clip)]) need(has(id), `no line "${id}"`);
  for (const s of SNACKS) {
    need(hasPic(s), `no Fluent picture "${s}"`);
    need(has(snackName(s)), `no name for ${s}`);
  }
  for (const f of FLYERS) {
    need(hasPic(f), `no Fluent picture "${f}"`);
  }

  // Snack Trolley
  need(SNACK_ROUNDS.length === ROUND_COUNT, `snacks: ${SNACK_ROUNDS.length} rounds`);
  noRepeats(
    "snacks",
    SNACK_ROUNDS.map((r) => `${r.tray.join()}|${r.orders.map((o) => o.want).join()}`)
  );
  SNACK_ROUNDS.forEach((r, k) => {
    const where = `snacks ${k + 1}`;
    need(r.tray.length === (k < 2 ? 3 : 4), `${where}: ${r.tray.length} snacks on the trolley`);
    need(distinct(r.tray), `${where}: a snack is on the trolley twice`);
    need(r.orders.length === 3, `${where}: ${r.orders.length} passengers`);
    need(distinct(r.orders.map((o) => o.who)), `${where}: a passenger sits twice`);
    need(distinct(r.orders.map((o) => o.want)), `${where}: two passengers want the same snack`);
    for (const o of r.orders) {
      need(r.tray.includes(o.want), `${where}: ${o.want} is not on the trolley`);
      need(hasPic(o.who), `no Fluent picture "${o.who}"`);
    }
    need(
      distinct(r.orders.map((o) => r.tray.indexOf(o.want))),
      `${where}: the snacks asked for sit in one place`
    );
  });

  // Window Spy
  need(WINDOW_ROUNDS.length === ROUND_COUNT, `window: ${WINDOW_ROUNDS.length} rounds`);
  noRepeats(
    "window",
    WINDOW_ROUNDS.map((r) => r.sightings.map((s) => s.flyer).join())
  );
  WINDOW_ROUNDS.forEach((r, k) => {
    const where = `window ${k + 1}`;
    need(r.fast === k >= 2, `${where}: should be ${k >= 2 ? "fast" : "slow"}`);
    need(r.sightings.length === 3, `${where}: ${r.sightings.length} sightings`);
    need(distinct(r.sightings.map((s) => s.flyer)), `${where}: the same thing flies past twice`);
    for (const s of r.sightings) {
      need(s.choices.length === 3 && distinct(s.choices), `${where}: choices repeat`);
      need(s.choices.includes(s.flyer), `${where}: ${s.flyer} is not among the choices`);
    }
    need(
      distinct(r.sightings.map((s) => s.choices.indexOf(s.flyer))),
      `${where}: the right picture is always in the same place`
    );
  });

  return problems;
}
