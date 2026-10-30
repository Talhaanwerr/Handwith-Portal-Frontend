"use client";

import type { ReactNode, RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { Teacher } from "@games/door-count/components/Teacher";
import { Picture } from "@games/blend-read/components/PictureArt";
import { Backdrop } from "@games/on-off/components/OoArt";
import { ROUND_COUNT, type BackdropId } from "@games/on-off/constants/scenes";

/**
 * The frame every round plays in — the same ON or OFF, so the child learns
 * one layout: the scene's world, the teacher in the bottom-left corner with
 * the instruction in his speech bubble, a row of stars along the top (one
 * per round) that fill in round by round, and the pills (Back to the title top-left,
 * Back to Games top-right).
 *
 * The bubble is the game's own (not the Teacher's `say` string) because the
 * position word has to be shown BIG — "Put the teddy ON the bed."
 */
export function OoStage({
  stageRef,
  backdrop,
  floor,
  round,
  done,
  bubbleKey,
  bubble,
  label,
  onHome,
  onExitPortal,
  children,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  backdrop: BackdropId;
  /** The world's floor depth below the baseline (u), per orientation. */
  floor: { land: number; port: number };
  round: number;
  /** The round is won: the teacher jumps and this round's star lights. */
  done: boolean;
  /** Changes when the bubble's words change, so it pops afresh. */
  bubbleKey: string;
  bubble: ReactNode;
  /** The bubble's words as plain text, for screen readers. */
  label: string;
  onHome: () => void;
  onExitPortal: () => void;
  children: ReactNode;
}) {
  return (
    <div
      ref={stageRef}
      className="oo-screen"
      style={cssVars({ "--oo-floor-l": floor.land, "--oo-floor-p": floor.port })}
    >
      <Backdrop id={backdrop} />

      <div className="oo-teacher-slot" aria-hidden="true">
        <Teacher cheer={done} />
      </div>
      <AnimatePresence initial={false}>
        <motion.div
          key={bubbleKey}
          className={`oo-says font-rounded font-black ${done ? "is-done" : ""}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          aria-hidden="true"
        >
          {bubble}
        </motion.div>
      </AnimatePresence>
      <p className="oo-sr" aria-live="polite">
        {label}
      </p>

      {children}

      <div
        className="oo-trail"
        role="img"
        aria-label={`Round ${Math.min(round + 1, ROUND_COUNT)} of ${ROUND_COUNT}`}
      >
        {Array.from({ length: ROUND_COUNT }, (_, i) => (
          <span
            key={i}
            className={`oo-trail-item ${
              i < round || (i === round && done) ? "is-done" : i === round ? "is-now" : ""
            }`}
          >
            <Picture id="star" />
          </span>
        ))}
      </div>

      <NavPillButton
        label="Back"
        ariaLabel="Back to the On & Off title screen"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onHome();
        }}
      />
      <button
        type="button"
        className="oo-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>
    </div>
  );
}
