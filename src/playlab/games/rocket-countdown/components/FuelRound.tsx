"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playChime, playClickSound, playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useFillDrag, type Seats } from "@games/birthday-party/hooks/useFillDrag";
import { useHandAt, type HandPath } from "@games/birthday-party/hooks/useHandAt";
import {
  FLIGHT_S,
  FuelBar,
  FuelCell,
  RocketOnPad,
  SpaceWorld,
  type Flight,
} from "@games/rocket-countdown/components/RocketParts";
import { BLAST, StarStreak, flightTo } from "@games/rocket-countdown/components/CountRound";
import { COUNTDOWN, FUEL_ROUNDS, TANK } from "@games/rocket-countdown/constants/rounds";

const FILL_WITH = "rkc-fill-with";
const COUNT_AGAIN = "mouse-count-again";

/** fill: cells in and out · check: counting a wrong amount · count: 3, 2, 1
 *  · fly: lift-off · won. */
type Phase = "fill" | "check" | "count" | "fly" | "won";

/** The tank fills from the bottom: a cell takes the lowest empty place. */
const lowestFree = (_zone: number, seats: Seats) => {
  const k = seats.indexOf(null);
  return k < 0 ? null : k;
};

const cell = () => <FuelCell />;

/**
 * FUEL THE ROCKET — one round (NUMERAL → QUANTITY, then a countdown).
 *
 * The rocket's fuel window shows how many star cells it needs. Drag cells
 * from the crate into the tank: each one is counted aloud and lights a bar
 * of the gauge; tap the tank to take the top cell out again. The Go! lever
 * appears after the first cell. Pulled with the right amount: an automatic
 * countdown (3, 2, 1, "Blast off!") and the rocket lifts off. With the wrong
 * amount the gauge glows softly twice (never a strobe), the cells in it are
 * counted aloud, the number is said again, and the child fixes it.
 */
