/**
 * Finish My Song — hearing a rhyme at the end of a line, for three- to
 * five-year-olds. A little bird sings a short two-line song with its last
 * word missing ("I saw a cat, wearing a…"); three eggs in the nest hatch one
 * by one, each picture named; the child taps the one that finishes the song
 * (the hat), and the bird sings the whole line.
 *
 * Every song is our own, written for this game; the word that finishes it
 * and the word it rhymes with are both rhyme words (`WORDS`), so the picture
 * and its recording exist. One module, six rounds, one song a round.
 */

import {
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "sing";
export const MODULE_IDS: readonly ModuleId[] = ["sing"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "sing",
    name: "Finish My Song",
    tag: "Listen, then tap the egg that rhymes",
    accent: "#F08A3C",
    edge: "#B95E1C",
    clip: "fms-mode-sing",
  },
];

export const VOICE: GameVoice = { welcome: "fms-welcome", done: "fms-done" };

/** "Which one finishes my song?" */
export const ASK = "fms-ask";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const SONG_ROUNDS = 6;

export interface Song {
  /** The song's clip: two short lines, the last word left out. */
  clip: string;
  /** The word in the song that the missing word rhymes with. */
  partner: Word;
  /** The word that finishes the song. */
  answer: Word;
  /** The three eggs, left to right (the answer is one of them). */
  eggs: readonly [Word, Word, Word];
}

export const ROUNDS: readonly Song[] = [
  // "I saw a cat, wearing a…"
  { clip: "fms-song-1", partner: "cat", answer: "hat", eggs: ["hat", "sun", "fish"] },
  // "Look at the moon! I eat with a…"
  { clip: "fms-song-2", partner: "moon", answer: "spoon", eggs: ["ball", "spoon", "duck"] },
  // "A little green frog sat on a…"
  { clip: "fms-song-3", partner: "frog", answer: "log", eggs: ["bus", "cake", "log"] },
  // "Twinkle, little star, high above my…"
  { clip: "fms-song-4", partner: "star", answer: "car", eggs: ["shoe", "car", "apple"] },
  // "My little red hen has a big blue…"
  { clip: "fms-song-5", partner: "hen", answer: "pen", eggs: ["bear", "cow", "pen"] },
  // "A tiny grey mouse lives in a…"
  { clip: "fms-song-6", partner: "mouse", answer: "house", eggs: ["house", "tree", "bug"] },
];

/** Self-check: six songs, each with its own clip; the answer rhymes with its
 *  partner and is in the nest once; the other two eggs rhyme with neither
 *  nor each other; the answer does not always sit in the same egg. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === SONG_ROUNDS, `${ROUNDS.length} songs`);
  need(distinct(ROUNDS.map((s) => s.clip)), "a song clip twice");
  need(distinct(ROUNDS.map((s) => s.answer)), "an answer twice");
  ROUNDS.forEach((s, i) => {
    need(rhymes(s.answer, s.partner), `song ${i}: ${s.answer} does not rhyme with ${s.partner}`);
    need(
      s.eggs.filter((e) => e === s.answer).length === 1,
      `song ${i}: the answer is not in one egg`
    );
    need(distinct(s.eggs), `song ${i}: two eggs the same`);
    const others = s.eggs.filter((e) => e !== s.answer);
    for (const o of others) {
      need(!rhymes(o, s.partner) && !rhymes(o, s.answer), `song ${i}: ${o} rhymes too`);
      need(o !== s.partner, `song ${i}: ${o} is the song's own word`);
    }
    need(!rhymes(others[0], others[1]), `song ${i}: the other two eggs rhyme`);
  });
  need(
    new Set(ROUNDS.map((s) => s.eggs.indexOf(s.answer))).size === 3,
    "the answer sits in too few eggs"
  );
  return problems;
}
