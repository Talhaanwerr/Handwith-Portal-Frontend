/**
 * Everything that can appear in a picture, named once.
 *
 * The id list is the CONTRACT between three files: the scenes are built from
 * these ids, the art registry must draw every one of them (it is typed
 * `Record<ThingId, ...>`, so a missing drawing is a type error rather than an
 * empty hole at bedtime), and the screen reader reads the names below.
 */

export type ThingId =
  | "sun"
  | "cloud"
  | "tree"
  | "flower"
  | "ball"
  | "boat"
  | "fish"
  | "kite"
  | "apple"
  | "star"
  | "moon"
  | "snowman"
  | "house"
  | "butterfly"
  | "bird"
  | "lion"
  | "rabbit"
  | "penguin"
  | "bear"
  | "frog"
  | "cat"
  | "dog"
  | "turtle"
  | "monkey"
  | "elephant"
  | "horse"
  | "whale";

/** What each thing is called, for the instruction and the screen reader. */
export const THING_NAMES: Record<ThingId, string> = {
  sun: "sun",
  cloud: "cloud",
  tree: "tree",
  flower: "flower",
  ball: "ball",
  boat: "boat",
  fish: "fish",
  kite: "kite",
  apple: "apple",
  star: "star",
  moon: "moon",
  snowman: "snowman",
  house: "house",
  butterfly: "butterfly",
  bird: "bird",
  lion: "lion",
  rabbit: "rabbit",
  penguin: "penguin",
  bear: "bear",
  frog: "frog",
  cat: "cat",
  dog: "dog",
  turtle: "turtle",
  monkey: "monkey",
  elephant: "elephant",
  horse: "horse",
  whale: "whale",
};
