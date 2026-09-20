/**
 * Leo's Puzzles — THE THREE-PIECE PUZZLE.
 *
 * The question is a row of three shapes with a plus between them and an empty
 * slot after the equals:
 *
 *     [yellow rectangle]  +  [purple circle]  +  [green triangle]  =  [ ? ]
 *
 * Underneath are four answer cards, each holding a set of shapes. Exactly one
 * holds THE SAME THREE. The child is matching all three components at once,
 * which is the whole difficulty and the whole point: two out of three is
 * wrong, right colours in the wrong shape is wrong, right shapes with one
 * swapped is wrong.
 *
 * THE WRONG ANSWERS ARE DERIVED FROM THE RIGHT ONE, never authored: one has a
 * part recoloured, one is missing a part, one has a part swapped for a
 * different shape. So every near-miss is near in a way a child can be shown
 * afterwards ("look — this one only has two"), and no question can be written
 * with a distractor that is accidentally also correct.
 */

import { unit } from "@shared/utils/hash";
import {
  HUES,
  SHAPE_PATHS,
  type HueId,
  type Piece,
  type ShapeId,
} from "@games/shape-match/constants/shapes";

/** Every shape and every colour, in a fixed order, for building near-misses. */
const SHAPES = Object.keys(SHAPE_PATHS) as readonly ShapeId[];
const HUE_LIST = Object.keys(HUES) as readonly HueId[];

export interface PieceSet {
  id: string;
  /** The parts, left to right. Three of them: that is the puzzle. */
  parts: readonly Piece[];
}

/**
 * THE QUESTIONS.
 *
 * Each is three shapes that differ from each other in both shape and colour,
 * so a child can hold all three in their head at once. They get less
 * distinctive further down the list — the last few share a colour or a
 * family of shapes, which is what makes them harder.
 */
export const SETS: readonly PieceSet[] = [
  {
    id: "rect-circle-triangle",
    parts: [
      { shape: "rectangle", hue: "sun" },
      { shape: "circle", hue: "grape" },
      { shape: "triangle", hue: "leaf" },
    ],
  },
  {
    id: "square-star-circle",
    parts: [
      { shape: "square", hue: "cherry" },
      { shape: "star", hue: "sun" },
      { shape: "circle", hue: "sky" },
    ],
  },
  {
    id: "triangle-oval-square",
    parts: [
      { shape: "triangle", hue: "rose" },
      { shape: "oval", hue: "leaf" },
      { shape: "square", hue: "grape" },
    ],
  },
  {
    id: "heart-diamond-rect",
    parts: [
      { shape: "heart", hue: "cherry" },
      { shape: "diamond", hue: "sky" },
      { shape: "rectangle", hue: "mango" },
    ],
  },
  {
    id: "pentagon-circle-star",
    parts: [
      { shape: "pentagon", hue: "leaf" },
      { shape: "circle", hue: "mango" },
      { shape: "star", hue: "grape" },
    ],
  },
  {
    id: "oval-square-heart",
    parts: [
      { shape: "oval", hue: "sky" },
      { shape: "square", hue: "sun" },
      { shape: "heart", hue: "rose" },
    ],
  },
  {
    id: "diamond-triangle-pentagon",
    parts: [
      { shape: "diamond", hue: "mango" },
      { shape: "triangle", hue: "sky" },
      { shape: "pentagon", hue: "cherry" },
    ],
  },
  {
    id: "star-rect-oval",
    parts: [
      { shape: "star", hue: "sky" },
      { shape: "rectangle", hue: "rose" },
      { shape: "oval", hue: "grape" },
    ],
  },
  {
    id: "circle-square-triangle",
    parts: [
      { shape: "circle", hue: "cherry" },
      { shape: "square", hue: "leaf" },
      { shape: "triangle", hue: "sun" },
    ],
  },
  {
    id: "heart-star-diamond",
    parts: [
      { shape: "heart", hue: "grape" },
      { shape: "star", hue: "mango" },
      { shape: "diamond", hue: "leaf" },
    ],
  },
  {
    id: "square-circle-oval",
    parts: [
      { shape: "square", hue: "sky" },
      { shape: "circle", hue: "sky" },
      { shape: "oval", hue: "cherry" },
    ],
  },
  {
    id: "triangle-triangle-square",
    parts: [
      { shape: "triangle", hue: "sun" },
      { shape: "triangle", hue: "grape" },
      { shape: "square", hue: "rose" },
    ],
  },
];

/** How many answer cards a child chooses from. Four, in two rows of two. */
export const CARD_COUNT = 4;

/* ── The near misses ─────────────────────────────────────────────────────── */

/** The same three, with one of them in a different colour. */
function recoloured(parts: readonly Piece[], seed: number): readonly Piece[] {
  const at = seed % parts.length;
  const taken = new Set(parts.map((piece) => piece.hue));
  const swap = HUE_LIST.filter((hue) => !taken.has(hue));
  const hue = swap[Math.floor(unit(seed * 7) * swap.length) % swap.length];
  return parts.map((piece, i) => (i === at ? { ...piece, hue } : piece));
}

/** Only two of the three: the commonest way to be nearly right. */
function missingOne(parts: readonly Piece[], seed: number): readonly Piece[] {
  const drop = seed % parts.length;
  return parts.filter((_, i) => i !== drop);
}

/** The right colours, but one of them is a different shape. */
function reshaped(parts: readonly Piece[], seed: number): readonly Piece[] {
  const at = (seed + 1) % parts.length;
  const taken = new Set(parts.map((piece) => piece.shape));
  const swap = SHAPES.filter((shape) => !taken.has(shape));
  const shape = swap[Math.floor(unit(seed * 11) * swap.length) % swap.length];
  return parts.map((piece, i) => (i === at ? { ...piece, shape } : piece));
}

export interface AnswerCard {
  parts: readonly Piece[];
  /** This is the one. */
  right: boolean;
}

/**
 * WHERE THE RIGHT CARD SITS.
 *
 * Not at random: the four places are DEALT OUT. Every four puzzles use all
 * four places, once each, in an order that changes from one four to the next.
 *
 * That is not fussiness. A hash puts the answer in the same place three times
 * running often enough, and a child who taps the same corner three times and
 * is cheered three times has been taught to tap the corner instead of to look
 * at the shapes. Dealing the places out makes that impossible — the most the
 * answer can ever repeat is twice, across the join between two fours.
 */
function placeIn(block: number): readonly number[] {
  const places = [0, 1, 2, 3];
  // a shuffle the machine can repeat: same block, same deal, every time
  for (let i = places.length - 1; i > 0; i -= 1) {
    const j = Math.floor(unit(block * 31 + i) * (i + 1));
    [places[i], places[j]] = [places[j], places[i]];
  }
  return places;
}

/** The four cards, in the order they are laid out. */
export function answerCards(set: PieceSet, seed: number): readonly AnswerCard[] {
  const wrong = [
    { parts: recoloured(set.parts, seed), right: false },
    { parts: missingOne(set.parts, seed), right: false },
    { parts: reshaped(set.parts, seed), right: false },
  ];
  const cards = [...wrong];
  const at = placeIn(Math.floor(seed / CARD_COUNT))[seed % CARD_COUNT];
  cards.splice(at, 0, { parts: set.parts, right: true });
  return cards;
}
