"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Glyph,
  LetterPiece,
  type JigsawLayout,
  type PieceBox,
  type PieceKey,
} from "@shared/components/game/LetterPuzzle";
import { Burst } from "@shared/components/game/Burst";
import { Ripple } from "@shared/components/game/Ripple";
import { CelebrationMotif } from "@shared/components/game/CelebrationMotif";
import { VocabObject } from "@games/space-letters/components/VocabObject";
import { Rocket, Star } from "@games/space-letters/components/SpaceWinArt";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playChime, playCelebrationSound } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";

/** The timeline, in seconds from the overlay appearing. */
/** The pieces lift off the letter and orbit it. */
const ORBIT_S = 0.9;
/** …and click back into place. */
const RECONNECT_S = 2.3;
/** The rocket sets off around the letter. */
const ROCKET_S = 2.2;
const ROCKET_DUR = 1.3;
/** The letter becomes a constellation. */
const STARS_S = 3.3;
/** The galaxy burst. */
const BURST_S = 4.2;
/** The object, the cheer and the way on. */
const PRAISE_MS = 4500;

/** The rocket's circle around the letter, in vmin — outside the letter box,
 *  inside the screen on every phone. Thirteen points close the loop. */
const ROCKET_R = 16;
const ROCKET_STEPS = 13;
const ROCKET_PATH = Array.from({ length: ROCKET_STEPS }, (_, i) => {
  const a = (i / (ROCKET_STEPS - 1)) * Math.PI * 2;
  return {
    x: `${(Math.cos(a) * ROCKET_R).toFixed(2)}vmin`,
    y: `${(Math.sin(a) * ROCKET_R).toFixed(2)}vmin`,
    // nose along the direction of travel: a nose-up drawing needs θ + 180
    rotate: Number(((i / (ROCKET_STEPS - 1)) * 360 + 180).toFixed(1)),
  };
});

/** Each piece's little orbit: lifts off its place, circles once a third of a
 *  turn apart from the others, and settles back. In vmin, so it is the same
 *  gesture at every size. */
const ORBIT_R = 3;
function orbitFor(index: number): { x: string[]; y: string[] } {
  const phase = (index * 2 * Math.PI) / 3;
  const points = Array.from({ length: 4 }, (_, k) => phase + (k * Math.PI) / 2);
  return {
    x: ["0vmin", ...points.map((a) => `${(Math.cos(a) * ORBIT_R).toFixed(2)}vmin`), "0vmin"],
    y: ["0vmin", ...points.map((a) => `${(Math.sin(a) * ORBIT_R).toFixed(2)}vmin`), "0vmin"],
  };
}

const STARS: readonly ReactNode[] = [<Star key="star" />];
const BURST_REACH: readonly [number, number] = [24, 64];

interface SpaceWinProps {
  /** The letter as built — BIG or little. */
  shown: string;
  /** The vocabulary letter (canonical), for its picture. */
  letter: string;
  fit: string;
  pieces: readonly PieceKey[];
  boxes: Record<PieceKey, { box: PieceBox; outline?: string }>;
  layout: JigsawLayout;
  nextLabel: string;
  onAgain: () => void;
  onNext: () => void;
}

/**
 * THE LETTER IN SPACE — Space ABC's celebration.
 *
 * The child has just built the letter from three pieces, so the celebration
 * is that letter, finished, in space: it GLOWS; its pieces lift off and
 * ORBIT it once before clicking back together; a rocket flies a loop around
 * it, leaving a glowing trail; the letter becomes a CONSTELLATION — its own
 * outline in stars; and it bursts, sending stars across the whole screen.
 * Then the picture, the cheer and the way on.
 *
 * Every picture is a declarative Framer keyframe run against the constants
 * above; the sounds and the hand-off are timers on the same numbers. No loop.
 */
