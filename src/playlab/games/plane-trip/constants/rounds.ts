/**
 * Plane Trip — matching and sorting at the airport, as data. No numbers.
 *
 *   • "bags" — BAG MATCH: three passengers stand by the plane, each holding a
 *              luggage tag with a picture of their suitcase. Suitcases come
 *              round on the baggage belt one at a time; tap whose bag it is.
 *              The first rounds' bags differ in colour AND pattern; later
 *              rounds only in colour, then only in pattern.
 *   • "pack" — PACK FOR THE TRIP: a sunny-trip suitcase and a snowy-trip
 *              suitcase stand open. Things to pack appear one at a time;
 *              tap the suitcase they belong in. Then the cases shut and the
 *              plane takes off.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import type { Passenger } from "@games/plane-seats/constants/rounds";

export type ModuleId = "bags" | "pack";
export const MODULE_IDS: readonly ModuleId[] = ["bags", "pack"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "bags",
    name: "Bag Match",
    tag: "Find whose bag it is",
    accent: "#3C7BE0",
    edge: "#2A5BAF",
    clip: "ptr-mode-bags",
  },
  {
    id: "pack",
    name: "Pack for the Trip",
    tag: "Sunny or snowy?",
    accent: "#F08A24",
    edge: "#C2650F",
    clip: "ptr-mode-pack",
  },
];

export const VOICE: GameVoice = { welcome: "ptr-welcome", done: "ptr-done" };

/* ── Bag Match ───────────────────────────────────────────────────────────── */

export type BagColour = "red" | "blue" | "yellow" | "green" | "purple";
export type BagPattern = "stripes" | "dots" | "stars" | "hearts";

export interface Bag {
  colour: BagColour;
  pattern: BagPattern;
}

/** The suitcase's paint, its darker edge, and the colour of its pattern. */
export const BAG_PAINT: Readonly<Record<BagColour, { body: string; edge: string; motif: string }>> =
  {
    red: { body: "#E8524A", edge: "#B5342E", motif: "#FFFFFF" },
    blue: { body: "#3C7BE0", edge: "#2A5BAF", motif: "#FFFFFF" },
    yellow: { body: "#F7C53C", edge: "#C9951B", motif: "#D9632B" },
    green: { body: "#3DB36B", edge: "#26864C", motif: "#FFFFFF" },
    purple: { body: "#9A62D8", edge: "#7342AD", motif: "#FFFFFF" },
  };

export interface BagRound {
  /** The three passengers, left to right, and the bag on each one's tag. */
  owners: readonly [
    { who: Passenger; bag: Bag },
    { who: Passenger; bag: Bag },
    { who: Passenger; bag: Bag },
  ];
  /** The order the bags come round on the belt (owner indexes). */
  order: readonly [number, number, number];
}

export const BAG_ROUNDS: readonly BagRound[] = [
  // colour and pattern both differ
  {
    owners: [
      { who: "bear", bag: { colour: "red", pattern: "stripes" } },
      { who: "rabbit", bag: { colour: "blue", pattern: "dots" } },
      { who: "fox", bag: { colour: "yellow", pattern: "stars" } },
    ],
    order: [1, 2, 0],
  },
  {
    owners: [
      { who: "panda", bag: { colour: "green", pattern: "hearts" } },
      { who: "lion", bag: { colour: "purple", pattern: "stripes" } },
      { who: "monkey", bag: { colour: "red", pattern: "dots" } },
    ],
    order: [2, 0, 1],
  },
  // only the colour differs
  {
    owners: [
      { who: "tiger", bag: { colour: "blue", pattern: "stars" } },
      { who: "dog", bag: { colour: "red", pattern: "stars" } },
      { who: "rabbit", bag: { colour: "green", pattern: "stars" } },
    ],
    order: [1, 0, 2],
  },
  // only the pattern differs
  {
    owners: [
      { who: "fox", bag: { colour: "purple", pattern: "dots" } },
      { who: "bear", bag: { colour: "purple", pattern: "hearts" } },
      { who: "panda", bag: { colour: "purple", pattern: "stripes" } },
    ],
    order: [2, 1, 0],
  },
];

