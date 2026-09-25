import type { PictureId } from "@games/blend-read/components/PictureArt";

/**
 * Sort It — twelve boards in two modules.
 *
 * The modules are two different RULES, not two difficulties: sort by how big a
 * thing is, or by where it lives. A child picks the rule they want and gets
 * six boards of it, so coming back to the game is coming back to something
 * different rather than the same ladder.
 *
 * Two boards, a pile of things underneath, and a rule the child is never told:
 * each board starts with ONE example already in it and question marks where
 * the rest will go, so the board itself says "things like this belong here".
 * That is the whole teaching method of the reference, and it is why no screen
 * in this game has an instruction on it.
 *
 * Correctness compares an object's `group` to the board's — never its
 * position, and never which board is on the left — so one engine runs all
 * twelve boards without knowing what any of them are about.
 */

export type Rule = "size" | "home";

/** A thing to sort. `big` only matters on a size board, where the SAME picture
 *  appears at two sizes and the size is the entire question. */
export interface SortObject {
  id: string;
  picture: PictureId;
  group: string;
  big?: boolean;
}

export interface SortBoard {
  group: string;
  /** The word over the board — BIG, SMALL, WATER, LAND. Said on screen
   *  because a child sorting by size should meet the words for the sizes. */
  label: string;
  /** Already in the board when it opens — the worked example. */
  example: SortObject;
  /** How many more go in here (drawn as question marks until they are filled). */
  slots: number;
}

export interface Activity {
  id: string;
  rule: Rule;
  /** Left board, right board. */
  boards: readonly [SortBoard, SortBoard];
  objects: readonly SortObject[];
}

export interface SortModule {
  id: Rule;
  label: string;
  preview: string;
  aria: string;
}

export const MODULES: readonly SortModule[] = [
  {
    id: "size",
    label: "Big or small",
    preview: "●  ○",
    aria: "Sort things by how big they are",
  },
  {
    id: "home",
    label: "Where it lives",
    preview: "~  ▲",
    aria: "Sort animals by whether they live in the water, on the land or in the sky",
  },
];

const big = (id: string, picture: PictureId, group: string): SortObject => ({
  id,
  picture,
  group,
  big: true,
});
const small = (id: string, picture: PictureId, group: string): SortObject => ({
  id,
  picture,
  group,
});

/** BIG or SMALL — the same picture at two sizes, so size is the only thing
 *  telling them apart. */
const SIZE: readonly Activity[] = [
  {
    id: "size-1",
    rule: "size",
    boards: [
      { group: "big", label: "BIG", example: big("s1-eb", "apple", "big"), slots: 2 },
      { group: "small", label: "SMALL", example: small("s1-es", "apple", "small"), slots: 2 },
    ],
    objects: [
      big("s1-a", "ball", "big"),
      small("s1-b", "plum", "small"),
      big("s1-c", "cake", "big"),
      small("s1-d", "acorn", "small"),
    ],
  },
  {
    id: "size-2",
    rule: "size",
    boards: [
      { group: "big", label: "BIG", example: big("s2-eb", "drum", "big"), slots: 2 },
      { group: "small", label: "SMALL", example: small("s2-es", "drum", "small"), slots: 2 },
    ],
    objects: [
      small("s2-a", "shell", "small"),
      big("s2-b", "bus", "big"),
      small("s2-c", "cup", "small"),
      big("s2-d", "house", "big"),
    ],
  },
  {
    id: "size-3",
    rule: "size",
    boards: [
      { group: "big", label: "BIG", example: big("s3-eb", "star", "big"), slots: 2 },
      { group: "small", label: "SMALL", example: small("s3-es", "star", "small"), slots: 2 },
    ],
    objects: [
      big("s3-a", "whale", "big"),
      small("s3-b", "bird", "small"),
      big("s3-c", "train", "big"),
      small("s3-d", "mouse", "small"),
    ],
  },
  {
    id: "size-4",
    rule: "size",
    boards: [
      { group: "big", label: "BIG", example: big("s4-eb", "crown", "big"), slots: 2 },
      { group: "small", label: "SMALL", example: small("s4-es", "crown", "small"), slots: 2 },
    ],
    objects: [
      small("s4-a", "medal", "small"),
      big("s4-b", "chair", "big"),
      small("s4-c", "clam", "small"),
      big("s4-d", "ship", "big"),
    ],
  },
  {
    id: "size-5",
    rule: "size",
    boards: [
      { group: "big", label: "BIG", example: big("s5-eb", "cake", "big"), slots: 2 },
      { group: "small", label: "SMALL", example: small("s5-es", "cake", "small"), slots: 2 },
    ],
    objects: [
      big("s5-a", "lion", "big"),
      small("s5-b", "bird", "small"),
      big("s5-c", "ship", "big"),
      small("s5-d", "acorn", "small"),
    ],
  },
  {
    id: "size-6",
    rule: "size",
    boards: [
      { group: "big", label: "BIG", example: big("s6-eb", "ball", "big"), slots: 2 },
      { group: "small", label: "SMALL", example: small("s6-es", "ball", "small"), slots: 2 },
    ],
    objects: [
      big("s6-a", "bear", "big"),
      small("s6-b", "mouse", "small"),
      big("s6-c", "house", "big"),
      small("s6-d", "clam", "small"),
    ],
  },
];

