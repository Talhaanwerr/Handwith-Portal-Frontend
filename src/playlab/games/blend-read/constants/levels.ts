/**
 * Blend & Seek — every word, as data, plus the rules that read it.
 *
 * ONE MECHANIC: a written word, its phoneme markers, and a grid of pictures.
 * Exactly one picture matches the word; the rest are distractors. The right
 * answer is never a separate stored number — `answerIndex` DERIVES it by
 * finding `picture` inside `options`, so a question can never disagree with
 * itself (the same rule Key Quest's `answerFor` and Leo's Puzzles' dealt
 * answers already use in this portal).
 *
 * A `phonemes` entry is a grapheme unit, not a single letter: `"oy"` is ONE
 * unit (the long bar under the word), `"t"` is another (a dot). Rendering
 * reads the STRING LENGTH — nothing here tags a unit as "dot" or "bar" by
 * hand, so the visual always matches the spelling.
 *
 * FIVE LEVELS, easiest to hardest:
 *   level1 — plain 3-sound CVC words (cat, dog, sun, ...), every unit a dot.
 *   level2 — one simple blend or digraph per word (ship, frog, star, ...).
 *   level3 — vowel teams and silent e (cake, house, spoon, ...).
 *   level4 — digraphs and blends together (clock, cheese, brush, ...).
 *   level5 — from the reference recording exactly as observed: the hardest
 *            set, unchanged since it was first built (lion, unicorn, ...).
 *
 * Level 1 and level 2 are self-contained: every option in their grids is one
 * of that level's OWN ten words (see the generator note below), so neither
 * needs a single extra distractor picture. Levels 3-5 draw some options from
 * the shared distractor pool in PictureArt.tsx, same as before.
 */

import type { PictureId } from "@games/blend-read/components/PictureArt";

export interface Question {
  /** Stable id — also the root of its audio clips (`blend-word-<id>`,
   *  `blend-sound-<id>-<i>`). */
  id: string;
  word: string;
  /** Grapheme units under the word, left to right. */
  phonemes: readonly string[];
  /** The one picture that matches the word. */
  picture: PictureId;
  /** All eight cards, `picture` among them exactly once. */
  options: readonly PictureId[];
}

export type LevelId = "level1" | "level2" | "level3" | "level4" | "level5";

export interface Level {
  id: LevelId;
  /** The button's own label on the level menu. */
  title: string;
  questions: readonly Question[];
}

/** The answer's place in the grid — DERIVED, never hand-duplicated. */
export function answerIndex(q: Question): number {
  return q.options.indexOf(q.picture);
}

const opts = (...ids: PictureId[]): readonly PictureId[] => ids;

/* ── Level 1 — plain CVC words, every phoneme a single letter ───────────────
   Self-contained: each grid is the level's own ten words minus two, so the
   set reinforces itself round after round with no outside distractor art. */

const LEVEL1: readonly Question[] = [
  {
    id: "level1-cat",
    word: "cat",
    phonemes: ["c", "a", "t"],
    picture: "cat",
    options: opts("dog", "sun", "cat", "fox", "bed", "cup", "bus", "hen"),
  },
  {
    id: "level1-dog",
    word: "dog",
    phonemes: ["d", "o", "g"],
    picture: "dog",
    options: opts("cat", "sun", "hat", "bed", "cup", "dog", "box", "hen"),
  },
  {
    id: "level1-sun",
    word: "sun",
    phonemes: ["s", "u", "n"],
    picture: "sun",
    options: opts("sun", "cat", "dog", "hat", "fox", "cup", "box", "bus"),
  },
  {
    id: "level1-hat",
    word: "hat",
    phonemes: ["h", "a", "t"],
    picture: "hat",
    options: opts("dog", "sun", "fox", "bed", "box", "bus", "hen", "hat"),
  },
  {
    id: "level1-fox",
    word: "fox",
    phonemes: ["f", "o", "x"],
    picture: "fox",
    options: opts("cat", "sun", "hat", "fox", "bed", "cup", "bus", "hen"),
  },
  {
    id: "level1-bed",
    word: "bed",
    phonemes: ["b", "e", "d"],
    picture: "bed",
    options: opts("cat", "dog", "hat", "fox", "cup", "box", "bed", "hen"),
  },
  {
    id: "level1-cup",
    word: "cup",
    phonemes: ["c", "u", "p"],
    picture: "cup",
    options: opts("cat", "cup", "dog", "sun", "fox", "bed", "box", "bus"),
  },
  {
    id: "level1-box",
    word: "box",
    phonemes: ["b", "o", "x"],
    picture: "box",
    options: opts("dog", "sun", "hat", "bed", "box", "cup", "bus", "hen"),
  },
  {
    id: "level1-bus",
    word: "bus",
    phonemes: ["b", "u", "s"],
    picture: "bus",
    options: opts("cat", "sun", "bus", "hat", "fox", "cup", "box", "hen"),
  },
  {
    id: "level1-hen",
    word: "hen",
    phonemes: ["h", "e", "n"],
    picture: "hen",
    options: opts("cat", "dog", "hat", "fox", "bed", "box", "bus", "hen"),
  },
];

