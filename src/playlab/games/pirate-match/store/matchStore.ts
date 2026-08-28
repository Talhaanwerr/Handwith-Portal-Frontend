"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildRun, advanceRun, type LetterRun, type RunIntent } from "@shared/utils/progression";
import { ALPHA } from "@games/pirate-match/constants/rounds";

export type LetterCase = "upper" | "lower";
export type MatchScreen = "splash" | "case" | "start" | "level" | "complete";

/**
 * Pirate Match's session — the portal's standard alphabet-game shape:
 * canonical UPPERCASE letters, per-case progress (matching "b" to its
 * picture is different learning from "B"), flow state never persisted.
 * One target letter is marked done per round; its two companions are
 * practice, so a run is exactly 26 rounds and Continue means what it means
 * in every other game.
 */
interface MatchState {
  screen: MatchScreen;
  letterCase: LetterCase;
  currentLetter: string;
  run: LetterRun | null;
  done: string[];
  doneLower: string[];
  setScreen: (s: MatchScreen) => void;
  setCase: (c: LetterCase) => void;
  markDone: (l: string) => void;
  beginRun: (startAt: string | number, intent: RunIntent) => void;
  /** Step to the next letter; false when the run is finished. */
  advance: () => boolean;
  resetProgress: (c?: LetterCase) => void;
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      letterCase: "upper",
      currentLetter: "A",
      run: null,
      done: [],
      doneLower: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),

      beginRun: (startAt, intent) =>
        set((s) => {
          const finished = s.letterCase === "lower" ? s.doneLower : s.done;
          const run = buildRun(ALPHA, startAt, finished, intent);
          return { run, currentLetter: run.queue[0] ?? "A" };
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

      markDone: (l) =>
        set((s) => {
          const key = s.letterCase === "lower" ? "doneLower" : "done";
          const letter = l.toUpperCase();
          if (s[key].includes(letter)) return {};
          return { [key]: [...s[key], letter] } as Partial<MatchState>;
        }),

      resetProgress: (c) =>
        set((s) => {
          const key = (c ?? s.letterCase) === "lower" ? "doneLower" : "done";
          return { [key]: [] } as Partial<MatchState>;
        }),
    }),
    {
      name: "pirate-match-progress",
      partialize: (s) => ({ done: s.done, doneLower: s.doneLower, letterCase: s.letterCase }),
    }
  )
);

/** The progress list for a case — read this rather than picking a field. */
export function doneFor(state: Pick<MatchState, "done" | "doneLower">, c: LetterCase): string[] {
  return c === "lower" ? state.doneLower : state.done;
}

/** Display form of a canonical letter. Data and clip ids stay uppercase. */
export function displayLetter(letter: string, c: LetterCase): string {
  return c === "lower" ? letter.toLowerCase() : letter.toUpperCase();
}
