"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asRecord, wholeNumber } from "@shared/utils/persisted";
import {
  MODULE_IDS,
  ROUNDS,
  starsFor,
  type ModuleId,
} from "@games/sesame-activities/constants/content";

export type SesameScreen = "home" | "play" | "complete";

interface SesameActivitiesState {
  screen: SesameScreen;
  module: ModuleId;
  /** 0-based round inside the module. */
  round: number;
  /** Wrong taps so far in this run — they decide the stars. */
  misses: number;
  /** Stars from the run that just finished. */
  lastStars: number;
  /** Best stars ever per module (0 = not played yet) — the only thing
   *  persisted between sessions. */
  best: Record<ModuleId, number>;
  goHome: () => void;
  start: (module: ModuleId) => void;
  replay: () => void;
  miss: () => void;
  /** The round was solved: on to the next, or to the star card. */
  next: () => void;
}

const NO_STARS: Record<ModuleId, number> = { colours: 0, snack: 0 };

export const useSesameActivitiesStore = create<SesameActivitiesState>()(
  persist(
    (set) => ({
      screen: "home",
      module: "colours",
      round: 0,
      misses: 0,
      lastStars: 0,
      best: NO_STARS,
      goHome: () => set({ screen: "home" }),
      start: (id) => set({ screen: "play", module: id, round: 0, misses: 0 }),
      replay: () => set({ screen: "play", round: 0, misses: 0 }),
      miss: () => set((s) => ({ misses: s.misses + 1 })),
      // A leaving scene's timers still run during its exit fade; one that
      // lands after the child went home must not move them anywhere.
      next: () =>
        set((s) => {
          if (s.screen !== "play") return {};
          if (s.round + 1 < ROUNDS) return { round: s.round + 1 };
          const stars = starsFor(s.misses);
          return {
            screen: "complete",
            lastStars: stars,
            best: { ...s.best, [s.module]: Math.max(s.best[s.module], stars) },
          };
        }),
    }),
    {
      name: "sesame-activities-progress",
      // the screen is session flow, not progress — a refresh re-enters
      // through the home screen, exactly like every other game in the portal
      partialize: (s) => ({ best: s.best }),
      merge: (persisted, current) => {
        const saved = asRecord(asRecord(persisted)?.best);
        const best = { ...NO_STARS };
        for (const id of MODULE_IDS) best[id] = wholeNumber(saved?.[id], 0, 3, 0);
        return { ...(current as SesameActivitiesState), best };
      },
    }
  )
);
