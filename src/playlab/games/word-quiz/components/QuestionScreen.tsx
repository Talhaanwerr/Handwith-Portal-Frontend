"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QuizPicture } from "@games/word-quiz/components/QuizArt";
import { IceScene } from "@games/word-quiz/components/IceScene";
import { QuizProgress } from "@games/word-quiz/components/QuizProgress";
import { QUESTIONS, TOTAL_QUESTIONS } from "@games/word-quiz/constants/questions";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { wordClip } from "@shared/audio/wordClips";
import { playClip, sayAfter } from "@shared/audio/voice";
import { playClickSound, playPlaceSound } from "@shared/audio/sfx";

/** How long the chosen tile stays lit before the next question slides in —
 *  long enough to see which one was pressed, short enough not to be a wait. */
const ADVANCE_MS = 620;
/** How long a question can sit unanswered before the ask is said again. */
const NUDGE_MS = 8000;

interface QuestionScreenProps {
  index: number;
  onAnswer: (word: string) => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/**
 * ONE QUESTION — the picture on one side, three words on the other.
 *
 * Tapping a word IS the answer: it lights up, says itself, and the next
 * question arrives. There is no Check button and no second step, because for
 * a three-year-old a confirm press is a second puzzle stacked on top of the
 * reading one, and the reading is the thing being taught.
 *
 * Nothing is marked right or wrong here. No tick, no buzzer, no red — the
 * whole verdict waits for the review at the end, which is what lets a child
 * who got one wrong carry on without stopping.
 */
export function QuestionScreen({ index, onAnswer, onBack, onExitPortal }: QuestionScreenProps) {
  const question = QUESTIONS[index];
  /** The tile just pressed, lit while the question turns over. */
  const [chosen, setChosen] = useState<string | null>(null);
  const schedule = useScheduler();
  useSayOnEnter(index === 0 ? ["instr-snow-tap-word"] : []);

  // a child still looking at the picture after a while gets the ask again
  useEffect(() => {
    if (chosen) return;
    const nudge = setTimeout(() => void sayAfter("instr-click-the-word"), NUDGE_MS);
    return () => clearTimeout(nudge);
  }, [index, chosen]);

  const answer = useCallback(
    (word: string) => {
      if (chosen) return; // this question is already on its way out
      setChosen(word);
      playPlaceSound();
      // say the word they picked, when the portal has a recording of it
      const said = wordClip(word);
      if (said) void playClip(said);
      schedule(() => {
        setChosen(null);
        onAnswer(word);
      }, ADVANCE_MS);
    },
    [chosen, schedule, onAnswer]
  );

  return (
    <div className="wq-screen">
      <IceScene />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Snow Words home"
        tone="arctic"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />

      <button
        type="button"
        className="wq-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>

      {/* the bar sits in its own row UNDER the two pinned pills, never beside
          them — at phone widths it used to run straight through both */}
      <div className="wq-topbar">
        <QuizProgress done={index} />
        <span className="wq-count font-rounded font-black">
          {index + 1} / {TOTAL_QUESTIONS}
        </span>
      </div>

      <motion.div
        className="wq-card"
        key={index}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <h1 className="wq-instruction font-rounded font-black">Which word is the picture?</h1>

        <div className="wq-body">
          <div className="wq-picture">
            <QuizPicture word={question.word} />
          </div>

          <ul className="wq-options">
            {question.options.map((word) => (
              <li key={word}>
                <button
                  type="button"
                  className={`wq-option font-rounded font-black ${
                    chosen === word ? "wq-option--chosen" : ""
                  }`}
                  onClick={() => answer(word)}
                  disabled={chosen !== null}
                >
                  <span className="wq-option-word">{word}</span>
                  <span className="wq-option-tick" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
