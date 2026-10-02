"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asRecord } from "@shared/utils/persisted";
import {
  isModuleId,
  roundCount,
  starsFor,
  type ModuleId,
} from "@games/color-shape-friends/constants/rounds";

export type CsfScreen = "home" | "play" | "complete";

interface CsfState {
  screen: CsfScreen;
  module: ModuleId;
  /** Index of the round being played in `module`. */
  round: number;
  /** Wrong taps in this run of the module — the stars come from this. */
  misses: number;
  /** Best stars ever earned per module, shown on the title cards. */
  best: Partial<Record<ModuleId, number>>;

  /** The title screen, the game's home. */
  goHome: () => void;
  /** Start (or restart) a module from its first round. */
  begin: (module: ModuleId) => void;
  addMiss: () => void;
  /** A round is solved: the next one, or the finish card after the last. */
  nextRound: () => void;
}

export const useColorShapeFriendsStore = create<CsfState>()(
  persist(
    (set) => ({
      screen: "home",
      module: "colors",
      round: 0,
      misses: 0,
      best: {},

      goHome: () => set({ screen: "home" }),
      begin: (module) => set({ screen: "play", module, round: 0, misses: 0 }),
      addMiss: () => set((s) => ({ misses: s.misses + 1 })),
      nextRound: () =>
        set((s) => {
          if (s.screen !== "play") return {};
          const next = s.round + 1;
          if (next < roundCount(s.module)) return { round: next };
          const stars = starsFor(s.misses);
          const best = Math.max(stars, s.best[s.module] ?? 0);
          return { screen: "complete" as const, best: { ...s.best, [s.module]: best } };
        }),
    }),
    {
      name: "color-shape-friends-progress",
      // Where the child is right now is session flow, not progress: only the
      // best stars per module are remembered between visits.
      partialize: (state) => ({ best: state.best }),
      // Validated merge (GAME_DEV.md): only known module ids with a star count
      // of 1–3 survive; an old build's shape, a hand edit or junk is dropped.
      merge: (persisted, current) => {
        const saved = asRecord(asRecord(persisted)?.best);
        const best: Partial<Record<ModuleId, number>> = {};
        if (saved) {
          for (const [key, value] of Object.entries(saved)) {
            if (isModuleId(key) && typeof value === "number" && value >= 1 && value <= 3) {
              best[key] = Math.round(value);
            }
          }
        }
        return { ...current, best };
      },
    }
  )
);
