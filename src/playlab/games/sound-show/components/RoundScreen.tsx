"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LitSign, ShowPicture, ShowStage } from "@games/phonics-show/components/ShowStage";
import { ShowGuideBar, ShowHand, lineText } from "@games/phonics-show/components/ShowGuide";
import { ROUNDS, TOTAL_ROUNDS, answerOf, askLines } from "@games/sound-show/constants/rounds";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useAfterVoice } from "@shared/hooks/useAfterVoice";
import { FirstPlayHand, useIdleHand } from "@shared/hooks/useIdleHand";
import { wordClip } from "@shared/audio/wordClips";
import { cheerFor } from "@shared/audio/cheers";
import { clipText, playClip, playSequence, stopVoice } from "@shared/audio/voice";
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
 *
 * The guide bar at the top shows the progress and the line being said. The
 * teaching hand taps the right picture whenever it glows for a wait — on the
 * run's first round after a moment (see FirstPlayHand); the ask itself is
 * said again only after the full wait, every round.
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
  /** The bar's line, once something other than the round's own steps has been said. */
  const [line, setLine] = useState<{ index: number; text: string } | null>(null);
  const missed = useRef(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLButtonElement>(null);
  const { thenAfter } = useAfterVoice();

  // the bar: "s … s" while the sound is taught, then the ask
  const askText = `${clipText("instr-find-starts-with")} ${clipText(sound)}`;
  const stepText = phase === "teach" ? lineText([sound, sound]) : askText;
  const barText = line?.index === index ? line.text : stepText;

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
  const handKey = `${index}-${wrong.length}`;
  const idle = useIdleHand(ready && !chosen, handKey, HINT_MS);
  const hint = !chosen && (idle || wrong.length > 0);

  const pick = useCallback(
    (picture: string) => {
      if (!ready || chosen || wrong.includes(picture)) return;
      const said = wordClip(picture);
      if (picture !== answer) {
        missed.current = true;
        setWrong((w) => [...w, picture]);
        playIncorrectSound();
        const lines = [...(said ? [said] : []), "instr-try-again"];
        setLine({ index, text: lineText(lines) });
        void playSequence(lines, 250);
        return;
      }
      setChosen(picture);
      playCorrectSound();
      const firstTap = !missed.current;
      const lines = [sound, ...(said ? [said] : []), cheerFor(index + 3)];
      setLine({ index, text: lineText(lines) });
      thenAfter(
        lines,
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
    <div className="pgs-screen snd-screen" ref={screenRef}>
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

      {/* the guide bar sits BETWEEN the two pinned pills, at the top centre */}
      <ShowGuideBar index={index} total={TOTAL_ROUNDS} solved={chosen !== null} text={barText} />

      {/* the ask again after a long wait: its own clock, never the first play's quick one */}
      <FirstPlayHand on={false}>
        <AskAgain
          armed={ready && !chosen}
          resetKey={handKey}
          lines={askLines(round)}
          onAsk={() => setLine({ index, text: askText })}
        />
      </FirstPlayHand>

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
                    ref={picture === answer ? answerRef : undefined}
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

      <ShowHand show={idle} resetKey={handKey} root={screenRef} target={answerRef} />
    </div>
  );
}

/**
 * The ask said again once a toddler has sat still for the full wait — the
 * same clock as the glow, but kept outside the first play's quick one (its
 * parent sets `FirstPlayHand on={false}`), so the line is never repeated a
 * moment after it was heard, nor cuts off "Try again!".
 */
function AskAgain({
  armed,
  resetKey,
  lines,
  onAsk,
}: {
  armed: boolean;
  resetKey: string;
  lines: string[];
  onAsk: () => void;
}) {
  const idle = useIdleHand(armed, resetKey, HINT_MS);
  const said = lines.join("|");
  const onAskRef = useRef(onAsk);
  useEffect(() => {
    onAskRef.current = onAsk;
  });
  useEffect(() => {
    if (!idle) return;
    onAskRef.current();
    void playSequence(said.split("|"), 200);
  }, [idle, said]);
  return null;
}
