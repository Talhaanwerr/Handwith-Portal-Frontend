"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_ACTIVITIES, activitiesFor, type Rule } from "@games/sort-it/constants/activities";
import { asRecord, numberMap } from "@shared/utils/persisted";

const RULES: readonly Rule[] = ["size", "home"];

export type SortScreen = "splash" | "pick" | "play" | "complete";

interface SortState {
  screen: SortScreen;
  /** Which rule is being practised. */
  rule: Rule;
  /** 0-based board inside that module. */
  index: number;
  /** Boards ever finished, per module — the only progress worth keeping. */
  finished: Partial<Record<Rule, number>>;

  setScreen: (s: SortScreen) => void;
  beginModule: (rule: Rule) => void;
  next: () => void;
}

export const useSortStore = create<SortState>()(
  persist(
    (set) => ({
      screen: "splash",
      rule: "size",
      index: 0,
      finished: {},

      setScreen: (screen) => set({ screen }),
      beginModule: (rule) => set({ rule, index: 0, screen: "play" }),

      next: () =>
        set((s) => {
          const count = activitiesFor(s.rule).length;
          const next = s.index + 1;
          const finished = {
            ...s.finished,
            [s.rule]: Math.max(s.finished[s.rule] ?? 0, next),
          };
          return next >= count
            ? { index: next, finished, screen: "complete" }
            : { index: next, finished };
        }),
    }),
    {
      name: "sort-it-progress",
      partialize: (s) => ({ finished: s.finished }),
      merge: (persisted, current) => ({
        ...current,
        finished: numberMap(asRecord(persisted)?.finished, RULES, 0, TOTAL_ACTIVITIES),
      }),
    }
  )
);