/* ── Level 2 — one simple blend or digraph per word ─────────────────────────
   Also self-contained, same reason as level 1. */

const LEVEL2: readonly Question[] = [
  {
    id: "level2-ship",
    word: "ship",
    phonemes: ["sh", "i", "p"],
    picture: "ship",
    options: opts("frog", "star", "plum", "drum", "ship", "flag", "nest", "clam"),
  },
  {
    id: "level2-frog",
    word: "frog",
    phonemes: ["f", "r", "o", "g"],
    picture: "frog",
    options: opts("ship", "frog", "star", "crab", "drum", "flag", "shell", "clam"),
  },
  {
    id: "level2-star",
    word: "star",
    phonemes: ["s", "t", "ar"],
    picture: "star",
    options: opts("ship", "frog", "crab", "plum", "flag", "shell", "nest", "star"),
  },
  {
    id: "level2-crab",
    word: "crab",
    phonemes: ["c", "r", "a", "b"],
    picture: "crab",
    options: opts("frog", "star", "plum", "crab", "drum", "shell", "nest", "clam"),
  },
  {
    id: "level2-plum",
    word: "plum",
    phonemes: ["p", "l", "u", "m"],
    picture: "plum",
    options: opts("plum", "ship", "star", "crab", "drum", "flag", "nest", "clam"),
  },
  {
    id: "level2-drum",
    word: "drum",
    phonemes: ["d", "r", "u", "m"],
    picture: "drum",
    options: opts("ship", "frog", "crab", "plum", "flag", "shell", "drum", "clam"),
  },
  {
    id: "level2-flag",
    word: "flag",
    phonemes: ["f", "l", "a", "g"],
    picture: "flag",
    options: opts("ship", "frog", "flag", "star", "plum", "drum", "shell", "nest"),
  },
  {
    id: "level2-shell",
    word: "shell",
    phonemes: ["sh", "e", "l"],
    picture: "shell",
    options: opts("frog", "star", "crab", "drum", "flag", "shell", "nest", "clam"),
  },
  {
    id: "level2-nest",
    word: "nest",
    phonemes: ["n", "e", "s", "t"],
    picture: "nest",
    options: opts("ship", "star", "crab", "plum", "nest", "flag", "shell", "clam"),
  },
  {
    id: "level2-clam",
    word: "clam",
    phonemes: ["c", "l", "a", "m"],
    picture: "clam",
    options: opts("ship", "clam", "frog", "crab", "plum", "drum", "shell", "nest"),
  },
];

/* ── Level 3 — vowel teams and silent e ───────────────────────────────────── */

