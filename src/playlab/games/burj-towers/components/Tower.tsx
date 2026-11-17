"use client";

import { useEffect, useRef, type PointerEvent, type Ref } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Thing } from "@games/number-groups/components/SumParts";
import {
  BurjFloor,
  BurjGlow,
  BurjPodium,
  BurjSpire,
  type BurjTime,
  type FloorVariant,
} from "@shared/components/dubai/BurjTower";

/** A wrong drop on it: a quick shake (a tween — a spring takes two keyframes only). */
const SHAKE = { x: [0, -12, 11, -6, 0], transition: { duration: 0.42 } };

/**
 * ONE WHOLE BURJ KHALIFA — the spire, `floors` glass floors and the podium,
 * built from Burj Khalifa's own pieces (`BurjTower`), sized by `--bjk-f` /
 * `--bjk-u` on an ancestor and with its spire `--bjt-s` tall (the same for
 * every tower on the stage, so the floors alone make one taller).
 *
 * `shape` is the floor count every tower on the stage is drawn to (the
 * tallest), so the same floor has the same width in every tower: a short
 * tower is the bottom of a tall one.
 *
 * Three uses: a PIECE to drag (`grab`, Line Them Up's row — the finger picks
 * the whole tower up), a DROP TARGET (Tall or Short?: the star is dragged
 * onto it; `over` lights it while the star is over it), or a picture (the
 * tower under the finger, or gliding to its place). `hint` makes it glow
 * (the answer, after a wrong drop or a long wait); `happy` glows it for a
 * right one; `star` (a key: a new value pops a new star) puts a gold star on
 * the spire; `shine` lights the spire's tip; `shake` (a counter) shakes it
 * once per change; `away` keeps its room but hides it (it is being carried).
 */
export function Tower({
  floors,
  shape,
  variant,
  time,
  grab,
  away = false,
  hint = false,
  happy = false,
  over = false,
  star = null,
  shine = false,
  glow = 0,
  shake = 0,
  towerRef,
  floorsRef,
  starRef,
  label,
}: {
  floors: number;
  shape: number;
  variant: FloorVariant;
  time: BurjTime;
  /** Makes it a piece to pick up: called on the finger going down. */
  grab?: (e: PointerEvent<HTMLElement>) => void;
  away?: boolean;
  hint?: boolean;
  happy?: boolean;
  /** Something carried is over it (it is a drop target). */
  over?: boolean;
  star?: number | null;
  shine?: boolean;
  /** The warm halo behind it (dusk), 0–1. */
  glow?: number;
  shake?: number;
  /** The whole tower — a drop target, or where a carried tower is measured. */
  towerRef?: Ref<HTMLDivElement>;
  /** The floors' box — where the idle hand points and the round's star stamps. */
  floorsRef?: Ref<HTMLSpanElement>;
  /** Where the star sits on the spire (an empty box the same size). */
  starRef?: Ref<HTMLSpanElement>;
  /** For screen readers; a picture copy (carried, gliding) has none. */
  label?: string;
}) {
  const controls = useAnimationControls();
  // only a NEW miss shakes: a tower remounted keeps its old count
  const shaken = useRef(shake);
  useEffect(() => {
    if (shake === shaken.current) return;
    shaken.current = shake;
    void controls.start(SHAKE);
  }, [shake, controls]);

  return (
    <motion.div
      ref={towerRef}
      className={`bjt-tower ${grab ? "bjt-tower--grab" : ""} ${hint ? "bjt-tower--hint" : ""} ${
        happy || over ? "bjt-tower--lit" : ""
      } ${away ? "bjt-tower--away" : ""}`}
      animate={controls}
      onPointerDown={grab}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="bjt-halo" aria-hidden="true" />
      {time !== "day" && <BurjGlow strength={glow} className="bjt-glow" />}
      <span className="bjt-spire-slot">
        <BurjSpire time={time} />
        {shine && <span className="bjt-shine" aria-hidden="true" />}
        <span ref={starRef} className="bjt-star-spot" aria-hidden="true" />
        {star !== null && (
          <motion.span
            key={star}
            className="bjt-star"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 12 }}
            aria-hidden="true"
          >
            <Thing id="star" />
          </motion.span>
        )}
      </span>
      <span ref={floorsRef} className="bjt-floors">
        {Array.from({ length: floors }, (_, i) => (
          <BurjFloor
            key={i}
            index={i}
            floors={shape}
            variant={variant}
            time={time}
            lit={time !== "day"}
            live={hint}
          />
        ))}
      </span>
      <BurjPodium time={time} />
    </motion.div>
  );
}
