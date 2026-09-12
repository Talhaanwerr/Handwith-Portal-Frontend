"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { Sparkle } from "@games/counting-numbers/components/CountingArt";
import { MascotFace } from "@games/counting-numbers/components/Characters";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { cssVars } from "@shared/styles/cssVars";

/**
 * The things every level shares once an answer is right: the number flying
 * to its place, the confetti where it lands, the stars when the whole level
 * is done, and the progress bar that follows.
 */

/** The reference's confetti — little squares in six colours. */
const CONFETTI_COLORS = ["#E0413F", "#3F6FBF", "#F6C544", "#5FAF3A", "#F28AB2", "#F28A2E"] as const;
const CONFETTI_REACH: readonly [number, number] = [6, 22];
const STAR_REACH: readonly [number, number] = [16, 48];
const STARS: readonly ReactNode[] = [<Sparkle key="star" />];

/** A puff of square confetti from the centre of its positioned parent. */
export function ConfettiPuff({ count = 22, delay = 0 }: { count?: number; delay?: number }) {
  const pieces = useMemo<readonly ReactNode[]>(
    () =>
      CONFETTI_COLORS.map((c) => (
        <span key={c} className="cn-confetti" style={cssVars({ "--pl-color": c })} />
      )),
    []
  );
  return (
    <Burst
      pieces={pieces}
      count={count}
      delay={delay}
      reach={CONFETTI_REACH}
      size="clamp(6px, 2.4cqh, 14px)"
    />
  );
}

/** Stars thrown across the whole level from its centre — the level is done. */
export function StarBurst({ delay = 0 }: { delay?: number }) {
  return (
    <div className="cn-centre" aria-hidden="true">
      <Burst
        pieces={STARS}
        count={26}
        delay={delay}
        reach={STAR_REACH}
        size="clamp(14px, 5cqh, 40px)"
      />
    </div>
  );
}

export interface Flight {
  value: number;
  /** From and to, in px relative to the level root. */
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/** The chosen number on its way into place. Root-relative absolute, never
 *  fixed — the portal's rule for anything that flies. */
export function FlyingNumber({
  flight,
  tone,
  onArrive,
}: {
  flight: Flight;
  tone: string;
  onArrive: () => void;
}) {
  return (
    <motion.div
      className="cn-flight pointer-events-none absolute z-40"
      initial={{ left: flight.fx, top: flight.fy, scale: 1.05 }}
      animate={{ left: flight.tx, top: flight.ty, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.3, 0.7, 0.2, 1] }}
      onAnimationComplete={onArrive}
      aria-hidden="true"
    >
      <span className={`cn-bubble cn-bubble--${tone} cn-bubble--flying`}>
        <span className="cn-bubble-glyph font-rounded font-black">{flight.value}</span>
      </span>
    </motion.div>
  );
}

/**
 * The progress strip that rises over a finished level: a white rounded
 * track, green filling across it to where the child now is, and Pip riding
 * the front of the fill all the way.
 */
export function ProgressStrip({ value }: { value: number }) {
  const pct = `${Math.round(value * 100)}%`;
  return (
    <motion.div
      className="cn-progress"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      role="status"
      aria-label={`${Math.round(value * 100)} percent of the levels done`}
    >
      <ProgressBar
        value={value}
        trackClassName="cn-progress-bar"
        fillClassName="cn-progress-fill"
        animateFromZero
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      />
      <motion.span
        className="cn-progress-mascot"
        initial={{ left: "0%", rotate: 0 }}
        animate={{ left: pct, rotate: [0, -12, 12, -8, 8, 0] }}
        transition={{
          left: { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
          rotate: { duration: 1.4, delay: 0.25, ease: "easeInOut" },
        }}
        aria-hidden="true"
      >
        <MascotFace />
      </motion.span>
    </motion.div>
  );
}
