"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playSnapSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { PUZZLE, TRY, nameClip, type ShapeId } from "@games/shape-lesson/constants/lessons";
import { MshWorld } from "@games/shape-lesson/components/MshWorld";
import { ShapeArt, ShapeHole } from "@games/shape-lesson/components/ShapeArt";
import {
  boxClass,
  sayNow,
  useLesson,
  useMisses,
  useOpening,
  usePageHand,
} from "@games/shape-lesson/components/lessonKit";

/**
 * Page 4 — PUZZLE. One piece and two outlines: its own and one other.
 * "Circle. Put it in its home!" Drag the piece into its own outline: it
 * snaps in and is named. The wrong outline: the piece slides home, "Try
 * again!", and the right outline glows. A tap on the piece says its name.
 */
export function PuzzlePage({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const L = useLesson();
  const homes = useMemo<readonly ShapeId[]>(
    () => (L.puzzle.rightFirst ? [L.id, L.puzzle.wrong] : [L.puzzle.wrong, L.id]),
    [L]
  );
  const answer = homes.indexOf(L.id);

  const stageRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const homeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<number, HTMLElement>());
  const [placed, setPlaced] = useState(false);
  const [wiggle, setWiggle] = useState(0);

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
  const { ready, act } = useOpening([nameClip(L.id), PUZZLE]);

  const { dragging, over, start, ghostRef } = useDragDrop<"piece", number>({
    root: stageRef,
    targets,
    slopPx: 30,
    onDrop: (_item, target, info) => {
      if (isSolved()) return;
      act();
      if (!info.moved) {
        void sayNow([nameClip(L.id)]);
        return;
      }
      if (target === null) {
        slideBack(stageRef.current, pieceRef.current, info);
        return;
      }
      if (target === answer) {
        setPlaced(true);
        playSnapSound();
        playStarPop();
        const el = homeRefs.current[answer];
        burst(el);
        void sayNow([nameClip(L.id)]);
        finish(el);
        return;
      }
      playIncorrectSound();
      void playClip(TRY);
      slideBack(stageRef.current, pieceRef.current, info);
      setWiggle((n) => n + 1);
      miss();
    },
  });

  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (isSolved() || placed) return;
      if (start(e, "piece")) playPickUpSound();
    },
    [isSolved, placed, start]
  );

  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    homeRefs.current[i] = el;
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);

  const from = useCallback(() => pieceRef.current, []);
  const to = useCallback(() => homeRefs.current[answer], [answer]);
  const hand = usePageHand({
    round,
    armed: ready && !solved && !placed && dragging === null,
    misses,
    resetKey: "puzzle",
    stageRef,
    from,
    to,
  });

  const line = placed
    ? clipText(nameClip(L.id))
    : misses > 0
      ? clipText(TRY)
      : `${clipText(nameClip(L.id))} ${clipText(PUZZLE)}`;

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`msh-play msh-play--puzzle msh-play--${L.id}`}
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
          {dragging !== null && (
            <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
              <span className={`ng-carried msh-carried msh-carried--puzzle ${boxClass(L.id)}`}>
                <ShapeArt shape={L.id} hue={L.hue} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="msh-puzzle">
        <div className="msh-tray">
          <div
            ref={pieceRef}
            className={`msh-piece msh-puzzle-piece touch-none ${boxClass(L.id)} ${dragging !== null || placed ? "is-away" : ""}`}
            onPointerDown={pick}
            role="button"
            aria-label={`A ${L.id} — drag it to its home`}
          >
            <motion.span
              className="msh-piece-in"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
            >
              <span key={wiggle} className={`msh-wiggle ${wiggle > 0 ? "is-wiggling" : ""}`}>
                <ShapeArt shape={L.id} hue={L.hue} />
              </span>
            </motion.span>
          </div>
        </div>
        <div className="msh-homes">
          {homes.map((s, i) => {
            const right = i === answer;
            return (
              <div
                key={s}
                ref={(el) => register(i, el)}
                className={`msh-home ${over === i ? "is-over" : ""} ${misses > 1 && right && !placed ? "is-pulse" : ""}`}
                aria-label={`${s} home`}
              >
                <motion.span
                  className="msh-home-in"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    type: "spring",
                    stiffness: 220,
                    damping: 16,
                  }}
                >
                  <ShapeHole shape={s} glow={(misses > 0 && right) || over === i} />
                  {placed && right && (
                    <motion.span
                      className="msh-home-fill"
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 14 }}
                    >
                      <ShapeArt shape={L.id} hue={L.hue} />
                    </motion.span>
                  )}
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
    </NgStage>
  );
}
