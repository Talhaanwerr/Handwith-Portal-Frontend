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
export type OceanScreen = "splash" | "mode" | "grid" | "level" | "complete";

/**
 * The three things a child does with each letter, in order:
 *   build it from pieces → pop the bubbles it rises in → write it.
 * A stage cursor rather than three screens: they share one world and one
 * letter, so they are beats within a level, not separate destinations. Back
 * therefore leaves the whole letter, which is what a child expects.
 */
export type Stage = "build" | "pop" | "trace";
export const STAGES: readonly Stage[] = ["build", "pop", "trace"];

/** Letters are always stored UPPERCASE — only the DISPLAY case changes — so
 *  one progression implementation serves both modes. */
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface OceanState {
  screen: OceanScreen;
  letterCase: LetterCase;
  currentLetter: string;
  stage: Stage;
  run: LetterRun | null;
  /** Progress per case — building "A" is different learning from "a", so
   *  each case earns its own finale (the pattern jungle-spy established). */
  done: string[];
  doneLower: string[];
  setScreen: (s: OceanScreen) => void;
  setCase: (c: LetterCase) => void;
  setStage: (s: Stage) => void;
  /** Move to the next stage; false when the letter's three stages are done. */
  nextStage: () => boolean;
  markDone: (l: string) => void;
  beginRun: (startAt: string | number, intent: RunIntent) => void;
  jumpTo: (letter: string) => void;
  /** Step to the next letter; false when the run is finished. */
  advance: () => boolean;
  resetProgress: (c?: LetterCase) => void;
}

export const useOceanStore = create<OceanState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      letterCase: "upper",
      currentLetter: "A",
      stage: "build",
      run: null,
      done: [],
      doneLower: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),
      setStage: (stage) => set({ stage }),

      nextStage: () => {
        const i = STAGES.indexOf(get().stage);
        if (i < 0 || i >= STAGES.length - 1) return false;
        set({ stage: STAGES[i + 1] });
        return true;
      },

      beginRun: (startAt, intent) =>
        set((s) => {
          const finished = s.letterCase === "lower" ? s.doneLower : s.done;
          const run = buildRun(ALPHA, startAt, finished, intent);
          return { run, currentLetter: run.queue[0] ?? "A", stage: "build" };
        }),

      jumpTo: (letter) =>
        set((s) => {
          const finished = s.letterCase === "lower" ? s.doneLower : s.done;
          const run = s.run ? jumpRunTo(s.run, letter) : buildRun(ALPHA, letter, finished, "fresh");
          return { run, currentLetter: letter, stage: "build" };
        }),

      advance: () => {
        const s = get();
        if (!s.run) return false;
        const { run, isDone } = advanceRun(s.run);
        if (isDone) {
          set({ run });
          return false;
        }
        set({ run, currentLetter: run.queue[run.index], stage: "build" });
        return true;
      },

      markDone: (l) =>
        set((s) => {
          const key = s.letterCase === "lower" ? "doneLower" : "done";
          const letter = l.toUpperCase();
          if (s[key].includes(letter)) return {};
          return { [key]: [...s[key], letter] } as Partial<OceanState>;
        }),

      resetProgress: (c) =>
        set((s) => {
          const key = (c ?? s.letterCase) === "lower" ? "doneLower" : "done";
          return { [key]: [] } as Partial<OceanState>;
        }),
    }),
    {
      name: "ocean-abc-progress",
      // screen/letter/stage/run are session flow, not progress
      partialize: (s) => ({ done: s.done, doneLower: s.doneLower, letterCase: s.letterCase }),
    }
  )
);

/** The progress list for a given case — read this rather than picking a field. */
export function doneFor(state: Pick<OceanState, "done" | "doneLower">, c: LetterCase): string[] {
  return c === "lower" ? state.doneLower : state.done;
}

/** Display form of a canonical letter for the active case. */
export function displayLetter(letter: string, c: LetterCase): string {
  return c === "lower" ? letter.toLowerCase() : letter.toUpperCase();
}

export { ALPHA as OCEAN_ALPHA };
