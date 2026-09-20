/**
 * Shape Match — the eight pictures, and where the missing things go.
 *
 * WHY THE PIECES ARE THINGS, NOT TILES. A picture cut into rectangles asks a
 * three-year-old to recognise half a lion and a corner of sky. A picture
 * missing its SUN, its TREE and its BALL asks them to recognise a sun — which
 * they can already do. So every piece is a whole thing, and the gap it came
 * out of is that same thing, faint and waiting.
 *
 * WHY THE SPOTS ARE THE SAME IN EVERY PICTURE. The gaps always sit in the
 * same few places, so the second picture is easier than the first and the
 * eighth is easy: the child learns the pattern of the activity once and then
 * spends their attention on what the things ARE. Three things to a picture,
 * four in the last two.
 */

/** Where the missing things sit, in % of the picture. Three-piece pictures
 *  use the first layout, four-piece ones the second — and both keep every
 *  gap well clear of its neighbours at any size. */
const LAYOUT_3 = [
  { x: 18, y: 30, size: 20 },
  { x: 50, y: 62, size: 20 },
  { x: 82, y: 32, size: 20 },
] as const;

const LAYOUT_4 = [
  { x: 16, y: 28, size: 17 },
  { x: 40, y: 66, size: 17 },
  { x: 64, y: 28, size: 17 },
  { x: 88, y: 66, size: 17 },
] as const;

/** And where the picture's own furniture goes: the pockets the gaps leave
 *  free, so a cloud can never end up sitting on top of the gap a child is
 *  looking for. Three pockets, one per decoration. */
const DECOR_3 = [
  { x: 50, y: 9, size: 12 },
  { x: 9, y: 84, size: 10 },
  { x: 91, y: 84, size: 10 },
] as const;

const DECOR_4 = [
  { x: 40, y: 8, size: 9 },
  { x: 8, y: 86, size: 9 },
  { x: 50, y: 46, size: 8 },
] as const;

import type { ThingId } from "@games/shape-match/constants/things";

export type SceneId = "park" | "farm" | "beach" | "garden" | "pond" | "forest" | "snow" | "night";

/** Something drawn in a picture at a fixed spot. */
export interface Spot {
  art: ThingId;
  /** Centre, in % of the picture box. */
  x: number;
  y: number;
  /** Width, in % of the picture box. */
  size: number;
}

export interface Scene {
  id: SceneId;
  /** What the picture is of — goes straight into the instruction. */
  name: string;
  /** The sky behind everything. */
  paper: string;
  /** The ground (or the water) across the bottom. */
  band: string;
  bandHeight: number;
  /** True when the sky is dark, so the gaps outline themselves in light. */
  night?: boolean;
  /** Always drawn: the picture's furniture, in the free pockets. */
  decor: readonly ThingId[];
  /** The things a child puts back, in the order they sit in the layout. */
  pieces: readonly ThingId[];
}

export const SCENES: Record<SceneId, Scene> = {
  park: {
    id: "park",
    name: "park",
    paper: "#C8ECFF",
    band: "#7ED957",
    bandHeight: 30,
    decor: ["cloud", "flower", "flower"],
    pieces: ["sun", "tree", "ball"],
  },
  farm: {
    id: "farm",
    name: "farm",
    paper: "#FFE9B8",
    band: "#8FD96B",
    bandHeight: 32,
    decor: ["cloud", "apple", "flower"],
    pieces: ["sun", "house", "horse"],
  },
  beach: {
    id: "beach",
    name: "beach",
    paper: "#CFF2FF",
    band: "#5BC8F5",
    bandHeight: 34,
    decor: ["cloud", "star", "turtle"],
    pieces: ["sun", "boat", "fish"],
  },
  garden: {
    id: "garden",
    name: "garden",
    paper: "#DDF4FF",
    band: "#7ED957",
    bandHeight: 34,
    decor: ["cloud", "apple", "bird"],
    pieces: ["flower", "cat", "butterfly"],
  },
  pond: {
    id: "pond",
    name: "pond",
    paper: "#D6F0FF",
    band: "#5BC8F5",
    bandHeight: 36,
    decor: ["cloud", "flower", "turtle"],
    pieces: ["frog", "fish", "boat"],
  },
  forest: {
    id: "forest",
    name: "forest",
    paper: "#D9F2E4",
    band: "#6FC24A",
    bandHeight: 34,
    decor: ["cloud", "flower", "butterfly"],
    pieces: ["tree", "bear", "apple"],
  },
  snow: {
    id: "snow",
    name: "snow",
    paper: "#E6F5FF",
    band: "#FFFFFF",
    bandHeight: 36,
    decor: ["cloud", "star", "rabbit"],
    pieces: ["snowman", "penguin", "sun", "bird"],
  },
  night: {
    id: "night",
    name: "night",
    paper: "#3B3E85",
    band: "#5B4E9E",
    bandHeight: 32,
    night: true,
    decor: ["house", "bird", "flower"],
    pieces: ["moon", "cat", "star", "tree"],
  },
};

/** Where each missing thing belongs, derived from how many there are — so a
 *  picture cannot be authored with two gaps on top of each other. */
export function spotsOf(scene: Scene): readonly Spot[] {
  const layout = scene.pieces.length <= 3 ? LAYOUT_3 : LAYOUT_4;
  return scene.pieces.map((art, i) => {
    const place = layout[Math.min(i, layout.length - 1)];
    return { art, x: place.x, y: place.y, size: place.size };
  });
}

/** And where its furniture stands — in the pockets the gaps leave free. */
export function decorOf(scene: Scene): readonly Spot[] {
  const layout = scene.pieces.length <= 3 ? DECOR_3 : DECOR_4;
  return scene.decor.slice(0, layout.length).map((art, i) => {
    const place = layout[i];
    return { art, x: place.x, y: place.y, size: place.size };
  });
}
