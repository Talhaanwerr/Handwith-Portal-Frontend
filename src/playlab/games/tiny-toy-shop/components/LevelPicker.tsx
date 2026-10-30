"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { playClickSound } from "@shared/audio/sfx";
import { ADD_LEVEL_CHOICES, type AddLevel } from "@games/tiny-toy-shop/constants/rounds";

/**
 * Easy / Medium / Hard — shown when the Add Them Up card is tapped, before the
 * How to Play card and the first round. Three big buttons and a way back.
 */
export function LevelPicker({
  onPick,
  onClose,
}: {
  onPick: (level: AddLevel) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="tys-levels" role="dialog" aria-modal="true" aria-label="How hard?">
      <motion.div
        className="tys-levels-card font-rounded"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          type="button"
          className="tys-levels-close"
          onClick={() => {
            playClickSound();
            onClose();
          }}
          aria-label="Back to the games"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h2 className="tys-levels-title font-black">How hard?</h2>
        <div className="tys-levels-row">
          {ADD_LEVEL_CHOICES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`tys-level tys-level--${i + 1} font-black`}
              onClick={() => {
                playClickSound();
                onPick(c.id);
              }}
            >
              <span className="tys-level-name">{c.label}</span>
              <span className="tys-level-tag">{c.tag}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
