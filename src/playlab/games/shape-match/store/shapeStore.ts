"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MODULES, ROUNDS_PER_MODULE, TOTAL_MODULES } from "@games/shape-match/constants/modules";

export type ShapeScreen = "home" | "play" | "done";

interface ShapeState {
  screen: ShapeScreen;
  /** Which module is open, and where inside it. */
  module: number;
  round: number;
  /** The modules already finished, by id — the ticks on the start screen. */
  finished: string[];
  /** Tap a picture on the start screen. */
  openModule: (index: number) => void;
  /** Put this round away and move on, or finish the module. */
  nextRound: () => void;
  /** From the "well done" screen: on to the next picture. */
  nextModule: () => void;
  /** From anywhere: back to the shelf of pictures. */
  goHome: () => void;
  /** Wipe every tick. */
  resetAll: () => void;
}

export const useShapeStore = create<ShapeState>()(
  persist(
    (set) => ({
      screen: "home",
      module: 0,
      round: 0,
      finished: [],

      openModule: (index) =>
        set({ screen: "play", module: Math.min(Math.max(index, 0), TOTAL_MODULES - 1), round: 0 }),

      nextRound: () =>
        set((state) => {
          const round = state.round + 1;
          if (round < ROUNDS_PER_MODULE) return { round };
          const id = MODULES[state.module]?.id;
          const finished =
            id && !state.finished.includes(id) ? [...state.finished, id] : state.finished;
          return { screen: "done" as const, round: ROUNDS_PER_MODULE - 1, finished };
        }),

      nextModule: () =>
        set((state) => {
          const next = state.module + 1;
          if (next >= TOTAL_MODULES) return { screen: "home" as const };
          return { screen: "play" as const, module: next, round: 0 };
        }),

      goHome: () => set({ screen: "home", round: 0 }),

      resetAll: () => set({ finished: [], screen: "home", module: 0, round: 0 }),
    }),
    {
      name: "shape-match-progress",
      // which pictures are made is progress; where the child is right now is
      // session flow, and a refresh re-enters through the start screen
      partialize: (state) => ({ finished: state.finished }),
    }
  )
);
