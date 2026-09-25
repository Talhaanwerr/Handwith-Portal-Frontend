"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MODULES, boardsFor } from "@games/cvc-match/constants/words";
import { asRecord, numberMap } from "@shared/utils/persisted";

/** Every board id this build has — the only keys a saved star count may use. */
const BOARD_IDS = new Set(MODULES.flatMap((m) => boardsFor(m).map((b) => b.id)));

export type CvcScreen = "splash" | "pick" | "play" | "complete";

interface CvcState {
  screen: CvcScreen;
  /** Which sound is being practised. */
  moduleId: string;
  /** 0-based board inside that module. */
  boardIndex: number;
  /** Wrong drops on the current board — the stars at the end of it. */
  misses: number;
  /** Best stars per board id, the only thing worth keeping. */
  best: Record<string, number>;

  setScreen: (s: CvcScreen) => void;
  /** Start a module from its first board. */
  beginModule: (moduleId: string) => void;
  nextBoard: (boardCount: number) => void;
  addMiss: () => void;
  bank: (boardId: string, stars: number) => void;
}

export const useCvcStore = create<CvcState>()(
  persist(
    (set) => ({
      screen: "splash",
      moduleId: MODULES[0].id,
      boardIndex: 0,
      misses: 0,
      best: {},

      setScreen: (screen) => set({ screen }),
      beginModule: (moduleId) => set({ moduleId, boardIndex: 0, misses: 0, screen: "play" }),

      nextBoard: (boardCount) =>
        set((s) => {
          const next = s.boardIndex + 1;
          return next >= boardCount
            ? { boardIndex: next, screen: "complete" }
            : { boardIndex: next, misses: 0 };
        }),

      addMiss: () => set((s) => ({ misses: s.misses + 1 })),
      bank: (boardId, stars) =>
        set((s) => ({ best: { ...s.best, [boardId]: Math.max(s.best[boardId] ?? 0, stars) } })),
    }),
    {
      name: "cvc-match-progress",
      partialize: (s) => ({ best: s.best }),
      // the total on the last screen ADDS these up, so a saved string was
      // glued on as text rather than counted
      merge: (persisted, current) => ({
        ...current,
        best: numberMap(asRecord(persisted)?.best, (id) => BOARD_IDS.has(id), 0, 3) as Record<
          string,
          number
        >,
      }),
    }
  )
);
