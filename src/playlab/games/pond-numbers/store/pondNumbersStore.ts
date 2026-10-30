"use client";

import { create } from "zustand";
import { ROUND_COUNT, type ModuleId } from "@games/pond-numbers/constants/rounds";

/** home (title + the two module cards) → play → complete. */
export type PnScreen = "home" | "play" | "complete";

interface PnState {
  screen: PnScreen;
  module: ModuleId | null;
  round: number;
  /** Wrong taps this run — the finish card's stars come from it. */
  misses: number;

  setScreen: (s: PnScreen) => void;
  toHome: () => void;
  start: (module: ModuleId) => void;
  advance: () => void;
  miss: () => void;
  restart: () => void;
}

/**
 * Session-only state — no `persist`. A run is six short rounds with nothing
 * worth carrying between visits, so there is no saved value to validate.
 */
export const usePondNumbersStore = create<PnState>()((set) => ({
  screen: "home",
  module: null,
  round: 0,
  misses: 0,

  setScreen: (screen) => set({ screen }),
  toHome: () => set({ screen: "home", round: 0, misses: 0 }),
  start: (module) => set({ module, round: 0, misses: 0, screen: "play" }),
  advance: () =>
    set((s) => {
      const next = s.round + 1;
      return next >= ROUND_COUNT ? { round: next, screen: "complete" as const } : { round: next };
    }),
  miss: () => set((s) => ({ misses: s.misses + 1 })),
  restart: () => set({ round: 0, misses: 0, screen: "play" }),
}));
