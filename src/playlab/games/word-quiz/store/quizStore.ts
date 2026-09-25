"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_QUESTIONS, type Answer } from "@games/word-quiz/constants/questions";
import { asRecord, wholeNumber } from "@shared/utils/persisted";

export type QuizScreen = "splash" | "play" | "review";

interface QuizState {
  screen: QuizScreen;
  /** 0-based question. */
  index: number;
  /** Every answer given this run, in order — the review reads this. */
  answers: Answer[];
  /** Best score ever, the only thing worth keeping between sessions. */
  best: number;

  setScreen: (s: QuizScreen) => void;
  start: () => void;
  /** Take the word tapped and move on; the last one opens the review. */
  answer: (word: string) => void;
  bank: (score: number) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      screen: "splash",
      index: 0,
      answers: [],
      best: 0,

      setScreen: (screen) => set({ screen }),
      start: () => set({ screen: "play", index: 0, answers: [] }),

      answer: (chosen) =>
        set((s) => {
          const answers = [...s.answers, { question: s.index, chosen }];
          const next = s.index + 1;
          return next >= TOTAL_QUESTIONS
            ? { answers, index: next, screen: "review" }
            : { answers, index: next };
        }),

      bank: (score) => set((s) => ({ best: Math.max(s.best, score) })),
    }),
    {
      name: "word-quiz-progress",
      // where a child is inside a run is session flow; only the best score keeps
      partialize: (s) => ({ best: s.best }),
      merge: (persisted, current) => ({
        ...current,
        best: wholeNumber(asRecord(persisted)?.best, 0, TOTAL_QUESTIONS, 0),
      }),
    }
  )
);
