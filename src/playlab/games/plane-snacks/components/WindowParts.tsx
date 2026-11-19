"use client";

import { memo, useEffect, type CSSProperties, type ReactNode, type Ref } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Thing } from "@games/number-groups/components/SumParts";

/**
 * The pieces of Window Spy: the one big aeroplane window (a chunky cream
 * frame, the blind pulled up, the sky with drifting clouds and the tip of
 * the wing outside), the thing flying past, and the picture choices. Sized
 * from `--psn-wh` (the window's height) and `--psn-c` (a choice), set in
 * plane-snacks.css.
 */

const SHAKE = { x: [0, -10, 9, -5, 0], transition: { duration: 0.4 } };

/** THE WINDOW. What flies past it is `children` (inside the glass). */
export function BigWindow({
  winRef,
  children,
  below,
}: {
  winRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
  /** Drawn on the frame's bottom edge (the "Look again" button). */
  below?: ReactNode;
}) {
  return (
    <div ref={winRef} className="psn-window">
      <span className="psn-window-bevel" aria-hidden="true" />
      <div className="psn-window-glass">
        <SkyView />
        {children}
        <span className="psn-window-blind" aria-hidden="true">
          <span className="psn-window-tab" />
        </span>
        <span className="psn-window-glint" aria-hidden="true" />
      </div>
      {below}
    </div>
  );
}

/** Three clouds drifting right to left: where each starts, its size, its
 *  speed (s) and how far into its drift it begins (a negative delay). */
const CLOUDS = [
  { top: 14, w: 34, d: 30, at: -6 },
  { top: 46, w: 26, d: 38, at: -24 },
  { top: 66, w: 40, d: 46, at: -36 },
] as const;

/** The view outside: the sky, the sun, the clouds and the wing. */
const SkyView = memo(function SkyView() {
  return (
    <span className="psn-sky" aria-hidden="true">
      <span className="psn-sky-sun" />
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="psn-cloud-track"
          style={
            {
              "--psn-cloud-d": `${c.d}s`,
              "--psn-cloud-at": `${c.at}s`,
            } as CSSProperties
          }
        >
          <svg
            className="psn-cloud"
            viewBox="0 0 120 56"
            style={{ top: `${c.top}%`, width: `${c.w}%` }}
          >
            <ellipse cx="60" cy="40" rx="56" ry="15" fill="#ffffff" />
            <circle cx="38" cy="30" r="18" fill="#ffffff" />
            <circle cx="66" cy="22" r="22" fill="#ffffff" />
            <circle cx="92" cy="34" r="13" fill="#ffffff" />
            <ellipse cx="60" cy="49" rx="48" ry="6" fill="#dceefb" />
          </svg>
        </span>
      ))}
      <Wing />
    </span>
  );
});

/** The tip of the aeroplane's wing, reaching out under the window. */
function Wing() {
  return (
    <svg className="psn-wing" viewBox="0 0 220 90" preserveAspectRatio="xMinYMax meet">
      <defs>
        <linearGradient id="psn-wing-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d5dde8" />
        </linearGradient>
      </defs>
      {/* the wing, from the body of the plane out to its tip */}
      <path d="M0 90 V58 L178 30 Q190 28 192 36 L196 46 L0 90Z" fill="url(#psn-wing-top)" />
      <path d="M0 90 L196 46 L198 52 L0 98Z" fill="#a9b6c7" />
      {/* the winglet, in the airline's red */}
      <path d="M178 30 L196 4 Q200 0 204 4 L200 44 L196 46 Q190 28 178 30Z" fill="#e8574a" />
      <path d="M196 4 Q200 0 204 4 L200 44 L198 45Z" fill="#c43f33" />
      {/* a seam and a little light */}
      <path d="M30 70 L160 41" stroke="#c4cfdc" strokeWidth="2" strokeLinecap="round" />
      <circle cx="190" cy="40" r="2.6" fill="#7ee08a" />
    </svg>
  );
}

/**
 * The thing flying past, right to left across the glass. The track is the
 * glass's own width, so `x` in % of it crosses the whole window whatever its
 * size; a new `flightKey` flies it again. `happy` (found!): slower, waving.
 */
export function FlyPast({
  id,
  flightKey,
  ms,
  mirror,
  climb,
  happy,
}: {
  id: string;
  flightKey: number;
  ms: number;
  mirror: boolean;
  climb: boolean;
  happy: boolean;
}) {
  return (
    <motion.span
      key={flightKey}
      className="psn-flight"
      initial={{ x: "78%", y: climb ? "12%" : "0%" }}
      animate={{ x: "-78%", y: climb ? "-10%" : "0%" }}
      transition={{ duration: ms / 1000, ease: happy ? "easeInOut" : "linear" }}
      aria-hidden="true"
    >
      <span className={`psn-flyer ${happy ? "psn-flyer--happy" : ""}`}>
        <span className={`psn-flyer-pic ${mirror ? "psn-flyer-pic--mirror" : ""}`}>
          <Thing id={id} />
        </span>
      </span>
    </motion.span>
  );
}

/** ONE PICTURE CHOICE under the window — the button. */
export function ChoiceCard({
  id,
  index,
  live,
  hint,
  right,
  shake,
  onTap,
  cardRef,
}: {
  id: string;
  index: number;
  live: boolean;
  hint: boolean;
  /** Found: it stays ringed in green while it flies past again. */
  right: boolean;
  shake: number;
  onTap: () => void;
  cardRef?: Ref<HTMLButtonElement>;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    void controls.start({
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 18, delay: index * 0.09 },
    });
  }, [controls, index]);
  useEffect(() => {
    if (shake) void controls.start(SHAKE);
  }, [shake, controls]);

  return (
    <motion.button
      ref={cardRef}
      type="button"
      className={`psn-card ${live ? "psn-card--live" : ""} ${hint ? "psn-card--hint" : ""} ${
        right ? "psn-card--right" : ""
      }`}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={controls}
      onClick={onTap}
      disabled={!live}
      aria-label={id}
    >
      <span className="psn-card-ring" aria-hidden="true" />
      <span className="psn-card-pic">
        <Thing id={id} />
      </span>
    </motion.button>
  );
}

/** An eye, for the "Look again" button. */
export function EyeGlyph() {
  return (
    <svg className="psn-eye" viewBox="0 0 32 20" aria-hidden="true">
      <path d="M2 10C6 3.6 10.6 1 16 1s10 2.6 14 9c-4 6.4-8.6 9-14 9S6 16.4 2 10z" fill="#ffffff" />
      <circle cx="16" cy="10" r="5.6" fill="#1f5da6" />
      <circle cx="18" cy="8" r="1.8" fill="#ffffff" />
    </svg>
  );
}
