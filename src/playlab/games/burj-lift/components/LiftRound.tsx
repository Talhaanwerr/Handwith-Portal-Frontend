"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { animate } from "framer-motion";
import { playChime, playClickSound, playIncorrectSound } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import {
  BurjFloor,
  BurjGlow,
  BurjPodium,
  BurjSpire,
  floorShape,
} from "@shared/components/dubai/BurjTower";
import { DubaiWorld } from "@shared/components/dubai/DubaiWorld";
import { Balloon, LiftArrow, LiftCar, type LiftDir } from "@games/burj-lift/components/LiftArt";
import {
  ASK_UPDOWN,
  COLOUR_PAINT,
  FLOORS,
  FLOOR_COLOURS,
  FLOOR_PICS,
  ROUNDS,
  TRIPS,
  findClip,
  fromOf,
  goClip,
  type ModuleId,
} from "@games/burj-lift/constants/rounds";

/** A ride's length: a moment to start and stop, and a little more per floor
 *  (the car's CSS tween is given exactly this). */
const rideMs = (floors: number) => 500 + 420 * floors;
/** From arriving to the next passenger (or the win): the hop out. */
const HOP_MS = 1100;

/** Where the shaft stands, in width units right of the tower's centre line. */
const SHAFT_AT = 1.05;
/** How far each floor's right edge is from the shaft (its bracket's length). */
const REACH = Array.from({ length: FLOORS }, (_, i) => {
  const { width, shift } = floorShape(i, FLOORS);
  return SHAFT_AT - (shift + width / 2);
});
const FLOOR_LIST = Array.from({ length: FLOORS }, (_, i) => i);

type Phase = "ask" | "ride" | "out";

/** A wrong choice shakes (a tween: five keyframes). */
function shake(el: Element | null | undefined) {
  if (el) void animate(el, { x: [0, -10, 9, -5, 0] }, { duration: 0.4 });
}

/**
 * ONE ROUND OF LIFT RIDES — three passengers, one after another.
 *
 * A passenger pops into the glass lift and shows where they want to go: in
 * Up or Down? a bubble with the picture of their floor ("Up or down?"), in
 * Picture Floors a balloon of their floor's colour ("Find the red one!").
 * The right choice — the up or down button, or the floor of that colour —
 * rides the lift all the way there in one smooth trip; the passenger hops
 * out happy and the next one gets in. A wrong choice shakes, "Try again!",
 * the right one starts to glow, and the miss is counted (`onMiss`). Taps
 * while the lift is riding, or a passenger is stepping out, do nothing.
 */
