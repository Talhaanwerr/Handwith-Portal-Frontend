"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useScheduler } from "@shared/hooks/useScheduler";
import { playCorrectSound, playIncorrectSound, playPickUpSound } from "@shared/audio/sfx";
import { playClip, sayAfter, clipText, stopVoice } from "@shared/audio/voice";
import { PnStage } from "@games/pond-numbers/components/PnStage";
import { NumberTiles } from "@games/pond-numbers/components/NumberTiles";
import { IDLE_MS, NUMBER_CLIPS, SAY_MS, wait } from "@games/pond-numbers/components/QuickLookRound";
import { Frog, LilyPad } from "@games/pond-numbers/components/PondArt";
import { moreStart } from "@games/pond-numbers/constants/rounds";

const READY_MS = 700;
const COUNT_MS = 1900;
const HOP_MS = 950;
const SOLVED_MS = 1900;

/** The hop, in units of the frog's own size: from the lily pad in the water
 *  just in front of the log, up in an arc, down into the empty spot. Three
 *  keyframes, so a tween (a spring takes exactly two). */
const ON_PAD = { x: "55%", y: "135%" };
const HOP = { x: ["55%", "28%", "0%"], y: ["135%", "-55%", "0%"] };

type Phase = "ready" | "count" | "hop" | "ask" | "solved";

interface RoundProps {
  round: number;
  onDone: () => void;
  onMiss: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}

/**
 * ONE MORE — one round.
 *
 * Some frogs sit on a log and the teacher says how many ("Two frogs on the
 * log.") — the child starts from a known number. Then one more frog hops from
 * its lily pad into the empty spot at the end of the log: "How many now?"
 * That is counting on, the first step to adding. The right tile lights, every
 * frog wears its number, and the total is spoken; a wrong tile is crossed out.
 */
export function OneMoreRound({ round, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const start = moreStart(round);
  const total = start + 1;
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>("ready");
  const [wrong, setWrong] = useState<readonly number[]>([]);
  /** False once the round is left (Back, Back to Games, unmount): a line that
   *  ends after that must not move a round nobody is looking at. */
  const live = useRef(true);
  /** The number, then "Now there are three frogs!" — the round moves on once
   *  that is said. */
  const told = useRef<Promise<void>>(Promise.resolve());
  const nudged = useRef(false);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  // Each beat waits for its line as well as its time: on the first round the
  // mode card's line is still playing, and the frogs ran ahead of the teacher.
  useEffect(() => {
    let cancelled = false;
    const go = () => !cancelled && live.current;
    const looked = wait(SAY_MS).then(() => (go() ? sayAfter("pond-look-log") : undefined));
    void Promise.all([wait(READY_MS), looked])
      .then(() => {
        if (!go()) return;
        setPhase("count");
        return Promise.all([wait(COUNT_MS), sayAfter(`pond-start-${start}`)]);
      })
      .then(() => {
        if (!go()) return;
        setPhase("hop");
        playPickUpSound();
        void sayAfter("pond-one-more");
        schedule(() => {
          if (!live.current) return;
          // as the frog lands
          void sayAfter("pond-ribbit");
          setPhase("ask");
          void sayAfter("pond-how-many-now");
        }, HOP_MS);
      });
    return () => {
      cancelled = true;
    };
  }, [round, start, schedule]);

  // One quiet nudge if the tiles wait and nothing is tapped; a wrong tap
  // starts the wait again.
  useEffect(() => {
    if (phase !== "ask" || nudged.current) return;
    const t = setTimeout(() => {
      if (!live.current) return;
      nudged.current = true;
      void sayAfter("pond-tap-number");
    }, IDLE_MS);
    return () => clearTimeout(t);
  }, [phase, wrong]);

  // Hold the answer for SOLVED_MS — longer if it is still being said, so the
  // next round never starts under it.
  useEffect(() => {
    if (phase !== "solved") return;
    let cancelled = false;
    void Promise.all([wait(SOLVED_MS), told.current]).then(() => {
      if (!cancelled && live.current) onDone();
    });
    return () => {
      cancelled = true;
    };
  }, [phase, onDone]);

  const pick = useCallback(
    (value: number) => {
      if (value === total) {
        playCorrectSound();
        void playClip(NUMBER_CLIPS[value - 1]);
        told.current = sayAfter(`pond-total-${total}`);
        setPhase("solved");
        return;
      }
      playIncorrectSound();
      void playClip("pond-count-again");
      setWrong((w) => (w.includes(value) ? w : [...w, value]));
      onMiss();
    },
    [total, onMiss]
  );

  /** Leaving mid-round: silence now, and nothing queued may follow. */
  const leave = (fn: () => void) => () => {
    live.current = false;
    stopVoice();
    fn();
  };

  const hopped = phase === "hop" || phase === "ask" || phase === "solved";
  const say = clipText(
    {
      ready: "pond-look-log",
      count: `pond-start-${start}`,
      hop: "pond-one-more",
      ask: "pond-how-many-now",
      solved: `pond-total-${total}`,
    }[phase]
  );

  return (
    <PnStage
      round={round}
      say={say}
      cheer={phase === "solved"}
      onHome={leave(onHome)}
      onExitPortal={leave(onExitPortal)}
      tiles={
        <NumberTiles
          lit={phase === "solved" ? total : null}
          wrong={wrong}
          onPick={phase === "ask" ? pick : null}
        />
      }
    >
      <div className="pn-log-wrap">
        <div className="pn-frogs">
          <span className="pn-log" aria-hidden="true" />
          {Array.from({ length: total }, (_, i) => {
            const isNew = i === start;
            return (
              <span key={i} className={`pn-frog-slot ${isNew && !hopped ? "is-empty" : ""}`}>
                {isNew ? (
                  <>
                    <span className="pn-hop-pad" aria-hidden="true">
                      <LilyPad />
                    </span>
                    <motion.span
                      className="pn-frog"
                      initial={ON_PAD}
                      animate={hopped ? HOP : ON_PAD}
                      transition={
                        hopped
                          ? { duration: HOP_MS / 1000, times: [0, 0.5, 1], ease: "easeInOut" }
                          : { duration: 0 }
                      }
                    >
                      <Frog />
                    </motion.span>
                  </>
                ) : (
                  <span className="pn-frog">
                    <Frog />
                  </span>
                )}
                {phase === "solved" && (
                  <motion.span
                    className="pn-frog-badge font-rounded font-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.18, type: "spring", stiffness: 420, damping: 15 }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </motion.span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </PnStage>
  );
}
