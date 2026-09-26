"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { runLength, starsFor, type Difficulty } from "@games/number-safari/constants/levels";
import { asRecord, numberMap } from "@shared/utils/persisted";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export type SafariScreen = "splash" | "pick" | "play" | "complete";

interface SafariState {
  screen: SafariScreen;
  /** Which run is being played. */
  difficulty: Difficulty;
  /** 0-based level within the run. */
  levelIndex: number;
  /** Wrong answers so far in this run — the stars at the end. */
  misses: number;
  /** Best stars ever earned per run, the only thing worth keeping. */
  best: Partial<Record<Difficulty, number>>;

  setScreen: (s: SafariScreen) => void;
  /** Start a run from the top. */
  beginRun: (d: Difficulty) => void;
  goTo: (index: number) => void;
  /** Next level, or the finish line. */
  nextLevel: () => void;
  addMiss: () => void;
}

export const useSafariStore = create<SafariState>()(
  persist(
    (set) => ({
      screen: "splash",
      difficulty: "easy",
      levelIndex: 0,
      misses: 0,
      best: {},

      setScreen: (screen) => set({ screen }),

      beginRun: (difficulty) => set({ difficulty, levelIndex: 0, misses: 0, screen: "play" }),

      goTo: (index) =>
        set((s) => ({
          levelIndex: Math.max(0, Math.min(index, runLength(s.difficulty) - 1)),
          screen: "play",
        })),

      nextLevel: () =>
        set((s) => {
          const next = s.levelIndex + 1;
          if (next < runLength(s.difficulty)) return { levelIndex: next };
          // the run is over: bank the stars if they beat what is there
          const earned = starsFor(s.misses);
          const kept = s.best[s.difficulty] ?? 0;
          return {
            levelIndex: next,
            screen: "complete",
            best: { ...s.best, [s.difficulty]: Math.max(kept, earned) },
          };
        }),

      addMiss: () => set((s) => ({ misses: s.misses + 1 })),
    }),
    {
      name: "number-safari-progress",
      // where a child is inside a run is session flow, not progress — only the
      // stars they have earned survive a refresh, the way every game here does it
      partialize: (s) => ({ best: s.best }),
      // stars are 0–3; anything else saved here is not a star count
      merge: (persisted, current) => ({
        ...current,
        best: numberMap(asRecord(persisted)?.best, DIFFICULTIES, 0, 3),
      }),
    }
  )
);
