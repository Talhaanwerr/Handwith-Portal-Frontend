"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PlayMode } from "@shared/types/game";
import {
  buildRun,
  jumpRunTo,
  advanceRun,
  type LetterRun,
  type RunIntent,
} from "@shared/utils/progression";

export type HuntCase = "upper" | "lower";
export type HuntScreen = "splash" | "home" | "mode-select" | "level" | "complete";
/** Free = find the letter once · 5 Star = find all five, one star each. The
 *  same two modes Letter Tracing offers, so a child meets one idea, not two. */
export type HuntMode = PlayMode;

interface HuntState {
  screen: HuntScreen;
  /** BIG letters or little letters — a separate run, and a separate finale. */
  letterCase: HuntCase;
  /**
   * Chosen once per session; null until the child picks Free or 5 Star.
   * Deliberately NOT persisted (see partialize) — exactly like the tracing
   * game's practiceMode, so every session asks the question once and progress
   * is never silently resumed under a mode the child did not choose today.
   */
  mode: HuntMode | null;
  /**
   * The current play session's letter queue. Session-only (never persisted):
   * a run is decided when the child presses Start from A / Continue, and
   * advancing walks it instead of re-querying `completed`. This is what makes
   * "Start from A" actually replay letters it already knows are finished.
   */
  run: LetterRun | null;
  /** 0–25 — the letter the child is currently on */
  currentIndex: number;
  /**
   * Canonical uppercase letters already completed, kept PER CASE so finishing
   * the BIG letters does not silently mark the little ones done too (the
   * tracing game keeps its uppercase and lowercase modules apart the same
   * way). `completed` keeps its original name, so progress a child already has
   * carries over as their uppercase run and the lowercase list starts empty.
   */
  completed: string[];
  completedLower: string[];
  setScreen: (s: HuntScreen) => void;
  setCase: (c: HuntCase) => void;
  setMode: (m: HuntMode) => void;
  /** Begin a run. intent "fresh" = Start from X, "continue" = Continue. */
  beginRun: (startAt: string | number, intent: RunIntent) => void;
  /** Point the run at a letter the child tapped on the shelf. */
  jumpTo: (letter: string) => void;
  /** Step to the next letter; returns false when the run is finished. */
  advance: () => boolean;
  markCompleted: (letter: string) => void;
  resetProgress: (c?: HuntCase) => void;
}

/** Canonical letter order. Declared here rather than imported from a screen
 *  component so the store never pulls React code into its module graph. */
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const useHuntStore = create<HuntState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      letterCase: "upper",
      mode: null,
      run: null,
      currentIndex: 0,
      completed: [],
      completedLower: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),
      setMode: (mode) => set({ mode }),

      beginRun: (startAt, intent) =>
        set((s) => {
          const completed = s.letterCase === "lower" ? s.completedLower : s.completed;
          const run = buildRun(LETTERS, startAt, completed, intent);
          return { run, currentIndex: LETTERS.indexOf(run.queue[0] ?? "A") };
        }),

      jumpTo: (letter) =>
        set((s) => {
          const completed = s.letterCase === "lower" ? s.completedLower : s.completed;
          // Tapping a tile with no run yet is itself a start — treat it as a
          // fresh run from that letter rather than leaving run null.
          const run = s.run
            ? jumpRunTo(s.run, letter)
            : buildRun(LETTERS, letter, completed, "fresh");
          return { run, currentIndex: LETTERS.indexOf(letter) };
        }),

      advance: () => {
        const s = get();
        if (!s.run) return false;
        const { run, isDone } = advanceRun(s.run);
        if (isDone) {
          set({ run });
          return false;
        }
        set({ run, currentIndex: LETTERS.indexOf(run.queue[run.index]) });
        return true;
      },
      markCompleted: (l) =>
        set((s) => {
          const key = s.letterCase === "lower" ? "completedLower" : "completed";
          const letter = l.toUpperCase();
          if (s[key].includes(letter)) return {};
          return { [key]: [...s[key], letter] } as Partial<HuntState>;
        }),
      resetProgress: (c) =>
        set((s) => {
          const key = (c ?? s.letterCase) === "lower" ? "completedLower" : "completed";
          return { [key]: [], currentIndex: 0 } as Partial<HuntState>;
        }),
    }),
    {
      name: "letter-hunt-progress",
      partialize: (s) => ({
        currentIndex: s.currentIndex,
        completed: s.completed,
        completedLower: s.completedLower,
        letterCase: s.letterCase,
      }),
    }
  )
);

/** The list for a given case — read this rather than picking a field by hand. */
export function completedFor(
  state: Pick<HuntState, "completed" | "completedLower">,
  c: HuntCase
): string[] {
  return c === "lower" ? state.completedLower : state.completed;
}
