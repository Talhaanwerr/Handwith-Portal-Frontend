"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { StickerDisplay } from "@games/letter-tracing/components/illustrations/StickerDisplay";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { useElementSize } from "@shared/hooks/useElementSize";
import { STICKERS } from "@games/letter-tracing/constants/rewards";
import { useAudio } from "@games/letter-tracing/hooks/useAudio";
import { useGameStore } from "@games/letter-tracing/store/gameStore";

interface CompletionScreenProps {
  onPlayAgain: () => void;
}

export function CompletionScreen({ onPlayAgain }: CompletionScreenProps) {
  const { playCelebration } = useAudio();
  const { resetProgress, resetLowercaseProgress, resetNumbersProgress, module } = useGameStore();
  const isNumbers = module === "numbers";
  // Badge glyphs must match the module just completed — this previously
  // always showed uppercase "A B C…" even after finishing the LOWERCASE
  // module, the same module-blindness as the reset bug above.
  const symbols = isNumbers
    ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    : module === "lowercase"
      ? "abcdefghijklmnopqrstuvwxyz".split("")
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  // Observed, so an orientation change re-sizes the confetti buffer.
  const [containerRef, dimensions] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    const t = setTimeout(playCelebration, 300);
    return () => clearTimeout(t);
  }, [playCelebration]);

  // Reset the module the child actually just finished — not always uppercase.
  // (Previously this always called resetProgress(), which silently reset the
  // UPPERCASE bucket even when the child had just completed lowercase or
  // numbers, leaving the just-finished module stuck at "completion" forever
  // and wiping unrelated uppercase progress.)
  const handlePlayAgain = () => {
    if (module === "lowercase") resetLowercaseProgress();
    else if (module === "numbers") resetNumbersProgress();
    else resetProgress();
    onPlayAgain();
  };

  return (
    // The shell never scrolls, so the confetti canvas stays put and spans the
    // whole screen; only the inner column scrolls on short viewports.
    <div ref={containerRef} className="lt-bg-completion pl-screen-shell">
      <CelebrationSparkles active width={dimensions.w} height={dimensions.h} />

      <div className="pl-screen-scroll z-10 flex flex-col items-center justify-between px-6 py-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="font-rounded text-plum text-5xl font-black drop-shadow-sm"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            You did it!
          </motion.h1>
          <p className="font-rounded text-plum/70 mt-2 text-xl font-bold">
            {isNumbers ? "You learned all 10 numbers!" : "You learned all 26 letters!"}
          </p>
        </motion.div>

        {/* Alphabet badge */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
        >
          <div className="shadow-card flex max-w-[320px] flex-wrap justify-center gap-2 rounded-4xl bg-white/80 p-5">
            {symbols.map((l, i) => (
              <motion.div
                key={l}
                className="bg-plum flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 240, damping: 20 }}
              >
                <span className="font-rounded text-sm font-black text-white">{l}</span>
              </motion.div>
            ))}
          </div>

          <p className="font-rounded text-plum/60 text-center text-base font-semibold">
            You collected {STICKERS.length} stickers along the way!
          </p>
        </motion.div>

        {/* Sticker collection preview */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-rounded text-plum/60 mb-3 text-center text-sm font-bold">
            Your sticker collection
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {STICKERS.slice(0, 10).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
              >
                <StickerDisplay icon={s.icon} color={s.color} size={44} />
              </motion.div>
            ))}
            {STICKERS.length > 10 && (
              <div className="bg-lavender flex h-11 w-11 items-center justify-center rounded-2xl">
                <span className="font-rounded text-plum text-xs font-bold">
                  +{STICKERS.length - 10}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Play again */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button size="xl" onClick={handlePlayAgain} className="w-full">
            Play Again
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
