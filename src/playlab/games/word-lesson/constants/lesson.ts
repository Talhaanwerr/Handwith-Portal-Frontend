/**
 * MY FIRST WORDS — the lesson engine's data shape. Five vocabulary lessons for
 * three- and four-year-olds (Animals, Food, At Home, Out and About, Clothes),
 * each the same six pages in the same order so a child learns the routine:
 *
 *   1 MEET        three big picture cards come in, each named; tap each one
 *   2 WHERE IS IT two pictures: "Where is the cow?" — tap it
 *   3 WHERE IS IT three pictures, a different word
 *   4 SHADOW      drag the picture onto its dark shadow (two shadows)
 *   5 PEEKABOO    three hiding spots, a corner of each thing peeks out:
 *                 "Peekaboo! Where is the duck?" — tap where it hides
 *   6 PUT IT AWAY two pictures and the lesson's container: drag the named one in
 *
 * One action a page (tap OR drag). Every word here has BOTH a Fluent 3D
 * picture (`fluentSrc`) and a recorded clip that says it (`wordClip`) —
 * `checkLesson()` proves it for every word a lesson uses.
 *
 * Kit folder, not a game: each `words-*` game hands its own `Lesson` to
 * `makeLesson()` (components/WordLesson.tsx).
 */

import { fluentSrc } from "@shared/constants/fluent3d";
import { animalPhoto } from "@games/blend-read/components/PictureArt";
import { wordClip } from "@shared/audio/wordClips";
import { distinct, type GameVoice, type ModuleInfo } from "@games/number-groups/constants/kit";

/** The one module every lesson has. */
export type LessonModule = "learn";
export const LESSON_MODULES: readonly LessonModule[] = ["learn"];

/** Pages a lesson: the store and NgShell's `roundCount`. */
export const LESSON_ROUNDS = 6;

/** The lesson's room — its world, its colours, its hiding spots and its
 *  container all follow from it. */
export type SceneId = "barn" | "kitchen" | "living" | "park" | "bedroom";

export type Pair = readonly [string, string];
export type Trio = readonly [string, string, string];

export interface Lesson {
  /** The game id (`words-animals`) — also its store's key. */
  id: string;
  title: string;
  scene: SceneId;
  voice: GameVoice;
  module: ModuleInfo<LessonModule>;
  /** "in the barn!" — said after "Put the" + the word on page six. */
  putIn: string;
  /** Page 1: the three cards, in the order they come in. */
  meet: Trio;
  /** Page 2: two pictures, one asked for. */
  where2: { options: Pair; target: string };
  /** Page 3: three pictures, one asked for. */
  where3: { options: Trio; target: string };
  /** Page 4: the picture to drag, and the two shadows (one is its own). */
  shadow: { piece: string; shadows: Pair };
  /** Page 5: what hides in each of the three spots, and the one asked for. */
  peek: { spots: Trio; target: string };
  /** Page 6: the two pictures on the floor, and the one to put away. */
  put: { options: Pair; target: string };
  /**
   * SET LESSON (optional): the lesson is played three words at a time. Each
   * set is SET_ROUNDS pages — meet the three; find each of them in turn (the
   * cards shuffled every time); a peekaboo and a put-away with them; then a four-piece puzzle of each — and after every set the shell's
   * break card asks Continue or Back. The six pages above are not played.
   */
  sets?: readonly Trio[];
}

/** Pages in one set of a set lesson: 1 meet + 3 finds + 2 games + 3 puzzles. */
export const SET_ROUNDS = 9;

/** Pages a lesson has: the store's and NgShell's `roundCount`. */
export const lessonRounds = (l: Lesson): number =>
  l.sets ? l.sets.length * SET_ROUNDS : LESSON_ROUNDS;

/** One set's pages, all derived from its three words (never stored twice). */
export interface SetPages {
  meet: Trio;
  /** Three asks, the cards in a new order each time, each word asked once. */
  finds: readonly { options: Trio; target: string }[];
  peek: Lesson["peek"];
  put: Lesson["put"];
  /** A four-piece puzzle of each word, in meeting order. */
  puzzles: Trio;
}

