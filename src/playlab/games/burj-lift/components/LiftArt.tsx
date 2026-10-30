"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { motion } from "framer-motion";
import { Thing } from "@games/number-groups/components/SumParts";

/**
 * Burj Lift's own pieces (styles in `burj-lift/styles/burj-lift.css`, all
 * `bjl-` classes, no SVG ids): the chunky arrow, the balloon, and the glass
 * lift car with its passenger. The tower and the world are Burj Khalifa's
 * (`BurjTower`, `DubaiWorld`), never redrawn here.
 */

export type LiftDir = "up" | "down";

/** A fat arrow, pointing up or down. Coloured by `currentColor`. */
export function LiftArrow({ dir, className = "" }: { dir: LiftDir; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`bjl-arrow ${className}`} aria-hidden="true">
      <g transform={dir === "down" ? "rotate(180 20 20)" : undefined}>
        <path
          d="M20 3 L37 21 H27 V36 Q27 38 25 38 H15 Q13 38 13 36 V21 H3 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** A party balloon on its string, in one colour (face and darker edge). */
export function Balloon({ face, edge }: { face: string; edge: string }) {
  return (
    <svg viewBox="0 0 40 70" className="bjl-balloon-art" aria-hidden="true">
      <path d="M20 44 Q15 52 21 58 Q26 64 19 70" fill="none" stroke="#6b5a3a" strokeWidth="1.6" />
      <path d="M17 43 H23 L21.5 46.5 H18.5 Z" fill={edge} />
      <ellipse cx="20" cy="22" rx="17" ry="20.5" fill={edge} />
      <ellipse cx="20" cy="21" rx="15.4" ry="19" fill={face} />
      <ellipse cx="13.5" cy="13" rx="4" ry="6.5" fill="#ffffff" opacity="0.45" />
    </svg>
  );
}

/** What the passenger is doing: getting in, riding, or stepping out. */
export type RiderPhase = "in" | "out";

/**
 * THE LIFT CAR — a glass cabin in a gold frame, a pulley box on top and a
 * sill below, the passenger standing inside behind the glass. A new
 * passenger (a new `riderKey`) pops in; `phase="out"` makes them hop out to
 * the left, onto the floor they have arrived at, and bounce away. `extra`
 * (the passenger's bubble or balloon) is drawn beside the cabin.
 */
export function LiftCar({
  passenger,
  riderKey,
  phase,
  extra,
  carRef,
  style,
}: {
  passenger: string;
  riderKey: string | number;
  phase: RiderPhase;
  extra?: ReactNode;
  carRef?: Ref<HTMLDivElement>;
  style?: CSSProperties;
}) {
  const out = phase === "out";
  return (
    <div ref={carRef} className="bjl-car" style={style}>
      <span className="bjl-car-cap" aria-hidden="true" />
      <span className="bjl-car-cabin" aria-hidden="true">
        <span className="bjl-car-back" />
        <motion.span
          key={riderKey}
          className="bjl-rider"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={
            out
              ? {
                  x: ["0%", "-55%", "-105%", "-105%", "-105%"],
                  y: ["0%", "-70%", "0%", "-22%", "0%"],
                  opacity: [1, 1, 1, 1, 0],
                  scale: 1,
                }
              : { x: "0%", y: "0%", opacity: 1, scale: 1 }
          }
          transition={
            out
              ? { duration: 1, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeOut" }
              : { duration: 0.35, ease: "easeOut" }
          }
        >
          <Thing id={passenger} />
        </motion.span>
        <span className="bjl-car-glass" />
      </span>
      <span className="bjl-car-sill" aria-hidden="true" />
      {extra}
    </div>
  );
}
