"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asRecord, numberMap } from "@shared/utils/persisted";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";

/** home (title + the module cards) → play → complete. */
export type ModuleScreen = "home" | "play" | "complete";

export interface ModuleStore<Id extends string> {
  screen: ModuleScreen;
  module: Id | null;
  round: number;
  /** Wrong taps and wrong drops this run — the finish card's stars. */
  misses: number;
  /** Best stars per module — the only thing kept between visits. */
  best: Partial<Record<Id, number>>;

  setScreen: (s: ModuleScreen) => void;
  toHome: () => void;
  start: (m: Id) => void;
  advance: () => void;
  miss: () => void;
  restart: () => void;
  record: (m: Id, stars: number) => void;
}

/**
 * One game's progress store — Count & Match and Number Hunt each make their
 * own, under their own `persist` key. Only the best stars are saved, and what
 * comes back is validated: a module this game no longer has (Count & Match's
 * old saves still name Find the Number, Group Boxes and Peekaboo Count) or a
 * star count outside 1–3 is simply dropped.
 */
export function createModuleStore<Id extends string>(key: string, ids: readonly Id[]) {
  return create<ModuleStore<Id>>()(
    persist(
      (set) => ({
        screen: "home",
        module: null,
        round: 0,
        misses: 0,
        best: {},

        setScreen: (screen) => set({ screen }),
        toHome: () => set({ screen: "home", round: 0, misses: 0 }),
        start: (module) => set({ module, round: 0, misses: 0, screen: "play" }),
        // only a round being played can move on: a leaving round's late timer
        // (after Back, or browser Back) must not push the home screen onwards
        advance: () =>
          set((s) => {
            if (s.screen !== "play") return {};
            const next = s.round + 1;
            return next >= ROUND_COUNT
              ? { round: next, screen: "complete" as const }
              : { round: next };
          }),
        miss: () => set((s) => (s.screen === "play" ? { misses: s.misses + 1 } : {})),
        restart: () => set({ round: 0, misses: 0, screen: "play" }),
        record: (m, stars) =>
          set((s) => ({
            best: { ...s.best, [m]: Math.max(s.best[m] ?? 0, stars) },
          })),
      }),
      {
        name: key,
        partialize: (s) => ({ best: s.best }),
        merge: (persisted, current) => ({
          ...current,
          best: numberMap(asRecord(persisted)?.best, ids, 1, 3),
        }),
      }
    )
  );
}
