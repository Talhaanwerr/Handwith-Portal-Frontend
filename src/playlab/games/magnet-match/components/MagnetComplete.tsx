"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { useElementSize } from "@shared/hooks/useElementSize";
import { playCelebrationSound } from "@shared/audio/sfx";
import { playClip, clipText, stopVoice } from "@shared/audio/voice";
import { LOWERCASE } from "@games/magnet-match/constants/letters";
import { ChefArt } from "@games/magnet-match/components/MagnetArt";
import { KitchenBackdrop } from "@games/magnet-match/components/KitchenBackdrop";

interface MagnetCompleteProps {
  onPlayAgain: () => void;
  onExitPortal: () => void;
}

export function MagnetComplete({ onPlayAgain, onExitPortal }: MagnetCompleteProps) {
  // The shared hook, not a hand-rolled measure: this screen carried its own
  // copy that measured once on mount, so a device rotated during the finale
  // left the confetti sized for the previous orientation. useElementSize
  // observes the element instead.
  const [containerRef, dims] = useElementSize<HTMLDivElement>();

  // cheer first, jingle after — never talking over itself
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      void playClip("cheer-amazing").then(() => {
        if (!cancelled) playCelebrationSound();
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
      stopVoice();
    };
  }, []);

  return (
    <div ref={containerRef} className="mm-stage pl-screen-shell">
      <KitchenBackdrop />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <CelebrationSparkles active width={dims.w} height={dims.h} />
      </div>

      {/* The kitchen and the confetti stay outside the scroller so they cover
          the whole screen; only the praise column scrolls. */}
      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center px-6 py-6">
        <div className="relative z-10 flex w-full flex-col items-center gap-4">
          <motion.div
            className="text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="mm-heading--finale font-rounded text-4xl font-black md:text-5xl">
              {clipText("cheer-amazing")}
            </h1>
            <p className="font-rounded text-kitchen mt-2 text-lg font-bold">
              The whole alphabet is in the soup!
            </p>
          </motion.div>

          <motion.div
            className="mm-chef-finale"
            initial={{ scale: 0.5, y: 24 }}
            animate={{ scale: 1, y: [0, -10, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 200, damping: 15 },
              y: { duration: 1, repeat: 2, ease: "easeInOut", delay: 0.4 },
            }}
          >
            <ChefArt happy />
          </motion.div>

          {/* the finished alphabet, lowercase — this game's whole point */}
          <motion.div
            className="shadow-card flex max-w-[360px] flex-wrap justify-center gap-1.5 rounded-4xl bg-white/90 p-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {LOWERCASE.map((l, i) => (
              <motion.span
                key={l}
                className="bg-kitchen font-rounded flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35 + i * 0.03, type: "spring", stiffness: 260, damping: 18 }}
              >
                {l}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="flex w-full max-w-sm flex-col items-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="xl"
              onClick={onPlayAgain}
              className="w-full"
              aria-label="Play again from the letter a"
            >
              Play Again
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={onExitPortal}
              className="w-full"
              aria-label="Back to the game portal"
            >
              Back to Games
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
