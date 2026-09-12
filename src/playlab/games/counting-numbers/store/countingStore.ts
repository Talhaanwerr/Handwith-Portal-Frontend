"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_LEVELS } from "@games/counting-numbers/constants/levels";

export type CountingScreen = "title" | "play" | "final";

interface CountingState {
  screen: CountingScreen;
  /** 0-based index of the current level (TOTAL_LEVELS = finished). */
  levelIndex: number;
  setScreen: (s: CountingScreen) => void;
  /** Jump to a level — the chrome's ‹ and › and the replay of a finished run. */
  goTo: (index: number) => void;
  /** The level is done: on to the next, or to the summary after the last. */
  nextLevel: () => void;
  resetProgress: () => void;
}

export const useCountingStore = create<CountingState>()(
  persist(
    (set) => ({
      screen: "title",
      levelIndex: 0,
      setScreen: (screen) => set({ screen }),
      goTo: (index) =>
        set({ levelIndex: Math.max(0, Math.min(TOTAL_LEVELS - 1, index)), screen: "play" }),
      nextLevel: () =>
        set((s) => {
          const next = s.levelIndex + 1;
          return next >= TOTAL_LEVELS
            ? { levelIndex: next, screen: "final" }
            : { levelIndex: next };
        }),
      resetProgress: () => set({ levelIndex: 0 }),
    }),
    {
      name: "counting-numbers-progress",
      // screen is session flow, not progress — a refresh re-enters via the title
      partialize: (s) => ({ levelIndex: s.levelIndex }),
    }
  )
);
