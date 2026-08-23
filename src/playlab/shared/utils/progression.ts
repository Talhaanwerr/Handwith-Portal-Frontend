/**
 * progression.ts — what "Start from A" and "Continue" actually mean.
 *
 * THE BUG THIS EXISTS TO KILL
 * ---------------------------
 * Every alphabet game used to recompute "what comes next" from the PERSISTED
 * completion list at the moment of advancing:
 *
 *     const next = order.find((i) => !completed.includes(LETTERS[i]));
 *
 * That single line is why "Start from A" skipped letters. Choosing Start from A
 * set the index to 0, but the very first advance jumped straight past every
 * letter the child had ever completed — so a child who had done A, B, C got
 * A and then D. Letter Tracing only looked correct because it wiped saved
 * progress on Start from A, which is destructive rather than right.
 *
 * The missing concept was a RUN: a play session has its own ordered list of
 * letters, decided once when the child presses a start button, and advancing
 * walks that list. Persisted completion decides what goes INTO the list; it
 * never gets consulted again mid-run.
 *
 *     Start from X  →  every letter from X onward, completion IGNORED
 *     Continue      →  only letters not yet completed, from X onward
 *
 * Start from X is non-destructive: the child's saved progress is left exactly
 * as it was, so replaying the alphabet never costs them their 26/26 record.
 */

/** A play session's letter queue, fixed at the moment the child starts. */
export interface LetterRun {
  /** The letters this run will present, in order. */
  queue: string[];
  /** How far through `queue` the child is (index into it). */
  index: number;
}

export type RunIntent = "fresh" | "continue";

/**
 * Build a run.
 *
 * @param all        every letter this module can present, in canonical order
 * @param startAt    letter (or index) the run begins at
 * @param completed  canonical letters already finished — consulted ONCE, here
 * @param intent     "fresh" = Start from X · "continue" = Continue
 */
export function buildRun(
  all: readonly string[],
  startAt: string | number,
  completed: readonly string[],
  intent: RunIntent
): LetterRun {
  const startIndex = typeof startAt === "number" ? startAt : Math.max(0, all.indexOf(startAt));
  const tail = all.slice(Math.max(0, startIndex));

  // "fresh" keeps EVERY letter from the start point — that is the whole point
  // of Start from A. "continue" is the only mode that honours completion.
  const queue = intent === "fresh" ? [...tail] : tail.filter((l) => !completed.includes(l));

  // A Continue with nothing left to do would otherwise hand back an empty
  // queue and strand the caller; fall back to the full tail so the child
  // always gets something to play rather than a dead screen.
  return { queue: queue.length > 0 ? queue : [...tail], index: 0 };
}

/**
 * THE letter a Continue will actually start at — the single source of truth.
 *
 * This exists because the UI and the gameplay were each computing it their own
 * way and disagreeing. Letter Hunt's button read the PERSISTED "last position"
 * (`LETTERS[currentIndex]`) while the run it started was built from the
 * COMPLETION list, so a child who had last opened F but only finished A saw
 * "Continue - F" and was then dropped into B. Two answers to one question.
 *
 * Anything that needs to name the continue letter must call this, so the label
 * and the run are the same calculation by construction rather than by
 * coincidence. It is deliberately defined as "the head of the continue run" —
 * if the run rules ever change, the label follows automatically.
 */
export function continueLetter(all: readonly string[], completed: readonly string[]): string {
  return buildRun(all, 0, completed, "continue").queue[0] ?? all[0];
}

/** The letter currently being played, or null once the run is exhausted. */
export function currentLetter(run: LetterRun | null): string | null {
  if (!run) return null;
  return run.queue[run.index] ?? null;
}

/** Advance one step. Returns the same run object shape with index moved on;
 *  `isDone` tells the caller to show the finale instead of another round. */
export function advanceRun(run: LetterRun): { run: LetterRun; isDone: boolean } {
  const index = run.index + 1;
  return { run: { ...run, index }, isDone: index >= run.queue.length };
}

/**
 * Jump a run to a specific letter — the child tapping a tile on the shelf.
 *
 * If the letter is already somewhere in the queue we simply move to it, which
 * preserves the rest of the run. If it is not (a Continue run, and the child
 * picked something they had already completed) the letter is spliced in at the
 * current position, so tapping a finished letter replays it and then carries
 * on exactly where the run was — rather than silently doing nothing.
 */
export function jumpRunTo(run: LetterRun, letter: string): LetterRun {
  const at = run.queue.indexOf(letter);
  if (at >= 0) return { ...run, index: at };
  const queue = [...run.queue];
  queue.splice(run.index, 0, letter);
  return { queue, index: run.index };
}
