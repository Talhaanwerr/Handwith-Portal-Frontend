"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { Picture, type PictureId } from "@games/blend-read/components/PictureArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { ClassroomWorld } from "@games/shadow-match/components/ShmWorld";
import { Shadow } from "@games/shadow-match/components/Shadow";
import { useHandAt } from "@games/shadow-match/components/useHandAt";
import { SIZE_ROUNDS, sizeAnswer } from "@games/shadow-match/constants/rounds";

const WRONG = "shm-long-wrong";

/** What is said and written for each ask: the recorded words "big" / "small". */
const ASK = {
  big: { say: "word-big", text: "Tap the BIG shadow." },
  small: { say: "word-small", text: "Tap the SMALL shadow." },
} as const;

/**
 * BIG OR SMALL — one round. The thing itself stands on top; below it two of
 * its shadows, one big and one small. "big" (or "small") — tap that one.
 * Right: the shadow is lit and cheered. Wrong: it is crossed out and the
 * thing shakes.
 */
export function BigSmallRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = SIZE_ROUNDS[round];
  const answer = sizeAnswer(r);
  const ask = ASK[r.ask].say;
  const yes = ASK[r.ask].say;
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const refRef = useRef<HTMLDivElement>(null);
  const spots = useRef<(HTMLButtonElement | null)[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [right, setRight] = useState(false);
  const cast = useMemo(
    () => [
      <span key="a" className="ng-cast">
        <Picture id={r.picture} />
      </span>,
    ],
    [r.picture]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: ROUND_COUNT + round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ask]);
  const askText = ASK[r.ask].text;

  const tap = useCallback(
    (i: number) => {
      if (isSolved() || wrong === i) return;
      if (i === answer) {
        setRight(true);
        burst(spots.current[i]);
        playStarPop();
        void sayAfter(yes);
        finish(boardRef.current);
        return;
      }
      playIncorrectSound();
      void playClip(WRONG);
      setWrong(i);
      shake(refRef.current);
      onMiss();
    },
    [answer, burst, finish, isSolved, onMiss, wrong, yes]
  );

  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    spots.current[i] = el;
  }, []);

  const idle = useIdleHand(!solved && !right, wrong);
  const at = useCallback(() => spots.current[answer], [answer]);
  const hand = useHandAt(idle, stageRef, at, at);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="shm-play--size"
      world={<ClassroomWorld />}
      round={round}
      solved={solved}
      say={say(right ? `Yes! The ${r.ask} one.` : wrong !== null ? clipText(WRONG) : askText)}
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
      <div ref={boardRef} className="shm-long-board">
        <div ref={refRef} className="shm-ref" role="img" aria-label={`A ${r.picture}`}>
          <Picture id={r.picture} />
        </div>
        <div className="shm-pair">
          {[0, 1].map((i) => (
            <SizeCard
              key={`${round}-${i}`}
              index={i}
              picture={r.picture}
              scale={i === r.bigSide ? 1 : r.smallScale}
              big={i === r.bigSide}
              wrong={wrong === i}
              lit={right && i === answer}
              live={!solved && !right}
              onTap={tap}
              register={register}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

const SizeCard = memo(function SizeCard({
  index,
  picture,
  scale,
  big,
  wrong,
  lit,
  live,
  onTap,
  register,
}: {
  index: number;
  picture: PictureId;
  scale: number;
  big: boolean;
  wrong: boolean;
  lit: boolean;
  live: boolean;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    register(index, ref.current);
    return () => register(index, null);
  }, [index, register]);
  const can = live && !wrong;
  return (
    <div className="shm-len" style={cssVars({ "--shm-k": "1" })}>
      <button
        ref={ref}
        type="button"
        className={`shm-lspot ${wrong ? "is-wrong" : ""} ${lit ? "is-lit" : ""}`}
        disabled={!can}
        onClick={can ? () => onTap(index) : undefined}
        aria-label={big ? "The big shadow" : "The small shadow"}
      >
        <span className="shm-lsil">
          <Shadow id={picture} size={scale} />
        </span>
        {wrong && (
          <span className="ng-cross" aria-hidden="true">
            <CrossMark />
          </span>
        )}
      </button>
    </div>
  );
});
