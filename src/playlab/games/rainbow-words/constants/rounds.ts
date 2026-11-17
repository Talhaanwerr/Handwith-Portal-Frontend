/**
 * RAINBOW WORDS — seven sight-word lessons, one for each colour of the
 * rainbow, each its own game (`rainbow-words-red` … `-violet`; this folder is
 * their kit). Sight words are the little words that cannot be sounded out
 * ("the", "see", "my"), so a child learns them by SEEING them again and again:
 *
 *   for each of the lesson's three words
 *     1 MEET   the word on a big card: "This word is see." — tap it to hear it
 *     2 FIND   three word cards: "Find the word see." — tap it
 *     3 CATCH  six clouds, three of them the word: "Tap every cloud that says
 *              see." — tap all three
 *   then the three words again, in sentences
 *     4 FILL   a sentence with a gap and a picture: "I ___ a cat." — tap the
 *              word that fits; the sentence is read out
 *
 * Finishing a lesson paints its band of the rainbow. Everything a page shows
 * is derived from the lesson's words; `checkRounds()` proves every page can be
 * won and that only one word ever fits a sentence's gap.
 */

import { wordClip } from "@shared/audio/wordClips";
import { distinct, type GameVoice, type ModuleInfo } from "@games/number-groups/constants/kit";

export type ModuleId = "red" | "orange" | "yellow" | "green" | "blue" | "indigo" | "violet";
export const MODULE_IDS: readonly ModuleId[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
];

export const VOICE: GameVoice = { welcome: "rbw-welcome", done: "rbw-done" };

/** A sentence: its words in order, which one is the gap, its picture. */
export interface Sentence {
  words: readonly string[];
  gap: number;
  /** A Word Site picture id (the thing the sentence is about). */
  picture: string;
}

export interface Lesson {
  /** The band's colour and its darker edge. */
  accent: string;
  edge: string;
  words: readonly [string, string, string];
  sentences: readonly [Sentence, Sentence, Sentence];
}

export const LESSONS: Record<ModuleId, Lesson> = {
  red: {
    accent: "#E8554E",
    edge: "#B43A34",
    words: ["I", "see", "a"],
    sentences: [
      { words: ["I", "see", "a", "cat"], gap: 1, picture: "cat" },
      { words: ["I", "see", "a", "dog"], gap: 0, picture: "dog" },
      { words: ["I", "see", "a", "bus"], gap: 2, picture: "bus" },
    ],
  },
  orange: {
    accent: "#F0902A",
    edge: "#BE6A0C",
    words: ["the", "is", "big"],
    sentences: [
      { words: ["the", "dog", "is", "big"], gap: 2, picture: "dog" },
      { words: ["the", "bus", "is", "big"], gap: 0, picture: "bus" },
      { words: ["the", "bed", "is", "big"], gap: 3, picture: "bed" },
    ],
  },
  yellow: {
    accent: "#E3AE12",
    edge: "#A97F04",
    words: ["my", "can", "go"],
    sentences: [
      { words: ["my", "dog", "can", "go"], gap: 2, picture: "dog" },
      { words: ["my", "cat", "can", "go"], gap: 0, picture: "cat" },
      { words: ["my", "bus", "can", "go"], gap: 3, picture: "bus" },
    ],
  },
  green: {
    accent: "#3BA55D",
    edge: "#267A41",
    words: ["we", "like", "it"],
    sentences: [
      { words: ["we", "like", "the", "hat"], gap: 1, picture: "hat" },
      { words: ["we", "like", "the", "cup"], gap: 0, picture: "cup" },
      { words: ["we", "like", "it"], gap: 2, picture: "sun" },
    ],
  },
  blue: {
    accent: "#2F7FD0",
    edge: "#1F5C9C",
    words: ["look", "at", "this"],
    sentences: [
      { words: ["look", "at", "the", "fox"], gap: 1, picture: "fox" },
      { words: ["look", "at", "the", "hen"], gap: 0, picture: "hen" },
      { words: ["this", "is", "a", "box"], gap: 0, picture: "box" },
    ],
  },
  indigo: {
    accent: "#4B55C8",
    edge: "#333C99",
    words: ["and", "has", "play"],
    sentences: [
      { words: ["the", "hen", "has", "a", "hat"], gap: 2, picture: "hen" },
      { words: ["the", "cat", "and", "the", "dog"], gap: 2, picture: "cat" },
      { words: ["the", "dog", "can", "play"], gap: 3, picture: "dog" },
    ],
  },
  violet: {
    accent: "#8A4FD6",
    edge: "#6233A3",
    words: ["to", "he", "little"],
    sentences: [
      { words: ["I", "see", "the", "little", "hen"], gap: 3, picture: "hen" },
      { words: ["I", "go", "to", "the", "bus"], gap: 2, picture: "bus" },
      { words: ["he", "can", "go"], gap: 0, picture: "dog" },
    ],
  },
};

const NAMES: Record<ModuleId, string> = {
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  indigo: "Indigo",
  violet: "Violet",
};

export const MODULES: readonly ModuleInfo<ModuleId>[] = MODULE_IDS.map((id) => ({
  id,
  name: `${NAMES[id]} words`,
  tag: `Learn ${LESSONS[id].words.join(", ")}`,
  accent: LESSONS[id].accent,
  edge: LESSONS[id].edge,
  clip: `rbw-mode-${id}`,
}));