/** WATER, LAND or SKY — the same kind of thing told apart by where it lives,
 *  which is a step on from telling a cake from a cat. */
const HOME: readonly Activity[] = [
  {
    id: "home-1",
    rule: "home",
    boards: [
      { group: "water", label: "WATER", example: small("h1-ew", "whale", "water"), slots: 2 },
      { group: "land", label: "LAND", example: small("h1-el", "lion", "land"), slots: 2 },
    ],
    objects: [
      small("h1-a", "crab", "water"),
      small("h1-b", "bear", "land"),
      small("h1-c", "dolphin", "water"),
      small("h1-d", "horse", "land"),
    ],
  },
  {
    id: "home-2",
    rule: "home",
    boards: [
      { group: "water", label: "WATER", example: small("h2-ew", "clam", "water"), slots: 2 },
      { group: "land", label: "LAND", example: small("h2-el", "fox", "land"), slots: 2 },
    ],
    objects: [
      small("h2-a", "shell", "water"),
      small("h2-b", "hen", "land"),
      small("h2-c", "ship", "water"),
      small("h2-d", "snake", "land"),
    ],
  },
  {
    id: "home-3",
    rule: "home",
    boards: [
      { group: "sky", label: "SKY", example: small("h3-es", "bird", "sky"), slots: 2 },
      { group: "land", label: "LAND", example: small("h3-el", "dog", "land"), slots: 2 },
    ],
    objects: [
      small("h3-a", "cloud", "sky"),
      small("h3-b", "mouse", "land"),
      small("h3-c", "planet", "sky"),
      small("h3-d", "cat", "land"),
    ],
  },
  {
    id: "home-4",
    rule: "home",
    boards: [
      { group: "water", label: "WATER", example: small("h4-ew", "dolphin", "water"), slots: 2 },
      { group: "sky", label: "SKY", example: small("h4-es", "cloud", "sky"), slots: 2 },
    ],
    objects: [
      small("h4-a", "crab", "water"),
      small("h4-b", "bird", "sky"),
      small("h4-c", "whale", "water"),
      small("h4-d", "planet", "sky"),
    ],
  },
  {
    id: "home-5",
    rule: "home",
    boards: [
      { group: "water", label: "WATER", example: small("h5-ew", "crab", "water"), slots: 2 },
      { group: "sky", label: "SKY", example: small("h5-es", "bird", "sky"), slots: 2 },
    ],
    objects: [
      small("h5-a", "clam", "water"),
      small("h5-b", "cloud", "sky"),
      small("h5-c", "whale", "water"),
      small("h5-d", "planet", "sky"),
    ],
  },
  {
    id: "home-6",
    rule: "home",
    boards: [
      { group: "land", label: "LAND", example: small("h6-el", "horse", "land"), slots: 2 },
      { group: "water", label: "WATER", example: small("h6-ew", "dolphin", "water"), slots: 2 },
    ],
    objects: [
      small("h6-a", "bear", "land"),
      small("h6-b", "crab", "water"),
      small("h6-c", "fox", "land"),
      small("h6-d", "whale", "water"),
    ],
  },
];

const BY_RULE: Record<Rule, readonly Activity[]> = { size: SIZE, home: HOME };

/** Twelve boards in total — six in each module. */
export const TOTAL_ACTIVITIES = SIZE.length + HOME.length;

export function activitiesFor(rule: Rule): readonly Activity[] {
  return BY_RULE[rule];
}