export function SpaceWin({
  shown,
  letter,
  fit,
  pieces,
  boxes,
  layout,
  nextLabel,
  onAgain,
  onNext,
}: SpaceWinProps) {
  /** The last act is real state, not a delayed fade-in: buttons must not
   *  exist — invisible but tappable — before their moment. */
  const [praised, setPraised] = useState(false);

  // The sounds and the last act, on the same clock as the pictures — every
  // timer cleared with the screen.
  const schedule = useScheduler();
  useEffect(() => {
    schedule(playChime, RECONNECT_S * 1000);
    schedule(playCelebrationSound, BURST_S * 1000);
    schedule(() => setPraised(true), PRAISE_MS);
  }, [schedule]);

  const orbits = useMemo(() => pieces.map((_, i) => orbitFor(i)), [pieces]);

  return (
    <div className="sap-win-stage">
      <CelebrationMotif motif="sparkle" count={16} />

      {/* THE LETTER, finished, at the centre of everything */}
      <motion.div
        className="sap-win-letter"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
      >
        {/* the glow — swells up behind the letter and keeps breathing */}
        <motion.span
          className="sap-win-glow"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0.65, 1, 0.75], scale: [0.6, 1.1, 1, 1.08, 1] }}
          transition={{ duration: 4.4, times: [0, 0.18, 0.4, 0.7, 1], ease: "easeInOut" }}
        />

        {/* the rocket's trail: the loop drawing itself as the rocket flies */}
        <svg viewBox="0 0 100 100" className="sap-win-trail" aria-hidden="true">
          <motion.circle
            cx="50"
            cy="50"
            r="44.4"
            className="sap-win-trail-line"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{
              delay: ROCKET_S,
              duration: ROCKET_DUR + 0.9,
              times: [0, ROCKET_DUR / (ROCKET_DUR + 0.9), 1],
              ease: "linear",
            }}
          />
        </svg>

        {/* the pieces: lift, orbit, click back; then dim for the stars */}
        <div className="pl-lp-assembly">
          {pieces.map((key, i) => {
            const { box, outline } = boxes[key];
            return (
              <motion.div
                key={key}
                className="pl-lp-placed pl-at sap-win-piece"
                style={cssVars({
                  "--pl-x": `${box.x.toFixed(2)}%`,
                  "--pl-y": `${box.y.toFixed(2)}%`,
                  "--pl-w": `${box.w.toFixed(2)}%`,
                  "--pl-h": `${box.h.toFixed(2)}%`,
                })}
                initial={{ x: "0vmin", y: "0vmin", scale: 1, rotate: 0 }}
                animate={{
                  x: orbits[i].x,
                  y: orbits[i].y,
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
                  rotate: [0, -5, 4, -4, 3, 0],
                }}
                transition={{
                  delay: ORBIT_S,
                  duration: RECONNECT_S - ORBIT_S,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="h-full w-full"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: STARS_S, duration: 0.6 }}
                >
                  <LetterPiece
                    letter={shown}
                    piece={key}
                    fit={fit}
                    box={box}
                    layout={layout}
                    outline={outline}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* THE CONSTELLATION: the letter's own outline, in stars */}
        <motion.svg
          viewBox="0 0 100 100"
          className="sap-win-constellation"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: [0, 1, 0.75, 1], scale: [0.94, 1.04, 1, 1.02] }}
          transition={{ delay: STARS_S, duration: 1.6, ease: "easeInOut" }}
        >
          <Glyph letter={shown} fit={fit} className="sap-win-stars" />
        </motion.svg>

        {/* THE ROCKET, once around, and gone */}
        <motion.div
          className="sap-win-rocket"
          initial={{ x: ROCKET_PATH[0].x, y: ROCKET_PATH[0].y, rotate: 180, opacity: 0 }}
          animate={{
            x: ROCKET_PATH.map((p) => p.x),
            y: ROCKET_PATH.map((p) => p.y),
            rotate: ROCKET_PATH.map((p) => p.rotate),
            opacity: [0, 1, ...Array.from({ length: ROCKET_STEPS - 3 }, () => 1), 0],
          }}
          transition={{ delay: ROCKET_S, duration: ROCKET_DUR, ease: "linear" }}
        >
          <Rocket />
        </motion.div>

        {/* THE GALAXY BURST: rings out from the letter, stars everywhere */}
        <Ripple delay={BURST_S} count={3} gap={0.14} size="clamp(200px, 50vmin, 520px)" />
        <Burst
          pieces={STARS}
          count={44}
          delay={BURST_S}
          reach={BURST_REACH}
          size="clamp(14px, 3.2vmin, 28px)"
        />
      </motion.div>

      {/* the picture, the cheer and the way on */}
      {praised && (
        <motion.div
          className="sap-win-praise"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <div className="sap-win-object">
            <VocabObject letter={letter} />
          </div>
          <h2 className="spl-win-heading font-rounded font-black">{clipText("cheer-great-job")}</h2>
          <div className="flex gap-4">
            <button
              onClick={onAgain}
              className="font-rounded text-space-ink min-h-[52px] rounded-full bg-white px-6 text-base font-black shadow-lg"
              aria-label="Build this letter again"
            >
              Again
            </button>
            <button
              onClick={onNext}
              className="bg-space font-rounded min-h-[52px] rounded-full px-6 text-base font-black text-white shadow-lg"
              aria-label="Go to the next letter"
            >
              <span>{nextLabel}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
