"use client";

import { useState } from "react";
import { ClassroomScene } from "@games/blend-read/components/ClassroomScene";
import { PhonicsQuestion } from "@games/blend-read/components/PhonicsQuestion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { Teacher } from "@games/door-count/components/Teacher";
import { playClickSound } from "@shared/audio/sfx";
import type { Question } from "@games/blend-read/constants/levels";

interface PlayScreenProps {
  question: Question;
  questionNumber: number;
  total: number;
  onBack: () => void;
  onCorrect: () => void;
}

/** State 4 — the puzzle screen every word reuses: the classroom (its board
 *  and desk hidden — see `ClassroomScene`'s `bare` prop — so nothing behind
 *  the word card and picture grid competes with them), the pinned Back pill,
 *  Key Quest's own teacher watching from the side, and the question engine
 *  itself. */
export function PlayScreen({
  question,
  questionNumber,
  total,
  onBack,
  onCorrect,
}: PlayScreenProps) {
  // Which question last solved itself — DERIVED into "is the teacher
  // celebrating right now" by comparing against the question on screen, so a
  // new word stops the celebration for free instead of needing its own
  // effect to reset a flag (the same trick Leo's Puzzles uses for its mood).
  const [solvedFor, setSolvedFor] = useState<string | null>(null);
  const cheer = solvedFor === question.id;

  return (
    <div className="br-screen pl-screen-shell">
      <ClassroomScene bare />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the level menu"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />

      <span className="br-progress font-rounded font-bold" aria-live="polite">
        {questionNumber} of {total}
      </span>

      {/* Rendered BEFORE the question column on purpose (see .br-teacher-slot):
          at his true life size he sits behind it, not beside it, on anything
          but a very wide screen — a decorative companion, not load-bearing. */}
      <div className="br-teacher-slot" aria-hidden="true">
        <Teacher cheer={cheer} />
      </div>

      <div className="br-play-column pl-screen-scroll pl-safe-center flex flex-col items-center px-4 py-6">
        <PhonicsQuestion
          key={question.id}
          question={question}
          onCorrect={onCorrect}
          onSolved={() => setSolvedFor(question.id)}
        />
      </div>
    </div>
  );
}
