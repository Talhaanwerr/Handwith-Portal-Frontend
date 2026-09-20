"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSpaceStore } from "@games/space-letters/store/spaceStore";
import { SpaceBackdrop } from "@games/space-letters/components/SpaceScreens";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { Button } from "@shared/components/ui/Button";
import { playClip, preloadClips, stopVoice } from "@shared/audio/voice";
import { playClickSound } from "@shared/audio/sfx";

/**
 * LETTER INTRO / DEMONSTRATION — the calm beat between picking a letter and
 * playing its round. The letter appears, its name is spoken (the existing
 * `letter-<x>` clip every other game already uses), then the child taps
 * through to the interactive round. Kept to one screen, one action, per the
 * brief's "minimal UI + majestic experience".
 */
export function SpaceIntro({ onExplore }: { onExplore: () => void }) {
  const router = useRouter();
  const currentLetter = useSpaceStore((s) => s.currentLetter);
  const letterKey = currentLetter.toLowerCase();

  useEffect(() => {
    preloadClips([`letter-${letterKey}`, `space-find-${letterKey}`]);
    const t = setTimeout(() => void playClip(`letter-${letterKey}`), 300);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, [letterKey]);

  return (
    <div className="spl-screen relative flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden px-6 py-8">
      <SpaceBackdrop />

      <NavPillButton
        label="Letters"
        ariaLabel="Back to the letter map"
        tone="space"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          stopVoice();
          router.back();
        }}
      />

      <motion.div
        key={currentLetter}
        className="spl-target-letter font-rounded relative z-10 font-black"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        aria-label={`The letter ${currentLetter}`}
        role="img"
      >
        {currentLetter}
      </motion.div>

      <motion.p
        className="font-rounded relative z-10 text-lg font-semibold text-white/85 drop-shadow-md"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Let&apos;s find it in space!
      </motion.p>

      <motion.div
        className="relative z-10"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <Button
          size="lg"
          onClick={() => {
            playClickSound();
            onExplore();
          }}
          aria-label={`Explore and find the letter ${currentLetter}`}
          className="spl-explore-btn"
        >
          Explore
        </Button>
      </motion.div>
    </div>
  );
}
