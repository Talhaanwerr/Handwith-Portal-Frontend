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
import { JUNGLE_ANIMALS } from "@games/jungle-spy/constants/animals";

export type LetterCase = "upper" | "lower";
export type JungleScreen = "splash" | "grid" | "level" | "complete";

interface JungleState {
  screen: JungleScreen;
  letterCase: LetterCase;
  currentLetter: string;
  /**
   * This session's letter queue — session-only, never persisted.
   * See @shared/utils/progression. Jungle Spy used to pick the next animal
   * with `order.find((a) => !found.includes(a.letter))`, which is exactly why
   * "Start from A" skipped every animal already found.
   */
  run: LetterRun | null;
  /**
   * Progress is tracked PER CASE, exactly as the tracing game keeps its
   * uppercase, lowercase and numbers modules apart. Finding "A" next to the
   * ant teaches a different thing from finding "a", so finishing one case must
   * not silently hand the child the other — each case earns its own finale.
   *
   * Both lists hold canonical UPPERCASE letters; only the display differs.
   * `found` keeps its original name and meaning (the uppercase run), so a
   * child's already-persisted progress carries over untouched and the new
   * lowercase list simply starts empty.
   */
  found: string[];
  foundLower: string[];
  setScreen: (s: JungleScreen) => void;
  setCase: (c: LetterCase) => void;
  markFound: (l: string) => void;
  /** Begin a run. "fresh" = Start from A, "continue" = Continue. */
  beginRun: (startAt: string | number, intent: RunIntent) => void;
  /** Point the run at a letter the child tapped on the grid. */
  jumpTo: (letter: string) => void;
  /** Step to the next animal; false when the run is finished. */
  advance: () => boolean;
  resetProgress: (c?: LetterCase) => void;
}

/** Canonical letter order for this game — the animals' letters, in sequence. */
const ALPHA = JUNGLE_ANIMALS.map((a) => a.letter);

export const useJungleStore = create<JungleState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      letterCase: "upper",
      currentLetter: "A",
      run: null,
      found: [],
      foundLower: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),
      beginRun: (startAt, intent) =>
        set((s) => {
          const found = s.letterCase === "lower" ? s.foundLower : s.found;
          const run = buildRun(ALPHA, startAt, found, intent);
          return { run, currentLetter: run.queue[0] ?? "A" };
        }),

      jumpTo: (letter) =>
        set((s) => {
          const found = s.letterCase === "lower" ? s.foundLower : s.found;
          // Tapping a tile with no run yet IS a start — treat it as a fresh
          // run from that letter rather than leaving run null.
          const run = s.run ? jumpRunTo(s.run, letter) : buildRun(ALPHA, letter, found, "fresh");
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

      markFound: (l) =>
        set((s) => {
          const key = s.letterCase === "lower" ? "foundLower" : "found";
          const letter = l.toUpperCase();
          if (s[key].includes(letter)) return {};
          return { [key]: [...s[key], letter] } as Partial<JungleState>;
        }),
      resetProgress: (c) =>
        set((s) => {
          const key = (c ?? s.letterCase) === "lower" ? "foundLower" : "found";
          return { [key]: [] } as Partial<JungleState>;
        }),
    }),
    {
      name: "jungle-spy-progress",
      // screen/currentLetter are session flow, not progress
      partialize: (s) => ({ found: s.found, foundLower: s.foundLower, letterCase: s.letterCase }),
    }
  )
);

/** The list for a given case — read this rather than picking a field by hand. */
export function foundFor(
  state: Pick<JungleState, "found" | "foundLower">,
  c: LetterCase
): string[] {
  return c === "lower" ? state.foundLower : state.found;
}
