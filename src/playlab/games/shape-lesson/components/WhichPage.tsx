"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  TRY,
  isClip,
  nameClip,
  tapClip,
  type Hue,
  type ShapeId,
} from "@games/shape-lesson/constants/lessons";
import { MshWorld } from "@games/shape-lesson/components/MshWorld";
import { ShapeArt } from "@games/shape-lesson/components/ShapeArt";
import { Sparkles } from "@games/shape-lesson/components/Sparkles";
import {
  boxClass,
  sayNow,
  useLesson,
  useMisses,
  useOpening,
  usePageHand,
} from "@games/shape-lesson/components/lessonKit";

/**
 * Page 2 — WHICH ONE? Two big shapes: the lesson's and one other. "Tap the
 * circle!" The right one: sparkles, "That one is a circle." The other: it
 * wiggles, says its own name and "Try again!", and the right one glows (and
 * after two misses pulses, and the hand shows it).
 */
export function WhichPage({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const L = useLesson();
  const pair = useMemo(() => {
    const right = { shape: L.id as ShapeId, hue: L.hue, right: true };
    const other = { shape: L.which.other, hue: L.which.otherHue as Hue, right: false };
    return L.which.rightLeft ? [right, other] : [other, right];
  }, [L]);
  const answer = pair.findIndex((p) => p.right);

  const stageRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [wiggle, setWiggle] = useState<{ at: number; n: number }>({ at: -1, n: 0 });
  const [won, setWon] = useState(false);
  const cast = useMemo(
    () => [
      <span key="a" className="ng-cast">
        <ShapeArt shape={L.id} hue={L.hue} />
      </span>,
    ],
    [L]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });
  const { misses, miss } = useMisses(onMiss);
  const { ready, act } = useOpening([tapClip(L.id)]);

  const tap = useCallback(
    (i: number) => {
      if (isSolved()) return;
      act();
      const el = boxRefs.current[i];
      if (i === answer) {
        setWon(true);
        playStarPop();
        burst(el);
        void sayNow([isClip(L.id)]);
        finish(el);
        return;
      }
      playIncorrectSound();
      setWiggle((w) => ({ at: i, n: w.n + 1 }));
      void sayNow([nameClip(pair[i].shape), TRY]);
      miss();
    },
    [L.id, act, answer, burst, finish, isSolved, miss, pair]
  );

  const at = useCallback(() => boxRefs.current[answer], [answer]);
  const hand = usePageHand({
    round,
    armed: ready && !solved,
    misses,
    resetKey: "which",
    stageRef,
    from: at,
    to: at,
  });

  const line = won ? clipText(isClip(L.id)) : misses > 0 ? clipText(TRY) : clipText(tapClip(L.id));

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`msh-play msh-play--which msh-play--${L.id}`}
      world={<MshWorld scene={L.scene} />}
      round={round}
      solved={solved}
      say={say(line)}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="msh-which">
        {pair.map((p, i) => (
          <motion.span
            key={p.shape}
            className="msh-which-slot"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.15, type: "spring", stiffness: 220, damping: 15 }}
          >
            <span
              className={`msh-halo ${misses > 0 && i === answer && !won ? "is-on" : ""} ${misses > 1 && i === answer && !won ? "is-big" : ""} ${won && i === answer ? "is-won" : ""}`}
              aria-hidden="true"
            />
            <button
              ref={(el) => {
                boxRefs.current[i] = el;
              }}
              type="button"
              className={`msh-tap msh-which-shape ${boxClass(p.shape)}`}
              onClick={() => tap(i)}
              aria-label={p.shape}
            >
              <span
                key={wiggle.at === i ? wiggle.n : 0}
                className={`msh-wiggle ${wiggle.at === i && wiggle.n > 0 ? "is-wiggling" : ""} ${misses > 1 && i === answer && !won ? "is-pulse" : ""} ${won && i === answer ? "is-popped" : ""}`}
              >
                <ShapeArt shape={p.shape} hue={p.hue} />
              </span>
            </button>
            {won && i === answer && <Sparkles />}
          </motion.span>
        ))}
      </div>
    </NgStage>
  );
}
