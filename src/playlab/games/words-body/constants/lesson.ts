/**
 * First Words: Clothes — the lesson’s words and its six pages (see
 * word-lesson/constants/lesson.ts for what each page does). Every word has a
 * Fluent 3D picture and a recorded clip — `checkLesson()` proves it.
 */

import { checkLesson, type Lesson } from "@games/word-lesson/constants/lesson";

export const LESSON: Lesson = {
  id: "words-body",
  title: "First Words: Clothes",
  scene: "bedroom",
  voice: { welcome: "fw-clothes-welcome", done: "fw-done" },
  module: {
    id: "learn",
    name: "Clothes",
    tag: "Meet the clothes, then find them",
    accent: "#9B5DE5",
    edge: "#7A43C2",
    clip: "fw-clothes-mode",
  },
  putIn: "fw-in-wardrobe",
  meet: ["hat", "shoe", "jacket"],
  where2: { options: ["watch", "cap"], target: "cap" },
  where3: { options: ["top", "hat", "shoe"], target: "top" },
  shadow: { piece: "jacket", shadows: ["shoe", "jacket"] },
  peek: { spots: ["cap", "watch", "tie"], target: "tie" },
  put: { options: ["shoe", "hat"], target: "shoe" },
  // played three words at a time (see `sets` in the kit)
  sets: [
    ["hat", "shoe", "jacket"],
    ["watch", "cap", "top"],
    ["tie", "vest", "ring"],
  ],
};

/** Self-check: every word pictured and recorded, every page winnable. */
export const checkRounds = (): string[] => checkLesson(LESSON);
