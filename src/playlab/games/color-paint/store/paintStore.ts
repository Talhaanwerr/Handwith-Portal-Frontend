import { create } from "zustand";
import { ACTIVITIES } from "@games/color-paint/constants/activities";

/**
 * Screen graph — one straight line, the portal's splash → play → finale shape:
 *
 *   splash (tap to start) → intro ("Let's paint!") → level ×7 → finale
 *
 * Nothing is persisted. The game is a single short sitting of seven objects
 * with no scores or unlocks, so there is no "Continue" to remember and a
 * returning child simply starts at the apple again — which, for the colours,
 * is the point.
 */
export type PaintScreen = "splash" | "intro" | "level" | "finale";

interface PaintState {
  screen: PaintScreen;
  /** Which object is on the easel — an index into ACTIVITIES. */
  index: number;
  setScreen: (s: PaintScreen) => void;
  /** Move to the next object; false when the last one has been painted. */
  advance: () => boolean;
  /** Back to the first object, for "Paint again". */
  restart: () => void;
}

export const usePaintStore = create<PaintState>()((set, get) => ({
  screen: "splash",
  index: 0,
  setScreen: (screen) => set({ screen }),
  advance: () => {
    const next = get().index + 1;
    if (next >= ACTIVITIES.length) return false;
    set({ index: next });
    return true;
  },
  restart: () => set({ index: 0, screen: "level" }),
}));
