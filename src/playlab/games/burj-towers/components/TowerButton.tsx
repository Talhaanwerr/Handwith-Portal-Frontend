"use client";

import { useEffect, useRef, type Ref } from "react";
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

/** A wrong pick: a quick shake (a tween — a spring takes two keyframes only). */
const SHAKE = { x: [0, -12, 11, -6, 0], transition: { duration: 0.42 } };

/**
 * ONE WHOLE BURJ KHALIFA AS ONE BIG BUTTON — the spire, `floors` glass floors
 * and the podium, built from Burj Khalifa's own pieces (`BurjTower`), sized by
 * `--bjk-f` / `--bjk-u` on an ancestor and with its spire `--bjt-s` tall (the
 * same for every tower on the stage, so the floors alone make one taller).
 *
 * `shape` is the floor count every tower on the stage is drawn to (the
 * tallest), so the same floor has the same width in every tower: a short
 * tower is the bottom of a tall one. `hint` makes it glow (the answer, after
 * a wrong pick or a long wait); `happy` glows it for a right pick; `star`
 * (a key: a new value pops a new star) puts a gold star on the spire; `shine`
 * lights the spire's tip; `shake` (a counter) shakes it once per change.
 */
export function TowerButton({
  floors,
  shape,
  variant,
  time,
  live,
  hint = false,
  happy = false,
  star = null,
  shine = false,
  glow = 0,
  shake = 0,
  onTap,
  floorsRef,
  label,
}: {
  floors: number;
  shape: number;
  variant: FloorVariant;
  time: BurjTime;
  /** Can be tapped now. */
  live: boolean;
  hint?: boolean;
  happy?: boolean;
  star?: number | null;
  shine?: boolean;
  /** The warm halo behind it (dusk), 0–1. */
  glow?: number;
  shake?: number;
  onTap: () => void;
  /** The floors' box — where the idle hand points and the round's star stamps. */
  floorsRef?: Ref<HTMLSpanElement>;
  label: string;
}) {
  const controls = useAnimationControls();
  // only a NEW miss shakes: a tower remounted on the stand keeps its old count
  const shaken = useRef(shake);
  useEffect(() => {
    if (shake === shaken.current) return;
    shaken.current = shake;
    void controls.start(SHAKE);
  }, [shake, controls]);

  return (
    <motion.button
      type="button"
      className={`bjt-tower ${live ? "bjt-tower--live" : ""} ${hint ? "bjt-tower--hint" : ""} ${
        happy ? "bjt-tower--happy" : ""
      }`}
      animate={controls}
      onClick={onTap}
      disabled={!live}
      aria-label={label}
    >
      <span className="bjt-halo" aria-hidden="true" />
      {time !== "day" && <BurjGlow strength={glow} className="bjt-glow" />}
      <span className="bjt-spire-slot">
        <BurjSpire time={time} />
        {shine && <span className="bjt-shine" aria-hidden="true" />}
        {star !== null && (
          <motion.span
            key={star}
            className="bjt-star"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 13 }}
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
    </motion.button>
  );
}
