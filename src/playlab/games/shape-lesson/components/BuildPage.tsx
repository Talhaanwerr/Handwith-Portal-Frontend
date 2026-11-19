"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { playChime, playPickUpSound, playSnapSound, playStarPop } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { GAP_BOX, buildClip, nameClip } from "@games/shape-lesson/constants/lessons";
import { MshWorld } from "@games/shape-lesson/components/MshWorld";
import { ShapeArt, ShapeHole } from "@games/shape-lesson/components/ShapeArt";
import { BuildPicture } from "@games/shape-lesson/components/BuildPicture";
import {
  boxClass,
  sayNow,
  useAlive,
  useLesson,
  useOpening,
  usePageHand,
} from "@games/shape-lesson/components/lessonKit";

/** From the last shape going in to the picture's celebration. */
const ALIVE_MS = 1600;

/**
 * Page 6 — BUILD A PICTURE. A picture missing two or three of the lesson's
 * shapes (a car's wheels, a house's windows, a boat's sails, a train's
 * carriages, the night's stars), the shapes waiting in a tray beside it.
 * "Put the wheels on the car!" Drag each into any gap: it snaps in and is
 * named. With the last one the picture comes alive (the car drives, the
 * house lights up, the boat rocks, the train chugs, the stars twinkle). Every
 * gap takes every piece, so nothing here can be wrong.
 */
export function BuildPage({ round, title, onDone, onHome, onExitPortal }: RoundProps) {
  const L = useLesson();
  const gaps = L.build.gaps;
  const stageRef = useRef<HTMLDivElement>(null);
  const picRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<number, HTMLElement>());
  const [filled, setFilled] = useState<readonly number[]>([]);
  const [used, setUsed] = useState<readonly number[]>([]);
  const [alive, setAlive] = useState(false);
  const schedule = useScheduler();
  const mounted = useAlive();

  const cast = useMemo(
    () =>
      gaps.map((_, i) => (
        <span key={i} className="ng-cast">
          <ShapeArt shape={L.id} hue={L.hue} />
        </span>
      )),
    [L, gaps]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });
  const { ready, act } = useOpening([buildClip(L.id)]);

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: stageRef,
    targets,
    slopPx: 30,
    isEligible: (g) => !filled.includes(g),
    onDrop: (piece, target, info) => {
      if (isSolved() || alive) return;
      act();
      if (!info.moved) {
        void sayNow([nameClip(L.id)]);
        return;
      }
      if (target === null || filled.includes(target)) {
        slideBack(stageRef.current, pieceRefs.current[piece], info);
        return;
      }
      const next = [...filled, target];
      setFilled(next);
      setUsed((u) => [...u, piece]);
      playSnapSound();
      playStarPop();
      burst(gapRefs.current[target]);
      void sayNow([nameClip(L.id)]);
      if (next.length >= gaps.length) {
        setAlive(true);
        schedule(() => {
          if (!mounted.current) return;
          playChime();
          finish(picRef.current);
        }, ALIVE_MS);
      }
    },
  });

  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, piece: number) => {
      if (isSolved() || alive) return;
      if (start(e, piece)) playPickUpSound();
    },
    [alive, isSolved, start]
  );

  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    gapRefs.current[i] = el;
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);

  const nextPiece = gaps.findIndex((_, p) => !used.includes(p));
  const nextGap = gaps.findIndex((_, g) => !filled.includes(g));
  const from = useCallback(() => pieceRefs.current[nextPiece], [nextPiece]);
  const to = useCallback(() => gapRefs.current[nextGap], [nextGap]);
  const hand = usePageHand({
    round,
    armed: ready && !solved && !alive && dragging === null && nextPiece >= 0,
    misses: 0,
    resetKey: filled.length,
    stageRef,
    from,
    to,
  });

  const line = filled.length > 0 ? clipText(nameClip(L.id)) : clipText(buildClip(L.id));
  const box = `${(GAP_BOX / 400) * 100}%`;

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`msh-play msh-play--build msh-play--${L.id}`}
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
              <span className="ng-carried msh-carried msh-carried--build">
                <ShapeArt shape={L.id} hue={L.hue} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="msh-build">
        <motion.div
          className="msh-pic-slot"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <div
            ref={picRef}
            className={`msh-pic msh-pic--${L.build.picture} ${alive ? "is-alive" : ""}`}
          >
            <div className="msh-pic-move">
              <BuildPicture picture={L.build.picture} />
              {gaps.map((g, i) => {
                const full = filled.includes(i);
                return (
                  <div
                    key={i}
                    ref={(el) => register(i, el)}
                    className={`msh-gap ${over === i ? "is-over" : ""} ${full ? "is-full" : ""}`}
                    style={
                      {
                        left: `${((g.x - GAP_BOX / 2) / 400) * 100}%`,
                        top: `${((g.y - GAP_BOX / 2) / 300) * 100}%`,
                        width: box,
                        "--msh-i": i,
                      } as CSSProperties
                    }
                  >
                    {full ? (
                      <motion.span
                        className="msh-gap-fill"
                        initial={{ scale: 1.35 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 14 }}
                      >
                        <ShapeArt shape={L.id} hue={L.hue} />
                      </motion.span>
                    ) : (
                      <ShapeHole shape={L.id} glow={over === i} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
        <div className="msh-build-tray">
          {gaps.map((_, p) =>
            used.includes(p) ? null : (
              <div
                key={p}
                ref={(el) => {
                  pieceRefs.current[p] = el;
                }}
                className={`msh-piece msh-build-piece touch-none ${boxClass(L.id)} ${dragging === p ? "is-away" : ""}`}
                onPointerDown={(e) => pick(e, p)}
                role="button"
                aria-label={`A ${L.id} — drag it into the picture`}
              >
                <motion.span
                  className="msh-piece-in"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + p * 0.1, type: "spring", stiffness: 240, damping: 16 }}
                >
                  <ShapeArt shape={L.id} hue={L.hue} />
                </motion.span>
              </div>
            )
          )}
        </div>
      </div>
    </NgStage>
  );
}
