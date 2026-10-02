"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asRecord, numberMap } from "@shared/utils/persisted";
import { BOARDS, MODULE_IDS, type ModuleId } from "@games/sort-two-ways/constants/boards";

/** home (title + module cards) → play (four boards) → complete (star card). */
export type StwScreen = "home" | "play" | "complete";

interface StwState {
  screen: StwScreen;
  module: ModuleId | null;
  /** 0–3: set `board / 2`, sorted by its rule `board % 2`. */
  board: number;
  /** Wrong drops this run — the star card's stars come from it. */
  misses: number;
  /** Best stars per module — the only thing kept between visits. */
  best: Partial<Record<ModuleId, number>>;

  setScreen: (s: StwScreen) => void;
  toHome: () => void;
  start: (m: ModuleId) => void;
  advance: () => void;
  miss: () => void;
  restart: () => void;
  record: (m: ModuleId, stars: number) => void;
}

export const useSortTwoWaysStore = create<StwState>()(
  persist(
    (set) => ({
      screen: "home",
      module: null,
      board: 0,
      misses: 0,
      best: {},

      setScreen: (screen) => set({ screen }),
      toHome: () => set({ screen: "home", board: 0, misses: 0 }),
      start: (module) => set({ module, board: 0, misses: 0, screen: "play" }),
      advance: () =>
        set((s) => {
          const next = s.board + 1;
          return next >= BOARDS ? { board: next, screen: "complete" as const } : { board: next };
        }),
      miss: () => set((s) => ({ misses: s.misses + 1 })),
      restart: () => set({ board: 0, misses: 0, screen: "play" }),
      record: (m, stars) =>
        set((s) => ({ best: { ...s.best, [m]: Math.max(s.best[m] ?? 0, stars) } })),
    }),
    {
      name: "sort-two-ways-progress",
      partialize: (s) => ({ best: s.best }),
      // GAME_DEV: validate what comes back — only known modules, 1–3 stars.
      merge: (persisted, current) => ({
        ...current,
        best: numberMap(asRecord(persisted)?.best, MODULE_IDS, 1, 3),
      }),
    }
  )
);
