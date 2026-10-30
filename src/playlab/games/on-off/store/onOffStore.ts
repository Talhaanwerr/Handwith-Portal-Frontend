"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asRecord, numberMap, wholeNumber } from "@shared/utils/persisted";
import { ROUND_COUNT } from "@games/on-off/constants/scenes";

/** home (title + the Play card) → play → complete. */
export type OoScreen = "home" | "play" | "complete";

interface OoState {
  screen: OoScreen;
  round: number;
  /** Drags that ended away from the silhouette this run — the stars. */
  misses: number;
  /** Best stars for the run (0 = never finished) — the only thing kept
   *  between visits. */
  best: number;

  setScreen: (s: OoScreen) => void;
  toHome: () => void;
  /** A fresh run from round one (Play, and Play again). */
  start: () => void;
  advance: () => void;
  miss: () => void;
  record: (stars: number) => void;
}

/**
 * The saved best, from any version of the game. The first build had two
 * modules and kept `best` as `{ on, off }`; the run now mixes both, so the
 * better of those carries over. Anything else falls back to 0.
 */
function savedBest(value: unknown): number {
  const { on = 0, off = 0 } = numberMap(value, ["on", "off"], 1, 3);
  return Math.max(on, off, wholeNumber(value, 0, 3, 0));
}

export const useOnOffStore = create<OoState>()(
  persist(
    (set) => ({
      screen: "home",
      round: 0,
      misses: 0,
      best: 0,

      setScreen: (screen) => set({ screen }),
      toHome: () => set({ screen: "home", round: 0, misses: 0 }),
      start: () => set({ round: 0, misses: 0, screen: "play" }),
      // A leaving round's timers still run during its exit fade; one that
      // lands after the child went home must not move them anywhere.
      advance: () =>
        set((s) => {
          if (s.screen !== "play") return {};
          const next = s.round + 1;
          return next >= ROUND_COUNT
            ? { round: next, screen: "complete" as const }
            : { round: next };
        }),
      miss: () => set((s) => ({ misses: s.misses + 1 })),
      record: (stars) => set((s) => ({ best: Math.max(s.best, stars) })),
    }),
    {
      name: "on-off-progress",
      partialize: (s) => ({ best: s.best }),
      // GAME_DEV: validate what comes back (see `savedBest`).
      merge: (persisted, current) => ({
        ...current,
        best: savedBest(asRecord(persisted)?.best),
      }),
    }
  )
);
