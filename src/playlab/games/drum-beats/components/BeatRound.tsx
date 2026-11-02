"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playThudSound } from "@shared/audio/sfx";
import { clipText, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { StreetBackdrop } from "@games/tiny-toy-shop/components/ShopParts";
import { SumStrip, Thing } from "@games/number-groups/components/SumParts";
import {
  DOTS,
  ROUNDS,
  firstClip,
  moreClip,
  type ModuleId,
} from "@games/drum-beats/constants/rounds";

/** The rest between the first beats and "Now … more!", so the two parts feel apart. */
const REST_MS = 700;

/**
 * ONE ROUND OF DRUMMING — beats, then more beats, then the total.
 *
 * FIRST: "Tap the drum two times!" Every beat lights the next dot blue and
 * says the count; after the last one the drum rests (it will not take a
 * beat more). MORE: after a moment, "Now one more!" — the drum wakes, and
 * each beat lights a red dot and keeps counting on. When the red ones are
 * done the sum fills in and the round is won. Blue then red in one row is
 * the whole idea of adding, made with the child's own hands.
 */
export function BeatRoundOf({
  module,
  round,
  title,
  onDone,
  onHome,
  onExitPortal,
}: RoundProps & { module: ModuleId }) {
  const r = ROUNDS[module][round];
  const total = r.a + r.b;
  const stageRef = useRef<HTMLDivElement>(null);
  const drumRef = useRef<HTMLButtonElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [beats, setBeats] = useState(0);
  /** The drum has woken up for the "more" beats. */
  const [more, setMore] = useState(false);
  const done = beats === total;
  // the drum takes beats while the first ones are owed, or once "more" has been said
  const live = !done && (beats < r.a || more);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <Thing id="drum" />
        </span>
      )),
    []
  );
  const { solved, isSolved, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 21,
    stageRef,
    cast,
    onDone,
  });

  useEffect(() => {
    const t = setTimeout(() => void playSequence([firstClip(r.a)]), 400);
    return () => clearTimeout(t);
  }, [r.a]);

  // the first beats are in: rest, then "Now … more!" wakes the drum
  useEffect(() => {
    if (beats !== r.a || more) return;
    const t = setTimeout(() => {
      void playSequence([moreClip(r.b)]);
      setMore(true);
    }, REST_MS);
    return () => clearTimeout(t);
  }, [beats, r.a, r.b, more]);

  const beat = useCallback(() => {
    if (!live || isSolved()) return;
    const n = beats + 1;
    setBeats(n);
    playThudSound();
    sayNumber(n);
    if (n === total) finish(dotsRef.current);
  }, [live, isSolved, beats, total, finish]);

  // the idle hand taps the drum when it is waiting for a beat
  const idle = useIdleHand(live && !solved, `${beats}-${more}`);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() => setHand(centreIn(stageRef.current, drumRef.current)));
    return () => cancelAnimationFrame(raf);
  }, [idle]);

  const prompt = clipText(beats < r.a ? firstClip(r.a) : moreClip(r.b));

  return (
    <NgStage
      stageRef={stageRef}
      playClass="drb-play"
      world={<StreetBackdrop />}
      round={round}
      solved={solved}
      say={say(prompt)}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {idle && hand && <TeachingHand fx={hand.x} fy={hand.y} tx={hand.x} ty={hand.y} />}
        </>
      }
    >
      <div className="apa-board drb-board">
        <SumStrip id="" a={r.a} b={r.b} op="+" result={done ? total : null} />

        <div className="drb-scene">
          <motion.button
            ref={drumRef}
            key={beats}
            type="button"
            className={`drb-drum ${live ? "drb-drum--live" : ""}`}
            onClick={beat}
            disabled={!live}
            initial={beats > 0 ? { scale: 0.86 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 12 }}
            aria-label={live ? "tap the drum" : "the drum is resting"}
          >
            <Thing id="drum" />
          </motion.button>

          <div ref={dotsRef} className="drb-dots" aria-label={`${beats} beats`}>
            {DOTS.slice(0, total).map((i) => (
              <span
                key={i}
                className={`drb-dot ${i < beats ? (i < r.a ? "drb-dot--blue" : "drb-dot--red") : ""} ${
                  i >= r.a ? "drb-dot--more" : ""
                }`}
              >
                {i < beats && (
                  <motion.span
                    className="drb-dot-num font-rounded font-black"
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 14 }}
                  >
                    {i + 1}
                  </motion.span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </NgStage>
  );
}

export function LittleRound(props: RoundProps) {
  return <BeatRoundOf {...props} module="little" />;
}
export function BigRound(props: RoundProps) {
  return <BeatRoundOf {...props} module="big" />;
}
