import { wordClip } from "@shared/audio/wordClips";

/**
 * PHONICS GAME SHOW — the fifteen questions.
 *
 * One picture, three letters, one of them the sound the word starts with.
 * The first three are the reference show's own (sun, cup, ant); the other
 * twelve are words the portal already has a picture AND a recording for, so
 * nothing here needs new art or a new voice line. Every answer letter is
 * different, so by the end the child has heard fifteen first sounds.
 *
 * The two wrong letters are written by hand, never drawn at random: each one
 * SOUNDS clearly different from the answer (no `c` beside `k`, no `s` beside
 * a `c` that could be soft), so the only way to get it right is to listen
 * for the first sound. The reference's doubled letters (`ll`, `ss`) are left
 * out — at Level 2 a letter is a letter.
 */

export interface Question {
  /** The word, and the name of its picture and its recording. */
  word: string;
  /** The three letters, in the order they sit on the stage. */
  options: readonly string[];
}

export const QUESTIONS: readonly Question[] = [
  { word: "sun", options: ["l", "e", "s"] },
  { word: "cup", options: ["c", "n", "d"] },
  { word: "ant", options: ["a", "f", "g"] },
  { word: "bus", options: ["m", "b", "t"] },
  { word: "dog", options: ["d", "h", "s"] },
  { word: "fox", options: ["p", "l", "f"] },
  { word: "hat", options: ["h", "n", "b"] },
  { word: "lion", options: ["s", "l", "m"] },
  { word: "mouse", options: ["t", "f", "m"] },
  { word: "nest", options: ["n", "c", "h"] },
  { word: "penguin", options: ["d", "p", "l"] },
  { word: "egg", options: ["m", "s", "e"] },
  { word: "juice", options: ["j", "b", "a"] },
  { word: "tie", options: ["f", "t", "n"] },
  { word: "whale", options: ["h", "d", "w"] },
] as const;

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** The letter a question's word starts with — the right answer. */
export const answerOf = (q: Question): string => q.word[0];

/** Stars for a run, from how many were right at the FIRST tap. */
export function starsFor(firstTry: number): number {
  if (firstTry >= TOTAL_QUESTIONS - 2) return 3;
  if (firstTry >= Math.ceil(TOTAL_QUESTIONS * 0.6)) return 2;
  return 1;
}

/**
 * Self-check: every word has a recording, every letter on the stage has a
 * recorded sound, the answer is offered exactly once, and no letter repeats
 * within a question. `has` is the manifest lookup.
 */
export function checkQuestions(has: (id: string) => boolean): string[] {
  const errs: string[] = [];
  const answers = new Set<string>();
  for (const q of QUESTIONS) {
    const a = answerOf(q);
    if (!wordClip(q.word)) errs.push(`${q.word}: no recording`);
    if (q.options.filter((o) => o === a).length !== 1) errs.push(`${q.word}: answer not once`);
    if (new Set(q.options).size !== q.options.length) errs.push(`${q.word}: repeated letter`);
    for (const o of q.options) if (!has(`phonics-${o}`)) errs.push(`${q.word}: no sound for ${o}`);
    if (answers.has(a)) errs.push(`${q.word}: first sound ${a} used twice`);
    answers.add(a);
  }
  return errs;
}
