/**
 * Shape Match — the shapes themselves, and the paint they come in.
 *
 * ONE SILHOUETTE PER SHAPE. The path below is drawn twice: solid, as the
 * piece a child picks up, and hollow, as the hole it belongs in. Because
 * both read the same string, a piece can never be a slightly different
 * circle from the hole it has to fill.
 *
 * Every path fits a 40 x 40 box and is centred in it, so the layout sizes
 * the shape and the drawing never has to know how big it is — the same
 * contract the other games' art keeps.
 */

/** The nine shapes this game teaches. */
export type ShapeId =
  | "circle"
  | "square"
  | "triangle"
  | "rectangle"
  | "star"
  | "heart"
  | "diamond"
  | "oval"
  | "pentagon";

/** The paint box. Saturated, nursery-poster colours — no pastels here. */
export type HueId = "sun" | "mango" | "cherry" | "rose" | "grape" | "sky" | "leaf";

/** A thing on the board: one shape, in one colour. */
export interface Piece {
  shape: ShapeId;
  hue: HueId;
}

export interface Paint {
  /** The face of a solid piece. */
  fill: string;
  /** Its outline, and the outline of the hole it fits. */
  edge: string;
  /** The tint inside an empty hole, so a hole still reads as coloured. */
  soft: string;
}

export const HUES: Record<HueId, Paint> = {
  sun: { fill: "#FFC93C", edge: "#D99A11", soft: "#FFF1C8" },
  mango: { fill: "#FF8A3D", edge: "#D3610F", soft: "#FFE2CB" },
  cherry: { fill: "#F4553D", edge: "#C32E18", soft: "#FFD8D0" },
  rose: { fill: "#FF7EB6", edge: "#D44C8B", soft: "#FFDCEC" },
  grape: { fill: "#9B5DE5", edge: "#6F35BC", soft: "#E8DAFB" },
  sky: { fill: "#3DA5F4", edge: "#1476C0", soft: "#D2EAFD" },
  leaf: { fill: "#5FCB52", edge: "#38982F", soft: "#DCF4D4" },
};

/**
 * The silhouettes, in a 40 x 40 box.
 *
 * Corners are left sharp in the data and rounded by `stroke-linejoin: round`
 * on the drawing, which is what gives every shape the same thick, soft
 * cartoon edge without nine sets of hand-written corner curves.
 */
export const SHAPE_PATHS: Record<ShapeId, string> = {
  circle: "M20 3.4a16.6 16.6 0 1 1 0 33.2 16.6 16.6 0 0 1 0-33.2Z",
  square: "M6.4 6.4h27.2v27.2H6.4Z",
  triangle: "M20 4.4 36.2 33.6H3.8Z",
  rectangle: "M3.6 10.8h32.8v18.4H3.6Z",
  star: "m20 3.2 5.2 10.6 11.6 1.7-8.4 8.2 2 11.6L20 29.8 9.6 35.3l2-11.6-8.4-8.2 11.6-1.7Z",
  heart:
    "M20 35.4C9.2 28 4.6 22.4 4.6 16.8c0-5 3.9-8.8 8.6-8.8 2.9 0 5.4 1.5 6.8 3.8 1.4-2.3 3.9-3.8 6.8-3.8 4.7 0 8.6 3.8 8.6 8.8 0 5.6-4.6 11.2-15.4 18.6Z",
  diamond: "M20 3.6 36.4 20 20 36.4 3.6 20Z",
  oval: "M20 8.8c8.3 0 15 5 15 11.2S28.3 31.2 20 31.2 5 26.2 5 20s6.7-11.2 15-11.2Z",
  pentagon: "M20 3.6 36.4 15.5 30.1 34.9H9.9L3.6 15.5Z",
};
