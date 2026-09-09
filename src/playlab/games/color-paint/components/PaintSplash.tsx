"use client";

import { motion } from "framer-motion";
import { playClickSound } from "@shared/audio/sfx";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { Sparkle, CANDY } from "@games/letter-treats/components/candy-world/CandyArt";

const TITLE = ["C", "o", "l", "o", "r"];
const TITLE_B = ["P", "a", "i", "n", "t"];

interface PaintSplashProps {
  onPlay: () => void;
}

/**
 * Splash — Candy Land's own splash system, with this game's name on it.
 *
 * Same scene, same Bee, same letter-by-letter title and same big Play as
 * Candy ABC, because the child is walking into the same world. The tap is
 * the browser gesture that unlocks music and voice for the session.
 */
export function PaintSplash({ onPlay }: PaintSplashProps) {
  return (
    <div className="lt-screen lt-wash relative flex h-full w-full flex-col items-center justify-center">
      <CandyScene />

      <motion.div
        className="lt-bee-splash relative z-10"
        initial={{ x: -160, y: -60, opacity: 0, rotate: -12 }}
        animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <Bee mood="cheer" />
      </motion.div>

      <h1
        className="lt-title font-rounded relative z-10 flex items-baseline font-black"
        aria-label="Color and Paint"
      >
        {TITLE.map((ch, i) => (
          <motion.span
            key={`a${i}`}
            className={`lt-title-letter lt-title-letter--${(i % 6) + 1}`}
            initial={{ y: -120, opacity: 0, rotate: -20 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 420, damping: 16 }}
          >
            {ch}
          </motion.span>
        ))}
        <span className="lt-title-gap" />
        {TITLE_B.map((ch, i) => (
          <motion.span
            key={`b${i}`}
            className={`lt-title-letter lt-title-letter--${((i + 3) % 6) + 1}`}
            initial={{ y: -140, opacity: 0, rotate: 16 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 420, damping: 16 }}
          >
            {ch}
          </motion.span>
        ))}
      </h1>

      <motion.button
        onClick={() => {
          playClickSound();
          onPlay();
        }}
        className="lt-go lt-go--splash font-rounded relative z-10 flex items-center gap-3 font-black"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.06, 1], opacity: 1 }}
        transition={{ delay: 1.1, duration: 1.4, repeat: Infinity, repeatDelay: 0.2 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Play Color and Paint"
      >
        <span className="lt-go-icon" aria-hidden="true">
          <Sparkle color={CANDY.white} />
        </span>
        Play
      </motion.button>
    </div>
  );
}
