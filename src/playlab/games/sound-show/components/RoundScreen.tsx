"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LitSign, ShowPicture, ShowStage } from "@games/phonics-show/components/ShowStage";
import { ROUNDS, TOTAL_ROUNDS, answerOf, askLines } from "@games/sound-show/constants/rounds";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useAfterVoice } from "@shared/hooks/useAfterVoice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { wordClip } from "@shared/audio/wordClips";
import { cheerFor } from "@shared/audio/cheers";
import { playClip, playSequence, stopVoice } from "@shared/audio/voice";
import { playClickSound, playCorrectSound, playIncorrectSound } from "@shared/audio/sfx";

/** The quiet beat before a round's first sound, and between its two sounds. */
const TEACH_DELAY_MS = 600;
const TEACH_GAP_MS = 700;
/** How long a toddler can sit without tapping before the hint and the ask again. */
const HINT_MS = 8000;

/** "teach": the letter alone, its sound said twice. "ask": the pictures are out. */
type Phase = "teach" | "ask";

interface RoundScreenProps {
  index: number;
  onSolved: (firstTap: boolean) => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/** 1…10, built once rather than on every render. */
const SLOTS = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i);

/**
 * ONE ROUND, slowly — paced for a toddler.
 *
 * TEACH: the lit sign shows one big letter and its sound is said twice, with
 * a pause, while the letter pulses ("sss… sss"). Nothing else is on the stage.
 * ASK: the pictures rise onto the stage and "Find something that starts with
 * sss!" is said; taps wait until the whole line has been heard, so a toddler
 * tapping early never skips the question.
 *
 * A RIGHT picture goes green with a tick and "s… sun!" is said with a cheer;
 * the next letter only comes once all of it has been heard. A WRONG picture
 * says its own name and dims — no red, no cross, this is for the youngest —
 * then "Try again!", and the right picture starts to glow. Left alone for a
 * while, the ask is said again and the right picture glows. Tapping the
 * letter says its sound again at any time.
 */
export function RoundScreen({ index, onSolved, onBack, onExitPortal }: RoundScreenProps) {
  const round = ROUNDS[index];
  const answer = answerOf(round);
  const sound = `phonics-${round.letter}`;
  // both are keyed to the round, so a new round starts in "teach" by itself
  const [askedFor, setAskedFor] = useState<number | null>(null);
  /** The round whose ask has been heard in full: taps count from here. */
  const [readyFor, setReadyFor] = useState<number | null>(null);
  const phase: Phase = askedFor === index ? "ask" : "teach";
  const ready = readyFor === index;
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrong, setWrong] = useState<readonly string[]>([]);
  const missed = useRef(false);
  const { thenAfter } = useAfterVoice();

  // a new letter: teach its sound, then bring the pictures out and ask
  useEffect(() => {
    const t = setTimeout(() => {
      thenAfter(
        [sound, sound],
        () => {
          setAskedFor(index);
          thenAfter(askLines(round), () => setReadyFor(index), 500);
        },
        TEACH_GAP_MS
      );
    }, TEACH_DELAY_MS);
    return () => clearTimeout(t);
  }, [index, round, sound, thenAfter]);

  // the right picture glows after a miss, or when a toddler sits still a while
  const idle = useIdleHand(ready && !chosen, `${index}-${wrong.length}`, HINT_MS);
  useEffect(() => {
    if (idle) void playSequence(askLines(round), 200);
  }, [idle, round]);
  const hint = !chosen && (idle || wrong.length > 0);

  const pick = useCallback(
    (picture: string) => {
      if (!ready || chosen || wrong.includes(picture)) return;
      const said = wordClip(picture);
      if (picture !== answer) {
        missed.current = true;
        setWrong((w) => [...w, picture]);
        playIncorrectSound();
        void playSequence([...(said ? [said] : []), "instr-try-again"], 250);
        return;
      }
      setChosen(picture);
      playCorrectSound();
      const firstTap = !missed.current;
      thenAfter(
        [sound, ...(said ? [said] : []), cheerFor(index + 3)],
        () => {
          setChosen(null);
          setWrong([]);
          missed.current = false;
          onSolved(firstTap);
        },
        450
      );
    },
    [ready, chosen, wrong, answer, sound, index, thenAfter, onSolved]
  );

  return (
    <div className="pgs-screen snd-screen">
      <ShowStage />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Sound Show home"
        tone="plum"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          stopVoice();
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

      <div className="pgs-topbar snd-topbar">
        <div
          className="pgs-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL_ROUNDS}
          aria-valuenow={index}
          aria-label={`${index} of ${TOTAL_ROUNDS} sounds done`}
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
          {index + 1} <span className="pgs-count-of">of {TOTAL_ROUNDS}</span>
        </span>
      </div>

      <div className="snd-board" key={index}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <LitSign className="snd-sign">
            <button
              type="button"
              className={`snd-letter font-rounded font-black ${
                phase === "teach" ? "snd-letter--teach" : ""
              }`}
              onClick={() => {
                playClickSound();
                void playClip(sound);
              }}
              aria-label={`Hear the sound of ${round.letter} again`}
            >
              {round.letter}
            </button>
          </LitSign>
        </motion.div>

        <AnimatePresence>
          {phase === "ask" && (
            <ul className={`snd-pictures snd-pictures--${round.pictures.length}`}>
              {round.pictures.map((picture, i) => (
                <motion.li
                  key={picture}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.18, type: "spring", stiffness: 200, damping: 18 }}
                >
                  <button
                    type="button"
                    className={`snd-card ${chosen === picture ? "snd-card--right" : ""} ${
                      wrong.includes(picture) ? "snd-card--wrong" : ""
                    } ${hint && picture === answer ? "snd-card--hint" : ""}`}
                    onClick={() => pick(picture)}
                    disabled={chosen !== null || wrong.includes(picture)}
                    aria-label={picture}
                  >
                    <ShowPicture word={picture} />
                    {chosen === picture && <span className="snd-tick" aria-hidden="true" />}
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
