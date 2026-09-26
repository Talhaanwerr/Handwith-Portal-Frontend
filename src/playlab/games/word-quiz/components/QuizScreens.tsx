"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { QuizPicture } from "@games/word-quiz/components/QuizArt";
import { IceScene } from "@games/word-quiz/components/IceScene";
import { ScoreDonut } from "@games/word-quiz/components/ScoreDonut";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  isCorrect,
  type Answer,
} from "@games/word-quiz/constants/questions";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { Confetti } from "@shared/components/game/Confetti";
import { cheerFor } from "@shared/audio/cheers";
import { sayAfter } from "@shared/audio/voice";
import { playClickSound, playFanfare } from "@shared/audio/sfx";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";

/* ── The way in ──────────────────────────────────────────────────────────── */

/** Three of the ten, on snow tiles — the game in one glance. */
const SHOWCASE = ["penguin", "bus", "sun"] as const;

export function SplashScreen({
  best,
  onStart,
  onExitPortal,
}: {
  best: number;
  onStart: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-tap-play"]);
  return (
    <div className="wq-splash">
      {/* the full ice: igloo, pine, penguin and bear, with snow falling */}
      <IceScene crowd />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="arctic"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <motion.div
        className="wq-splash-head"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <h1 className="wq-title font-rounded font-black">Snow Words</h1>
        <p className="wq-subtitle font-rounded font-bold">Tap the word that names the picture</p>
      </motion.div>

      <div className="wq-splash-row">
        {SHOWCASE.map((word, i) => (
          <motion.div
            className="wq-splash-card"
            key={word}
            initial={{ y: 26, opacity: 0, rotate: i === 1 ? 0 : i === 0 ? -4 : 4 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.09, type: "spring", stiffness: 230, damping: 17 }}
          >
            <span className="wq-splash-pic">
              <QuizPicture word={word} />
            </span>
            <span className="wq-splash-word font-rounded font-black">{word}</span>
          </motion.div>
        ))}
      </div>

      {best > 0 && (
        <p className="wq-best font-rounded font-black">
          Best so far: {best} / {TOTAL_QUESTIONS}
        </p>
      )}

      <motion.button
        type="button"
        className="wq-play font-rounded font-black"
        onClick={() => {
          playClickSound();
          onStart();
        }}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.34, type: "spring", stiffness: 240, damping: 17 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Play Snow Words"
      >
        <span className="wq-play-glyph" aria-hidden="true">
          ▶
        </span>
        Play
      </motion.button>
    </div>
  );
}

/* ── The review ──────────────────────────────────────────────────────────── */

interface ReviewProps {
  answers: readonly Answer[];
  score: number;
  onAgain: () => void;
  onExitPortal: () => void;
}

/**
 * YOUR ANSWERS — every question again, with what the child chose, beside a
 * score panel that stays put while the list scrolls.
 *
 * The verdict lives here and nowhere else: during play nothing is marked, so
 * this is the first time a child sees which ones they got. A wrong answer is
 * shown BESIDE the right word rather than merely crossed out, because reading
 * the pair is the lesson.
 */
export function ReviewScreen({ answers, score, onAgain, onExitPortal }: ReviewProps) {
  useEffect(() => {
    playFanfare();
    void sayAfter("instr-snow-review");
    void sayAfter(cheerFor(score));
  }, [score]);

  return (
    <div className="wq-review">
      <IceScene />
      <Confetti count={44} />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="arctic"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <div className="wq-review-grid">
        <section className="wq-answers" aria-label="Your answers">
          <h2 className="wq-answers-title font-rounded font-black">Your answers</h2>

          <ul className="wq-answer-list">
            {answers.map((answer) => {
              const question = QUESTIONS[answer.question];
              const right = isCorrect(answer);
              return (
                <li
                  className={`wq-answer ${right ? "wq-answer--right" : "wq-answer--wrong"}`}
                  key={answer.question}
                >
                  <span className="wq-answer-num font-rounded font-black">
                    {answer.question + 1}
                  </span>
                  <span className="wq-answer-pic">
                    <QuizPicture word={question.word} />
                  </span>
                  <span className="wq-answer-words">
                    <span className="wq-answer-chosen font-rounded font-black">
                      {answer.chosen}
                    </span>
                    {!right && (
                      <span className="wq-answer-right font-rounded font-bold">
                        {question.word}
                      </span>
                    )}
                  </span>
                  <span className="wq-answer-mark" aria-label={right ? "correct" : "not correct"} />
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="wq-score" aria-label="Total score">
          <h2 className="wq-score-title font-rounded font-black">Total Score</h2>
          <ScoreDonut score={score} total={TOTAL_QUESTIONS} />
          <button
            type="button"
            className="wq-again font-rounded font-black"
            onClick={() => {
              playClickSound();
              onAgain();
            }}
          >
            <span className="wq-play-glyph" aria-hidden="true">
              ▶
            </span>
            Play Again
          </button>
        </aside>
      </div>
    </div>
  );
}
