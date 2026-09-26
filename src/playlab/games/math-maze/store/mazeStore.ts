"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LEVEL_ORDER, starsFor, type LevelId } from "@games/math-maze/constants/mazes";
import { asRecord, numberMap } from "@shared/utils/persisted";

export type MazeScreen = "splash" | "pick" | "play" | "done";

interface MazeState {
  screen: MazeScreen;
  /** The run being played. */
  level: LevelId;
  /** Which play of that run this is — picks the maze from its pool. */
  round: number;
  /** Wrong taps in this walk — the stars at the end of it. */
  misses: number;
  /** Best stars ever per run. */
  best: Partial<Record<LevelId, number>>;
  /** Mazes finished per run: the next play deals the next maze. */
  played: Partial<Record<LevelId, number>>;

  setScreen: (s: MazeScreen) => void;
  /** Walk the next maze of a run, from the start. */
  begin: (level: LevelId) => void;
  addMiss: () => void;
  /** The prize is reached: bank the stars, move the run on, show the finish. */
  finish: () => void;
}

export const useMazeStore = create<MazeState>()(
  persist(
    (set) => ({
      screen: "splash",
      level: "one-five",
      round: 0,
      misses: 0,
      best: {},
      played: {},

      setScreen: (screen) => set({ screen }),
      begin: (level) =>
        set((s) => ({ level, round: s.played[level] ?? 0, misses: 0, screen: "play" })),
      addMiss: () => set((s) => ({ misses: s.misses + 1 })),
      finish: () =>
        set((s) => ({
          screen: "done",
          best: { ...s.best, [s.level]: Math.max(s.best[s.level] ?? 0, starsFor(s.misses)) },
          played: { ...s.played, [s.level]: s.round + 1 },
        })),
    }),
    {
      name: "math-maze-progress",
      // where a child is inside a walk is session flow; stars and how far
      // through each run's mazes they are survive
      partialize: (s) => ({ best: s.best, played: s.played }),
      merge: (persisted, current) => {
        const saved = asRecord(persisted);
        return {
          ...current,
          best: numberMap(saved?.best, LEVEL_ORDER, 0, 3),
          played: numberMap(saved?.played, LEVEL_ORDER, 0, 100000),
        };
      },
    }
  )
);
