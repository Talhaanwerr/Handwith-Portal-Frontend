"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { playIncorrectSound, playSnapSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, sayAfter } from "@shared/audio/voice";
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
  LINED_CLIP,
  ORDER_CLIP,
  ORDER_ROUNDS,
  shortToTall,
} from "@games/burj-towers/constants/rounds";

/** How a picked tower slides onto the stand. */
const SLIDE = { type: "spring", stiffness: 210, damping: 24 } as const;
/** The light show: from the last tower landing to the first spire lighting,
 *  then one spire after another, then the round is won. */
const SHOW_AT = 650;
const SHOW_STEP = 420;
const PLACES = [0, 1, 2] as const;

/**
 * LINE THEM UP — one round of putting in order, on a Dubai evening.
 *
 * Three towers of different heights stand in a jumbled row; a stand of three
 * places waits beside them, a gold ramp under it growing from thin to thick
 * (short to tall). "Put them in order, from short to tall!" Tap the shortest
 * and a shared layout animation slides that very tower onto the first place,
 * then the middle one, then the tallest. Tap any other and it shakes, "Try
 * again!", and the right one glows. When all three are lined up their spires
 * light one after another, "Short, taller, tallest!", and the round is won.
 */
export function OrderRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = ORDER_ROUNDS[round];
  const shape = Math.max(...r.row);
  const order = useMemo(() => shortToTall(r), [r]);
  const stageRef = useRef<HTMLDivElement>(null);
  const standRef = useRef<HTMLDivElement>(null);
  const floorsRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const schedule = useScheduler();
  /** The row's towers (by place in the row) on the stand, in the order picked. */
  const [placed, setPlaced] = useState<readonly number[]>([]);
  const placedRef = useRef<readonly number[]>([]);
  const [miss, setMiss] = useState<{ at: number; n: number } | null>(null);
  const [shakes, setShakes] = useState<readonly number[]>([0, 0, 0]);
  /** How many spires are lit in the light show. */
  const [lights, setLights] = useState(0);
  /** The line has been said (no taps before it). */
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const lined = placed.length === 3;
  const next = order[placed.length];

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
    cheerSeed: round + 47,
    stageRef,
    cast,
    onDone,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      readyRef.current = true;
      setReady(true);
      void playSequence([ORDER_CLIP]);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const pick = useCallback(
    (i: number) => {
      const done = placedRef.current;
      if (!readyRef.current || done.length === 3 || done.includes(i) || isSolved()) return;
      if (i !== order[done.length]) {
        playIncorrectSound();
        void playClip("instr-try-again");
        setMiss((m) => ({ at: i, n: (m?.n ?? 0) + 1 }));
        setShakes((s) => s.map((v, k) => (k === i ? v + 1 : v)));
        onMiss();
        return;
      }
      playSnapSound();
      const now = [...done, i];
      placedRef.current = now;
      setPlaced(now);
      setMiss(null);
      if (now.length < 3) return;
      for (const k of [1, 2, 3])
        schedule(
          () => {
            setLights(k);
            playStarPop();
            if (k === 1) void sayAfter(LINED_CLIP);
          },
          SHOW_AT + (k - 1) * SHOW_STEP
        );
      schedule(() => finish(standRef.current), SHOW_AT + 3 * SHOW_STEP);
    },
    [order, isSolved, onMiss, schedule, finish]
  );

  // the idle hand (and a miss) points at the tower to pick next
  const waiting = ready && !lined && !solved;
  const idle = useIdleHand(waiting, `${placed.length}-${miss?.n ?? 0}`);
  const hint = waiting && (idle || miss !== null);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle || next === undefined) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, floorsRefs.current[next]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, next]);

  /** Tower `i` of the row, standing in the row or (at `spot`) on the stand. */
  const tower = (i: number, spot?: number) => {
    const lit = spot !== undefined && lights > spot;
    return (
      <motion.div key={i} layoutId={`bjt-${round}-${i}`} className="bjt-mover" transition={SLIDE}>
        <TowerButton
          floors={r.row[i]}
          shape={shape}
          variant={r.gold === i ? "gold" : "glass"}
          time="dusk"
          live={spot === undefined && waiting}
          hint={spot === undefined && hint && i === next}
          shine={lit}
          glow={lit ? 1 : 0}
          shake={shakes[i]}
          onTap={() => pick(i)}
          floorsRef={(el) => {
            floorsRefs.current[i] = el;
          }}
          label={r.gold === i ? "the gold tower" : "a silver tower"}
        />
      </motion.div>
    );
  };

  return (
    <NgStage
      stageRef={stageRef}
      playClass="bjt-play bjt-play--order"
      world={<DubaiWorld time="dusk" />}
      round={round}
      solved={solved}
      say={say(clipText(lined ? LINED_CLIP : ORDER_CLIP))}
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
      <LayoutGroup>
        <div className="bjt-board" style={{ "--bjt-n": shape } as CSSProperties}>
          {/* the jumbled row */}
          <div className="bjt-row">
            {PLACES.map((i) => (
              <div key={i} className="bjt-place">
                {!placed.includes(i) && tower(i)}
              </div>
            ))}
          </div>

          {/* the stand: three places, short to tall */}
          <div ref={standRef} className="bjt-stand">
            <div className="bjt-stand-places">
              {PLACES.map((k) => (
                <div
                  key={k}
                  className={`bjt-place bjt-place--stand ${
                    waiting && k === placed.length ? "bjt-place--next" : ""
                  }`}
                >
                  <span className="bjt-pad" aria-hidden="true" />
                  {placed[k] !== undefined && tower(placed[k], k)}
                </div>
              ))}
            </div>
            <span className="bjt-ramp" aria-hidden="true" />
          </div>
        </div>
      </LayoutGroup>
    </NgStage>
  );
}
