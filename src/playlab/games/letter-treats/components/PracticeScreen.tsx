"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { playClip, playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import { playClickSound, playCorrectSound, playIncorrectSound } from "@shared/audio/sfx";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import {
  TREAT_ALPHABET,
  letterData,
  type TreatWord,
} from "@games/letter-treats/constants/alphabet";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { TreatArt } from "@games/letter-treats/components/TreatArt";
import { useTreatsStore } from "@games/letter-treats/store/treatsStore";
import { useElementSize } from "@shared/hooks/useElementSize";

/** Questions per letter. Three is enough to show the child knows it without
 *  outlasting a 3-year-old's patience. */
const ROUNDS = 3;
const CHOICES = 4;

function shuffle<T>(a: readonly T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Question {
  answer: TreatWord;
  options: TreatWord[];
}

/**
 * SOUND PRACTICE - "Which picture starts with A?"
 *
 * Difficulty rises across the three rounds by where the distractors come from,
 * which is the simplest progression that actually gets harder:
 *   round 1  distractors from letters far away in the alphabet
 *   round 2  distractors from any other letter
 *   round 3  distractors from neighbouring letters (more similar sounds)
 *
 * Only words flagged `initial` can be the answer, so X asks about xylophone
 * and x-ray, never fox or box - those contain /ks/ but do not start with it.
 */
function buildQuestions(letter: string): Question[] {
  const data = letterData(letter);
  const answers = shuffle(data.vocabulary.filter((v) => v.initial));
  const others = TREAT_ALPHABET.filter((l) => l.letter !== data.letter);
  const idx = TREAT_ALPHABET.findIndex((l) => l.letter === data.letter);

  return Array.from({ length: ROUNDS }, (_, round) => {
    const pool =
      round === 0
        ? others.filter((l) => Math.abs(TREAT_ALPHABET.indexOf(l) - idx) > 6)
        : round === 1
          ? others
          : others.filter((l) => Math.abs(TREAT_ALPHABET.indexOf(l) - idx) <= 4);

    const source = pool.length >= CHOICES ? pool : others;
    const distractors = shuffle(source)
      .slice(0, CHOICES - 1)
      .map((l) => shuffle(l.vocabulary)[0]);

    const answer = answers[round % Math.max(1, answers.length)] ?? data.vocabulary[0];
    return { answer, options: shuffle([answer, ...distractors]) };
  });
}

export function PracticeScreen() {
  const { currentLetter, setScreen, markDone, advance } = useTreatsStore();
  const data = letterData(currentLetter);
  const lower = data.letter.toLowerCase();

  const questions = useMemo(() => buildQuestions(currentLetter), [currentLetter]);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wonId, setWonId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const q = questions[Math.min(round, questions.length - 1)];
  // CelebrationOverlay sizes its confetti canvas from the real element box.
  const [rootRef, size] = useElementSize<HTMLDivElement>();

  // Ask the question as soon as the round changes - no entrance delay.
  useEffect(() => {
    if (celebrating) return;
    preloadClips([`treat-which-${lower}`, ...q.options.map((o) => `treat-word-${o.id}`)]);
    let cancelled = false;
    void playClip(`treat-which-${lower}`);
    return () => {
      cancelled = true;
      void cancelled;
      stopVoice();
    };
  }, [round, lower, q.options, celebrating]);

  const choose = useCallback(
    (w: TreatWord) => {
      if (wonId || celebrating) return;

      if (w.id !== q.answer.id) {
        // Gentle: shake, "try again", and the right answer stays available.
        playIncorrectSound();
        setWrongId(w.id);
        setTimeout(() => setWrongId(null), 520);
        void playClip("instr-try-again");
        return;
      }

      playCorrectSound();
      setWonId(w.id);
      const done = correct + 1;
      setCorrect(done);
      void playSequence([`treat-word-${w.id}`, "cheer-great-job"], 150).then(() => {
        if (done >= ROUNDS) {
          markDone(data.letter);
          setCelebrating(true);
          return;
        }
        setWonId(null);
        setRound((r) => r + 1);
      });
    },
    [q.answer.id, wonId, celebrating, correct, markDone, data.letter]
  );

  const nextLetter = useCallback(() => {
    playClickSound();
    stopVoice();
    // Walk the RUN, never the completed list - a fresh "Start from A" run
    // deliberately contains letters already finished.
    if (advance()) setScreen("learn");
    else setScreen("complete");
  }, [advance, setScreen]);

  return (
    <div
      ref={rootRef}
      className="lt-screen lt-wash relative flex h-full w-full flex-col items-center px-4 py-3"
    >
      <CandyScene />

      <div className="relative z-10 flex w-full max-w-4xl items-center justify-between">
        <NavPillButton
          label="Back"
          ariaLabel="Back to the letter"
          tone="plum"
          onClick={() => {
            playClickSound();
            stopVoice();
            setScreen("learn");
          }}
        />
        <StarRow earned={correct} total={ROUNDS} />
      </div>

      <p className="lt-question font-rounded relative z-10 mt-3 text-center font-black">
        Which one starts with <span className="lt-sound">{data.letter}</span>?
      </p>

      <div className="lt-choice-grid relative z-10 mt-auto mb-auto grid w-full max-w-4xl">
        {q.options.map((o) => (
          <motion.button
            key={o.id}
            onClick={() => choose(o)}
            className={`lt-choice flex flex-col items-center ${wonId === o.id ? "is-right" : ""}`}
            whileTap={{ scale: 0.94 }}
            animate={
              wrongId === o.id
                ? { x: [0, -10, 10, -6, 6, 0] }
                : wonId === o.id
                  ? { scale: [1, 1.14, 1] }
                  : { x: 0, scale: 1 }
            }
            transition={{ duration: 0.45 }}
            aria-label={o.label}
          >
            <span className="lt-choice-art">
              <TreatArt word={o.id} label={o.label} />
            </span>
            <span className="lt-word-label font-rounded font-black">{o.label}</span>
          </motion.button>
        ))}
      </div>

      <Bee mood={wonId ? "cheer" : "idle"} className="lt-bee-corner absolute z-10" />

      {celebrating && (
        <CelebrationOverlay tintClassName="lt-celebrate-tint" size={size}>
          <div className="flex flex-col items-center gap-4">
            <Bee mood="cheer" className="lt-bee-big" />
            <p className="lt-done-headline font-rounded font-black">{data.letter} done!</p>
            <p className="lt-done-sub font-rounded font-black">
              {data.letter} says {data.sound}
            </p>
            <button onClick={nextLetter} className="lt-primary font-rounded font-black">
              Next letter
            </button>
          </div>
        </CelebrationOverlay>
      )}
    </div>
  );
}
