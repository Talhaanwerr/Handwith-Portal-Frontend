"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LEVEL_ORDER, questionCount, type LevelId } from "@games/blend-read/constants/levels";
import { asRecord, oneOf, wholeNumber } from "@shared/utils/persisted";

export type BRScreen = "splash" | "menu" | "play" | "complete";

interface BlendReadState {
  screen: BRScreen;
  levelId: LevelId;
  /** How far each level has got, kept apart so finishing one never wipes the
   *  others — the same shape as Key Quest's per-module progress. */
  progress: Record<LevelId, number>;
  /** The instructions modal is shown once, the first time Play is pressed. */
  seenInstructions: boolean;
  setScreen: (s: BRScreen) => void;
  markInstructionsSeen: () => void;
  /** Open a level and go to the question it left off at (or restart a
   *  finished one, rather than reopening on its own "Well Done"). */
  openLevel: (id: LevelId) => void;
  /** Move to the next question, or to "Well Done" if that was the last one. */
  nextQuestion: () => void;
  /** Start this level over from its first question. */
  restartLevel: (id: LevelId) => void;
}

export const useBlendReadStore = create<BlendReadState>()(
  persist(
    (set) => ({
      screen: "splash",
      levelId: "level1",
      progress: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
      seenInstructions: false,
      setScreen: (screen) => set({ screen }),
      markInstructionsSeen: () => set({ seenInstructions: true }),
      openLevel: (id) =>
        set((s) => ({
          levelId: id,
          screen: "play",
          progress: s.progress[id] >= questionCount(id) ? { ...s.progress, [id]: 0 } : s.progress,
        })),
      nextQuestion: () =>
        set((s) => {
          const next = s.progress[s.levelId] + 1;
          const progress = { ...s.progress, [s.levelId]: next };
          return next >= questionCount(s.levelId) ? { progress, screen: "complete" } : { progress };
        }),
      restartLevel: (id) =>
        set((s) => ({ progress: { ...s.progress, [id]: 0 }, levelId: id, screen: "play" })),
    }),
    {
      // bumped to v2: the progress shape changed from four weeks to five
      // levels, and a stale v1 entry in a tester's browser must not collide
      name: "blend-read-progress-v2",
      // the screen is session flow, not progress: a refresh re-enters through
      // the title screen, exactly like every other game in the portal
      partialize: (s) => ({
        progress: s.progress,
        levelId: s.levelId,
        seenInstructions: s.seenInstructions,
      }),
      // the saved level id INDEXES the level table, so an id this build does
      // not have (or a progress that is not a count) was a white screen
      merge: (persisted, current) => {
        const saved = asRecord(persisted) ?? {};
        const progress = asRecord(saved.progress) ?? {};
        return {
          ...current,
          levelId: oneOf(saved.levelId, LEVEL_ORDER, current.levelId),
          seenInstructions: saved.seenInstructions === true,
          progress: Object.fromEntries(
            LEVEL_ORDER.map((id) => [id, wholeNumber(progress[id], 0, questionCount(id), 0)])
          ) as Record<LevelId, number>,
        };
      },
    }
  )
);
