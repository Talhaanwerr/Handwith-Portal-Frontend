"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import { AnimatePresence, LayoutGroup, motion, useAnimationControls } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { PaxFigure } from "@games/plane-seats/components/SeatParts";
import type { Passenger } from "@games/plane-seats/constants/rounds";
import { AirportWorld, LuggageTag, Suitcase } from "@games/plane-trip/components/TripArt";
import { BAG_ROUNDS, type Bag } from "@games/plane-trip/constants/rounds";

/** A suitcase riding in on the belt, in seconds and milliseconds. */
const RIDE_S = 1.1;
const RIDE_MS = 1150;
/** The least time between a bag reaching its owner and the next riding in. */
const GIVE_MS = 1100;
/** To its owner: a shared layout animation carries the very same suitcase. */
const SLIDE = { type: "spring" as const, stiffness: 200, damping: 22 };
const SHAKE = { x: [0, -10, 9, -5, 0], transition: { duration: 0.4 } };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * ONE ROUND OF BAG MATCH — three suitcases, one after another.
 *
 * A suitcase rides in on the baggage belt; "Whose bag is this?" Each of the
 * three passengers holds a luggage tag with a picture of their own bag.
 * Tap the right passenger and the suitcase slides over to stand at their
 * feet ("Here's your bag!"); tap another and they shake, "Try again!", and
 * the owner starts to glow. Three bags, and the round is won.
 */
export function BagRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = BAG_ROUNDS[round];
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const ownerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** The bag on the belt (0–2, into `r.order`). */
  const [step, setStep] = useState(0);
  /** How many bags have reached their owners. */
  const [given, setGiven] = useState(0);
  /** The bag that has finished riding in (-1: none yet). */
  const [arrived, setArrived] = useState(-1);
  const [miss, setMiss] = useState<{ at: number; step: number } | null>(null);
  const [shakes, setShakes] = useState<Readonly<Record<number, number>>>({});
  const owner = r.order[step];

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const cast = useMemo(
    () =>
      [r.owners[0].who, r.owners[1].who].map((who, i) => (
        <span key={i} className="ng-cast">
          <Thing id={who} />
        </span>
      )),
    [r]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 61,
    stageRef,
    cast,
    onDone,
  });

  // the bag rides in on the belt, then the question
  useEffect(() => {
    const t = setTimeout(
      () => {
        setArrived(step);
        void playSequence(["ptr-whose"]);
      },
      step === 0 ? RIDE_MS + 250 : RIDE_MS
    );
    return () => clearTimeout(t);
  }, [step]);

  /** Owners whose bag is already with them. */
  const done = useMemo(() => new Set(r.order.slice(0, given)), [r.order, given]);
  const live = arrived === step && given === step && !solved;

  const pick = useCallback(
    (i: number) => {
      if (!live || isSolved() || done.has(i)) return;
      if (i !== owner) {
        playIncorrectSound();
        void playClip("instr-try-again");
        setMiss({ at: i, step });
        setShakes((s) => ({ ...s, [i]: (s[i] ?? 0) + 1 }));
        onMiss();
        return;
      }
      playStarPop();
      burst(ownerRefs.current[i]);
      const next = given + 1;
      setGiven(next);
      setMiss(null);
      void Promise.all([playSequence(["ptr-yours"], 150), wait(GIVE_MS)]).then(() => {
        if (!alive.current) return;
        if (next === 3) finish(rowRef.current);
        else setStep(next);
      });
    },
    [live, isSolved, done, owner, step, given, onMiss, burst, finish]
  );

  // the idle hand (and a miss) points at the bag's owner
  const idle = useIdleHand(live, `${step}-${given}`);
  const hint = live && (idle || miss?.step === step);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, ownerRefs.current[owner]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, owner]);

  const bagId = (i: number) => `ptr-bag-${round}-${i}`;
  const riding = arrived !== step && given === step;

  return (
    <NgStage
      stageRef={stageRef}
      playClass="ptr-play ptr-play--bags"
      world={<AirportWorld />}
      round={round}
      solved={solved}
      say={say(clipText("ptr-whose"))}
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
        <div className="ptr-board">
          <div ref={rowRef} className="ptr-owners">
            {r.owners.map((o, i) => (
              <Owner
                key={i}
                i={i}
                who={o.who}
                bag={o.bag}
                live={live && !done.has(i)}
                hint={hint && i === owner}
                happy={done.has(i)}
                shake={shakes[i] ?? 0}
                onTap={pick}
                ownerRef={(el) => {
                  ownerRefs.current[i] = el;
                }}
              >
                {done.has(i) && (
                  <motion.span layoutId={bagId(i)} className="ptr-bag" transition={SLIDE}>
                    <Suitcase bag={o.bag} />
                  </motion.span>
                )}
              </Owner>
            ))}
          </div>

          {/* the baggage belt */}
          <div className={`ptr-belt ${riding ? "ptr-belt--moving" : ""}`}>
            <span className="ptr-belt-band" aria-hidden="true" />
            <div className="ptr-belt-load">
              <AnimatePresence>
                {!done.has(owner) && (
                  <motion.div
                    key={step}
                    className="ptr-belt-spot"
                    initial={{ x: "260%" }}
                    animate={{ x: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.01 } }}
                    transition={{ duration: RIDE_S, ease: "easeOut" }}
                  >
                    <motion.span layoutId={bagId(owner)} className="ptr-bag" transition={SLIDE}>
                      <Suitcase bag={r.owners[owner].bag} />
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </NgStage>
  );
}

/** One passenger with their luggage tag; their bag stands at their feet. */
function Owner({
  i,
  who,
  bag,
  live,
  hint,
  happy,
  shake,
  onTap,
  ownerRef,
  children,
}: {
  i: number;
  who: Passenger;
  bag: Bag;
  live: boolean;
  hint: boolean;
  happy: boolean;
  shake: number;
  onTap: (i: number) => void;
  ownerRef: Ref<HTMLButtonElement>;
  children?: ReactNode;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake) void controls.start(SHAKE);
  }, [shake, controls]);
  return (
    <motion.button
      ref={ownerRef}
      type="button"
      className={`ptr-owner ${live ? "ptr-owner--live" : ""} ${hint ? "ptr-owner--hint" : ""} ${
        happy ? "ptr-owner--happy" : ""
      }`}
      animate={controls}
      onClick={() => onTap(i)}
      disabled={!live}
      aria-label={`the ${who}, whose tag shows a ${bag.colour} bag with ${bag.pattern}`}
    >
      <span className="ptr-owner-glow" aria-hidden="true" />
      <span className="ptr-owner-fig">
        <PaxFigure who={who} />
      </span>
      <span className="ptr-owner-tag">
        <LuggageTag bag={bag} />
      </span>
      <span className="ptr-owner-bag">{children}</span>
    </motion.button>
  );
}
