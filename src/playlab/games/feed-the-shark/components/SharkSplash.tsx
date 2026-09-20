"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { playClickSound } from "@shared/audio/sfx";
import { playClip, preloadClips, stopVoice } from "@shared/audio/voice";
import { FriendlyShark, LetterFish } from "@games/feed-the-shark/components/SharkArt";
import { OceanBackdrop, BubbleStream } from "@games/feed-the-shark/components/OceanBackdrop";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useSharkStore } from "@games/feed-the-shark/store/sharkStore";

interface SharkSplashProps {
  onStart: () => void;
  onExitPortal?: () => void;
  /** True when saved progress exists — the button reads Continue instead */
  hasProgress: boolean;
}

export function SharkSplash({ onStart, onExitPortal, hasProgress }: SharkSplashProps) {
  const { mode, setMode } = useSharkStore();
  // Narration on entry — the same delayed-clip pattern as the other games'
  // home screens, with stopVoice cleanup so leaving never leaves it talking.
  useEffect(() => {
    preloadClips(["shark-intro", "shark-instruction"]);
    const t = setTimeout(() => void playClip("shark-intro"), 500);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, []);

  return (
    <div className="fs-bg pl-screen-shell">
      <OceanBackdrop />
      <BubbleStream />

      {onExitPortal && (
        <NavPillButton
          label="Back to Games"
          ariaLabel="Back to the game portal"
          tone="ocean"
          pinned
          onClick={() => {
            playClickSound();
            onExitPortal();
          }}
        />
      )}

      {/* The ocean and its bubbles are OUTSIDE this scroller now, so they
          cover the whole screen rather than one screenful. `m-auto` centred
          the overflow as well and is replaced by overflow-safe centring. */}
      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center px-6 py-6">
        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Title */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-1 text-center"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="font-rounded text-3xl font-black text-white drop-shadow-md md:text-5xl">
              Letters A–Z
            </h1>
            <p className="font-rounded text-sm font-bold text-white/90 drop-shadow-md md:text-base">
              Feed the shark by matching big and small letters
            </p>
            <h2 className="fs-subtitle font-rounded text-2xl font-black md:text-4xl">
              Feed the Shark
            </h2>
            <p className="font-rounded text-plum/70 mt-1 rounded-full bg-white/80 px-4 py-1 text-xs font-bold md:text-sm">
              Match BIG letters with little letters
            </p>
          </motion.div>

          {/* The shark + two little fish */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
          >
            <div className="fs-shark-splash">
              <FriendlyShark letter="C" />
            </div>
            <div className="flex flex-col gap-2">
              <motion.div
                className="fs-fish-chip"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="shadow-soft rounded-full bg-white/75 p-1.5">
                  <LetterFish letter="b" colorIndex={1} />
                </div>
              </motion.div>
              <motion.div
                className="fs-fish-chip"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <div className="shadow-soft rounded-full bg-white/75 p-1.5">
                  <LetterFish letter="c" colorIndex={0} />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Game mode — one fish at a time, or both fish together */}
          <motion.div
            className="shadow-soft relative z-10 flex rounded-full bg-white/80 p-1"
            role="group"
            aria-label="Game mode"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { id: "one" as const, label: "🐟 One by One", aria: "One fish at a time" },
              { id: "both" as const, label: "🐟🐟 Both", aria: "Both fish at the same time" },
            ].map((m) => {
              const selected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    playClickSound();
                    setMode(m.id);
                  }}
                  className={`font-rounded min-h-[40px] rounded-full px-4 text-sm font-black ${
                    selected ? "bg-ocean text-white" : "text-ocean bg-transparent"
                  }`}
                  aria-pressed={selected}
                  aria-label={m.aria}
                >
                  {m.label}
                </button>
              );
            })}
          </motion.div>

          {/* Start */}
          <motion.div
            className="relative z-10"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              size="xl"
              onClick={() => {
                playClickSound();
                onStart();
              }}
              aria-label={hasProgress ? "Continue feeding the sharks" : "Start feeding the sharks"}
            >
              {hasProgress ? "Continue" : "Start"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
