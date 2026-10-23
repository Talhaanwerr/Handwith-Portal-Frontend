"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_GROUPS, type LetterCase } from "@games/magnet-match/constants/letters";

export type MagnetScreen = "splash" | "play" | "complete";

interface MagnetState {
  screen: MagnetScreen;
  /** 0-based index of the current letter group (TOTAL_GROUPS = finished) */
  groupIndex: number;
  /** Uppercase (letter names) or lowercase (phonics sounds). */
  letterCase: LetterCase;
  setLetterCase: (c: LetterCase) => void;
  setScreen: (s: MagnetScreen) => void;
  nextGroup: () => void;
  resetProgress: () => void;
}

export const useMagnetStore = create<MagnetState>()(
  persist(
    (set) => ({
      screen: "splash",
      groupIndex: 0,
      letterCase: "upper",
      setLetterCase: (letterCase) => set({ letterCase }),
      setScreen: (screen) => set({ screen }),
      nextGroup: () =>
        set((s) => {
          const next = s.groupIndex + 1;
          return next >= TOTAL_GROUPS
            ? { groupIndex: next, screen: "complete" }
            : { groupIndex: next };
        }),
      resetProgress: () => set({ groupIndex: 0 }),
    }),
    {
      name: "magnet-match-progress",
      // screen is session flow, not progress — refresh re-enters via splash
      partialize: (s) => ({ groupIndex: s.groupIndex, letterCase: s.letterCase }),
    }
  )
);
