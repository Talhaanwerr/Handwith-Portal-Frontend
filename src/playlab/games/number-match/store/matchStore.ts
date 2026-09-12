"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_ROUNDS } from "@games/number-match/constants/rounds";

export type MatchScreen = "home" | "play" | "final";

interface MatchState {
  screen: MatchScreen;
  /** Rounds won = stickers in the book = the 0-based round now being played. */
  done: number;
  setScreen: (s: MatchScreen) => void;
  /** Open the cards, carrying on from wherever the book got to. */
  start: () => void;
  /** Stick the sticker down and move on, or finish the book. */
  nextRound: () => void;
  /** A brand new book. */
  restart: () => void;
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set) => ({
      screen: "home",
      done: 0,
      setScreen: (screen) => set({ screen }),
      start: () =>
        set((s) => ({
          screen: "play",
          // a full book starts again rather than opening on its last page
          done: s.done >= TOTAL_ROUNDS ? 0 : s.done,
        })),
      nextRound: () =>
        set((s) => {
          const done = s.done + 1;
          return done >= TOTAL_ROUNDS ? { done, screen: "final" } : { done };
        }),
      restart: () => set({ done: 0, screen: "play" }),
    }),
    {
      name: "number-match-progress",
      // the screen is session flow, not progress: a refresh re-enters through
      // the start screen, exactly like every other game in the portal
      partialize: (s) => ({ done: s.done }),
    }
  )
);
