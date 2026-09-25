"use client";

import { motion } from "framer-motion";
import { playClickSound } from "@shared/audio/sfx";
import { playSequence } from "@shared/audio/voice";
import { useEffect } from "react";

interface InstructionsModalProps {
  onClose: () => void;
}

/**
 * State 2 — the instructions overlay. The classroom stays visible underneath,
 * dimmed; a white card explains the ONE thing this game is about: sound out
 * the word, then pick the matching picture. The hint line is the reason the
 * phoneme buttons exist at all — it is spoken here so a child hears it before
 * ever meeting a question.
 */
export function InstructionsModal({ onClose }: InstructionsModalProps) {
  useEffect(() => {
    void playSequence(["blend-instructions", "blend-instructions-hint"], 350);
  }, []);

  return (
    <motion.div
      className="br-modal-tint absolute inset-0 z-30 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        className="br-modal-close"
        aria-label="Close instructions"
        onClick={() => {
          playClickSound();
          onClose();
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 6 L18 18 M18 6 L6 18"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <motion.div
        className="br-modal-card"
        initial={{ scale: 0.85, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <h2 className="br-modal-title font-rounded font-black">Instructions</h2>
        <p className="br-modal-text font-rounded font-bold">
          Sound out the word at the top of the screen, then select the picture that matches the
          word.
        </p>
        <p className="br-modal-hint font-rounded font-bold">
          Hint: Click on the letter (or sound button beneath it) to hear the sound that the letter
          makes!
        </p>
      </motion.div>
    </motion.div>
  );
}
