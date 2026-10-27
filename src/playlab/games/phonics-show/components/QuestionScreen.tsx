"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LitSign, ShowPicture, ShowStage } from "@games/phonics-show/components/ShowStage";
import { QUESTIONS, TOTAL_QUESTIONS, answerOf } from "@games/phonics-show/constants/questions";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useAfterVoice } from "@shared/hooks/useAfterVoice";
import { wordClip } from "@shared/audio/wordClips";
import { cheerFor } from "@shared/audio/cheers";
import { playClip, playSequence, sayAfter } from "@shared/audio/voice";
import { playClickSound, playCorrectSound, playIncorrectSound } from "@shared/audio/sfx";

/** How long a question can sit unanswered before the ask is said again. */
const NUDGE_MS = 8000;

interface QuestionScreenProps {
  index: number;
  onSolved: (firstTap: boolean) => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/** 1…15, built once rather than on every render. */
const SLOTS = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i);

/**
 * ONE QUESTION — the picture on the lit sign, three letters on the stage.
 *
 * The picture arrives with the ask — "Sun. Can you click the starting
 * sound of sun?" — and tapping the picture says the word again. A RIGHT
 * letter goes green, a big tick lands on the sign and the
 * letter's sound and the word are said ("s… sun!") with a cheer; the next
 * picture waits until all of that has been heard. A WRONG letter says its
 * own sound, turns red, shakes and is crossed out, then "Try again!" — the
 * child hears why it was wrong and picks again; a crossed-out letter can't
 * be picked twice. Only a right FIRST tap counts towards the stars.
 */
export function QuestionScreen({ index, onSolved, onBack, onExitPortal }: QuestionScreenProps) {
  const question = QUESTIONS[index];
  const answer = answerOf(question);
  const said = wordClip(question.word);
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrong, setWrong] = useState<readonly string[]>([]);
  const missed = useRef(false);
  const { thenAfter } = useAfterVoice();

  // the picture arrives with the ask: "Sun. Can you click the starting sound
  // of sun?" — the word, the line, the word again. Never the sound itself at
  // the end: that would say the answer before the child has found it.
  useEffect(() => {
    const word = said ? [said] : [];
    const lines = [...word, "instr-click-starting-sound", ...word];
    const t = setTimeout(() => void playSequence(lines, 250), 350);
    return () => clearTimeout(t);
  }, [index, said]);

  // a child still looking at the picture after a while gets the ask again
  useEffect(() => {
    if (chosen) return;
    const nudge = setTimeout(() => {
      void sayAfter("instr-click-starting-sound");
      if (said) void sayAfter(said);
    }, NUDGE_MS);
    return () => clearTimeout(nudge);
  }, [index, chosen, wrong, said]);

  const pick = useCallback(
    (letter: string) => {
      if (chosen || wrong.includes(letter)) return; // turning over, or already tried
      if (letter !== answer) {
        missed.current = true;
        setWrong((w) => [...w, letter]);
        playIncorrectSound();
        void playSequence([`phonics-${letter}`, "instr-try-again"], 200);
        return;
      }
      setChosen(letter);
      playCorrectSound();
      const firstTap = !missed.current;
      thenAfter([`phonics-${letter}`, ...(said ? [said] : []), cheerFor(index + 7)], () => {
        setChosen(null);
        setWrong([]);
        missed.current = false;
        onSolved(firstTap);
      });
    },
    [chosen, wrong, answer, said, index, thenAfter, onSolved]
  );

  return (
    <div className="pgs-screen">
      <ShowStage />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Phonics Game Show home"
        tone="plum"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />

      <button
        type="button"
        className="pgs-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>

      {/* the progress row sits UNDER the two pinned pills, never beside them */}
      <div className="pgs-topbar">
        <div
          className="pgs-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL_QUESTIONS}
          aria-valuenow={index}
          aria-label={`${index} of ${TOTAL_QUESTIONS} questions done`}
        >
          {SLOTS.map((slot) => (
            <span
              key={slot}
              className={`pgs-progress-seg ${slot < index ? "pgs-progress-seg--done" : ""} ${
                slot === index ? "pgs-progress-seg--now" : ""
              }`}
            />
          ))}
        </div>
        <span className="pgs-count font-rounded font-black">
          {index + 1} <span className="pgs-count-of">of {TOTAL_QUESTIONS}</span>
        </span>
      </div>

      <motion.div
        className="pgs-board"
        key={index}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
      >
        <LitSign className="pgs-sign--question">
          <button
            type="button"
            className="pgs-picture"
            onClick={() => {
              playClickSound();
              if (said) void playClip(said);
            }}
            aria-label={`Hear the word ${question.word} again`}
          >
            <ShowPicture word={question.word} />
          </button>
          <AnimatePresence>
            {chosen && (
              <motion.span
                className="pgs-tick"
                aria-hidden="true"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
              />
            )}
          </AnimatePresence>
        </LitSign>

        <ul className="pgs-options">
          {question.options.map((letter) => (
            <li key={letter}>
              <button
                type="button"
                className={`pgs-option font-rounded font-black ${
                  chosen === letter ? "pgs-option--chosen" : ""
                } ${wrong.includes(letter) ? "pgs-option--wrong" : ""}`}
                onClick={() => pick(letter)}
                disabled={chosen !== null || wrong.includes(letter)}
                aria-label={wrong.includes(letter) ? `${letter}, not this one` : letter}
              >
                {letter}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
