"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { Picture, type PictureId } from "@games/blend-read/components/PictureArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { ClassroomWorld } from "@games/shadow-match/components/ShmWorld";
import { Shadow } from "@games/shadow-match/components/Shadow";
import { useHandAt } from "@games/shadow-match/components/useHandAt";
import { FIND_ROUNDS, NAMED, findAnswer } from "@games/shadow-match/constants/rounds";

const ASK = "shm-find";
const WRONG = "shm-find-wrong";

/**
 * FIND THE SHADOW — one round. The picture stands big on top; three shadows
 * wait below. Drag it onto its own shadow (or tap the shadow): it drops in
 * and the colour fills the shadow. A wrong shadow is crossed out and the
 * picture shakes "no".
 */
export function FindShadowRound({
  round,
  title,
  onDone,
  onMiss,
  onHome,
  onExitPortal,
}: RoundProps) {
  const r = FIND_ROUNDS[round];
  const answer = findAnswer(r);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const objRef = useRef<HTMLDivElement>(null);
  const targets = useRef(new Map<number, HTMLElement>());
  const wrongRef = useRef<readonly number[]>([]);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [matched, setMatched] = useState(false);
  const cast = useMemo(
    () => [
      <span key="a" className="ng-cast">
        <Picture id={r.target} />
      </span>,
    ],
    [r.target]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const judge = useCallback(
    (i: number) => {
      if (isSolved() || wrongRef.current.includes(i)) return;
      if (i === answer) {
        setMatched(true);
        burst(targets.current.get(i));
        playStarPop();
        if (NAMED.has(r.target)) void sayAfter(`name-${r.target}`);
        finish(boardRef.current);
        return;
      }
      playIncorrectSound();
      void playClip(WRONG);
      wrongRef.current = [...wrongRef.current, i];
      setWrong(wrongRef.current);
      shake(objRef.current);
      onMiss();
    },
    [answer, burst, finish, isSolved, onMiss, r.target]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: stageRef,
    targets,
    slopPx: 20,
    isEligible: (k) => !wrongRef.current.includes(k),
    onDrop: (_v, target, info) => {
      if (!info.moved || target === null) return;
      judge(target);
    },
  });

  const pick = (e: React.PointerEvent<HTMLElement>) => {
    if (solved || matched) return;
    if (start(e, 0)) playPickUpSound();
  };

  const register = useCallback((i: number, el: HTMLElement | null) => {
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);

  const idle = useIdleHand(!solved && !matched && dragging === null, wrong.length);
  const from = useCallback(() => objRef.current, []);
  const to = useCallback(() => targets.current.get(answer), [answer]);
  const hand = useHandAt(idle, stageRef, from, to);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="shm-play--find"
      world={<ClassroomWorld />}
      round={round}
      solved={solved}
      say={say(clipText(wrong.length > 0 ? WRONG : ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {dragging !== null && (
            <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
              <span className="ng-carried shm-carried">
                <Picture id={r.target} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div ref={boardRef} className="shm-find-board">
        <div
          ref={objRef}
          className={`shm-obj touch-none ${dragging !== null || matched ? "is-away" : ""}`}
          onPointerDown={pick}
          role="img"
          aria-label={`A ${r.target} — drag it onto its shadow`}
        >
          <Picture id={r.target} />
        </div>
        <div className="shm-shadows">
          {r.shadows.map((s, i) => (
            <ShadowSlot
              key={`${round}-${s}`}
              index={i}
              picture={s}
              size={i === answer ? r.size : 1}
              filled={matched && i === answer}
              wrong={wrong.includes(i)}
              lit={over === i}
              live={!solved}
              onTap={judge}
              register={register}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

const ShadowSlot = memo(function ShadowSlot({
  index,
  picture,
  size,
  filled,
  wrong,
  lit,
  live,
  onTap,
  register,
}: {
  index: number;
  picture: PictureId;
  size: number;
  filled: boolean;
  wrong: boolean;
  lit: boolean;
  live: boolean;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    register(index, ref.current);
    return () => register(index, null);
  }, [index, register]);
  const can = live && !wrong && !filled;
  return (
    <button
      ref={ref}
      type="button"
      className={`shm-spot ${lit ? "is-lit" : ""} ${wrong ? "is-wrong" : ""} ${filled ? "is-filled" : ""}`}
      disabled={!can}
      onClick={can ? () => onTap(index) : undefined}
      aria-label={`Shadow ${index + 1}`}
    >
      <Shadow id={picture} size={size} />
      {filled && (
        <motion.span
          className="shm-fill"
          initial={{ opacity: 0, scale: size * 1.25 }}
          animate={{ opacity: 1, scale: size }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-hidden="true"
        >
          <Picture id={picture} />
        </motion.span>
      )}
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