export function setPages([a, b, c]: Trio): SetPages {
  return {
    meet: [a, b, c],
    finds: [
      { options: [b, c, a], target: a },
      { options: [c, a, b], target: c },
      { options: [a, b, c], target: b },
    ],
    peek: { spots: [c, a, b], target: b },
    put: { options: [c, b], target: c },
    puzzles: [a, b, c],
  };
}

/* The kit's own lines (see word-lesson/NEW-CLIPS.json). */
/** "Tap each one!" */
export const MEET = "fw-meet";
/** "Where is the" — the word follows. */
export const WHERE = "fw-where";
/** "Put it on its shadow!" */
export const SHADOW = "fw-shadow";
/** "Peekaboo! Where is the" — the word follows. */
export const PEEK = "fw-peek";
/** "Put the" — the word and the lesson's `putIn` follow. */
export const PUT = "fw-put";
export const TRY = "instr-try-again";
/** "Put the four pieces together!" (Jigsaw Fun’s line). */
export const PUZZLE = "jigsaw-pieces-4";

/** A word's picture (every lesson word has one — `checkLesson`). */
/** A word's picture: the real photo for an animal that has one (the
 *  portal's own photos), else its Fluent 3D picture. */
export const picOf = (w: string): string => animalPhoto(w) ?? fluentSrc(w) ?? "";
/** The Fluent 3D picture only — for the shadow page, whose dark outlines
 *  need a cut-out picture, not a photo. */
export const shapeOf = (w: string): string => fluentSrc(w) ?? "";
/** The recorded clip that says a word (every lesson word has one). */
export const sayOf = (w: string): string => wordClip(w) ?? "";

/** Every word a lesson shows, once each. */
export function lessonWords(l: Lesson): string[] {
  return [
    ...new Set([
      ...l.meet,
      ...l.where2.options,
      ...l.where3.options,
      ...l.shadow.shadows,
      l.shadow.piece,
      ...l.peek.spots,
      ...l.put.options,
      ...(l.sets ?? []).flat(),
    ]),
  ];
}

/** The answers' places on the pages that have one (2, 3, 4, 5, 6). */
export function answerSlots(l: Lesson): number[] {
  return [
    l.where2.options.indexOf(l.where2.target),
    l.where3.options.indexOf(l.where3.target),
    l.shadow.shadows.indexOf(l.shadow.piece),
    l.peek.spots.indexOf(l.peek.target),
    l.put.options.indexOf(l.put.target),
  ];
}

/**
 * Self-check: a picture AND a recording for every word; every page has the
 * right number of different pictures with its answer among them; the five
 * words asked for are five different words; the answer is not always in one
 * place; and a lesson teaches at least six words.
 */
export function checkLesson(l: Lesson): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(`${l.id}: ${msg}`);
  };
  const words = lessonWords(l);
  for (const w of words) {
    need(!!fluentSrc(w), `${w} has no picture`);
    need(!!wordClip(w), `${w} has no recording`);
  }
  need(words.length >= 6, `only ${words.length} words`);
  need(distinct(l.meet), "meet: a card twice");
  need(distinct(l.where2.options), "where2: a picture twice");
  need(distinct(l.where3.options), "where3: a picture twice");
  need(distinct(l.shadow.shadows), "shadow: a shadow twice");
  need(distinct(l.peek.spots), "peek: a thing twice");
  need(distinct(l.put.options), "put: a picture twice");
  const slots = answerSlots(l);
  need(
    slots.every((s) => s >= 0),
    "a page's answer is not on the page"
  );
  need(new Set(slots).size >= 2, "the answer is always in one place");
  const asked = [l.where2.target, l.where3.target, l.shadow.piece, l.peek.target, l.put.target];
  need(distinct(asked), "the same word is asked for twice");
  need(l.module.id === "learn", "the module is not `learn`");
  if (l.sets) {
    need(l.sets.length >= 1, "a set lesson with no sets");
    need(distinct(l.sets.flat()), "a word is in two sets");
    for (const trio of l.sets) {
      const s = setPages(trio);
      need(distinct(s.finds.map((f) => f.target)), "a set asks for a word twice");
      need(
        new Set(s.finds.map((f) => f.options.indexOf(f.target))).size === 3,
        "a set’s answer is twice in one place"
      );
      need(
        s.peek.spots.includes(s.peek.target) && s.put.options.includes(s.put.target),
        "a set game has no answer"
      );
    }
  }
  return problems;
}
