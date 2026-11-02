"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { CabinWorld } from "@games/plane-seats/components/CabinWorld";
import { PaxFigure, Seat, Ticket } from "@games/plane-seats/components/SeatParts";
import {
  SEATS,
  TICKET_ROUNDS,
  findClip,
  type TicketModule,
} from "@games/plane-seats/constants/rounds";

/** A passenger walking up the aisle, in seconds and in milliseconds. */
const WALK_S = 0.9;
const WALK_MS = 950;
/** The least time between a passenger sitting down and the next walking up. */
const SIT_MS = 1100;
/** Into the seat: a shared layout animation carries the very same passenger. */
const SLIDE = { type: "spring" as const, stiffness: 200, damping: 22 };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * ONE ROUND OF BOARDING — three passengers, one after another.
 *
 * A passenger walks up the aisle holding a boarding pass; "Find the seat
 * with this number!" (or "Add up the ticket. Find the seat!"). Tap the seat
 * with that number and the passenger slides into it, the pass is stamped
 * (a sum's "?" fills in) and the seat's number is said. Tap
 * another seat and it shakes, "Try again!", and the right seat glows. A
 * seat that is taken cannot be tapped. When the third passenger is in their
 * seat the round is won.
 */
export function TicketRoundOf({
  module,
  round,
  title,
  onDone,
  onMiss,
  onHome,
  onExitPortal,
}: RoundProps & { module: TicketModule }) {
  const trips = TICKET_ROUNDS[module][round];
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const seatRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** The passenger in the aisle (0–2). */
  const [step, setStep] = useState(0);
  /** How many passengers are in their seats. */
  const [sat, setSat] = useState(0);
  /** The passenger who has finished walking up (-1: none yet). */
  const [arrived, setArrived] = useState(-1);
  /** The last wrong seat, and for which passenger. */
  const [miss, setMiss] = useState<{ seat: number; step: number } | null>(null);
  /** Per seat: how many times it has been shaken. */
  const [shakes, setShakes] = useState<Readonly<Record<number, number>>>({});
  const trip = trips[step];

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const cast = useMemo(
    () =>
      [trips[0].who, trips[1].who].map((who, i) => (
        <span key={i} className="ng-cast">
          <Thing id={who} />
        </span>
      )),
    [trips]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + (module === "number" ? 41 : 47),
    stageRef,
    cast,
    onDone,
  });

  // the passenger walks up the aisle, then the line
  useEffect(() => {
    const t = setTimeout(
      () => {
        setArrived(step);
        void playSequence([findClip(module)]);
      },
      step === 0 ? WALK_MS + 250 : WALK_MS
    );
    return () => clearTimeout(t);
  }, [step, module]);

  /** Seat number → the passenger (index) sitting in it. */
  const seatedIn = useMemo(() => {
    const m = new Map<number, number>();
    trips.slice(0, sat).forEach((t, i) => m.set(t.seat, i));
    return m;
  }, [trips, sat]);

  const live = arrived === step && sat === step && !solved;

  const pick = useCallback(
    (n: number) => {
      if (!live || isSolved() || seatedIn.has(n)) return;
      if (n !== trip.seat) {
        playIncorrectSound();
        void playClip("instr-try-again");
        setMiss({ seat: n, step });
        setShakes((s) => ({ ...s, [n]: (s[n] ?? 0) + 1 }));
        onMiss();
        return;
      }
      playStarPop();
      burst(seatRefs.current[n - 1]);
      const next = sat + 1;
      setSat(next);
      setMiss(null);
      // just the seat's number: the whole sum spoken ("2 plus 1 is 3") kept
      // the next passenger waiting for seconds
      void Promise.all([playSequence([`number-${n}`], 150), wait(SIT_MS)]).then(() => {
        if (!alive.current) return;
        if (next === trips.length) finish(rowRef.current);
        else setStep(next);
      });
    },
    [live, isSolved, seatedIn, trip, step, sat, trips.length, onMiss, burst, finish]
  );

  // the idle hand (and a miss) points at the seat on the ticket
  const idle = useIdleHand(live, `${step}-${sat}`);
  const hint = live && (idle || miss?.step === step);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, seatRefs.current[trip.seat - 1]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, trip.seat]);

  const paxId = (i: number) => `pls-pax-${module}-${round}-${i}`;
  const walking = arrived !== step;

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`pls-play pls-play--${module}`}
      world={<CabinWorld />}
      round={round}
      solved={solved}
      say={say(clipText(findClip(module)))}
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
        <div className="pls-board">
          <div ref={rowRef} className="pls-row">
            {SEATS.map((n) => {
              const who = seatedIn.get(n);
              return (
                <Seat
                  key={n}
                  n={n}
                  live={live && who === undefined}
                  hint={hint && n === trip.seat}
                  taken={who !== undefined}
                  shake={shakes[n] ?? 0}
                  onTap={pick}
                  seatRef={(el) => {
                    seatRefs.current[n - 1] = el;
                  }}
                  label={who !== undefined ? `seat ${n}, taken` : `seat ${n}`}
                >
                  {who !== undefined && (
                    <motion.div
                      layoutId={paxId(who)}
                      className="pls-pax pls-pax--seated"
                      transition={SLIDE}
                    >
                      <PaxFigure who={trips[who].who} />
                    </motion.div>
                  )}
                </Seat>
              );
            })}
          </div>

          {/* the aisle: the passenger with their boarding pass */}
          <div className="pls-aisle">
            <AnimatePresence>
              <motion.div
                key={step}
                className="pls-boarding"
                initial={{ x: "70%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-50%", opacity: 0, transition: { duration: 0.4 } }}
                transition={{ duration: WALK_S, ease: "easeOut" }}
              >
                <div className="pls-pax-slot">
                  {sat <= step && (
                    <motion.div layoutId={paxId(step)} className="pls-pax" transition={SLIDE}>
                      <span className={`pls-pax-step ${walking ? "pls-pax-step--walk" : ""}`}>
                        <PaxFigure who={trip.who} />
                      </span>
                    </motion.div>
                  )}
                </div>
                <Ticket seat={trip.seat} sum={trip.sum} used={sat > step} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </LayoutGroup>
    </NgStage>
  );
}

export function NumberRound(props: RoundProps) {
  return <TicketRoundOf {...props} module="number" />;
}
export function SumsRound(props: RoundProps) {
  return <TicketRoundOf {...props} module="sums" />;
}
