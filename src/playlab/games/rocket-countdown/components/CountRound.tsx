"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playChime, playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { Picture } from "@games/blend-read/components/PictureArt";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useHandAt } from "@games/birthday-party/hooks/useHandAt";
import {
  Destination,
  FLIGHT_S,
  NumberStar,
  RocketOnPad,
  SpaceWorld,
  Tower,
  type Flight,
} from "@games/rocket-countdown/components/RocketParts";
import { COUNT_ROUNDS, startOf, tapOrder } from "@games/rocket-countdown/constants/rounds";

const COUNT_FROM = "rkc-count-from";
/** "Blast off!" — said at lift-off here and after the fuel countdown. */
export const BLAST = "rkc-blast";
/** After each number but the last: "What comes next?" (Pattern Wall's line). */
const NEXT = "brick-pattern-next";

/** From tapping 1 to lift-off. */
const LIFT_AFTER_MS = 700;

/** The streak of stars behind a flying rocket: where (stage px) and when. */
interface Streak {
  x: number;
  y: number;
  delay: number;
}

/**
 * Where the rocket must travel to stand on top of `target`, and the streak
 * of stars along the way. Measured once, at lift-off.
 */
export function flightTo(
  root: HTMLElement | null,
  rocket: HTMLElement | null,
  target: HTMLElement | null,
  scale: number
): { flight: Flight; streak: Streak[] } {
  const a = centreIn(root, rocket);
  const h = rocket?.getBoundingClientRect().height ?? 0;
  const lift = h * 0.16;
  let tx = a.x;
  let ty = a.y - (root?.getBoundingClientRect().height ?? 600) - h;
  if (target) {
    const t = target.getBoundingClientRect();
    const c = centreIn(root, target);
    tx = c.x;
    ty = c.y - t.height / 2 - h * scale * 0.3;
  }
  const flight = { dx: tx - a.x, dy: ty - a.y, scale, lift };
  const streak = [0.3, 0.45, 0.6, 0.75, 0.9].map((t) => ({
    x: a.x + (tx - a.x) * t,
    y: a.y - lift + (ty - a.y + lift) * t,
    delay: FLIGHT_S * (0.15 + t * 0.8),
  }));
  return { flight, streak };
}

