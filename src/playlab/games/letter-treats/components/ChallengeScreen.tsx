"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playClip, playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import { playClickSound, playCorrectSound } from "@shared/audio/sfx";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { letterData, letterPair, TREAT_LETTERS } from "@games/letter-treats/constants/alphabet";
import { buildChallenge, ROUNDS_PER_LETTER } from "@games/letter-treats/constants/challenge";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { TreatArt } from "@games/letter-treats/components/TreatArt";
import { Sparkle, CANDY } from "@games/letter-treats/components/candy-world/CandyArt";

/** Pause after a correct pick before the next question - long enough for the
 *  sparkle and "Great job!" to land, short enough that a 3-year-old stays. */
const NEXT_ROUND_MS = 1500;
/** One praise line, one retry line, one finish line - all recorded clips.
 *  Nothing else talks on this screen. */
const PRAISE_CLIP = "cheer-great-job";
const RETRY_CLIP = "instr-try-again";
const DONE_CLIP = "cheer-you-did-it";
const SPARKLE_COLOURS = [
  CANDY.white,
  CANDY.vanilla,
  CANDY.pinkLight,
  CANDY.cyan,
  CANDY.white,
  CANDY.lavenderLight,
];

interface ChallengeScreenProps {
  letter: string;
  onBack: () => void;
  onNextLetter: (letter: string) => void;
  onLetters: () => void;
}

/**
 * THE CHALLENGE - apply what was just learned.
 *
 *   "Can you find A?"                      (round 1, the letter's name)
 *   "Find something that starts with ah!"  (round 2, the letter's sound)
 *
 * In the sound round the chip switches from "Aa" to the sound spelling with a
 * small "Aa" under it and pulses once - a visual cue that the question changed
 * and what to listen for, without hinting at which picture is right.
 *
 * Four big pictures on the calm backdrop; the child taps one.
 *   right -> bounce + glow + sparkle, one chime, "Great job!", next round
 *   wrong -> gentle shake, "Try again!", nothing lost, tap again
 * After both rounds: "You did it!" and two obvious ways on - the next letter,
 * or back to the alphabet. No score, no stars, no timer, no other narration.
 *
 * Mounted with key={letter}: a new letter builds a new challenge from scratch.
 */
