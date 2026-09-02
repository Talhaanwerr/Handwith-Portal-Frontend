"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameScreen,
  GameProgress,
  StickerTheme,
  Module,
  PracticeMode,
} from "@games/letter-tracing/types";
import { symbolsFor } from "@games/letter-tracing/constants/symbols";
import { getThemeForProgress } from "@games/letter-tracing/constants/rewards";
import {
  buildRun,
  jumpRunTo,
  advanceRun,
  type LetterRun,
  type RunIntent,
} from "@shared/utils/progression";

interface GameState {
  screen: GameScreen;
  module: Module;
  /** Chosen once per session; null until the child picks Free or 5 Star */
  practiceMode: PracticeMode | null;
  /** This session's letter queue — session-only, never persisted. See
   *  @shared/utils/progression: it is what makes Start from A replay letters
   *  the child has already completed instead of skipping them. */
  run: LetterRun | null;
  progress: GameProgress;
  lowercaseProgress: GameProgress;
  numbersProgress: GameProgress;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setModule: (module: Module) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  goToLetter: (index: number) => void;
  beginRun: (startAt: string | number, intent: RunIntent) => void;
  jumpTo: (letter: string) => void;
  /** Step to the next letter; false when the run is finished. */
  advance: () => boolean;
  completeCurrentLetter: () => void;
  resetProgress: () => void;
  resetLowercaseProgress: () => void;
  resetNumbersProgress: () => void;
}

/** The progress record for whichever module is active — one place, so the
 *  three near-identical branches below never drift apart. */
function currentProgressOf(state: {
  module: Module;
  progress: GameProgress;
  lowercaseProgress: GameProgress;
  numbersProgress: GameProgress;
}): GameProgress {
  if (state.module === "lowercase") return state.lowercaseProgress;
  if (state.module === "numbers") return state.numbersProgress;
  return state.progress;
}

const defaultProgress: GameProgress = {
  currentLetterIndex: 0,
  completedLetters: [],
  unlockedStickers: [],
  currentTheme: "garden",
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      module: "uppercase",
      practiceMode: null,
      run: null,
      progress: { ...defaultProgress },
      lowercaseProgress: { ...defaultProgress },
      numbersProgress: { ...defaultProgress },

      setScreen: (screen) => set({ screen }),

      // Switching modules KILLS the session run: a run is a queue of one
      // module's symbols, and advancing a numbers session along a leftover
      // lowercase queue is how "1" repeated forever (every indexOf missed and
      // was masked to 0). A fresh module always builds a fresh run.
      setModule: (module) => set({ module, run: null }),

      setPracticeMode: (practiceMode) => set({ practiceMode }),

      beginRun: (startAt, intent) => {
        const { module } = get();
        const all = symbolsFor(module);
        const completed = currentProgressOf(get()).completedLetters;
        const run = buildRun(all, startAt, completed, intent);
        set({ run });
        get().goToLetter(Math.max(0, all.indexOf(run.queue[0] ?? all[0])));
      },

      jumpTo: (letter) => {
        const { module, run } = get();
        const all = symbolsFor(module);
        const completed = currentProgressOf(get()).completedLetters;
        const next = run ? jumpRunTo(run, letter) : buildRun(all, letter, completed, "fresh");
        set({ run: next });
        get().goToLetter(Math.max(0, all.indexOf(letter)));
      },

      advance: () => {
        const { run, module } = get();
        const all = symbolsFor(module);
        if (!run) return false;
        const stepped = advanceRun(run);
        set({ run: stepped.run });
        if (stepped.isDone) return false;
        // A symbol the module doesn't know means the run belongs to some other
        // state (it cannot happen in a healthy session). End the run rather
        // than mask the miss — Math.max(0, -1) here is what turned a stale
        // queue into the same first symbol repeating forever.
        const idx = all.indexOf(stepped.run.queue[stepped.run.index]);
        if (idx < 0) return false;
        get().goToLetter(idx);
        return true;
      },

      goToLetter: (index) => {
        const { module } = get();
        if (module === "lowercase") {
          set((state) => ({
            lowercaseProgress: { ...state.lowercaseProgress, currentLetterIndex: index },
          }));
        } else if (module === "numbers") {
          set((state) => ({
            numbersProgress: { ...state.numbersProgress, currentLetterIndex: index },
          }));
        } else {
          set((state) => ({
            progress: { ...state.progress, currentLetterIndex: index },
          }));
        }
      },

      completeCurrentLetter: () => {
        const { progress, lowercaseProgress, numbersProgress, module } = get();
        const currentProgress =
          module === "lowercase"
            ? lowercaseProgress
            : module === "numbers"
              ? numbersProgress
              : progress;
        const letter = symbolsFor(module)[currentProgress.currentLetterIndex];

        if (!letter) return;

        const completedLetters = currentProgress.completedLetters.includes(letter)
          ? currentProgress.completedLetters
          : [...currentProgress.completedLetters, letter];

        const stickerId = `sticker-${currentProgress.currentLetterIndex}`;
        const unlockedStickers = currentProgress.unlockedStickers.includes(stickerId)
          ? currentProgress.unlockedStickers
          : [...currentProgress.unlockedStickers, stickerId];

        const newTheme: StickerTheme = getThemeForProgress(completedLetters.length);

        const updated = {
          ...currentProgress,
          completedLetters,
          unlockedStickers,
          currentTheme: newTheme,
        };

        if (module === "lowercase") {
          set({ lowercaseProgress: updated });
        } else if (module === "numbers") {
          set({ numbersProgress: updated });
        } else {
          set({ progress: updated });
        }
      },

      resetProgress: () =>
        set({
          progress: { ...defaultProgress },
          screen: "home",
        }),

      resetLowercaseProgress: () =>
        set({
          lowercaseProgress: { ...defaultProgress },
          screen: "home",
        }),

      resetNumbersProgress: () =>
        set({
          numbersProgress: { ...defaultProgress },
          screen: "home",
        }),
    }),
    {
      name: "letter-tracing-progress",
      // v1: the lowercase module's canonical symbols became lowercase (they
      // were wrongly uppercase, which broke every indexOf against its data).
      // Saved lowercase completions from v0 are uppercase strings — lowercase
      // them once here so a child's record survives the fix.
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as Partial<GameState>;
        if (version < 1 && state.lowercaseProgress) {
          state.lowercaseProgress = {
            ...state.lowercaseProgress,
            completedLetters: (state.lowercaseProgress.completedLetters ?? []).map((l) =>
              l.toLowerCase()
            ),
          };
        }
        return state as GameState;
      },
      partialize: (state) => ({
        progress: state.progress,
        lowercaseProgress: state.lowercaseProgress,
        numbersProgress: state.numbersProgress,
      }),
    }
  )
);
