"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PencilPal } from "@games/letter-hunt/components/PennyArt";
import { MagnifyingGlass } from "@games/letter-hunt/components/HuntWinArt";
import { Burst } from "@shared/components/game/Burst";
import { Ripple } from "@shared/components/game/Ripple";
import { CELEBRATION_COLORS } from "@shared/components/game/CelebrationMotif";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playStarPop, playFanfare } from "@shared/audio/sfx";
import { playClip, clipText } from "@shared/audio/voice";

/** The timeline, in seconds from the overlay appearing. */
/** The glass lands on the letter — click. */
const LOCK_S = 1.3;
/** The letter starts growing until it fills the whole screen. */
const ZOOM_S = 1.7;
/** The giant letter POPS into little letters. */
const POP_S = 2.75;
/** Penny, the cheer and the way on. */
const PRAISE_S = 3.2;
/** The round moves on by itself after this; the button goes sooner. */
const DONE_MS = 5800;

/** The letter's whole keyframe run ends just past the pop. */
const LETTER_END_S = POP_S + 0.2;
/** Where a moment falls in that run, as a keyframe time. */
const at = (s: number) => Number((s / LETTER_END_S).toFixed(4));

const SHARD_REACH: readonly [number, number] = [24, 56];

interface HuntWinProps {
  /** The letter as it was hunted — BIG or little. */
  shown: string;
  cheerId: string;
  subtitle: string;
  nextLabel: string;
  nextAriaLabel: string;
  /** The button: the child chooses to go on. */
  onNext: () => void;
  /** The timer: the round goes on by itself once the show has played. */
  onDone: () => void;
}

/**
 * THE GLASS — Letter Hunt's celebration.
 *
 * Three beats on one clock. A huge magnifying glass sweeps in, hunts across
 * the screen and LOCKS onto the found letter (click, lens flash). The letter
 * zooms up through the lens until it fills the entire screen — and pops,
 * gently, into dozens of little copies of itself flying outward. Then Penny
 * springs in with the cheer and the way on, and the next round begins by
 * itself.
 *
 * Every picture is a declarative Framer keyframe run against the constants
 * above; the sounds and the hand-off are timers on the same numbers. No loop.
 */
export function HuntWin({
  shown,
  cheerId,
  subtitle,
  nextLabel,
  nextAriaLabel,
  onNext,
  onDone,
}: HuntWinProps) {
  /** Act three is real state, not a delayed fade-in: a button must not exist
   *  — invisible but tappable — before its moment. */
  const [praised, setPraised] = useState(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  // The sounds and the hand-off, on the same clock as the pictures — every
  // timer cleared with the screen, so leaving early cannot advance a round
  // that is no longer there.
  const schedule = useScheduler();
  useEffect(() => {
    schedule(playStarPop, LOCK_S * 1000);
    schedule(playFanfare, POP_S * 1000);
    schedule(() => {
      setPraised(true);
      void playClip(cheerId);
    }, PRAISE_S * 1000);
    schedule(() => doneRef.current(), DONE_MS);
  }, [schedule, cheerId]);

  /** The little letters the big one pops into — the celebration palette. */
  const shards = useMemo(
    () =>
      CELEBRATION_COLORS.map((color) => (
        <span
          key={color}
          className="hunt-win-shard font-rounded font-black"
          style={cssVars({ "--pl-color": color })}
        >
          {shown}
        </span>
      )),
    [shown]
  );

  return (
    <div className="hunt-win-stage">
      {/* THE LETTER: found, then magnified under the glass, then filling the
          whole screen, then gone in the pop. */}
      <motion.span
        className="hunt-win-letter font-rounded font-black"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{
          scale: [0.4, 1, 1, 1.35, 1.2, 7.5, 7.5, 8.4],
          opacity: [0, 1, 1, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: LETTER_END_S,
          times: [
            0,
            at(0.4),
            at(LOCK_S),
            at(LOCK_S + 0.25),
            at(ZOOM_S),
            at(ZOOM_S + 0.75),
            at(POP_S),
            1,
          ],
          ease: ["easeOut", "linear", "easeOut", "easeIn", "easeInOut", "linear", "easeOut"],
        }}
      >
        {shown}
      </motion.span>

      {/* THE GLASS: sweeps in from off-screen, hunts across the board and
          lands on the letter; then, as the letter zooms, it grows past the
          edges of the screen and is gone. Two layers: the sweep, and the
          zoom, so each is one clean keyframe run. */}
      <motion.div
        className="hunt-glass"
        initial={{ x: "90vmin", y: "60vmin", rotate: 28, opacity: 0 }}
        animate={{
          x: ["90vmin", "-14vmin", "12vmin", "-5vmin", "0vmin"],
          y: ["60vmin", "-10vmin", "9vmin", "-3vmin", "0vmin"],
          rotate: [28, -12, 9, -4, 0],
          opacity: [0, 1, 1, 1, 1],
        }}
        transition={{ duration: LOCK_S, times: [0, 0.35, 0.6, 0.82, 1], ease: "easeInOut" }}
      >
        <motion.div
          className="h-full w-full"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: [1, 1, 3.6], opacity: [1, 1, 0] }}
          transition={{
            duration: ZOOM_S + 0.75,
            times: [0, Number((ZOOM_S / (ZOOM_S + 0.75)).toFixed(4)), 1],
            ease: "easeIn",
          }}
        >
          <MagnifyingGlass />
          {/* the lens catching the light as it locks on */}
          <motion.span
            className="hunt-glass-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ delay: LOCK_S, duration: 0.35 }}
          />
        </motion.div>
      </motion.div>

      {/* THE POP: rings spreading from the centre, and the letter in pieces. */}
      <div className="hunt-win-centre">
        <Ripple delay={POP_S} count={3} gap={0.12} size="clamp(160px, 44vmin, 420px)" />
        <Burst
          pieces={shards}
          count={40}
          delay={POP_S}
          reach={SHARD_REACH}
          size="clamp(26px, 6vmin, 56px)"
        />
      </div>

      {/* ACT THREE — Penny, the cheer and the way on, over the settled pop. */}
      {praised && (
        <motion.div
          className="hunt-win-praise"
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
        >
          <motion.div
            className="hunt-penny-done relative"
            initial={{ scale: 0.5, y: 20 }}
            animate={{ scale: 1, y: [0, -10, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 220, damping: 16 },
              y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
            }}
          >
            <motion.span
              className="absolute -top-3 -right-3 text-4xl"
              animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              aria-hidden="true"
            >
              ⭐
            </motion.span>
            <PencilPal />
          </motion.div>
          <h2 className="hunt-done-heading font-rounded font-black">{clipText(cheerId)}</h2>
          <p className="hunt-win-sub font-rounded text-base font-semibold">{subtitle}</p>
          <button
            onClick={onNext}
            className="hunt-win-next font-rounded inline-flex min-h-[52px] items-center gap-2 rounded-full px-7 text-base font-black shadow-lg"
            aria-label={nextAriaLabel}
          >
            <span>{nextLabel}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
}