/** The game's title for a lesson. */
export const titleOf = (id: ModuleId): string => `Rainbow Words: ${NAMES[id]}`;

export type Step = "meet" | "find" | "catch" | "fill";
const WORD_STEPS: readonly Step[] = ["meet", "find", "catch"];
/** Pages of the three words, then one page a sentence. */
const TEACH = 9;
export const ROUNDS = TEACH + 3;

/** What a round plays: a word's page (`i` = which word) or a sentence (`i` =
 *  which sentence). */
export function pageOf(round: number): { step: Step; i: number } {
  if (round >= TEACH) return { step: "fill", i: (round - TEACH) % 3 };
  return { step: WORD_STEPS[round % 3], i: Math.floor(round / 3) % 3 };
}

/* The game's own lines (see NEW-CLIPS.json). */
/** "This word is" — the word follows. */
export const MEET = "rbw-meet";
/** "Tap the word to hear it!" */
export const TAP = "rbw-tap";
/** "Find the word" — the word follows. */
export const FIND = "rbw-find";
/** "Tap every cloud that says" — the word follows. */
export const CATCH = "rbw-catch";
/** "Which word is missing?" */
export const FILL = "rbw-fill";
export const TRY = "instr-try-again";

/** The clip that says a sight word: an existing recording, else its own. */
export const sayOf = (word: string): string => wordClip(word) ?? `sw-${word.toLowerCase()}`;
/** The clip that reads a lesson's sentence out. */
export const sentenceClip = (id: ModuleId, i: number): string => `rbw-s-${id}-${i + 1}`;

/** A sentence as it is printed: a capital first letter and a full stop. */
export function printed(s: Sentence): string[] {
  return s.words.map((w, k) => (k === 0 ? w[0].toUpperCase() + w.slice(1) : w));
}
export const sentenceText = (s: Sentence): string => `${printed(s).join(" ")}.`;

/** FIND: the lesson's three words, the asked one in a place that changes. */
export function findOptions(l: Lesson, i: number): string[] {
  // turned by two places a word: the asked word lands first, last, middle
  const out = [...l.words];
  for (let k = 0; k < (i * 2) % 3; k++) out.push(out.shift() as string);
  return out;
}

/**
 * CATCH: six clouds — the word three times, the other two words and one of
 * them again — laid out so the three right clouds are never one row.
 */
export function catchClouds(l: Lesson, i: number): string[] {
  const w = l.words[i];
  const [x, y] = l.words.filter((_, k) => k !== i);
  const layouts = [
    [w, x, y, x, w, w],
    [x, w, w, w, y, x],
    [w, y, w, x, x, w],
  ];
  return layouts[i % layouts.length];
}

/** FILL: the three words to choose from, in an order that changes. */
export function fillOptions(l: Lesson, i: number): string[] {
  // the word that fits goes second, first, then last; the other two keep
  // their order round it
  const s = l.sentences[i];
  const right = l.words.find((w) => w.toLowerCase() === s.words[s.gap].toLowerCase()) as string;
  const out = l.words.filter((w) => w !== right);
  out.splice([1, 0, 2][i % 3], 0, right);
  return out;
}

/** Self-check: every lesson is playable and fair on every page. */
export function checkRounds(): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };
  const all = MODULE_IDS.flatMap((m) => LESSONS[m].words.map((w) => w.toLowerCase()));
  need(distinct(all), "a word is taught in two lessons");
  for (const m of MODULE_IDS) {
    const l = LESSONS[m];
    need(distinct(l.words), `${m}: a word twice`);
    const gaps = l.sentences.map((s) => s.words[s.gap].toLowerCase());
    need(
      distinct(gaps) && gaps.every((g) => l.words.some((w) => w.toLowerCase() === g)),
      `${m}: the sentences do not ask for each word once`
    );
    const places = new Set<number>();
    l.sentences.forEach((s, i) => {
      need(s.gap >= 0 && s.gap < s.words.length, `${m} sentence ${i + 1}: no gap`);
      // only the gap's own word may appear among the choices AND fit: no other
      // lesson word is already printed in the sentence
      const others = l.words.filter((w) => w.toLowerCase() !== s.words[s.gap].toLowerCase());
      need(
        fillOptions(l, i).filter((w) => w.toLowerCase() === s.words[s.gap].toLowerCase()).length ===
          1,
        `${m} sentence ${i + 1}: the answer is not offered once`
      );
      need(others.length === 2, `${m} sentence ${i + 1}: wrong number of other words`);
      places.add(
        fillOptions(l, i).findIndex((w) => w.toLowerCase() === s.words[s.gap].toLowerCase())
      );
    });
    need(places.size === 3, `${m}: the missing word is twice in one place`);
    const found = new Set<number>();
    l.words.forEach((w, i) => {
      found.add(findOptions(l, i).indexOf(w));
      const clouds = catchClouds(l, i);
      need(clouds.length === 6, `${m} ${w}: not six clouds`);
      need(clouds.filter((c) => c === w).length === 3, `${m} ${w}: not three right clouds`);
      const top = clouds.slice(0, 3).filter((c) => c === w).length;
      need(top > 0 && top < 3, `${m} ${w}: the right clouds are one row`);
    });
    need(found.size === 3, `${m}: FIND's answer is twice in one place`);
  }
  for (let r = 0; r < ROUNDS; r++) {
    const p = pageOf(r);
    need(p.i >= 0 && p.i < 3, `round ${r}: no word`);
  }
  return problems;
}
