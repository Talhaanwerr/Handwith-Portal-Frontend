"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildRun,
  jumpRunTo,
  advanceRun,
  type LetterRun,
  type RunIntent,
} from "@shared/utils/progression";

export type LetterCase = "upper" | "lower";
export type SpaceScreen = "splash" | "mode" | "grid" | "level" | "complete";

/** Canonical letter order. Letters are always stored UPPERCASE — only the
 *  DISPLAY case changes — exactly as jungle-spy keeps its two cases. That
 *  way one progression implementation serves both modes. */
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface SpaceState {
  screen: SpaceScreen;
  letterCase: LetterCase;
  currentLetter: string;
  /** This session's letter queue — session-only, never persisted.
   *  See @shared/utils/progression. */
  run: LetterRun | null;
  /**
   * Progress is tracked PER CASE, the same way jungle-spy and the tracing
   * game keep their uppercase and lowercase modules apart: building "A" is a
   * different piece of learning from building "a", so finishing one case
   * must not silently hand the child the other. Both lists hold canonical
   * UPPERCASE letters; only the display differs.
   */
  built: string[];
  builtLower: string[];
  setScreen: (s: SpaceScreen) => void;
  setCase: (c: LetterCase) => void;
  markBuilt: (l: string) => void;
  /** Begin a run. "fresh" = Start from A, "continue" = Continue. */
  beginRun: (startAt: string | number, intent: RunIntent) => void;
  /** Point the run at a letter the child tapped on the grid. */
  jumpTo: (letter: string) => void;
  /** Step to the next letter; false when the run is finished. */
  advance: () => boolean;
  resetProgress: (c?: LetterCase) => void;
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      letterCase: "upper",
      currentLetter: "A",
      run: null,
      built: [],
      builtLower: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),

      beginRun: (startAt, intent) =>
        set((s) => {
          const done = s.letterCase === "lower" ? s.builtLower : s.built;
          const run = buildRun(ALPHA, startAt, done, intent);
          return { run, currentLetter: run.queue[0] ?? "A" };
        }),

      jumpTo: (letter) =>
        set((s) => {
          const done = s.letterCase === "lower" ? s.builtLower : s.built;
          // Tapping a tile with no run yet IS a start — treat it as a fresh
          // run from that letter rather than leaving run null.
          const run = s.run ? jumpRunTo(s.run, letter) : buildRun(ALPHA, letter, done, "fresh");
          return { run, currentLetter: letter };
        }),

      advance: () => {
        const s = get();
        if (!s.run) return false;
        const { run, isDone } = advanceRun(s.run);
        if (isDone) {
          set({ run });
          return false;
        }
        set({ run, currentLetter: run.queue[run.index] });
        return true;
      },

      markBuilt: (l) =>
        set((s) => {
          const key = s.letterCase === "lower" ? "builtLower" : "built";
          const letter = l.toUpperCase();
          if (s[key].includes(letter)) return {};
          return { [key]: [...s[key], letter] } as Partial<SpaceState>;
        }),

      resetProgress: (c) =>
        set((s) => {
          const key = (c ?? s.letterCase) === "lower" ? "builtLower" : "built";
          return { [key]: [] } as Partial<SpaceState>;
        }),
    }),
    {
      name: "space-letters-progress",
      // screen/currentLetter/run are session flow, not progress
      partialize: (s) => ({ built: s.built, builtLower: s.builtLower, letterCase: s.letterCase }),
    }
  )
);

/** The progress list for a given case — read this rather than picking a
 *  field by hand (same helper jungle-spy exposes). */
export function builtFor(state: Pick<SpaceState, "built" | "builtLower">, c: LetterCase): string[] {
  return c === "lower" ? state.builtLower : state.built;
}

/** Display form of a canonical letter for the active case. */
export function displayLetter(letter: string, c: LetterCase): string {
  return c === "lower" ? letter.toLowerCase() : letter.toUpperCase();
}

export { ALPHA as SPACE_ALPHA };
