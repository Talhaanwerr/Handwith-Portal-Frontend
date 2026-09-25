"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PictureCard } from "@games/blend-read/components/PictureCard";
import { answerIndex, type Question } from "@games/blend-read/constants/levels";
import { useScheduler } from "@shared/hooks/useScheduler";
import { playIncorrectSound, playCorrectSound } from "@shared/audio/sfx";
import { playClip, playSequence, sayAfter } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { cssVars } from "@shared/styles/cssVars";
import { Burst } from "@shared/components/game/Burst";

/** The celebration on a correct pick: a ring of small coloured shapes flung
 *  out from the middle of the grid — an actual burst of confetti shapes
 *  (star, dot, square, ribbon, triangle), not a generic paper-rain, cycled
 *  by `Burst` across as many pieces as `count` asks for. */
const CONFETTI_SHAPES = [
  <svg key="star" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 1 L14.7 8.8 L23 9.5 L16.5 14.9 L18.5 23 L12 18.3 L5.5 23 L7.5 14.9 L1 9.5 L9.3 8.8 Z"
      fill="#F6C544"
    />
  </svg>,
  <svg key="dot" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#E05A6E" />
  </svg>,
  <svg key="square" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="#5B8AD6" />
  </svg>,
  <svg key="ribbon" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="7" y="1" width="10" height="22" rx="4" fill="#5FAF3A" transform="rotate(18 12 12)" />
  </svg>,
  <svg key="triangle" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2 L22 20 L2 20 Z" fill="#B06AD6" />
  </svg>,
  <svg key="dot2" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#F0A32E" />
  </svg>,
] as const;

/** How long the check mark holds before the grid clears. */
const HOLD_MS = 900;
/** How long the grid takes to fade once it starts clearing. */
const CLEAR_MS = 450;
/** The question is read the moment it arrives. */
const ASK_AFTER_MS = 350;

interface PhonicsQuestionProps {
  question: Question;
  /** The celebration has finished holding: move to the next question. */
  onCorrect: () => void;
  /** Fires the instant the right picture is picked — before the hold/clear
   *  delay `onCorrect` waits out. The teacher standing beside the question
   *  uses this to time its jump to the actual tap, not to the later
   *  "advance to the next word" moment. */
  onSolved?: () => void;
}

/**
 * THE ENGINE — one word, its phoneme buttons, and eight picture cards.
 *
 * Mounted with `key={question.id}` by its caller, so a new question is a
 * fresh component instance: `wrong` and `solved` never need to be reset by
 * hand between questions (the same trick Letter Treats' ChallengeScreen uses
 * for its own rounds).
 *
 *   tap a phoneme  -> hear that one sound, nothing else changes
 *   tap the WRONG picture -> permanent red X on that card, question stays open
 *   tap the RIGHT picture -> permanent check, a short hold, the grid clears,
 *                            then the caller is told to advance
 *
 * A wrong pick never resets progress and never ends the question — there is
 * no "try again" screen, only the same grid with one more card crossed out.
 */
export function PhonicsQuestion({ question, onCorrect, onSolved }: PhonicsQuestionProps) {
  const [wrong, setWrong] = useState<ReadonlySet<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const [clearing, setClearing] = useState(false);
  const schedule = useScheduler();
  const answer = useMemo(() => answerIndex(question), [question]);

  useEffect(() => {
    const t = setTimeout(() => void sayAfter(`blend-word-${question.id}`), ASK_AFTER_MS);
    return () => clearTimeout(t);
  }, [question]);

  const playSound = useCallback(
    (i: number) => {
      void playClip(`blend-sound-${question.id}-${i}`);
    },
    [question.id]
  );

  // Tapping the word is the teaching moment, not just a repeat: it plays the
  // BLEND first — every sound stretched out and run together, "hhhhh...
  // aaaaa... t-t-t... hhhaaatt" — and only then the clean word, so the child
  // hears exactly how the sounds they can tap below combine into it.
  const sayWord = useCallback(() => {
    void playSequence([`blend-merge-${question.id}`, `blend-word-${question.id}`], 300);
  }, [question.id]);

  const pick = useCallback(
    (i: number) => {
      if (solved || wrong.has(i)) return;
      if (i !== answer) {
        playIncorrectSound();
        setWrong((prev) => new Set(prev).add(i));
        return;
      }
      setSolved(true);
      playCorrectSound();
      onSolved?.();
      void playClip(cheerFor(question.id));
      schedule(() => setClearing(true), HOLD_MS);
      schedule(() => onCorrect(), HOLD_MS + CLEAR_MS);
    },
    [solved, wrong, answer, question.id, schedule, onCorrect, onSolved]
  );

  return (
    <div className="br-question">
      <div className="br-word-row">
        <button
          type="button"
          className="br-word-card font-rounded font-black"
          onClick={sayWord}
          aria-label={`Hear the word ${question.word}`}
        >
          {question.word}
        </button>

        {/* the decorative progress dots beside the word card — see Blending to
            Read's own notes: nice to look at, never load-bearing */}
        <span className="br-dots" aria-hidden="true">
          {question.phonemes.map((_, i) => (
            <span key={i} className="br-dot" style={cssVars({ "--br-i": i })} />
          ))}
        </span>
      </div>

      <div className="br-phoneme-row" role="group" aria-label="Sound out the word">
        {question.phonemes.map((unit, i) => (
          <button
            key={i}
            type="button"
            className="br-phoneme"
            onClick={() => playSound(i)}
            aria-label={`Hear the ${unit} sound`}
          >
            <span className="br-phoneme-letters font-rounded font-black">{unit}</span>
            <span className={unit.length > 1 ? "br-phoneme-bar" : "br-phoneme-dot"} />
          </button>
        ))}
      </div>

      <div className="br-grid-wrap">
        <AnimatePresence>
          {!clearing && (
            <motion.div
              className="br-grid"
              data-n={question.options.length}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: CLEAR_MS / 1000 }}
            >
              {question.options.map((picture, i) => (
                <PictureCard
                  key={i}
                  picture={picture}
                  state={solved && i === answer ? "correct" : wrong.has(i) ? "wrong" : "idle"}
                  disabled={solved || wrong.has(i)}
                  onPick={() => pick(i)}
                  label={`Picture ${i + 1}`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {solved && (
          <Burst
            pieces={CONFETTI_SHAPES}
            count={30}
            reach={[20, 52]}
            gravity
            size="clamp(14px, 3.4vmin, 26px)"
          />
        )}
      </div>
    </div>
  );
}
