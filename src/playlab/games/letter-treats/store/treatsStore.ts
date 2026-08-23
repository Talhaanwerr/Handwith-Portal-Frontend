import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Screen graph - one stack, Back always goes to the immediate parent:
 *
 *   splash (tap to start) -> alphabet-set -> letter -> challenge
 *
 * The only thing persisted is the last letter opened, so "Continue" on the
 * alphabet can take a returning child straight back to it. No scores, no
 * completion state.
 */
export type TreatScreen = "splash" | "alphabet-set" | "letter" | "challenge";

interface TreatsState {
  screen: TreatScreen;
  currentLetter: string;
  /** Last letter the child opened - null until they open one. Persisted. */
  lastLetter: string | null;
  setScreen: (s: TreatScreen) => void;
  /** Open a letter's learning screen (and remember it). */
  openLetter: (letter: string) => void;
}

export const useTreatsStore = create<TreatsState>()(
  persist(
    (set) => ({
      screen: "splash",
      currentLetter: "A",
      lastLetter: null,
      setScreen: (screen) => set({ screen }),
      openLetter: (letter) => set({ currentLetter: letter, lastLetter: letter, screen: "letter" }),
    }),
    {
      name: "candy-abc-progress",
      partialize: (s) => ({ lastLetter: s.lastLetter }),
    }
  )
);
