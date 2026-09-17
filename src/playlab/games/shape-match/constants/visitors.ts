/**
 * Leo's Puzzles — WHO COMES TO VISIT.
 *
 * The last round of a module is not a puzzle at all: four animals wander in
 * from four different edges of the meadow, look around, and wait to be
 * touched. Tap one and it does its own delighted thing, throws something in
 * the air and wanders back out. When all four have been said hello to, the
 * module is done.
 *
 * There is nothing to get wrong here, which is the point: after two rounds of
 * being right, a small child gets a room where everything they touch simply
 * answers.
 *
 * WHERE each animal comes from and WHAT it does are DERIVED from its place in
 * the cast, so no two visitors in a module ever arrive from the same edge or
 * greet in the same way, and a module cannot be authored with four animals
 * stacked in one corner.
 */

import type { SceneId } from "@games/shape-match/constants/scenes";
import type { ThingId } from "@games/shape-match/constants/things";

/** The edge a visitor comes in from. */
type Edge = "left" | "right" | "bottom" | "top";

/**
 * HOW IT ARRIVES — and this belongs to the ANIMAL, not to its turn in the
 * queue. A rabbit's ears come up over the edge before the rest of it. A cat
 * puts its head round the side, looks, and then runs in. A penguin comes
 * straight up out of the snow. Birds and butterflies come down out of the sky.
 * Bears amble. Fish glide.
 *
 * A child who has met the rabbit in the park meets the same rabbit in the
 * garden — same ears, same arrival — which is how a cast of animals becomes
 * a cast of characters.
 */
export type Entrance = "hop" | "peek" | "rise" | "flutter" | "amble" | "glide";

/** What it does when a child touches it. */
type Greeting = "jump" | "spin" | "wobble" | "grow";

export interface Visitor {
  art: ThingId;
  /** Which edge it comes in from. WHERE on the screen it comes to rest, and
   *  how big it is, are the stylesheet's business — the free corners of a wide
   *  screen and a tall one are in different places. */
  edge: Edge;
  entrance: Entrance;
  greeting: Greeting;
  /** Seconds after the round starts before it wanders in. */
  delay: number;
}

/** One cast per picture: the animals that live there. */
const CASTS: Record<SceneId, readonly ThingId[]> = {
  park: ["rabbit", "bird", "cat", "butterfly"],
  farm: ["horse", "dog", "cat", "bird"],
  beach: ["turtle", "fish", "whale", "bird"],
  // a cat in the garden: without it, all four of these flutter or hop
  garden: ["butterfly", "rabbit", "cat", "bird"],
  pond: ["frog", "fish", "turtle", "bird"],
  forest: ["bear", "monkey", "rabbit", "butterfly"],
  snow: ["penguin", "bear", "rabbit", "bird"],
  night: ["cat", "bear", "rabbit", "frog"],
};

/** Each animal's own way in. Anything not named here ambles. */
const NATURE: Partial<Record<ThingId, Entrance>> = {
  rabbit: "hop",
  frog: "hop",
  cat: "peek",
  dog: "peek",
  monkey: "peek",
  penguin: "rise",
  turtle: "rise",
  whale: "rise",
  fish: "glide",
  bird: "flutter",
  butterfly: "flutter",
  bear: "amble",
  horse: "amble",
};

/**
 * The edges each arrival would like, best first. A hop comes up out of the
 * grass; a flutter comes down out of the sky; a peek comes round the side.
 * Four animals share four edges, so the last one in takes what is left — and
 * a frog that has to hop down from the top of the screen is still a frog
 * hopping, which is the only part a child is watching.
 */
const LIKES: Record<Entrance, readonly Edge[]> = {
  hop: ["bottom", "left", "right", "top"],
  peek: ["left", "right", "bottom", "top"],
  rise: ["bottom", "right", "left", "top"],
  flutter: ["top", "right", "left", "bottom"],
  amble: ["left", "right", "bottom", "top"],
  glide: ["left", "right", "top", "bottom"],
};

const GREETINGS: readonly Greeting[] = ["jump", "spin", "wobble", "grow"];

/** Who visits this picture, and how. */
export function visitorsOf(scene: SceneId, seed: number): readonly Visitor[] {
  const taken = new Set<Edge>();

  return CASTS[scene].map((art, i) => {
    const entrance = NATURE[art] ?? "amble";
    const edge = LIKES[entrance].find((side) => !taken.has(side)) ?? "top";
    taken.add(edge);

    return {
      art,
      edge,
      entrance,
      // the greetings rotate with the module, so the rabbit that jumped in the
      // park spins in the garden
      greeting: GREETINGS[(i + seed) % GREETINGS.length],
      delay: 0.5 + i * 0.85,
    };
  });
}

/** How many hellos finish the round. */
export function visitorCount(scene: SceneId): number {
  return CASTS[scene].length;
}
