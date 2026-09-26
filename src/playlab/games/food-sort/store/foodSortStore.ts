"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MAX_TABLES,
  MODULE_IDS,
  moduleById,
  type ModuleId,
} from "@games/food-sort/constants/activities";
import { asRecord, numberMap } from "@shared/utils/persisted";

export type FoodScreen = "splash" | "pick" | "play" | "done";

interface FoodSortState {
  screen: FoodScreen;
  /** The module being played. */
  module: ModuleId;
  /** 0-based table inside it. */
  index: number;
  /** Tables finished per module, at best — the only thing worth keeping. */
  finished: Partial<Record<ModuleId, number>>;

  setScreen: (s: FoodScreen) => void;
  /** A module from its first table. */
  begin: (module: ModuleId) => void;
  /** The next table, or the end of the module. */
  next: () => void;
}

export const useFoodSortStore = create<FoodSortState>()(
  persist(
    (set) => ({
      screen: "splash",
      module: "colours",
      index: 0,
      finished: {},

      setScreen: (screen) => set({ screen }),
      begin: (module) => set({ module, index: 0, screen: "play" }),
      next: () =>
        set((s) => {
          const total = moduleById(s.module).activities.length;
          const index = s.index + 1;
          const finished = {
            ...s.finished,
            [s.module]: Math.max(s.finished[s.module] ?? 0, index),
          };
          return index >= total ? { index, finished, screen: "done" } : { index, finished };
        }),
    }),
    {
      name: "food-sort-progress",
      partialize: (s) => ({ finished: s.finished }),
      merge: (persisted, current) => ({
        ...current,
        finished: numberMap(asRecord(persisted)?.finished, MODULE_IDS, 0, MAX_TABLES),
      }),
    }
  )
);
