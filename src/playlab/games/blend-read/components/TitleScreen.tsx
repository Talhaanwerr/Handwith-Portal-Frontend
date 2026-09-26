"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ClassroomScene } from "@games/blend-read/components/ClassroomScene";
import { playClickSound } from "@shared/audio/sfx";
import { playClip, preloadClips } from "@shared/audio/voice";

interface TitleScreenProps {
  onPlay: () => void;
}

/** How long the splash waits before moving on by itself. */
const AUTO_ADVANCE_MS = 2800;

/** State 1 — the opening screen. Automatic, the way Letter Tracing's splash
 *  is: it advances on its own after a couple of seconds, and the whole
 *  screen is one big tap target that skips the wait immediately — no
 *  separate Play button to hunt for. */
export function TitleScreen({ onPlay }: TitleScreenProps) {
  useEffect(() => {
    preloadClips(["blend-title", "blend-instructions", "blend-instructions-hint"]);
    const sayT = setTimeout(() => void playClip("blend-title"), 450);
    const advanceT = setTimeout(onPlay, AUTO_ADVANCE_MS);
    return () => {
      clearTimeout(sayT);
      clearTimeout(advanceT);
    };
  }, [onPlay]);

  return (
    <button
      type="button"
      className="br-screen pl-screen-shell"
      aria-label="Blend & Seek — tap to start"
      onClick={() => {
        playClickSound();
        onPlay();
      }}
    >
      <ClassroomScene />

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-7 px-6 py-8">
        <motion.div
          className="br-title-card flex flex-col items-center text-center"
          initial={{ y: -18, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <h1 className="br-title font-rounded font-black">Blend &amp; Seek</h1>
          <p className="br-subtitle font-rounded font-bold">Levels 1–5 Phonics</p>
        </motion.div>

        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="br-title-dot"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      </div>
    </button>
  );
}
