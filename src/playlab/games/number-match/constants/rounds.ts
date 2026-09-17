/**
 * Number Pals — every round, as data, plus the rules that read it.
 *
 * ONE PUZZLE, twelve times: a row of cards, each holding a different number
 * of the same thing, an empty socket under each card, and those numbers
 * loose in a tray. Put each number under the card it counts.
 *
 * Nothing is authored twice. The tray is DERIVED from the cards, so a round
 * cannot offer a number no card wants; the sticker a round wins is the thing
 * the round was about; and the answer for a socket is simply the count on
 * the card above it.
 *
 * Twelve rounds fill a sticker book of three pages. A page is the unit of
 * progress — four stickers fill one, and a full page turns.
 */

import { unit } from "@shared/utils/hash";

/** Stickers to a page = rounds between the big celebrations. */
export const ROUNDS_PER_PAGE = 4;

/** What the cards hold. One drawing each, see MatchArt. */
export type Thing =
  | "cupcake"
  | "apple"
  | "balloon"
  | "fish"
  | "duck"
  | "star"
  | "bug"
  | "flower"
  | "kite"
  | "leaf"
  | "boat"
  | "bell";

/** Plural, for the question and the labels. */
export const THING_NAMES: Record<Thing, string> = {
  cupcake: "cupcakes",
  apple: "apples",
  balloon: "balloons",
  fish: "fish",
  duck: "ducks",
  star: "stars",
  bug: "bugs",
  flower: "flowers",
  kite: "kites",
  leaf: "leaves",
  boat: "boats",
  bell: "bells",
};

/** Singular, because "1 apples" is not a thing to teach a child. */
export const THING_NAME_ONE: Record<Thing, string> = {
  cupcake: "cupcake",
  apple: "apple",
  balloon: "balloon",
  fish: "fish",
  duck: "duck",
  star: "star",
  bug: "bug",
  flower: "flower",
  kite: "kite",
  leaf: "leaf",
  boat: "boat",
  bell: "bell",
};

/** What to call the things when there are this many of them. */
export function thingName(thing: Thing, count: number): string {
  return count === 1 ? THING_NAME_ONE[thing] : THING_NAMES[thing];
}

export interface Round {
  id: string;
  thing: Thing;
  /** How many things each card holds, left to right. Always all different. */
  cards: readonly number[];
}

/**
 * THE TWELVE ROUNDS.
 *
 * Page one is three cards of small, far-apart counts; page two keeps three
 * cards but pushes to five and moves the counts next to each other, where
 * the child has to actually count rather than eyeball the biggest pile; page
 * three opens a fourth card. The thing changes every round, so what is being
 * read is the NUMBER and never the picture.
 */
export const ROUNDS: readonly Round[] = [
  // ── Page one · three cards, counts far apart ──
  { id: "cupcakes-3-1-2", thing: "cupcake", cards: [3, 1, 2] },
  { id: "apples-2-4-1", thing: "apple", cards: [2, 4, 1] },
  { id: "balloons-1-3-4", thing: "balloon", cards: [1, 3, 4] },
  { id: "fish-4-2-3", thing: "fish", cards: [4, 2, 3] },

  // ── Page two · three cards, up to five and close together ──
  { id: "ducks-3-5-4", thing: "duck", cards: [3, 5, 4] },
  { id: "stars-5-3-2", thing: "star", cards: [5, 3, 2] },
  { id: "bugs-2-3-5", thing: "bug", cards: [2, 3, 5] },
  { id: "flowers-4-5-3", thing: "flower", cards: [4, 5, 3] },

  // ── Page three · a fourth card ──
  { id: "kites-1-3-2-4", thing: "kite", cards: [1, 3, 2, 4] },
  { id: "leaves-5-2-4-3", thing: "leaf", cards: [5, 2, 4, 3] },
  { id: "boats-3-1-4-5", thing: "boat", cards: [3, 1, 4, 5] },
  { id: "bells-2-5-3-1", thing: "bell", cards: [2, 5, 3, 1] },
];

export const TOTAL_ROUNDS = ROUNDS.length;

/* ── Reading a round ─────────────────────────────────────────────────────── */

/**
 * The numbers in the tray, derived from the cards so the tray can never
 * offer a number no card wants, nor miss one.
 *
 * The order is deterministic (never Math.random at render) and never the
 * same order as the cards — a tray that lines up with the row would let a
 * child win it left to right without counting anything.
 */
export function trayFor(round: Round, index: number): readonly number[] {
  const cards = round.cards;
  const order = [...cards].sort((a, b) => unit(index * 31 + a) - unit(index * 31 + b));
  const aligned = order.every((n, i) => n === cards[i]);
  return aligned ? [...order.slice(1), order[0]] : order;
}

/** The number that belongs under card `i`: what is drawn on it. */
export function answerFor(round: Round, cardIndex: number): number {
  return round.cards[cardIndex];
}

/** 1-based page of the sticker book this round lands on. */
export function pageOf(index: number): number {
  return Math.floor(index / ROUNDS_PER_PAGE) + 1;
}

/** Did winning this round fill a page? */
export function completesPage(index: number): boolean {
  return (index + 1) % ROUNDS_PER_PAGE === 0;
}

/** Every sticker in the book, in the order they are won. */
export const STICKERS: readonly Thing[] = ROUNDS.map((r) => r.thing);

/* ── The paint ───────────────────────────────────────────────────────────────
   The cards are a different colour EVERY ROUND, and every card in a row is a
   different colour from its neighbours — four sets of four, so the widest row
   never repeats and a set comes back only after four rounds. */

export interface CardPaint {
  /** The card face. */
  face: string;
  /** Its border and the shadow under it. */
  edge: string;
}

const PALETTES: readonly (readonly CardPaint[])[] = [
  [
    { face: "#BFE3F7", edge: "#7FBCE0" },
    { face: "#FFD9E4", edge: "#F0A3BC" },
    { face: "#D6EFC8", edge: "#9ACB84" },
    { face: "#FFE6B0", edge: "#EBBF62" },
  ],
  [
    { face: "#E0DAF7", edge: "#AFA2E0" },
    { face: "#C9EFE6", edge: "#7CC9B8" },
    { face: "#FFDCC2", edge: "#EFAF83" },
    { face: "#CFE2FA", edge: "#8FB6E4" },
  ],
  [
    { face: "#FBE0C6", edge: "#E2AE7A" },
    { face: "#D9E8FB", edge: "#93B6DF" },
    { face: "#F6D7EF", edge: "#DDA0CE" },
    { face: "#DCF0CB", edge: "#A3CC85" },
  ],
  [
    { face: "#CDEAF2", edge: "#84BFD1" },
    { face: "#FFE3B8", edge: "#E9BB6E" },
    { face: "#E3DBF9", edge: "#B0A2E6" },
    { face: "#FFD6D6", edge: "#EFA0A0" },
  ],
];

/** The paint for one card of one round. */
export function paintFor(index: number, cardIndex: number): CardPaint {
  const set = PALETTES[index % PALETTES.length];
  return set[cardIndex % set.length];
}
