/**
 * The shape of one Ocean Hunt round: a strip of consecutive letters with one
 * hidden, plus the letters offered on the sand.
 *
 * Everything here is a pure function of the target letter, and DETERMINISTIC
 * — no randomness. Two reasons: the same letter must always pose the same
 * round (a child replaying "E" meets the round they remember, which is the
 * predictability the portal is built on), and any Math.random in render
 * pathways is a hydration mismatch waiting to happen.
 */

export const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const WINDOW_SIZE = 4;
export const OPTION_COUNT = 3;

/**
 * The strip of consecutive letters shown in bubbles, with where the target
 * sits in it. The target rides at the END of its window (B C D ?, as in the
 * reference) so the child reads a run and supplies what comes next — except
 * at the alphabet's start, where the window slides right so there are always
 * four real letters (A's round is ? B C D: "what comes before?").
 */
export function sequenceWindow(letter: string): { letters: string[]; missingIndex: number } {
  const i = Math.max(0, ALPHA.indexOf(letter.toUpperCase()));
  const start = Math.min(Math.max(0, i - (WINDOW_SIZE - 1)), ALPHA.length - WINDOW_SIZE);
  return { letters: ALPHA.slice(start, start + WINDOW_SIZE), missingIndex: i - start };
}

/**
 * The three letters waiting on the sand: the answer and two others, in an
 * order that varies letter-to-letter but never between visits.
 *
 * Distractors are picked at fixed offsets from the target — far enough not
 * to be its neighbours every time, co-prime with 26 so all letters get used
 * across the alphabet. A distractor MAY be a letter already visible in the
 * strip (the reference does this too): the question is "which one is
 * MISSING", not "which of these is a letter", and a visible-letter decoy is
 * what makes that the question.
 */
export function optionsFor(letter: string): string[] {
  const i = Math.max(0, ALPHA.indexOf(letter.toUpperCase()));
  const opts = [ALPHA[i], ALPHA[(i + 5) % 26], ALPHA[(i + 17) % 26]];
  // rotate so the answer's position changes letter-to-letter (never random)
  const r = i % OPTION_COUNT;
  return [...opts.slice(r), ...opts.slice(0, r)];
}