export function ChallengeScreen({ letter, onBack, onNextLetter, onLetters }: ChallengeScreenProps) {
  const data = letterData(letter);
  const rounds = useMemo(() => buildChallenge(letter), [letter]);
  const [rootRef, size] = useElementSize<HTMLDivElement>();

  const [roundIndex, setRoundIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [beeMood, setBeeMood] = useState<"idle" | "cheer" | "point">("point");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const round = rounds[roundIndex];
  const nextLetter = TREAT_LETTERS[(TREAT_LETTERS.indexOf(data.letter) + 1) % TREAT_LETTERS.length];

  // Ask the question the moment a round is on screen; warm everything it needs.
  useEffect(() => {
    if (!round) return;
    preloadClips([...round.promptClips, PRAISE_CLIP, RETRY_CLIP, DONE_CLIP]);
    void playSequence(round.promptClips, 150);
    return () => stopVoice();
  }, [round]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, []);

  /** Bee repeats the question on demand - the letter screen's "tap to hear". */
  const repeatPrompt = () => {
    if (!round || solved) return;
    void playSequence(round.promptClips, 150);
  };

  // plain functions: the React Compiler memoizes these itself
  const pick = (id: string) => {
    if (!round || solved) return;
    if (id === round.target.id) {
      setSolved(true);
      setBeeMood("cheer");
      playCorrectSound();
      void playClip(PRAISE_CLIP);
      later(() => {
        if (roundIndex + 1 >= ROUNDS_PER_LETTER) {
          setDone(true);
          void playClip(DONE_CLIP);
        } else {
          setSolved(false);
          setBeeMood("point");
          setRoundIndex((i) => i + 1);
        }
      }, NEXT_ROUND_MS);
    } else {
      setShakeId(id);
      later(() => setShakeId(null), 450);
      void playClip(RETRY_CLIP);
    }
  };

  return (
    <div ref={rootRef} className="lt-screen lt-wash relative h-full w-full overflow-hidden">
      <CandyScene variant="calm" />

      <NavPillButton
        label="Back"
        ariaLabel={`Back to the letter ${data.letter}`}
        tone="plum"
        pinned
        onClick={() => {
          playClickSound();
          stopVoice();
          onBack();
        }}
      />

      {/* the question: Bee + a small target letter the child can tap to hear again */}
      <div className="ab-ch-top absolute z-10 flex items-center justify-center">
        <motion.button
          onClick={repeatPrompt}
          className="ab-ch-letter font-rounded flex items-center justify-center font-black"
          whileTap={{ scale: 0.92 }}
          key={round?.kind}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.12, 1], opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Hear the question again"
        >
          {round?.kind === "sound" ? (
            <span className="ab-ch-letter-sound">
              <span>{data.sound}</span>
              <small>{letterPair(data)}</small>
            </span>
          ) : (
            letterPair(data)
          )}
        </motion.button>
        <div
          className="ab-ch-dots flex"
          aria-label={`Question ${roundIndex + 1} of ${ROUNDS_PER_LETTER}`}
        >
          {rounds.map((r, i) => (
            <span
              key={r.kind}
              className={`ab-ch-dot ${i < roundIndex || (i === roundIndex && solved) ? "is-done" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* the four choices, standing on the meadow */}
      <div className="ab-ch-row absolute z-10" key={roundIndex}>
        {round?.choices.map((w, i) => {
          const isTarget = w.id === round.target.id;
          const isWin = solved && isTarget;
          const isShake = shakeId === w.id;
          return (
            <motion.button
              key={w.id}
              onClick={() => pick(w.id)}
              className={`ab-choice ab-choice-${i + 1} flex flex-col items-center justify-center ${isWin ? "is-win" : ""} ${
                solved && !isTarget ? "is-dim" : ""
              }`}
              initial={{ scale: 0, opacity: 0, y: 30 }}
              animate={
                isWin
                  ? { scale: [1, 1.18, 1.08], opacity: 1, y: [0, -18, 0] }
                  : isShake
                    ? { x: [0, -10, 10, -7, 7, 0], scale: 1, opacity: 1, y: 0 }
                    : { scale: 1, opacity: 1, y: 0, x: 0 }
              }
              transition={
                isShake
                  ? { duration: 0.42 }
                  : { duration: 0.45, delay: isWin ? 0 : 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }
              }
              whileTap={solved ? undefined : { scale: 0.92 }}
              aria-label={w.label}
              disabled={solved}
            >
              <span className={`ab-object-plate ab-choice-plate ${isWin ? "is-active" : ""}`}>
                <span className="ab-object-art">
                  <TreatArt word={w.id} label={w.label} />
                </span>
                {isWin && (
                  <span className="ab-burst" aria-hidden="true">
                    {SPARKLE_COLOURS.map((c, k) => (
                      <motion.span
                        key={k}
                        className={`ab-burst-spark ab-burst-spark-${k + 1}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.2, 0.9, 0], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.2, delay: k * 0.06, ease: "easeOut" }}
                      >
                        <Sparkle color={c} />
                      </motion.span>
                    ))}
                  </span>
                )}
              </span>
              <span className="ab-object-label font-rounded font-black">{w.label}</span>
            </motion.button>
          );
        })}
      </div>

      <Bee mood={beeMood} className="lt-bee-learn absolute z-10" />

      <AnimatePresence>
        {done && (
          <CelebrationOverlay tintClassName="lt-celebrate-tint" size={size} gapClassName="gap-4">
            <Bee mood="cheer" className="lt-bee-big" />
            <h2 className="lt-done-headline font-rounded text-center font-black">
              You found {data.letter}!
            </h2>
            <div className="ab-done-actions flex flex-wrap items-center justify-center">
              <motion.button
                onClick={() => {
                  playClickSound();
                  stopVoice();
                  onNextLetter(nextLetter);
                }}
                className="lt-primary font-rounded font-black"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                aria-label={`Next letter, ${nextLetter}`}
              >
                Next letter · {nextLetter}
              </motion.button>
              <button
                onClick={() => {
                  playClickSound();
                  stopVoice();
                  onLetters();
                }}
                className="lt-secondary font-rounded font-black"
                aria-label="Back to the alphabet"
              >
                Letters
              </button>
            </div>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
