"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { DubaiWorld } from "@shared/components/dubai/DubaiWorld";
import { TowerButton } from "@games/burj-towers/components/TowerButton";
import {
  SIDES,
  TALLSHORT_ROUNDS,
  answerFor,
  askClip,
  type Side,
} from "@games/burj-towers/constants/rounds";

/** From a right pick (the glow and the star) to the next question. */
const NEXT_MS = 1500;

/**
 * TALL OR SHORT? — one round: two towers side by side on a sunny day, one
 * gold and one silver, of clearly different heights, and two or three
 * questions in a row: "Which tower is taller?" / "Which tower is shorter?".
 *
 * Each whole tower is one big button. The right one glows and a gold star
 * pops onto its spire; a moment later the star goes and the next question is
 * asked. The wrong one shakes, "Try again!", and the right one starts to glow
 * (as it does when the idle hand comes). After the last question the round
 * is won, the star staying on the last right tower.
 */
export function TallShortRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = TALLSHORT_ROUNDS[round];
  const shape = Math.max(r.left, r.right);
  const stageRef = useRef<HTMLDivElement>(null);
  const floorsRefs = useRef<Record<Side, HTMLSpanElement | null>>({ left: null, right: null });
  const schedule = useScheduler();
  /** Which question is being asked. */
  const [q, setQ] = useState(0);
  const [miss, setMiss] = useState<{ side: Side; n: number } | null>(null);
  const [shakes, setShakes] = useState<Readonly<Record<Side, number>>>({ left: 0, right: 0 });
  /** The tower just picked right (glowing, with the star), until the next question. */
  const [right, setRight] = useState<Side | null>(null);
  /** True from a right pick until the next question is asked. */
  const busy = useRef(true);
  /** The first question has been asked (no taps before it). */
  const [ready, setReady] = useState(false);
  const ask = r.ask[q];
  const answer = answerFor(r, ask);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <Thing id="star" />
        </span>
      )),
    []
  );
  const { solved, isSolved, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 43,
    stageRef,
    cast,
    onDone,
  });

  // the round's first question
  useEffect(() => {
    const t = setTimeout(() => {
      busy.current = false;
      setReady(true);
      void playSequence([askClip(r.ask[0])]);
    }, 400);
    return () => clearTimeout(t);
  }, [r.ask]);

  const pick = useCallback(
    (side: Side) => {
      if (busy.current || isSolved()) return;
      if (side !== answer) {
        playIncorrectSound();
        void playClip("instr-try-again");
        setMiss((m) => ({ side, n: (m?.n ?? 0) + 1 }));
        setShakes((s) => ({ ...s, [side]: s[side] + 1 }));
        onMiss();
        return;
      }
      busy.current = true;
      playStarPop();
      setMiss(null);
      setRight(side);
      if (q === r.ask.length - 1) {
        finish(floorsRefs.current[side]);
        return;
      }
      schedule(() => {
        setRight(null);
        setQ(q + 1);
        busy.current = false;
        void playSequence([askClip(r.ask[q + 1])]);
      }, NEXT_MS);
    },
    [answer, isSolved, onMiss, q, r.ask, finish, schedule]
  );

  // the idle hand (and a miss) points at the tower the question asks for
  const waiting = ready && right === null && !solved;
  const idle = useIdleHand(waiting, `${q}-${miss?.n ?? 0}`);
  const hint = waiting && (idle || miss !== null);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, floorsRefs.current[answer]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, answer]);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="bjt-play bjt-play--tallshort"
      world={<DubaiWorld time="day" />}
      round={round}
      solved={solved}
      say={say(clipText(askClip(ask)))}
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
      <div className="bjt-board" style={{ "--bjt-n": shape } as CSSProperties}>
        {SIDES.map((side) => {
          const gold = r.gold === side;
          return (
            <div key={side} className={`bjt-col bjt-col--${side}`}>
              <TowerButton
                floors={r[side]}
                shape={shape}
                variant={gold ? "gold" : "glass"}
                time="day"
                live={waiting}
                hint={hint && side === answer}
                happy={right === side}
                star={right === side ? q : null}
                shake={shakes[side]}
                onTap={() => pick(side)}
                floorsRef={(el) => {
                  floorsRefs.current[side] = el;
                }}
                label={gold ? "the gold tower" : "the silver tower"}
              />
            </div>
          );
        })}
      </div>
    </NgStage>
  );
}
