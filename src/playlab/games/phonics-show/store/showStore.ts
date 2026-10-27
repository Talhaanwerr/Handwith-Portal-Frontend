"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_QUESTIONS } from "@games/phonics-show/constants/questions";
import { asRecord, wholeNumber } from "@shared/utils/persisted";

export type ShowScreen = "splash" | "play" | "done";

export interface ShowState {
  screen: ShowScreen;
  /** 0-based question. */
  index: number;
  /** Questions answered right at the first tap this run. */
  firstTry: number;
  /** Best first-tap score ever — the only thing kept between sessions. */
  best: number;

  setScreen: (s: ShowScreen) => void;
  start: () => void;
  /** One question solved (`first`: at the first tap); the last opens the finish. */
  solved: (first: boolean) => void;
}

/**
 * A show's run: which question, how many right at the first tap, and the best
 * score kept between sessions under `name`. Every show on this stage (Phonics
 * Game Show, Sound Show) makes its own with its own length.
 */
export function createShowStore(name: string, total: number) {
  return create<ShowState>()(
    persist(
      (set) => ({
        screen: "splash",
        index: 0,
        firstTry: 0,
        best: 0,

        setScreen: (screen) => set({ screen }),
        start: () => set({ screen: "play", index: 0, firstTry: 0 }),

        solved: (first) =>
          set((s) => {
            // a leaving screen's last timer can land after Back: only count it in play
            if (s.screen !== "play") return {};
            const firstTry = s.firstTry + (first ? 1 : 0);
            const next = s.index + 1;
            return next >= total
              ? { firstTry, index: next, screen: "done", best: Math.max(s.best, firstTry) }
              : { firstTry, index: next };
          }),
      }),
      {
        name,
        partialize: (s) => ({ best: s.best }),
        merge: (persisted, current) => ({
          ...current,
          best: wholeNumber(asRecord(persisted)?.best, 0, total, 0),
        }),
      }
    )
  );
}

export const useShowStore = createShowStore("phonics-show-progress", TOTAL_QUESTIONS);
