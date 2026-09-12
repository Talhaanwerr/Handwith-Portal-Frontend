"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { levelCount, type ModuleId } from "@games/door-count/constants/levels";

export type DoorScreen = "home" | "play" | "final";

interface DoorState {
  screen: DoorScreen;
  /** The module the child is in (or was last in). */
  moduleId: ModuleId;
  /** How far each module has got, kept apart so finishing one never wipes
   *  the other. The value is the 0-based door the child is on. */
  progress: Record<ModuleId, number>;
  setScreen: (s: DoorScreen) => void;
  /** Open a module and go to the door it left off at. */
  openModule: (id: ModuleId) => void;
  /** Move to the next door, or to the end if that was the last one. */
  nextLevel: () => void;
  /** Start this module over from its first door. */
  restartModule: (id: ModuleId) => void;
}

export const useDoorStore = create<DoorState>()(
  persist(
    (set) => ({
      screen: "home",
      moduleId: "count",
      progress: { count: 0, compare: 0 },
      setScreen: (screen) => set({ screen }),
      openModule: (id) =>
        set((s) => ({
          moduleId: id,
          screen: "play",
          // a finished module starts again rather than opening on its end
          progress: s.progress[id] >= levelCount(id) ? { ...s.progress, [id]: 0 } : s.progress,
        })),
      nextLevel: () =>
        set((s) => {
          const next = s.progress[s.moduleId] + 1;
          const progress = { ...s.progress, [s.moduleId]: next };
          return next >= levelCount(s.moduleId) ? { progress, screen: "final" } : { progress };
        }),
      restartModule: (id) =>
        set((s) => ({ progress: { ...s.progress, [id]: 0 }, moduleId: id, screen: "play" })),
    }),
    {
      name: "door-count-progress",
      // the screen is session flow, not progress: a refresh re-enters through
      // the home screen, exactly like every other game in the portal
      partialize: (s) => ({ progress: s.progress, moduleId: s.moduleId }),
    }
  )
);