/* ── Pack for the Trip ───────────────────────────────────────────────────── */

export type Trip = "sunny" | "snowy";
export const TRIPS: readonly Trip[] = ["sunny", "snowy"];

/** Things to pack. Fluent pictures where the portal has an unmistakable one;
 *  the rest are drawn in TripArt (sunglasses, flip-flops, beach ball,
 *  mittens, woolly hat, scarf, snow boots). */
export type Item =
  | "icecream"
  | "shell"
  | "crab"
  | "sunglasses"
  | "flipflops"
  | "beachball"
  | "jacket"
  | "mittens"
  | "beanie"
  | "scarf"
  | "boots";

export const ITEM_TRIP: Readonly<Record<Item, Trip>> = {
  icecream: "sunny",
  shell: "sunny",
  crab: "sunny",
  sunglasses: "sunny",
  flipflops: "sunny",
  beachball: "sunny",
  jacket: "snowy",
  mittens: "snowy",
  beanie: "snowy",
  scarf: "snowy",
  boots: "snowy",
};

/** What each thing is called (for screen readers). */
export const ITEM_NAME: Readonly<Record<Item, string>> = {
  icecream: "an ice cream",
  shell: "a sea shell",
  crab: "a crab",
  sunglasses: "sunglasses",
  flipflops: "flip-flops",
  beachball: "a beach ball",
  jacket: "a warm coat",
  mittens: "mittens",
  beanie: "a woolly hat",
  scarf: "a scarf",
  boots: "snow boots",
};

/** Four things a round, two for each trip, in the order they appear. */
export const PACK_ROUNDS: readonly (readonly [Item, Item, Item, Item])[] = [
  ["icecream", "mittens", "shell", "beanie"],
  ["jacket", "sunglasses", "scarf", "crab"],
  ["flipflops", "boots", "beachball", "mittens"],
  ["scarf", "beachball", "shell", "jacket"],
];

/** Self-check: four rounds a module; three different passengers with three
 *  different bags, met in a jumbled order; rounds 3 and 4 differ only in
 *  colour / only in pattern; two sunny and two snowy things a round. */
export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();
  const key = (b: Bag) => `${b.colour}-${b.pattern}`;

  need(BAG_ROUNDS.length === ROUND_COUNT, `bags: ${BAG_ROUNDS.length} rounds`);
  noRepeats(
    "bags",
    BAG_ROUNDS.map((r) => r.owners.map((o) => key(o.bag)).join())
  );
  BAG_ROUNDS.forEach((r, i) => {
    const bags = r.owners.map((o) => o.bag);
    need(distinct(r.owners.map((o) => o.who)), `bags ${i}: a passenger twice`);
    need(distinct(bags.map(key)), `bags ${i}: two bags the same`);
    need([...r.order].sort().join() === "0,1,2", `bags ${i}: order ${r.order.join()}`);
    need(r.order.join() !== "0,1,2", `bags ${i}: bags come in the owners' order`);
    const colours = distinct(bags.map((b) => b.colour));
    const patterns = distinct(bags.map((b) => b.pattern));
    const oneColour = new Set(bags.map((b) => b.colour)).size === 1;
    const onePattern = new Set(bags.map((b) => b.pattern)).size === 1;
    if (i < 2) need(colours && patterns, `bags ${i}: should differ in colour and pattern`);
    if (i === 2) need(colours && onePattern, `bags ${i}: should differ only in colour`);
    if (i === 3) need(oneColour && patterns, `bags ${i}: should differ only in pattern`);
  });

  need(PACK_ROUNDS.length === ROUND_COUNT, `pack: ${PACK_ROUNDS.length} rounds`);
  noRepeats(
    "pack",
    PACK_ROUNDS.map((r) => r.join())
  );
  PACK_ROUNDS.forEach((r, i) => {
    need(distinct(r), `pack ${i}: a thing twice`);
    need(r.filter((it) => ITEM_TRIP[it] === "sunny").length === 2, `pack ${i}: not two sunny`);
    need(r.filter((it) => ITEM_TRIP[it] === "snowy").length === 2, `pack ${i}: not two snowy`);
  });
  return problems;
}
