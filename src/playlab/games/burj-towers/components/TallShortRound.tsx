"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playSnapSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { DubaiWorld } from "@shared/components/dubai/DubaiWorld";
import { Tower } from "@games/burj-towers/components/Tower";
import { BACK_MS, SNAP_MS, useFlights } from "@games/burj-towers/components/useFlights";
import {
  SIDES,
  TALLSHORT_ROUNDS,
  TRY_AGAIN_CLIP,
  answerFor,
  askClip,
  type Side,
} from "@games/burj-towers/constants/rounds";

/** From the star landing on the right spire to the next question. */
const NEXT_MS = 1500;
/** How long the bar shows "Try again!" after a wrong drop. */
const RETRY_MS = 2200;

/** The one piece of this module. */
type Star = "star";

/**
 * TALL OR SHORT? — one round: two towers side by side on a sunny day, one
 * gold and one silver, of clearly different heights, a big gold star waiting
 * in its little holder on the sand between them, and two or three questions
 * in a row: "Which tower is taller?" / "Which tower is shorter?".
 *
 * The child DRAGS the star (the portal's `useDragDrop`: it follows the
 * finger, nothing re-renders on a move) onto a tower, which lights up while
 * the star is over it. The right tower: the star glides up onto its spire and
 * sticks, the tower glows, and a moment later a new star pops into the
 * holder and the next question is asked. A wrong tower: the star glides home,
 * the tower shakes, "Try again!", and the right one starts to glow (as it
 * does when the idle hand comes). Let go on the sand: it only glides home.
 * After the last question the round is won, the star staying on the last
 * right tower.
 */
export function TallShortRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = TALLSHORT_ROUNDS[round];
  const shape = Math.max(r.left, r.right);
  const stageRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLSpanElement>(null);
  const towers = useRef(new Map<Side, HTMLElement>());
  const floorsRefs = useRef<Record<Side, HTMLSpanElement | null>>({ left: null, right: null });
  const spots = useRef<Record<Side, HTMLSpanElement | null>>({ left: null, right: null });
  const schedule = useScheduler();
  /** Which question is being asked. */
  const [q, setQ] = useState(0);
  const [miss, setMiss] = useState<{ side: Side; n: number } | null>(null);
  const [shakes, setShakes] = useState<Readonly<Record<Side, number>>>({ left: 0, right: 0 });
  /** The tower whose spire has the star, until the next question. */
  const [right, setRight] = useState<Side | null>(null);
  /** The bar says "Try again!" (the miss it belongs to), for a moment. */
  const [retry, setRetry] = useState<number | null>(null);
  /** True from a right drop until the next question is asked. */
  const busy = useRef(true);
  /** The first question has been asked (no drags before it). */
  const [ready, setReady] = useState(false);
  const [slop, setSlop] = useState(24);
  const ask = r.ask[q];
  const answer = answerFor(r, ask);
  const flights = useFlights<Star>();

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

  /** The star glides back into its holder. */
  const home = useCallback(
    (from: { x: number; y: number }) =>
      flights.fly("star", from, centreIn(stageRef.current, holderRef.current), { ms: BACK_MS }),
    [flights]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<Star, Side>({
    root: stageRef,
    targets: towers,
    slopPx: slop,
    onDrop: (_star, side, info) => {
      if (!info.moved || side === null || busy.current || isSolved()) {
        home(info);
        return;
      }
      if (side !== answer) {
        playIncorrectSound();
        void playClip(TRY_AGAIN_CLIP);
        const n = (miss?.n ?? 0) + 1;
        setMiss({ side, n });
        setShakes((s) => ({ ...s, [side]: s[side] + 1 }));
        setRetry(n);
        schedule(() => setRetry((v) => (v === n ? null : v)), RETRY_MS);
        onMiss();
        home(info);
        return;
      }
      busy.current = true;
      playSnapSound();
      const spot = spots.current[side];
      const piece = holderRef.current?.getBoundingClientRect().width ?? 0;
      const onSpire = spot?.getBoundingClientRect().width ?? 0;
      flights.fly("star", info, centreIn(stageRef.current, spot), {
        ms: SNAP_MS,
        s1: piece > 0 && onSpire > 0 ? onSpire / piece : 1,
        land: () => {
          playStarPop();
          setMiss(null);
          setRetry(null);
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
      });
    },
  });

  const pickUp = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (busy.current || isSolved()) return;
      const t = towers.current.get("left")?.getBoundingClientRect();
      if (t) setSlop(Math.round(t.width * 0.2));
      if (start(e, "star")) {
        playPickUpSound();
        setRetry(null);
      }
    },
    [isSolved, start]
  );

  // the idle hand (and a miss) shows the star going to the tower asked for
  const away = dragging !== null || flights.busy || right !== null;
  const waiting = ready && !away && !solved;
  const idle = useIdleHand(waiting, `${q}-${miss?.n ?? 0}`);
  const hint = ready && right === null && !solved && (idle || miss !== null);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() => {
      const a = centreIn(stageRef.current, holderRef.current);
      const b = centreIn(stageRef.current, floorsRefs.current[answer]);
      setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    });
    return () => cancelAnimationFrame(raf);
  }, [idle, answer]);

  const sizes = cssVars({ "--bjt-n": shape });
  return (
    <NgStage
      stageRef={stageRef}
      playClass="bjt-play bjt-play--tallshort"
      world={<DubaiWorld time="day" />}
      round={round}
      solved={solved}
      say={say(clipText(retry !== null ? TRY_AGAIN_CLIP : askClip(ask)))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          <div className="bjt-carry" style={sizes}>
            {flights.layer(() => (
              <span className="bjt-carried-star">
                <Thing id="star" />
              </span>
            ))}
            {dragging !== null && (
              <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
                <span className="bjt-carried-star bjt-carried--lifted">
                  <Thing id="star" />
                </span>
              </div>
            )}
          </div>
          {idle && hand && (
            <TeachingHand key={q} fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
          )}
        </>
      }
    >
      <div className="bjt-board" style={sizes}>
        {SIDES.map((side) => {
          const gold = r.gold === side;
          return (
            <div key={side} className={`bjt-col bjt-col--${side}`}>
              <Tower
                floors={r[side]}
                shape={shape}
                variant={gold ? "gold" : "glass"}
                time="day"
                hint={hint && side === answer}
                happy={right === side}
                over={over === side}
                star={right === side ? q : null}
                shake={shakes[side]}
                towerRef={(el) => {
                  if (el) towers.current.set(side, el);
                  else towers.current.delete(side);
                }}
                floorsRef={(el) => {
                  floorsRefs.current[side] = el;
                }}
                starRef={(el) => {
                  spots.current[side] = el;
                }}
                label={gold ? "the gold tower" : "the silver tower"}
              />
            </div>
          );
        })}

        {/* the star's little holder on the sand, between the towers */}
        <div className="bjt-holder">
          <span ref={holderRef} className="bjt-holder-spot">
            <span className="bjt-holder-mark" aria-hidden="true">
              <Thing id="star" />
            </span>
            {right === null && !solved && (
              <motion.button
                key={q}
                type="button"
                className={`bjt-star-piece ${away ? "is-away" : ""} ${
                  waiting ? "bjt-star-piece--live" : ""
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onPointerDown={pickUp}
                aria-label="The gold star — drag it onto the tower"
              >
                <Thing id="star" />
              </motion.button>
            )}
          </span>
          <span className="bjt-holder-base" aria-hidden="true" />
        </div>
      </div>
    </NgStage>
  );
}
