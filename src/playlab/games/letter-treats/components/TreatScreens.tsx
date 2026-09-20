"use client";

import { motion } from "framer-motion";
import { playClickSound } from "@shared/audio/sfx";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { Sparkle, CANDY } from "@games/letter-treats/components/candy-world/CandyArt";
import { useTreatsStore } from "@games/letter-treats/store/treatsStore";

const TITLE = ["C", "a", "n", "d", "y"];
const TITLE_B = ["A", "B", "C"];

/**
 * Splash - the whole of Candy Land, the title dropping in letter by letter
 * like sweets, Bee flying in, and one big Play. Tap-to-start: the tap is the
 * browser gesture that unlocks music and voice for the rest of the session.
 */
export function TreatSplash() {
  const setScreen = useTreatsStore((s) => s.setScreen);

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
        aria-label="Candy ABC"
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
            className={`lt-title-letter lt-title-letter--big lt-title-letter--${((i + 3) % 6) + 1}`}
            initial={{ y: -140, opacity: 0, rotate: 16 }}
            animate={{ y: [0, -10, 0], opacity: 1, rotate: 0 }}
            transition={{
              delay: 0.6 + i * 0.1,
              opacity: { duration: 0.2 },
              y: {
                delay: 1.2 + i * 0.1,
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 1.4,
                ease: "easeInOut",
              },
            }}
          >
            {ch}
          </motion.span>
        ))}
      </h1>

      <motion.button
        onClick={() => {
          playClickSound();
          setScreen("alphabet-set");
        }}
        className="lt-go lt-go--splash font-rounded relative z-10 flex items-center gap-3 font-black"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.06, 1], opacity: 1 }}
        transition={{ delay: 1.1, duration: 1.4, repeat: Infinity, repeatDelay: 0.2 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Play Candy ABC"
      >
        <span className="lt-go-icon" aria-hidden="true">
          <Sparkle color={CANDY.white} />
        </span>
        Play
      </motion.button>
    </div>
  );
}
