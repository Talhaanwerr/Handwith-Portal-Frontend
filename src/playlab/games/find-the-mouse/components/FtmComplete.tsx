"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Confetti } from "@shared/components/game/Confetti";
import { StarRow } from "@shared/components/ui/StarRow";
import { playCelebrationSound, playClickSound } from "@shared/audio/sfx";
import { playClip, sayAfter, clipText, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Teacher } from "@games/door-count/components/Teacher";
import { Kitchen, MouseHead } from "@games/find-the-mouse/components/SceneArt";
import { starsFor } from "@games/find-the-mouse/constants/scene";
import type { FtmMode } from "@games/find-the-mouse/store/findTheMouseStore";

interface FtmCompleteProps {
  mode: FtmMode;
  misses: number;
  onPlayAgain: () => void;
  onChooseMode: () => void;
  onExitPortal: () => void;
}

/**
 * THE FINISH — the portal's star card (the same shape as Math Maze's and
 * Number Safari's): confetti, a card with the result and stars earned from
 * how few wrong taps the run took, three ways on, and the teacher jumping.
 * A row of mice pops up over the card's top edge.
 */
export function FtmComplete({
  mode,
  misses,
  onPlayAgain,
  onChooseMode,
  onExitPortal,
}: FtmCompleteProps) {
  const cheerId = useMemo(() => cheerFor(`find-the-mouse-${mode}-${misses}`), [mode, misses]);
  const stars = starsFor(misses);
  const doneId = mode === "peek" ? "mouse-done-peek" : "mouse-done-count";

  // cheer first, jingle after — never talking over itself; then the card's
  // title and the ways on, each after the line before
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      void playClip(cheerId).then(() => {
        if (cancelled) return;
        playCelebrationSound();
        void sayAfter(doneId);
        void sayAfter("mouse-done-next");
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
      stopVoice();
    };
  }, [cheerId, doneId]);

  const go = (fn: () => void) => () => {
    playClickSound();
    fn();
  };

  return (
    <div className="ftm-screen ftm-done">
      <Kitchen />
      <Confetti count={48} />

      <div className="ftm-teacher-slot" aria-hidden="true">
        <Teacher cheer say={clipText(cheerId)} />
      </div>

      <div className="ftm-done-center">
        <motion.div
          className="ftm-done-card"
          initial={{ scale: 0.84, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <div className="ftm-done-mice" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="ftm-done-mouse"
                initial={{ y: "70%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.12, type: "spring", stiffness: 300, damping: 14 }}
              >
                <MouseHead />
              </motion.span>
            ))}
          </div>

          <h2 className="ftm-done-title font-rounded font-black">{clipText(doneId)}</h2>
          <p className="ftm-done-sub font-rounded font-bold">
            {mode === "peek" ? "Peek-a-Mouse" : "Count the Mice"} · 6 rounds
          </p>
          <StarRow earned={stars} total={3} size={44} />

          <div className="ftm-done-buttons">
            <button
              type="button"
              className="ftm-done-btn ftm-done-btn--go font-rounded font-black"
              onClick={go(onPlayAgain)}
            >
              Play again
            </button>
            <button
              type="button"
              className="ftm-done-btn font-rounded font-black"
              onClick={go(onChooseMode)}
            >
              {mode === "peek" ? "Count the Mice" : "Peek-a-Mouse"}
            </button>
            <button
              type="button"
              className="ftm-done-btn font-rounded font-black"
              onClick={go(onExitPortal)}
            >
              Back to Games
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
