"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import { LayoutGroup, motion, useAnimationControls } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { AirportWorld, ItemPicture, Snowflake } from "@games/plane-trip/components/TripArt";
import {
  ITEM_NAME,
  ITEM_TRIP,
  PACK_ROUNDS,
  TRIPS,
  type Trip,
} from "@games/plane-trip/constants/rounds";

/** The least time between a thing going in and the next one appearing. */
const PACKED_MS = 1100;
/** Into the case: a shared layout animation carries the very same thing. */
const SLIDE = { type: "spring" as const, stiffness: 210, damping: 22 };
const SHAKE = { x: [0, -10, 9, -5, 0], transition: { duration: 0.4 } };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * ONE ROUND OF PACKING — four things, one after another, into two cases.
 *
 * The sunny-trip case (a sun sticker on its lid) and the snowy-trip case (a
 * snowflake) stand open. A thing to pack pops up on its plate; "Where does
 * it go?" Tap the right case and it flies in ("The sunny suitcase!"); tap
 * the other and it shakes, "Try again!", and the right one glows. When all
 * four are packed the lids shut, "Off we go!", the plane outside takes off,
 * and the round is won.
 */
export function PackRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const items = PACK_ROUNDS[round];
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const caseRefs = useRef<Partial<Record<Trip, HTMLButtonElement | null>>>({});
  /** The thing on the plate (0–3). */
  const [step, setStep] = useState(0);
  /** How many things are packed. */
  const [packed, setPacked] = useState(0);
  /** The thing that has finished popping up (-1: none yet). */
  const [shown, setShown] = useState(-1);
  const [miss, setMiss] = useState<{ at: Trip; step: number } | null>(null);
  const [shakes, setShakes] = useState<Readonly<Partial<Record<Trip, number>>>>({});
  /** The end: the lids shut, then the plane takes off. */
  const [closed, setClosed] = useState(false);
  const [takeoff, setTakeoff] = useState(false);
  const item = items[step];
  const trip = ITEM_TRIP[item];

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const cast = useMemo(
    () =>
      ["sun", "jacket"].map((id) => (
        <span key={id} className="ng-cast">
          <Thing id={id} />
        </span>
      )),
    []
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 67,
    stageRef,
    cast,
    onDone,
  });

  // the thing pops up on its plate, then the question
  useEffect(() => {
    const t = setTimeout(
      () => {
        setShown(step);
        void playSequence(["ptr-where"]);
      },
      step === 0 ? 700 : 450
    );
    return () => clearTimeout(t);
  }, [step]);

  const live = shown === step && packed === step && !solved && !closed;

  const pick = useCallback(
    (t: Trip) => {
      if (!live || isSolved()) return;
      if (t !== trip) {
        playIncorrectSound();
        void playClip("instr-try-again");
        setMiss({ at: t, step });
        setShakes((s) => ({ ...s, [t]: (s[t] ?? 0) + 1 }));
        onMiss();
        return;
      }
      playStarPop();
      burst(caseRefs.current[t]);
      const next = packed + 1;
      setPacked(next);
      setMiss(null);
      void Promise.all([playSequence([`ptr-${t}`], 150), wait(PACKED_MS)]).then(async () => {
        if (!alive.current) return;
        if (next < items.length) {
          setStep(next);
          return;
        }
        // all packed: shut the cases, "Off we go!", and up goes the plane
        setClosed(true);
        void playSequence(["ptr-takeoff"]);
        await wait(700);
        if (!alive.current) return;
        setTakeoff(true);
        await wait(1500);
        if (alive.current) finish(rowRef.current);
      });
    },
    [live, isSolved, trip, step, packed, items.length, onMiss, burst, finish]
  );

  // the idle hand (and a miss) points at the case the thing belongs in
  const idle = useIdleHand(live, `${step}-${packed}`);
  const hint = live && (idle || miss?.step === step);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, caseRefs.current[trip]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, trip]);

  const itemId = (k: number) => `ptr-item-${round}-${k}`;
  /** What is already in each case: indexes into `items`. */
  const inCase = (t: Trip) =>
    items
      .slice(0, packed)
      .map((it, k) => ({ it, k }))
      .filter(({ it }) => ITEM_TRIP[it] === t);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="ptr-play ptr-play--pack"
      world={<AirportWorld takeoff={takeoff} />}
      round={round}
      solved={solved}
      say={say(clipText(closed ? "ptr-takeoff" : "ptr-where"))}
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
        <div className="ptr-board ptr-board--pack">
          {/* the plate with the thing to pack */}
          <div className={`ptr-plate ${packed === step && !closed ? "" : "ptr-plate--empty"}`}>
            <span className="ptr-plate-disc" aria-hidden="true" />
            {packed === step && !closed && (
              <motion.span
                key={step}
                layoutId={itemId(step)}
                className="ptr-item ptr-item--big"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SLIDE}
                role="img"
                aria-label={ITEM_NAME[item]}
              >
                <ItemPicture item={item} />
              </motion.span>
            )}
          </div>

          {/* the two open cases */}
          <div ref={rowRef} className="ptr-cases">
            {TRIPS.map((t) => (
              <TripCase
                key={t}
                trip={t}
                live={live}
                hint={hint && t === trip}
                closed={closed}
                shake={shakes[t] ?? 0}
                onTap={pick}
                caseRef={(el) => {
                  caseRefs.current[t] = el;
                }}
              >
                {inCase(t).map(({ it, k }) => (
                  <motion.span key={k} layoutId={itemId(k)} className="ptr-item" transition={SLIDE}>
                    <ItemPicture item={it} />
                  </motion.span>
                ))}
              </TripCase>
            ))}
          </div>
        </div>
      </LayoutGroup>
    </NgStage>
  );
}

/** One open suitcase: the lid standing up with its sticker, the things
 *  packed inside, and its front. With `closed` the lid folds shut. */
function TripCase({
  trip,
  live,
  hint,
  closed,
  shake,
  onTap,
  caseRef,
  children,
}: {
  trip: Trip;
  live: boolean;
  hint: boolean;
  closed: boolean;
  shake: number;
  onTap: (t: Trip) => void;
  caseRef: Ref<HTMLButtonElement>;
  children?: ReactNode;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake) void controls.start(SHAKE);
  }, [shake, controls]);
  return (
    <motion.button
      ref={caseRef}
      type="button"
      className={`ptr-case ptr-case--${trip} ${live ? "ptr-case--live" : ""} ${
        hint ? "ptr-case--hint" : ""
      }`}
      animate={controls}
      onClick={() => onTap(trip)}
      disabled={!live}
      aria-label={trip === "sunny" ? "the sunny trip suitcase" : "the snowy trip suitcase"}
    >
      <span className="ptr-case-glow" aria-hidden="true" />
      <motion.span
        className="ptr-case-lid"
        initial={false}
        animate={closed ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeIn" }}
        aria-hidden="true"
      >
        <span className="ptr-case-sticker">
          {trip === "sunny" ? <Thing id="sun" /> : <Snowflake />}
        </span>
      </motion.span>
      <span className="ptr-case-base" aria-hidden="true">
        <span className="ptr-case-lining" />
        <span className="ptr-case-load">{children}</span>
        <span className="ptr-case-front" />
        <motion.span
          className="ptr-case-shut"
          initial={false}
          animate={{ opacity: closed ? 1 : 0 }}
          transition={{ duration: 0.25, delay: closed ? 0.3 : 0 }}
        >
          <span className="ptr-case-shut-sticker">
            {trip === "sunny" ? <Thing id="sun" /> : <Snowflake />}
          </span>
        </motion.span>
      </span>
    </motion.button>
  );
}
