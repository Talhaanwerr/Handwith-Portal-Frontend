"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { TRY, isClip, pictureOf, whichClip, wordOf } from "@games/shape-lesson/constants/lessons";
import { MshWorld } from "@games/shape-lesson/components/MshWorld";
import { ShapeGlowLine } from "@games/shape-lesson/components/ShapeArt";
import {
  sayNow,
  useLesson,
  useMisses,
  useOpening,
  usePageHand,
} from "@games/shape-lesson/components/lessonKit";

/**
 * Page 5 — IN MY WORLD. Three real things in picture frames, one of them
 * shaped like the lesson's shape. "Which one is a circle?" — then each thing
 * is named, its frame lighting up. Tap the right one: its shape's outline
 * draws itself round it in gold, "Ball. That one is a circle." Another: it
 * wiggles, says its name and "Try again!", and the right one glows.
 */
export function WorldPage({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const L = useLesson();
  const { words, answer, turn } = L.world;
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [naming, setNaming] = useState(-1);
  const [won, setWon] = useState(false);
  const [wiggle, setWiggle] = useState<{ at: number; n: number }>({ at: -1, n: 0 });

  const cast = useMemo(
    () => [
      <span key="a" className="ng-cast">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pictureOf(words[answer])} alt="" className="msh-thing-img" draggable={false} />
      </span>,
    ],
    [answer, words]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });
  const { misses, miss } = useMisses(onMiss);
  const opening = useMemo(() => [whichClip(L.id), ...words.map(wordOf)], [L.id, words]);
  const { ready, act } = useOpening(opening, (i) => setNaming(i < 0 ? -1 : i - 1));

  const tap = useCallback(
    (i: number) => {
      if (isSolved()) return;
      act();
      setNaming(-1);
      const el = frameRefs.current[i];
      if (i === answer) {
        setWon(true);
        playStarPop();
        burst(el);
        void sayNow([wordOf(words[i]), isClip(L.id)]);
        finish(el);
        return;
      }
      playIncorrectSound();
      setWiggle((w) => ({ at: i, n: w.n + 1 }));
      void sayNow([wordOf(words[i]), TRY]);
      miss();
    },
    [L.id, act, answer, burst, finish, isSolved, miss, words]
  );

  const at = useCallback(() => frameRefs.current[answer], [answer]);
  const hand = usePageHand({
    round,
    armed: ready && !solved,
    misses,
    resetKey: "world",
    stageRef,
    from: at,
    to: at,
  });

  const line = won
    ? clipText(isClip(L.id))
    : misses > 0
      ? clipText(TRY)
      : clipText(whichClip(L.id));

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`msh-play msh-play--world msh-play--${L.id}`}
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
      <div className="msh-world-row">
        {words.map((w, i) => {
          const right = i === answer;
          return (
            <motion.span
              key={w}
              className="msh-frame-slot"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 220, damping: 16 }}
            >
              <button
                ref={(el) => {
                  frameRefs.current[i] = el;
                }}
                type="button"
                className={`msh-tap msh-frame ${naming === i ? "is-naming" : ""} ${misses > 0 && right && !won ? "is-hint" : ""} ${misses > 1 && right && !won ? "is-pulse" : ""} ${won && right ? "is-won" : ""}`}
                onClick={() => tap(i)}
                aria-label={w}
              >
                <span
                  key={wiggle.at === i ? wiggle.n : 0}
                  className={`msh-wiggle msh-frame-pic ${wiggle.at === i && wiggle.n > 0 ? "is-wiggling" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pictureOf(w)} alt="" className="msh-thing-img" draggable={false} />
                </span>
                {won && right && (
                  <span className="msh-frame-glow" style={{ transform: `rotate(${turn}deg)` }}>
                    <ShapeGlowLine shape={L.id} />
                  </span>
                )}
              </button>
            </motion.span>
          );
        })}
      </div>
    </NgStage>
  );
}
