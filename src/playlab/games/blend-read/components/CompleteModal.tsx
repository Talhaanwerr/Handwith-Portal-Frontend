"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ClassroomScene } from "@games/blend-read/components/ClassroomScene";
import { Confetti } from "@shared/components/game/Confetti";
import { playClickSound, playCelebrationSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";

interface CompleteModalProps {
  onHome: () => void;
  onReplay: () => void;
}

/** State 5 — "Well Done!", verbatim from the reference recording, with the
 *  two circular buttons: Home (back to the level menu) and Replay (this same
 *  level again from its first word). */
export function CompleteModal({ onHome, onReplay }: CompleteModalProps) {
  useEffect(() => {
    playCelebrationSound();
    void playClip("blend-well-done");
  }, []);

  return (
    <div className="br-screen pl-screen-shell">
      <ClassroomScene />
      <Confetti count={44} />

      <div className="br-modal-tint absolute inset-0 z-30 flex items-center justify-center px-6">
        <motion.div
          className="br-modal-card br-modal-card--done"
          initial={{ scale: 0.85, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <h2 className="br-modal-title font-rounded font-black">Well Done!</h2>
          <p className="br-modal-text font-rounded font-bold">
            Great work! You matched up all the words and pictures correctly. Would you like to play
            again?
          </p>

          <div className="br-modal-actions flex items-center justify-center">
            <button
              type="button"
              className="br-round-btn"
              aria-label="Home — back to the level menu"
              onClick={() => {
                playClickSound();
                onHome();
              }}
            >
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path d="M20 8 L34 20 L30 20 L30 32 L10 32 L10 20 L6 20 Z" fill="#FFFFFF" />
              </svg>
            </button>
            <button
              type="button"
              className="br-round-btn"
              aria-label="Play this level again"
              onClick={() => {
                playClickSound();
                onReplay();
              }}
            >
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path
                  d="M30 12 A13 13 0 1 0 32 20"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path d="M32 8 L32 20 L20 20 Z" fill="#FFFFFF" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