export function FuelRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = FUEL_ROUNDS[round];
  const stageRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLSpanElement>(null);
  const tankRef = useRef<HTMLButtonElement | null>(null);
  const leverRef = useRef<HTMLButtonElement>(null);
  const run = useRef(0);
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>("fill");
  /** The bar being counted aloud after a wrong amount. */
  const [counting, setCounting] = useState<number | null>(null);
  /** The big number on show during the countdown. */
  const [shown, setShown] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const [trip, setTrip] = useState<{
    flight: Flight;
    streak: ReturnType<typeof flightTo>["streak"];
  } | null>(null);
  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <FuelCell />
        </span>
      )),
    []
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 4,
    stageRef,
    cast,
    onDone,
  });

  // "Fill the tank with… three!"
  useSayOnEnter([FILL_WITH, `number-${r.need}`]);
  useEffect(
    () => () => {
      run.current++;
    },
    []
  );

  const drag = useFillDrag({
    stageRef,
    seats: TANK,
    seatFor: lowestFree,
    locked: solved || phase !== "fill",
    onPlaced: (_seat, count) => sayNumber(count),
  });
  const { filled, count, remove } = drag;

  /** Tap the tank: the top cell comes out. */
  const takeOut = useCallback(() => {
    if (phase !== "fill" || drag.busy) return;
    const top = filled.reduce<number>((t, p, k) => (p === null ? t : k), -1);
    if (top < 0) return;
    remove(top);
    if (count - 1 > 0) sayNumber(count - 1);
  }, [count, drag.busy, filled, phase, remove]);

  const pull = useCallback(() => {
    if (phase !== "fill" || drag.busy || count === 0) return;
    playClickSound();
    const me = ++run.current;
    if (count === r.need) {
      // right: 3, 2, 1, blast off — then up and away
      setPhase("count");
      void playSequence([...COUNTDOWN.map((n) => `number-${n}`), BLAST], 320, (i) => {
        if (run.current !== me) return;
        setShown(i < COUNTDOWN.length ? COUNTDOWN[i] : 0);
        if (i < COUNTDOWN.length) playChime();
      }).then(() => {
        if (run.current !== me) return;
        setShown(null);
        setPhase("fly");
        setTrip(flightTo(stageRef.current, rocketRef.current, null, 0.8));
        schedule(() => {
          setPhase("won");
          burst(tankRef.current);
          playStarPop();
          finish(tankRef.current);
        }, FLIGHT_S * 1000);
      });
      return;
    }
    // wrong: the gauge glows, the cells are counted, the number said again
    playIncorrectSound();
    onMiss();
    setPhase("check");
    setFlash((f) => f + 1);
    const bars = filled.flatMap((p, k) => (p === null ? [] : [k]));
    void playClip(COUNT_AGAIN)
      .then(() =>
        playSequence(
          bars.map((_, i) => `number-${i + 1}`),
          220,
          (i) => {
            if (run.current === me) setCounting(bars[i]);
          }
        )
      )
      .then(() => {
        if (run.current !== me) return;
        setCounting(null);
        setPhase("fill");
        void sayAfter(FILL_WITH);
        void sayAfter(`number-${r.need}`);
      });
  }, [burst, count, drag.busy, filled, finish, onMiss, phase, r.need, schedule]);

  // ── the idle teaching hand: a cell into the tank, a tap on the tank to
  // take one out, or a tap on the lever ──
  const nextPiece = Array.from({ length: r.cells }, (_, p) => p).find((p) => !drag.away(p));
  const handKey = `${phase}-${count}`;
  const hand = useHandAt(
    !solved && !drag.busy && phase === "fill",
    handKey,
    (): HandPath | null => {
      const root = stageRef.current;
      const tap = (el: Element | null | undefined) => {
        const p = centreIn(root, el);
        return { fx: p.x, fy: p.y, tx: p.x, ty: p.y };
      };
      if (count === r.need) return tap(leverRef.current);
      if (count > r.need) return tap(tankRef.current);
      if (nextPiece === undefined) return null;
      const a = centreIn(root, drag.homeEl(nextPiece));
      const b = centreIn(root, tankRef.current);
      return { fx: a.x, fy: a.y, tx: b.x, ty: b.y };
    }
  );

  const fillLine = clipText(FILL_WITH);
  const prompt =
    phase === "check"
      ? clipText(COUNT_AGAIN)
      : phase === "count" || phase === "fly"
        ? clipText(BLAST)
        : fillLine
          ? `${fillLine} ${r.need}!`
          : "";

  return (
    <NgStage
      stageRef={stageRef}
      playClass="rkc-play rkc-play--fuel"
      world={<SpaceWorld />}
      round={round}
      solved={solved}
      say={say(prompt)}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {trip && <StarStreak streak={trip.streak} />}
          {overlay}
          {drag.layer(cell, "rkc-piece--cell")}
          {hand && <TeachingHand key={handKey} {...hand} />}
        </>
      }
    >
      <div className="rkc-fuel-board">
        <div className="rkc-fuel-ship">
          <div className="rkc-pad-col">
            <RocketOnPad
              lamps={0}
              lit={0}
              puff={phase === "fly" ? 1 : 0}
              flight={trip?.flight ?? null}
              rocketRef={rocketRef}
              window={r.need}
            />
          </div>
          <button
            ref={(el) => {
              tankRef.current = el;
              drag.registerZone(0, el);
            }}
            type="button"
            className={`rkc-tank ${drag.over === 0 ? "is-lit" : ""}`}
            onClick={takeOut}
            disabled={phase !== "fill" || count === 0}
            aria-label={`The fuel tank — ${count} cell${count === 1 ? "" : "s"} in it. Tap to take one out`}
          >
            <span className="rkc-tank-pipe" aria-hidden="true" />
            <span className="rkc-tank-glass">
              {Array.from({ length: TANK }, (_, k) => (
                <Gauge
                  key={k}
                  index={k}
                  shows={drag.shows(k)}
                  counted={counting === k}
                  register={drag.registerSeat}
                />
              ))}
            </span>
            {flash > 0 && <span key={flash} className="rkc-tank-flash" aria-hidden="true" />}
          </button>
        </div>

        <div className="rkc-fuel-controls">
          <div className={`rkc-crate ${phase !== "fill" ? "is-done" : ""}`}>
            {Array.from({ length: r.cells }, (_, p) => (
              <CrateCell
                key={p}
                piece={p}
                away={drag.away(p)}
                locked={solved || phase !== "fill"}
                onPick={drag.pickUp}
                register={drag.registerHome}
              />
            ))}
          </div>
          <div className="rkc-lever-slot">
            <AnimatePresence>
              {count > 0 && (
                <motion.button
                  key="lever"
                  ref={leverRef}
                  type="button"
                  className={`rkc-lever ${phase !== "fill" ? "is-pulled" : ""}`}
                  onClick={pull}
                  disabled={phase !== "fill"}
                  aria-label="Pull the Go lever"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <span className="rkc-lever-stick" aria-hidden="true">
                    <span className="rkc-lever-knob" />
                  </span>
                  <span className="rkc-lever-base font-rounded font-black">Go!</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {shown !== null && shown > 0 && (
          <motion.span
            key={shown}
            className="rkc-countdown font-rounded font-black"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            aria-hidden="true"
          >
            {shown}
          </motion.span>
        )}
      </AnimatePresence>
    </NgStage>
  );
}

/** One bar of the tank's gauge, lit when a cell is in it. */
const Gauge = memo(function Gauge({
  index,
  shows,
  counted,
  register,
}: {
  index: number;
  shows: boolean;
  counted: boolean;
  register: (k: number, el: HTMLElement | null) => void;
}) {
  return (
    <span
      ref={(el) => register(index, el)}
      className={`rkc-gauge ${shows ? "is-full" : ""} ${counted ? "is-counted" : ""}`}
    >
      {shows && <FuelBar />}
    </span>
  );
});

const CrateCell = memo(function CrateCell({
  piece,
  away,
  locked,
  onPick,
  register,
}: {
  piece: number;
  away: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, piece: number) => void;
  register: (p: number, el: HTMLElement | null) => void;
}) {
  return (
    <button
      ref={(el) => register(piece, el)}
      type="button"
      className={`rkc-piece rkc-piece--cell touch-none ${away ? "is-away" : ""}`}
      disabled={locked || away}
      onPointerDown={away || locked ? undefined : (e) => onPick(e, piece)}
      aria-label="A star cell — drag it into the tank"
    >
      <FuelCell />
    </button>
  );
});
