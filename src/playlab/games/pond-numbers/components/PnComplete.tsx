"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Confetti } from "@shared/components/game/Confetti";
import { StarRow } from "@shared/components/ui/StarRow";
import { playCelebrationSound, playClickSound } from "@shared/audio/sfx";
import { playClip, sayAfter, clipText, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Teacher } from "@games/door-count/components/Teacher";
import { Frog, Pond } from "@games/pond-numbers/components/PondArt";
import { ROUND_COUNT, starsFor, type ModuleId } from "@games/pond-numbers/constants/rounds";

/**
 * THE FINISH — the portal's star card: confetti, the result, stars from how
 * few wrong taps the run took, and three ways on. Frogs peek over the card.
 */
export function PnComplete({
  module,
  misses,
  onPlayAgain,
  onOther,
  onExitPortal,
}: {
  module: ModuleId;
  misses: number;
  onPlayAgain: () => void;
  onOther: () => void;
  onExitPortal: () => void;
}) {
  const cheerId = useMemo(() => cheerFor(`pond-numbers-${module}-${misses}`), [module, misses]);
  const doneId = module === "quick" ? "pond-done-quick" : "pond-done-more";

  // cheer first, jingle after; then the card's title and the ways on, each
  // after the line before
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
    <div className="pn-screen pn-done">
      <Pond />
      <Confetti count={48} />

      <div className="pn-teacher-slot" aria-hidden="true">
        <Teacher cheer say={clipText(cheerId)} />
      </div>

      <div className="pn-done-center">
        <motion.div
          className="pn-done-card"
          initial={{ scale: 0.84, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <div className="pn-done-frogs" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="pn-done-frog"
                initial={{ y: "70%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.12, type: "spring", stiffness: 300, damping: 14 }}
              >
                <Frog />
              </motion.span>
            ))}
          </div>
          <h2 className="pn-done-title font-rounded font-black">{clipText(doneId)}</h2>
          <p className="pn-done-sub font-rounded font-bold">
            {module === "quick" ? "Quick Look" : "One More"} · {ROUND_COUNT} rounds
          </p>
          <StarRow earned={starsFor(misses)} total={3} size={44} />
          <div className="pn-done-buttons">
            <button
              type="button"
              className="pn-done-btn pn-done-btn--go font-rounded font-black"
              onClick={go(onPlayAgain)}
            >
              Play again
            </button>
            <button
              type="button"
              className="pn-done-btn font-rounded font-black"
              onClick={go(onOther)}
            >
              {module === "quick" ? "One More" : "Quick Look"}
            </button>
            <button
              type="button"
              className="pn-done-btn font-rounded font-black"
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
