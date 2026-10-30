"use client";

import { forwardRef, memo, useCallback, useEffect, useRef, type RefObject } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { playCelebrationSound } from "@shared/audio/sfx";
import { useScheduler } from "@shared/hooks/useScheduler";
import { shake } from "@games/find-the-mouse/utils/shake";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { Carriage, Engine } from "@games/number-train/components/TrainArt";

/** How long the train takes to chug off the right edge. */
const CHUG_MS = 1900;

/**
 * The train leaving: "choo" (the celebration toot) and a slow tween off the
 * right side of the stage, then `then()` on the clock.
 */
export function useChugAway(stageRef: RefObject<HTMLDivElement | null>) {
  const controls = useAnimationControls();
  const trainRef = useRef<HTMLDivElement>(null);
  const schedule = useScheduler();
  const chug = useCallback(
    (then: () => void) => {
      const stage = stageRef.current?.getBoundingClientRect();
      const train = trainRef.current?.getBoundingClientRect();
      const dx = stage && train ? stage.right - train.left + 40 : 1200;
      playCelebrationSound();
      void controls.start({
        x: [0, -10, dx],
        transition: { duration: CHUG_MS / 1000, times: [0, 0.15, 1], ease: "easeIn" },
      });
      schedule(then, CHUG_MS);
    },
    [controls, schedule, stageRef]
  );
  return { controls, trainRef, chug };
}

/**
 * The railway and the train on it: the engine, then one place per carriage.
 * A place holds its carriage once it is on (`cars[k]`), or stands empty as a
 * dashed outline the carriage is dragged into.
 */
export const Train = memo(
  forwardRef<
    HTMLDivElement,
    {
      cars: readonly (number | undefined)[];
      /** The place a carried carriage is over, lit. */
      lit: number | null;
      /** The one place that is the gap (Missing Carriage), drawn with a "?". */
      gap?: number;
      controls: ReturnType<typeof useAnimationControls>;
      register: (k: number, el: HTMLElement | null) => void;
    }
  >(function Train({ cars, lit, gap, controls, register }, ref) {
    return (
      <div className="ntr-rail">
        <span className="ntr-track" aria-hidden="true" />
        <motion.div ref={ref} className="ntr-train" animate={controls} initial={{ x: 0 }}>
          {cars.map((n, k) => (
            <span
              key={k}
              ref={(el) => register(k, el)}
              className={`ntr-slot ${lit === k ? "is-lit" : ""} ${n === undefined ? "is-empty" : ""}`}
              role="img"
              aria-label={n === undefined ? `Empty place ${k + 1}` : `Carriage ${n}`}
            >
              <span className="ntr-coupling" aria-hidden="true" />
              {n !== undefined ? (
                <Carriage n={n} />
              ) : (
                <span className="ntr-slot-mark font-rounded font-black" aria-hidden="true">
                  {gap === k ? "?" : ""}
                </span>
              )}
            </span>
          ))}
          {/* the engine leads: at the right, facing the way the train goes */}
          <span className="ntr-engine">
            <Engine />
          </span>
        </motion.div>
      </div>
    );
  })
);

/** A carriage waiting below the train — dragged, or tapped. */
export const YardCar = memo(function YardCar({
  value,
  away,
  locked,
  wrong,
  shakeKey,
  onPick,
  register,
}: {
  value: number;
  away: boolean;
  locked: boolean;
  /** Crossed out (a wrong choice in Missing Carriage). */
  wrong?: boolean;
  /** Changes each time this carriage should shake. */
  shakeKey: number;
  onPick: (e: React.PointerEvent<HTMLElement>, value: number) => void;
  register: (v: number, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (shakeKey > 0) shake(ref.current);
  }, [shakeKey]);
  const can = !away && !locked && !wrong;
  return (
    <button
      ref={(el) => {
        ref.current = el;
        register(value, el);
      }}
      type="button"
      className={`ng-piece ntr-piece touch-none ${away ? "is-away" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onPointerDown={can ? (e) => onPick(e, value) : undefined}
      aria-label={`Carriage ${value}`}
    >
      <Carriage n={value} />
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