export function LiftRoundOf({
  module,
  round,
  title,
  onDone,
  onMiss,
  onHome,
  onExitPortal,
}: RoundProps & { module: ModuleId }) {
  const r = ROUNDS[module][round];
  const updown = module === "updown";
  const time = updown ? "day" : "dusk";
  const stageRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<LiftDir, HTMLButtonElement | null>>({ up: null, down: null });
  const signRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const schedule = useScheduler();
  const [trip, setTrip] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  /** The floor the car is on, or heading to. */
  const [goal, setGoal] = useState(r.start);
  const [rideFor, setRideFor] = useState(0);
  /** Wrong choices for this passenger (the right one glows after one). */
  const [misses, setMisses] = useState(0);
  /** Set the moment a ride starts, so two quick taps never make two rides. */
  const busyRef = useRef(false);

  const t = r.trips[trip];
  const from = fromOf(r, trip);
  const want: LiftDir = t.to > from ? "up" : "down";
  const colour = FLOOR_COLOURS[t.to - 1];
  const ask = updown ? ASK_UPDOWN : findClip(colour);

  const cast = useMemo(
    () =>
      [...r.trips.map((x) => x.who), "star"].map((id) => (
        <span key={id} className="ng-cast">
          <Thing id={id} />
        </span>
      )),
    [r.trips]
  );
  const { solved, isSolved, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + (updown ? 31 : 37),
    stageRef,
    cast,
    onDone,
  });

  // every new passenger asks
  useEffect(() => {
    const id = setTimeout(() => void playSequence([ask]), trip === 0 ? 400 : 150);
    return () => clearTimeout(id);
  }, [trip, ask]);

  /** A press of a button (Up or Down?) or a tap on a floor (Picture Floors). */
  const choose = useCallback(
    (right: boolean, el: Element | null | undefined) => {
      if (busyRef.current || phase !== "ask" || isSolved()) return;
      if (!right) {
        playIncorrectSound();
        void playClip("instr-try-again");
        shake(el);
        setMisses((m) => m + 1);
        onMiss();
        return;
      }
      busyRef.current = true;
      playClickSound();
      void playClip(goClip(want === "up"));
      const ms = rideMs(Math.abs(t.to - from));
      setRideFor(ms);
      setGoal(t.to);
      setPhase("ride");
      schedule(() => {
        playChime();
        setPhase("out");
        schedule(() => {
          if (trip + 1 < TRIPS) {
            busyRef.current = false;
            setMisses(0);
            setTrip(trip + 1);
            setPhase("ask");
          } else finish(carRef.current);
        }, HOP_MS);
      }, ms);
    },
    [phase, isSolved, onMiss, want, t.to, from, schedule, trip, finish]
  );

  // the idle hand (and a miss) points at the right button, or the right floor
  const asking = phase === "ask" && !solved;
  const idle = useIdleHand(asking, `${trip}-${misses}`);
  const hint = asking && (idle || misses > 0);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const target = updown ? btnRefs.current[want] : signRefs.current[t.to - 1];
    const raf = requestAnimationFrame(() => setHand(centreIn(stageRef.current, target)));
    return () => cancelAnimationFrame(raf);
  }, [idle, updown, want, t.to]);

  const stopped = phase !== "ride";
  const waiting = r.trips.slice(trip + 1);

  const passengerWants =
    phase === "out" ? null : updown ? (
      <span className="bjl-bubble" aria-hidden="true">
        <span className="bjl-bubble-pic">
          <Thing id={FLOOR_PICS[t.to - 1]} />
        </span>
      </span>
    ) : (
      <span className="bjl-balloon" aria-hidden="true">
        <Balloon {...COLOUR_PAINT[colour]} />
      </span>
    );

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`bjl-play bjl-play--${module}`}
      world={<DubaiWorld time={time} />}
      round={round}
      solved={solved}
      say={say(clipText(ask))}
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
      <div className="bjl-board" data-phase={phase}>
        <div className="bjl-rig">
          {!updown && <BurjGlow strength={0.9} />}

          <div className="bjl-towerbox">
            <span className="bjk-spire-slot bjl-spire-slot">
              <BurjSpire time={time} />
            </span>
            <div className="bjk-floors">
              {FLOOR_LIST.map((i) => (
                <div key={i} className="bjk-slot">
                  <BurjFloor
                    index={i}
                    floors={FLOORS}
                    time={time}
                    lit={!updown || (stopped && goal === i + 1)}
                    live={!updown && hint && t.to === i + 1}
                  />
                </div>
              ))}
            </div>
            <BurjPodium time={time} />
          </div>

          {/* a sign beside every floor: its picture, or its colour (then the
              whole floor, sign and all, is a button) */}
          <div className="bjl-rows">
            {FLOOR_LIST.map((i) => {
              const n = i + 1;
              const state = `${phase === "out" && goal === n ? "bjl-sign--reached" : ""} ${
                hint && t.to === n ? "bjl-sign--hint" : ""
              }`;
              const style = { "--bjl-i": i } as CSSProperties;
              if (updown)
                return (
                  <span key={i} className="bjl-row" style={style} aria-hidden="true">
                    <span
                      ref={(el) => {
                        signRefs.current[i] = el;
                      }}
                      className={`bjl-sign bjl-sign--pic ${state}`}
                    >
                      <span className="bjl-sign-pic">
                        <Thing id={FLOOR_PICS[i]} />
                      </span>
                    </span>
                  </span>
                );
              const paint = COLOUR_PAINT[FLOOR_COLOURS[i]];
              return (
                <button
                  key={i}
                  type="button"
                  className="bjl-row bjl-row--tap"
                  style={style}
                  onClick={() => choose(n === t.to, signRefs.current[i])}
                  disabled={solved}
                  aria-label={`the ${FLOOR_COLOURS[i]} floor`}
                >
                  <span
                    ref={(el) => {
                      signRefs.current[i] = el;
                    }}
                    className={`bjl-sign bjl-sign--colour ${state}`}
                    style={{ "--bjl-face": paint.face, "--bjl-edge": paint.edge } as CSSProperties}
                  />
                </button>
              );
            })}
          </div>

          {/* the lift: two rails, a bracket to every floor, the car */}
          <div className="bjl-shaft">
            <span className="bjl-rail bjl-rail--l" aria-hidden="true" />
            <span className="bjl-rail bjl-rail--r" aria-hidden="true" />
            <span className="bjl-shaft-top" aria-hidden="true" />
            {FLOOR_LIST.map((i) => (
              <span
                key={i}
                className="bjl-arm"
                style={{ "--bjl-i": i, "--bjl-reach": REACH[i] } as CSSProperties}
                aria-hidden="true"
              />
            ))}
            <LiftCar
              passenger={t.who}
              riderKey={trip}
              phase={phase === "out" ? "out" : "in"}
              carRef={carRef}
              style={{
                translate: `0 calc(var(--bjk-f) * ${1 - goal})`,
                transitionDuration: `${rideFor}ms`,
              }}
              extra={passengerWants}
            />
          </div>
        </div>

        <div className="bjl-side">
          {/* who rides next, waiting on the sand */}
          <div className="bjl-queue" aria-hidden="true">
            {waiting.map((w) => (
              <span key={w.who} className="bjl-queue-pic">
                <Thing id={w.who} />
              </span>
            ))}
          </div>

          {updown && (
            <div className="bjl-station">
              <span className="bjl-panel">
                {(["up", "down"] as const).map((dir) => (
                  <button
                    key={dir}
                    ref={(el) => {
                      btnRefs.current[dir] = el;
                    }}
                    type="button"
                    className={`bjl-go bjl-go--${dir} ${asking ? "bjl-go--live" : ""} ${
                      hint && want === dir ? "bjl-go--hint" : ""
                    }`}
                    onClick={() => choose(dir === want, btnRefs.current[dir])}
                    disabled={solved}
                    aria-label={dir === "up" ? "go up" : "go down"}
                  >
                    <LiftArrow dir={dir} className="bjl-go-arrow" />
                  </button>
                ))}
              </span>
              <span className="bjl-post" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </NgStage>
  );
}

export function UpDownRound(props: RoundProps) {
  return <LiftRoundOf {...props} module="updown" />;
}
export function MatchRound(props: RoundProps) {
  return <LiftRoundOf {...props} module="match" />;
}