/** The little stars left behind a flying rocket (CSS fades, no frames). */
export function StarStreak({ streak }: { streak: readonly Streak[] }) {
  return (
    <>
      {streak.map((s, i) => (
        <span
          key={i}
          className="rkc-streak pl-at"
          style={cssVars({
            "--pl-x": `${s.x}px`,
            "--pl-y": `${s.y}px`,
            "--rkc-delay": `${s.delay.toFixed(2)}s`,
          })}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/**
 * COUNT DOWN — one round (COUNTING BACKWARDS).
 *
 * Big numbered stars hang on the launch tower in mixed places — "Count down
 * from five!" Tap them from the biggest down to 1: each right star says its
 * number, switches one of the rocket's lights on and puffs smoke from the
 * pad. A wrong star shakes gently and the right one glows — it is NOT
 * crossed out, because it is needed later in the countdown (the one
 * exception to the cross-out rule). At 1: "Blast off!" — the rocket lifts
 * off smoothly, leaves a streak of stars, and lands on the planet.
 */
export function CountRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = COUNT_ROUNDS[round];
  const top = startOf(r);
  const order = useMemo(() => tapOrder(r), [r]);
  const stageRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLSpanElement>(null);
  const planetRef = useRef<HTMLSpanElement>(null);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const schedule = useScheduler();
  /** How many stars have been tapped, right, in order. */
  const [done, setDone] = useState(0);
  /** After a wrong tap, the right star glows until it is tapped. */
  const [glow, setGlow] = useState(false);
  const [trip, setTrip] = useState<{ flight: Flight; streak: Streak[] } | null>(null);
  const [landed, setLanded] = useState(false);
  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <Picture id="star" />
        </span>
      )),
    []
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  // "Count down from… five!"
  useSayOnEnter([COUNT_FROM, `number-${top}`]);

  const next = top - done;
  const nextSlot = order[done];

  const tap = useCallback(
    (slot: number) => {
      if (isSolved() || trip || done >= order.length) return;
      const n = r.tower[slot];
      if (n === null || n > next) return; // already counted
      if (n !== next) {
        playIncorrectSound();
        shake(starRefs.current[slot]);
        setGlow(true);
        onMiss();
        return;
      }
      const count = done + 1;
      setDone(count);
      setGlow(false);
      burst(starRefs.current[slot]);
      playStarPop();
      sayNumber(n);
      if (n !== 1) {
        void sayAfter(NEXT);
        return;
      }
      // 1 — blast off, then land on the planet
      schedule(() => {
        void sayAfter(BLAST);
        playChime();
        setTrip(flightTo(stageRef.current, rocketRef.current, planetRef.current, 0.42));
      }, LIFT_AFTER_MS);
      schedule(
        () => {
          setLanded(true);
          burst(planetRef.current);
          finish(planetRef.current);
        },
        LIFT_AFTER_MS + FLIGHT_S * 1000 + 100
      );
    },
    [burst, done, finish, isSolved, next, onMiss, order.length, r.tower, schedule, trip]
  );

  const register = useCallback((slot: number, el: HTMLButtonElement | null) => {
    starRefs.current[slot] = el;
  }, []);

  // the idle hand taps the next star
  const hand = useHandAt(!solved && !trip && done < order.length, `${done}`, () => {
    const p = centreIn(stageRef.current, starRefs.current[nextSlot]);
    return { fx: p.x, fy: p.y, tx: p.x, ty: p.y };
  });

  const countLine = clipText(COUNT_FROM);
  const prompt = trip
    ? clipText(BLAST)
    : done > 0
      ? clipText(NEXT)
      : countLine
        ? `${countLine} ${top}!`
        : "";

  return (
    <NgStage
      stageRef={stageRef}
      playClass="rkc-play rkc-play--count"
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
          {hand && <TeachingHand key={done} {...hand} />}
        </>
      }
    >
      <div className="rkc-count-board">
        <div className="rkc-pad-col">
          <RocketOnPad
            lamps={top}
            lit={done}
            puff={done}
            flight={trip?.flight ?? null}
            rocketRef={rocketRef}
          />
        </div>
        <Tower>
          {r.tower.map((n, slot) =>
            n === null ? (
              <span key={slot} className="rkc-slot" aria-hidden="true" />
            ) : (
              <StarButton
                key={slot}
                slot={slot}
                n={n}
                counted={n > next}
                glow={glow && slot === nextSlot}
                live={!solved && !trip}
                onTap={tap}
                register={register}
              />
            )
          )}
        </Tower>
        <Destination planetRef={planetRef} landed={landed} />
      </div>
    </NgStage>
  );
}

const StarButton = memo(function StarButton({
  slot,
  n,
  counted,
  glow,
  live,
  onTap,
  register,
}: {
  slot: number;
  n: number;
  /** Already counted down — lit, and taps do nothing. */
  counted: boolean;
  /** The one to tap now, shown after a wrong tap. */
  glow: boolean;
  live: boolean;
  onTap: (slot: number) => void;
  register: (slot: number, el: HTMLButtonElement | null) => void;
}) {
  const can = live && !counted;
  return (
    <motion.button
      ref={(el) => register(slot, el)}
      type="button"
      className={`rkc-slot rkc-star-btn ${counted ? "is-counted" : ""} ${glow ? "is-glow" : ""}`}
      disabled={!can}
      onClick={can ? () => onTap(slot) : undefined}
      aria-label={counted ? `${n} — counted` : `Star number ${n}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + slot * 0.06, duration: 0.3, ease: "easeOut" }}
    >
      <NumberStar n={n} />
    </motion.button>
  );
});
