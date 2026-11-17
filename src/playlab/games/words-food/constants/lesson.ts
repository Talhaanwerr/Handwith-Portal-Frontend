/**
 * First Words: Food — the lesson’s words and its six pages (see
 * word-lesson/constants/lesson.ts for what each page does). Every word has a
 * Fluent 3D picture and a recorded clip — `checkLesson()` proves it.
 */

import { checkLesson, type Lesson } from "@games/word-lesson/constants/lesson";

export const LESSON: Lesson = {
  id: "words-food",
  title: "First Words: Food",
  scene: "kitchen",
  voice: { welcome: "fw-food-welcome", done: "fw-done" },
  module: {
    id: "learn",
    name: "Food",
    tag: "Meet the food, then find it",
    accent: "#F08A24",
    edge: "#C46A12",
    clip: "fw-food-mode",
  },
  putIn: "fw-in-basket",
  meet: ["apple", "banana", "cake"],
  where2: { options: ["milk", "egg"], target: "egg" },
  where3: { options: ["grapes", "apple", "pizza"], target: "grapes" },
  shadow: { piece: "banana", shadows: ["cheese", "banana"] },
  peek: { spots: ["cake", "cheese", "orange"], target: "orange" },
  put: { options: ["apple", "milk"], target: "apple" },
  // played three words at a time (see `sets` in the kit)
  sets: [
    ["apple", "banana", "cake"],
    ["milk", "egg", "grapes"],
    ["pizza", "cheese", "orange"],
  ],
};

/** Self-check: every word pictured and recorded, every page winnable. */
export const checkRounds = (): string[] => checkLesson(LESSON);
