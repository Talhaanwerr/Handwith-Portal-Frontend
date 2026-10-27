"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LitSign, ShowPicture, ShowStage } from "@games/phonics-show/components/ShowStage";
import { ROUNDS, TOTAL_ROUNDS, oddOf } from "@games/odd-sound/constants/rounds";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useAfterVoice } from "@shared/hooks/useAfterVoice";
import { wordClip } from "@shared/audio/wordClips";
import { cheerFor } from "@shared/audio/cheers";
import { playSequence, playSequenceChecked, stopVoice } from "@shared/audio/voice";
import { playClickSound, playCorrectSound, playIncorrectSound } from "@shared/audio/sfx";

/** The pause between the four names — long enough to hold each one in mind. */
const NAME_GAP_MS = 550;
/** The ask, recorded once: "Which one starts with a different sound?" */
const ASK = "instr-odd-sound";

interface OddRoundProps {
  index: number;
  onSolved: (firstTap: boolean) => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/** 1…10, built once rather than on every render. */
const SLOTS = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i);

/**
 * ONE ROUND — four pictures, one odd sound out.
 *
 * The four pictures are named in turn, each card lifting while its word is
 * said, then the ask; taps wait until all of that has been heard, because
 * the whole puzzle is in the listening. The sign shows the letter three of
 * them start with from the start (the user wants the main letter on show,
 * never a blank), and tapping it says the four words again.
 *
 * A RIGHT tap: the odd card goes green, every card shows its first letter
 * (three the same, one not — the lesson, made visible), and the odd word, its own first sound and a cheer are said ("cat… c") — never the other three's sound again. A
 * WRONG tap: that card goes red with a ✕, its word and its first sound are
 * said ("ball… b") so the child hears why it belongs, then "Try again!".
 */
export function OddRound({ index, onSolved, onBack, onExitPortal }: OddRoundProps) {
  const round = ROUNDS[index];
  const odd = oddOf(round);
  const [speaking, setSpeaking] = useState<number | null>(null);
  /** The round whose names and ask have been heard: taps count from here. */
  const [readyFor, setReadyFor] = useState<number | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrong, setWrong] = useState<readonly string[]>([]);
  const missed = useRef(false);
  const { thenAfter } = useAfterVoice();
  const ready = readyFor === index;

  /** Say the four names in turn (each card lifts as it is named), then `after`. */
  const nameAll = useCallback(
    (after: readonly string[], onDone: () => void) => {
      let alive = true;
      const ids = [...round.pictures.map((p) => wordClip(p) ?? ""), ...after];
      void playSequenceChecked(ids, NAME_GAP_MS, (i) => {
        if (alive) setSpeaking(i < round.pictures.length ? i : null);
      }).then(() => {
        if (!alive) return;
        setSpeaking(null);
        onDone();
      });
      return () => {
        alive = false;
      };
    },
    [round]
  );

  // a new round: name the four, then ask
  useEffect(() => {
    let cancel = () => {};
    const t = setTimeout(() => {
      cancel = nameAll([ASK], () => setReadyFor(index));
    }, 500);
    return () => {
      clearTimeout(t);
      cancel();
    };
  }, [index, nameAll]);

  const pick = useCallback(
    (picture: string) => {
      if (!ready || chosen || wrong.includes(picture)) return;
      const said = wordClip(picture);
      if (picture !== odd) {
        missed.current = true;
        setWrong((w) => [...w, picture]);
        playIncorrectSound();
        void playSequence(
          [...(said ? [said] : []), `phonics-${picture[0]}`, "instr-try-again"],
          300
        );
        return;
      }
      setChosen(picture);
      playCorrectSound();
      const firstTap = !missed.current;
      thenAfter(
        [...(said ? [said] : []), `phonics-${picture[0]}`, cheerFor(index + 11)],
        () => {
          setChosen(null);
          setWrong([]);
          missed.current = false;
          onSolved(firstTap);
        },
        400
      );
    },
    [ready, chosen, wrong, odd, index, thenAfter, onSolved]
  );

  const solved = chosen !== null;

  return (
    <div className="pgs-screen odd-screen">
      <ShowStage />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Odd Sound Out home"
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

      <div className="pgs-topbar">
        <div
          className="pgs-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL_ROUNDS}
          aria-valuenow={index}
          aria-label={`${index} of ${TOTAL_ROUNDS} rounds done`}
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

      <motion.div
        className="odd-board"
        key={index}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
      >
        <LitSign className="odd-sign">
          <button
            type="button"
            className="odd-hear font-rounded font-black"
            onClick={() => {
              if (!ready || solved) return;
              playClickSound();
              nameAll([], () => {});
            }}
            aria-label="Hear the four words again"
          >
            {round.letter}
          </button>
        </LitSign>

        <ul className="odd-pictures">
          {round.pictures.map((picture, i) => (
            <li key={picture}>
              <button
                type="button"
                className={`odd-card ${speaking === i ? "odd-card--named" : ""} ${
                  chosen === picture ? "odd-card--right" : ""
                } ${wrong.includes(picture) ? "odd-card--wrong" : ""}`}
                onClick={() => pick(picture)}
                disabled={solved || wrong.includes(picture)}
                aria-label={wrong.includes(picture) ? `${picture}, not this one` : picture}
              >
                <ShowPicture word={picture} />
                {/* once solved, every card shows the letter it starts with */}
                {solved && (
                  <span
                    className={`odd-tag font-rounded font-black ${
                      picture === odd ? "odd-tag--odd" : ""
                    }`}
                  >
                    {picture[0]}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
