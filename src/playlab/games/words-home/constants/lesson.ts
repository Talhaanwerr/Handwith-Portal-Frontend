/**
 * First Words: At Home — the lesson’s words and its six pages (see
 * word-lesson/constants/lesson.ts for what each page does). Every word has a
 * Fluent 3D picture and a recorded clip — `checkLesson()` proves it.
 */

import { checkLesson, type Lesson } from "@games/word-lesson/constants/lesson";

export const LESSON: Lesson = {
  id: "words-home",
  title: "First Words: At Home",
  scene: "living",
  voice: { welcome: "fw-home-welcome", done: "fw-done" },
  module: {
    id: "learn",
    name: "At Home",
    tag: "Meet things at home, then find them",
    accent: "#2BA89A",
    edge: "#1F8074",
    clip: "fw-home-mode",
  },
  putIn: "fw-in-cupboard",
  meet: ["bed", "chair", "cup"],
  where2: { options: ["clock", "door"], target: "door" },
  where3: { options: ["key", "bed", "spoon"], target: "key" },
  shadow: { piece: "chair", shadows: ["cup", "chair"] },
  peek: { spots: ["spoon", "cup", "clock"], target: "clock" },
  put: { options: ["cup", "bowl"], target: "cup" },
  // played three words at a time (see `sets` in the kit)
  sets: [
    ["bed", "chair", "cup"],
    ["clock", "door", "key"],
    ["spoon", "bowl", "lamp"],
  ],
};

/** Self-check: every word pictured and recorded, every page winnable. */
export const checkRounds = (): string[] => checkLesson(LESSON);