const LEVEL3: readonly Question[] = [
  {
    id: "level3-cake",
    word: "cake",
    phonemes: ["c", "a", "k"],
    picture: "cake",
    options: opts("trophy", "crown", "cake", "chef", "bowl", "glue", "toys", "tie"),
  },
  {
    id: "level3-house",
    word: "house",
    phonemes: ["h", "ou", "s"],
    picture: "house",
    options: opts("chair", "house", "mountain", "girl", "ball", "acorn", "bone", "hat"),
  },
  {
    id: "level3-spoon",
    word: "spoon",
    phonemes: ["s", "p", "oo", "n"],
    picture: "spoon",
    options: opts("cube", "ruler", "dolphin", "paper", "medal", "spoon", "teeth", "queen"),
  },
  {
    id: "level3-juice",
    word: "juice",
    phonemes: ["j", "ui", "c"],
    picture: "juice",
    options: opts("trophy", "medal", "cheese", "juice", "glue", "toys", "crown", "tie"),
  },
  {
    id: "level3-mice",
    word: "mice",
    phonemes: ["m", "i", "c"],
    picture: "mice",
    options: opts("cupcake", "unicorn", "apple", "ball", "girl", "clock", "mice", "family"),
  },
  {
    id: "level3-toes",
    word: "toes",
    phonemes: ["t", "oe", "s"],
    picture: "toes",
    options: opts("ruler", "horse", "snake", "cupcake", "toes", "medal", "lion", "dolphin"),
  },
  {
    id: "level3-bowl",
    word: "bowl",
    phonemes: ["b", "ow", "l"],
    picture: "bowl",
    options: opts("teeth", "bike", "paper", "queen", "medal", "mountain", "bowl", "cake"),
  },
  {
    id: "level3-blue",
    word: "blue",
    phonemes: ["b", "l", "ue"],
    picture: "blue",
    options: opts("blue", "chef", "thumb", "ball", "hat", "bone", "apple", "toys"),
  },
  {
    id: "level3-train",
    word: "train",
    phonemes: ["t", "r", "ai", "n"],
    picture: "train",
    options: opts("bike", "unicorn", "horse", "bird", "snake", "lion", "train", "family"),
  },
  {
    id: "level3-mouse",
    word: "mouse",
    phonemes: ["m", "ou", "s"],
    picture: "mouse",
    options: opts("spider", "girl", "horse", "bird", "snake", "lion", "family", "mouse"),
  },
];

/* ── Level 4 — digraphs and blends together ───────────────────────────────── */

const LEVEL4: readonly Question[] = [
  {
    id: "level4-clock",
    word: "clock",
    phonemes: ["c", "l", "o", "ck"],
    picture: "clock",
    options: opts("clock", "chair", "mountain", "girl", "ball", "acorn", "bone", "hat"),
  },
  {
    id: "level4-thumb",
    word: "thumb",
    phonemes: ["th", "u", "m"],
    picture: "thumb",
    options: opts("cube", "dolphin", "paper", "ruler", "thumb", "medal", "teeth", "queen"),
  },
  {
    id: "level4-cheese",
    word: "cheese",
    phonemes: ["ch", "ee", "s"],
    picture: "cheese",
    options: opts("trophy", "crown", "chef", "cheese", "bowl", "glue", "toys", "tie"),
  },
  {
    id: "level4-queen",
    word: "queen",
    phonemes: ["qu", "ee", "n"],
    picture: "queen",
    options: opts("bike", "unicorn", "horse", "bird", "snake", "lion", "family", "queen"),
  },
  {
    id: "level4-whale",
    word: "whale",
    phonemes: ["wh", "a", "l"],
    picture: "whale",
    options: opts("chair", "whale", "mountain", "girl", "ball", "acorn", "bone", "hat"),
  },
  {
    id: "level4-brush",
    word: "brush",
    phonemes: ["b", "r", "u", "sh"],
    picture: "brush",
    options: opts("cube", "dolphin", "paper", "ruler", "medal", "brush", "teeth", "queen"),
  },
  {
    id: "level4-chair",
    word: "chair",
    phonemes: ["ch", "air"],
    picture: "chair",
    options: opts("cube", "ball", "acorn", "hat", "chair", "dolphin", "bone", "paper"),
  },
  {
    id: "level4-crown",
    word: "crown",
    phonemes: ["c", "r", "ow", "n"],
    picture: "crown",
    options: opts("trophy", "medal", "teeth", "cheese", "glue", "toys", "crown", "tie"),
  },
  {
    id: "level4-teeth",
    word: "teeth",
    phonemes: ["t", "ee", "th"],
    picture: "teeth",
    options: opts("trophy", "teeth", "medal", "cheese", "glue", "toys", "crown", "tie"),
  },
  {
    id: "level4-shoe",
    word: "shoe",
    phonemes: ["sh", "oe"],
    picture: "shoe",
    options: opts("hat", "toes", "shoe", "ball", "bike", "cube", "girl", "chair"),
  },
];

