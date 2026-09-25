"use client";

import { TOTAL_QUESTIONS } from "@games/word-quiz/constants/questions";

/**
 * The segmented progress strip.
 *
 * Deliberately NOT the shared `ProgressBar`: that fills one continuous track,
 * and this is ten separate blocks that go green one at a time. For a child
 * counting how many are left, ten lit blocks answer the question and a bar at
 * 70% does not.
 */
export function QuizProgress({ done }: { done: number }) {
  return (
    <div
      className="wq-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={TOTAL_QUESTIONS}
      aria-valuenow={done}
      aria-label={`${done} of ${TOTAL_QUESTIONS} questions answered`}
    >
      {QUESTION_SLOTS.map((slot) => (
        <span
          key={slot}
          className={`wq-progress-seg ${slot <= done ? "wq-progress-seg--done" : ""}`}
        />
      ))}
    </div>
  );
}

/** 1…10, built once rather than on every render. */
const QUESTION_SLOTS = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1);
