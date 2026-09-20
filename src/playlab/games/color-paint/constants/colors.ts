import { PALETTE } from "@games/letter-treats/components/candy-world/CandyDefs";

/**
 * The seven colours a child learns here.
 *
 * Every swatch comes from Candy Land's own palette (CandyDefs) — the same reds
 * and yellows the Letter Treats vocabulary art is drawn in — so a crayon and
 * the apple it colours are literally the same paint. No colour is defined in
 * this game; that is the "no new colours" rule, and it is also what makes the
 * game read as part of the same world.
 */
export type PaintColorId = "red" | "yellow" | "green" | "blue" | "orange" | "pink" | "purple";

export interface PaintColor {
  id: PaintColorId;
  /** The word the child hears and reads. */
  label: string;
  /** The crayon body and the paint it lays down. */
  fill: string;
  /** The crayon's shaded side — the palette's own deeper shade of the hue. */
  shade: string;
  /** The "Pick red." prompt for this colour. */
  promptClip: string;
}

export const PAINT_COLORS: Record<PaintColorId, PaintColor> = {
  red: {
    id: "red",
    label: "red",
    fill: PALETTE.red,
    shade: PALETTE.redDeep,
    promptClip: "paint-pick-red",
  },
  yellow: {
    id: "yellow",
    label: "yellow",
    fill: PALETTE.yellow,
    shade: PALETTE.yellowDeep,
    promptClip: "paint-pick-yellow",
  },
  green: {
    id: "green",
    label: "green",
    fill: PALETTE.green,
    shade: PALETTE.greenDeep,
    promptClip: "paint-pick-green",
  },
  blue: {
    id: "blue",
    label: "blue",
    fill: PALETTE.blue,
    shade: PALETTE.blueDeep,
    promptClip: "paint-pick-blue",
  },
  orange: {
    id: "orange",
    label: "orange",
    fill: PALETTE.orange,
    shade: PALETTE.orangeDeep,
    promptClip: "paint-pick-orange",
  },
  pink: {
    id: "pink",
    label: "pink",
    fill: PALETTE.pink,
    shade: PALETTE.pinkDeep,
    promptClip: "paint-pick-pink",
  },
  purple: {
    id: "purple",
    label: "purple",
    fill: PALETTE.purple,
    shade: PALETTE.lavenderDeep,
    promptClip: "paint-pick-purple",
  },
};

/** The order the rainbow is painted in, and the order the finale shows. */
export const RAINBOW_ORDER: readonly PaintColorId[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
];

/** The colouring-book line — a palette colour too, not a new one. */
export const OUTLINE_INK = PALETTE.ink;
