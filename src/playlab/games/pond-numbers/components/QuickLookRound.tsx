"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playCorrectSound, playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { playClip, sayAfter, clipText, stopVoice } from "@shared/audio/voice";
import { PnStage } from "@games/pond-numbers/components/PnStage";
import { NumberTiles } from "@games/pond-numbers/components/NumberTiles";
import { CardBack, DotFace } from "@games/pond-numbers/components/PondArt";
import { DOT_COLORS, flashMs, quickDots } from "@games/pond-numbers/constants/rounds";

const READY_MS = 900;
const PEEK_MS = 1000;
const SOLVED_MS = 1700;
/** The beat useSayOnEnter waits before a screen's first line. */
export const SAY_MS = 450;
/** A child who has not tapped a number for this long hears the nudge, once. */
export const IDLE_MS = 7000;

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** The recorded number clips (public/audio/numbers/N.mp3), indexed value-1. */
export const NUMBER_CLIPS = [
  "number-1",
  "number-2",
  "number-3",
  "number-4",
  "number-5",
  "number-6",
] as const;

const BURST = ["#FFD93D", "#3DAB72", "#54A0FF", "#FF7EA8"].map((c, i) => (
  <span key={i} className="pn-burst-piece" style={cssVars({ "--pl-color": c })} />
));

type Phase = "ready" | "show" | "ask" | "peek" | "solved";

interface RoundProps {
  round: number;
  onDone: () => void;
  onMiss: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}

/**
 * QUICK LOOK — one round.
 *
 * The card turns face up for a moment ("Quick, look!"), turns back, and the
 * child taps how many dots there were. A wrong tile is crossed out and the
 * card shows its dots once more ("Look again!"); the right tile turns the card
 * over for good, says the number and moves on. Remounted per round.
 *
 * The show timer starts inside the ready timer (not both from mount): the
 * first round opens during the shared music synthesis stall, and timed from
 * mount the whole flash could pass unseen.
 */
export function QuickLookRound({ round, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const count = quickDots(round);
  const color = DOT_COLORS[round % DOT_COLORS.length];
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>("ready");
  const [wrong, setWrong] = useState<readonly number[]>([]);
  /** False once the round is left (Back, Back to Games, unmount): a line that
   *  ends after that must not move a round nobody is looking at. */
  const live = useRef(true);
  /** The number, then "Four dots!" — the round moves on once that is said. */
  const told = useRef<Promise<void>>(Promise.resolve());
  const nudged = useRef(false);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  // "Get ready…" first, and the card waits for it: on the first round the
  // mode card's line is still playing, and a flash under it went unheard.
  useEffect(() => {
    let cancelled = false;
    const said = wait(SAY_MS).then(() => (cancelled ? undefined : sayAfter("pond-get-ready")));
    void Promise.all([wait(READY_MS), said]).then(() => {
      if (cancelled || !live.current) return;
      setPhase("show");
      playStarPop();
      void sayAfter("pond-quick-look");
      schedule(() => {
        if (!live.current) return;
        setPhase("ask");
        void sayAfter("pond-how-many-dots");
      }, flashMs(round));
    });
    return () => {
      cancelled = true;
    };
  }, [round, schedule]);

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
  }, [phase]);

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
      if (value === count) {
        playCorrectSound();
        void playClip(NUMBER_CLIPS[value - 1]);
        told.current = sayAfter(`pond-dots-${count}`);
        setPhase("solved");
        return;
      }
      playIncorrectSound();
      void playClip("pond-look-again");
      setWrong((w) => (w.includes(value) ? w : [...w, value]));
      onMiss();
      setPhase("peek");
      schedule(() => setPhase((p) => (p === "peek" ? "ask" : p)), PEEK_MS);
    },
    [count, onMiss, schedule]
  );

  /** Leaving mid-round: silence now, and nothing queued may follow. */
  const leave = (fn: () => void) => () => {
    live.current = false;
    stopVoice();
    fn();
  };

  const faceUp = phase === "show" || phase === "peek" || phase === "solved";
  const say = clipText(
    {
      ready: "pond-get-ready",
      show: "pond-quick-look",
      ask: "pond-how-many-dots",
      peek: "pond-look-again",
      solved: `pond-dots-${count}`,
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
          lit={phase === "solved" ? count : null}
          wrong={wrong}
          onPick={phase === "ask" ? pick : null}
        />
      }
    >
      <div className="pn-card-stand">
        <motion.div
          className="pn-card"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: faceUp ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 170, damping: 19 }}
        >
          <DotFace count={count} color={color} />
          <CardBack />
        </motion.div>

        {phase === "solved" && (
          <>
            <motion.span
              className="pn-card-count font-rounded font-black"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 15 }}
            >
              {count}
            </motion.span>
            <span className="pn-burst-anchor" aria-hidden="true">
              <Burst pieces={BURST} count={18} size="clamp(8px, 2.6cqh, 18px)" />
            </span>
          </>
        )}
        <span className="pn-card-post" aria-hidden="true" />
      </div>
    </PnStage>
  );
}
