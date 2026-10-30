"use client";

import { create } from "zustand";
import { ROUND_COUNT } from "@games/find-the-mouse/constants/scene";

/** The two ways to play, chosen on the title screen. */
export type FtmMode = "peek" | "count";

/** picker (the title screen with the two mode cards) → play → complete. */
export type FtmScreen = "picker" | "play" | "complete";

interface FtmState {
  screen: FtmScreen;
  /** null until a mode is chosen. */
  mode: FtmMode | null;
  /** 0-based round being played. */
  round: number;
  /** Wrong taps this run — the finish card's stars come from it. */
  misses: number;

  setScreen: (s: FtmScreen) => void;
  /** Home: the title screen. */
  toPicker: () => void;
  /** Pick a mode and start a fresh run. */
  startMode: (mode: FtmMode) => void;
  /** The round just solved: next round, or the finish after the last. */
  advance: () => void;
  /** One wrong tap. */
  miss: () => void;
  /** Replay the current mode from round 0. */
  restartMode: () => void;
}

/**
 * Session-only state — no `persist`. A run is six short rounds with nothing
 * worth carrying between visits, so everything resets through
 * useGameSession's onEnter and there is no saved value to validate.
 */
export const useFindTheMouseStore = create<FtmState>()((set) => ({
  screen: "picker",
  mode: null,
  round: 0,
  misses: 0,

  setScreen: (screen) => set({ screen }),
  toPicker: () => set({ screen: "picker", round: 0, misses: 0 }),
  startMode: (mode) => set({ mode, round: 0, misses: 0, screen: "play" }),
  advance: () =>
    set((s) => {
      const next = s.round + 1;
      return next >= ROUND_COUNT ? { round: next, screen: "complete" as const } : { round: next };
    }),
  miss: () => set((s) => ({ misses: s.misses + 1 })),
  restartMode: () => set({ round: 0, misses: 0, screen: "play" }),
}));
