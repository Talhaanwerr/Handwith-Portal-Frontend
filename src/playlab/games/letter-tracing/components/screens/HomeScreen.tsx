"use client";

import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import { GardenScene } from "@shared/components/animations/GardenScene";
import { symbolsFor } from "@games/letter-tracing/constants/symbols";
import { playClip, clipText } from "@shared/audio/voice";
import { useEffect } from "react";
import { useGameStore } from "@games/letter-tracing/store/gameStore";
import { getThemeColors } from "@games/letter-tracing/constants/rewards";

interface HomeScreenProps {
  onContinue: () => void;
  onStartFromA: () => void;
  /** The child taps any letter on the shelf to start tracing from it */
  onSelectLetter: (index: number) => void;
  /** Back to the game's main menu */
  onBack?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeScreen({ onContinue, onStartFromA, onSelectLetter, onBack }: HomeScreenProps) {
  const { progress, module, lowercaseProgress, numbersProgress, practiceMode, setPracticeMode } =
    useGameStore();
  const currentProgress =
    module === "lowercase" ? lowercaseProgress : module === "numbers" ? numbersProgress : progress;
  const completedCount = currentProgress.completedLetters.length;
  // symbolsFor, not a hand-rolled ternary: the shelf must show the module's OWN
  // glyphs. The old `numbers ? NUMBER : LETTER` branch gave the lowercase
  // module an UPPERCASE shelf whose letters matched nothing in its data.
  const allLetters = symbolsFor(module);
  const total = allLetters.length;
  const currentLetter = allLetters[currentProgress.currentLetterIndex] ?? allLetters[0];
  const [bg1, bg2] = getThemeColors(currentProgress.currentTheme);

  // Spoken prompt matches the on-screen "Pick a letter/number" label exactly
  useEffect(() => {
    const t = setTimeout(
      () => void playClip(module === "numbers" ? "instr-choose-a-number" : "instr-choose-a-letter"),
      450
    );
    return () => clearTimeout(t);
  }, [module]);

  return (
    <div
      className="lt-bg-theme relative flex h-full w-full flex-col items-center gap-4 overflow-x-hidden overflow-y-auto"
      style={cssVars({ "--pl-theme-1": bg1, "--pl-theme-2": bg2 })}
    >
      {/* ── The garden (shared — see GardenScene), and its birds and
          butterflies in the outer bands ── */}
      <GardenScene />
      <HomeEnvironment />

      {/* Back to the main menu */}
      {onBack && (
        <button
          onClick={onBack}
          className="shadow-soft absolute top-4 left-4 z-20 flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/75 px-3.5 py-2"
          aria-label="Back to the main menu"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="#7C5CBF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-rounded text-plum/80 text-xs font-bold">Back</span>
        </button>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 mt-auto flex w-full flex-col items-center px-6 pt-6">
        {/* Logo */}
        <motion.div
          className="mb-5 flex flex-col items-center gap-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-end gap-2">
            {["A", "B", "C"].map((l, i) => (
              <motion.div
                key={l}
                className="pl-box pl-swatch flex items-center justify-center rounded-2xl shadow-lg"
                style={cssVars({
                  "--pl-size": `${46 + i * 4}px`,
                  "--pl-bg": ["#DDD5F5", "#C8F0D8", "#FFD6BC"][i],
                  "--pl-border": ["#A882E8", "#66CC94", "#FFAA80"][i],
                })}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }}
              >
                <span
                  className="pl-glyph pl-tint font-rounded font-black"
                  style={cssVars({
                    "--pl-font-size": `${22 + i * 2}px`,
                    "--pl-color": ["#7C5CBF", "#3DAA72", "#C06030"][i],
                  })}
                >
                  {l}
                </span>
              </motion.div>
            ))}
          </div>
          <h1 className="font-rounded text-plum text-2xl font-black">Letter Tracing</h1>
          <p className="font-rounded text-plum/50 text-sm font-semibold">
            {module === "lowercase"
              ? "Lowercase Letters"
              : module === "numbers"
                ? "Numbers 1 to 10"
                : "Uppercase Letters"}
          </p>
        </motion.div>

        {/* Letter shelf — big, tappable letters; the child can start anywhere */}
        <motion.div
          className="w-full max-w-md rounded-3xl bg-white/75 p-4 shadow-lg backdrop-blur-sm md:max-w-2xl"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {/* Practice mode — changeable any time, for every module */}
          <div className="mb-3 flex items-center justify-center">
            <div
              className="bg-lavender/50 flex rounded-full p-1"
              role="group"
              aria-label="Practice mode"
            >
              {(
                [
                  { id: "free", label: "Free", icon: "✏️" },
                  { id: "five-star", label: "5 Star", icon: "⭐" },
                ] as const
              ).map((m) => {
                const selected = practiceMode === m.id;
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => setPracticeMode(m.id)}
                    className={`flex min-h-[38px] items-center gap-1.5 rounded-full px-4 py-1.5 ${
                      selected ? "shadow-pill bg-white" : "bg-transparent"
                    }`}
                    whileTap={{ scale: 0.94 }}
                    aria-pressed={selected}
                    aria-label={
                      m.id === "free"
                        ? "Free mode — trace each letter once"
                        : "Five star mode — practice five times"
                    }
                  >
                    <span className="text-sm">{m.icon}</span>
                    <span
                      className={`font-rounded text-sm font-black ${selected ? "text-plum" : "text-plum-muted"}`}
                    >
                      {m.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="font-rounded text-plum/70 text-sm font-bold">
              {module === "numbers"
                ? clipText("instr-choose-a-number")
                : clipText("instr-choose-a-letter")}
            </span>
            <span className="font-rounded text-plum text-sm font-bold">
              {completedCount} / {total}
            </span>
          </div>

          {/* Alphabet shelf */}
          <div className="pl-symbol-grid gap-1.5 sm:gap-2">
            {allLetters.map((letter, index) => {
              const isDone = currentProgress.completedLetters.includes(letter);
              const isCurrent = letter === currentLetter && !isDone;
              const display = module === "lowercase" ? letter.toLowerCase() : letter;
              const isNumber = module === "numbers";
              return (
                <motion.button
                  key={letter}
                  onClick={() => onSelectLetter(index)}
                  className={`flex aspect-square min-h-[48px] min-w-[48px] items-center justify-center rounded-xl shadow-sm ${
                    isDone
                      ? "lt-shelf-tile--done"
                      : isCurrent
                        ? "lt-shelf-tile--current"
                        : "lt-shelf-tile"
                  }`}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.06 }}
                  aria-label={`Trace the letter ${display}`}
                >
                  <span
                    className={`font-rounded leading-none font-black ${isDone ? "text-white" : "text-plum"} ${
                      isNumber && display.length > 1 ? "lt-shelf-glyph--wide" : "lt-shelf-glyph"
                    }`}
                  >
                    {display}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="bg-lavender mt-3 h-2.5 w-full overflow-hidden rounded-full">
            <motion.div
              className="bg-plum h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / total) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Unified start flow — the same shared control as Letter Hunt and
          Jungle Spy: Continue (when progress exists) + Start from A/1. The
          shelf above covers "choose a letter". */}
      <motion.div
        className="relative z-10 mb-auto px-6 pb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <StartOptions
          hasProgress={completedCount > 0}
          onContinue={onContinue}
          onStartFromA={completedCount > 0 ? onStartFromA : onContinue}
          startLabel={module === "numbers" ? "Start from 1" : "Start from A"}
        />
      </motion.div>
    </div>
  );
}
