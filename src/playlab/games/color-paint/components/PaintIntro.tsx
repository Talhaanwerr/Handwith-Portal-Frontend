"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { playClickSound } from "@shared/audio/sfx";
import { playClip, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { Sparkle, CANDY } from "@games/letter-treats/components/candy-world/CandyArt";

/** The one line this screen says. Its text is read from the manifest so the
 *  words on screen and the words in the air can never differ. */
const INTRO_CLIP = "paint-intro";

interface PaintIntroProps {
  onStart: () => void;
  onExitPortal: () => void;
}

/**
 * Introduction — "Let's paint!" and nothing more.
 *
 * The same shape as every other game's introduction: the mascot, one spoken
 * line, one big go button. There is nothing to configure here — no case, no
 * difficulty — so it stays a single beat rather than growing a menu.
 */
export function PaintIntro({ onStart, onExitPortal }: PaintIntroProps) {
  useEffect(() => {
    preloadClips([INTRO_CLIP]);
    const t = setTimeout(() => void playClip(INTRO_CLIP), 500);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, []);

  return (
    <div className="lt-screen lt-wash pl-screen-shell">
      <CandyScene variant="soft" />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="plum"
        surface="soft"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-6 px-6 py-8 pt-16">
        <motion.div
          className="cp-intro-bee relative z-10"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: [0, -8, 0], opacity: 1 }}
          transition={{
            opacity: { duration: 0.5 },
            y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Bee mood="point" />
        </motion.div>

        <motion.h1
          className="lt-title lt-title--small font-rounded relative z-10 text-center font-black"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 18 }}
        >
          {clipText(INTRO_CLIP)}
        </motion.h1>

        <motion.button
          onClick={() => {
            playClickSound();
            stopVoice();
            onStart();
          }}
          className="lt-go font-rounded relative z-10 flex items-center gap-3 font-black"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 260, damping: 18 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Start painting"
        >
          <span className="lt-go-icon" aria-hidden="true">
            <Sparkle color={CANDY.white} />
          </span>
          Paint
        </motion.button>
      </div>
    </div>
  );
}