/* ── Level 5 — from the reference recording, exactly as observed ─────────── */

const LEVEL5: readonly Question[] = [
  {
    id: "level5-lion",
    word: "lion",
    phonemes: ["l", "i", "o", "n"],
    picture: "lion",
    options: opts("horse", "glue", "bike", "lion", "family", "cube", "ruler", "girl"),
  },
  {
    id: "level5-snake",
    word: "snake",
    phonemes: ["s", "n", "a", "k"],
    picture: "snake",
    options: opts("chair", "girl", "mountain", "acorn", "snake", "trophy", "family", "bear"),
  },
  {
    id: "level5-toys",
    word: "toys",
    phonemes: ["t", "oy", "s"],
    picture: "toys",
    options: opts("hat", "bone", "cupcake", "cloud", "acorn", "bear", "ball", "toys"),
  },
  {
    id: "level5-cloud",
    word: "cloud",
    phonemes: ["c", "l", "ou", "d"],
    picture: "cloud",
    options: opts("girl", "bird", "cloud", "chair", "bone", "thumb", "queen", "trophy"),
  },
  {
    id: "level5-meat",
    word: "meat",
    phonemes: ["m", "ea", "t"],
    picture: "meat",
    options: opts("girl", "planet", "paper", "queen", "meat", "chair", "dolphin", "cupcake"),
  },
  {
    id: "level5-bike",
    word: "bike",
    phonemes: ["b", "i", "k"],
    picture: "bike",
    options: opts("chair", "bike", "mountain", "girl", "trophy", "ball", "acorn", "hat"),
  },
  {
    id: "level5-cube",
    word: "cube",
    phonemes: ["c", "u", "b"],
    picture: "cube",
    options: opts("cube", "ball", "bone", "ruler", "chair", "dolphin", "hat", "paper"),
  },
  {
    id: "level5-chef",
    word: "chef",
    phonemes: ["ch", "e", "f"],
    picture: "chef",
    options: opts("glue", "planet", "ruler", "bird", "dolphin", "cupcake", "girl", "chef"),
  },
  {
    id: "level5-tie",
    word: "tie",
    phonemes: ["t", "ie"],
    picture: "tie",
    options: opts("girl", "glue", "bowl", "telephone", "tie", "cupcake", "medal", "paper"),
  },
  {
    id: "level5-unicorn",
    word: "unicorn",
    phonemes: ["u", "n", "i", "c", "or", "n"],
    picture: "unicorn",
    options: opts("unicorn", "dolphin", "bear", "girl", "queen", "chef", "mountain", "trophy"),
  },
];

export const LEVELS: Record<LevelId, Level> = {
  level1: { id: "level1", title: "Level 1", questions: LEVEL1 },
  level2: { id: "level2", title: "Level 2", questions: LEVEL2 },
  level3: { id: "level3", title: "Level 3", questions: LEVEL3 },
  level4: { id: "level4", title: "Level 4", questions: LEVEL4 },
  level5: { id: "level5", title: "Level 5", questions: LEVEL5 },
};

/** Left to right / top to bottom on the level menu, easiest first. */
export const LEVEL_ORDER: readonly LevelId[] = ["level1", "level2", "level3", "level4", "level5"];

export const QUESTIONS_PER_LEVEL = 10;
export const OPTIONS_PER_QUESTION = 8;

export function questionCount(id: LevelId): number {
  return LEVELS[id].questions.length;
}
