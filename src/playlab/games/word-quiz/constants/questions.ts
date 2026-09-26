/**
 * Snow Words — the ten questions, exactly as the reference activity asks
 * them.
 *
 * One picture, three words, one of them right. The distractors are the point:
 * they rhyme with the answer or share its first sound (`pan` against `map`,
 * `top` and `tin` against `tap`), so the child has to read the whole word
 * rather than recognise its shape. That is why they are written here by hand
 * and never generated — a random wrong word would make the game easier, not
 * harder.
 *
 * `word` is both the answer and the picture: the picture for "bus" is looked
 * up by that name, so the two can never disagree.
 */

export interface Question {
  /** The answer, and the name of the picture shown. */
  word: string;
  /** The three words offered, in the order they appear. */
  options: readonly string[];
}

export const QUESTIONS: readonly Question[] = [
  { word: "bus", options: ["sock", "bus", "bin"] },
  { word: "cat", options: ["peg", "cat", "can"] },
  { word: "sun", options: ["hop", "sun", "sit"] },
  { word: "hen", options: ["man", "hen", "hat"] },
  { word: "penguin", options: ["pen", "penguin", "pin"] },
  { word: "dog", options: ["dog", "hen", "dig"] },
  { word: "rat", options: ["rat", "mat", "fan"] },
  { word: "tap", options: ["tap", "top", "tin"] },
  { word: "map", options: ["pan", "map", "tin"] },
  { word: "pan", options: ["peg", "rat", "pan"] },
] as const;

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** What the child chose on one question, kept for the review at the end. */
export interface Answer {
  /** Index into QUESTIONS. */
  question: number;
  /** The word they picked. */
  chosen: string;
}

export function isCorrect(answer: Answer): boolean {
  return QUESTIONS[answer.question].word === answer.chosen;
}

export function scoreOf(answers: readonly Answer[]): number {
  return answers.reduce((n, a) => n + (isCorrect(a) ? 1 : 0), 0);
}
