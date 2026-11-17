/**
 * First Words: Animals — the lesson’s words and its six pages (see
 * word-lesson/constants/lesson.ts for what each page does). Every word has a
 * Fluent 3D picture and a recorded clip — `checkLesson()` proves it.
 */

import { checkLesson, type Lesson } from "@games/word-lesson/constants/lesson";

export const LESSON: Lesson = {
  id: "words-animals",
  title: "First Words: Animals",
  scene: "barn",
  voice: { welcome: "fw-animals-welcome", done: "fw-done" },
  module: {
    id: "learn",
    name: "Animals",
    tag: "Meet the animals, then find them",
    accent: "#D9414A",
    edge: "#A8323A",
    clip: "fw-animals-mode",
  },
  putIn: "fw-in-barn",
  meet: ["cow", "duck", "dog"],
  where2: { options: ["hen", "cat"], target: "cat" },
  where3: { options: ["goat", "cow", "duck"], target: "goat" },
  shadow: { piece: "rabbit", shadows: ["frog", "rabbit"] },
  peek: { spots: ["dog", "hen", "duck"], target: "duck" },
  put: { options: ["cow", "hen"], target: "cow" },
  // played three animals at a time (see `sets` in the kit)
  sets: [
    ["cow", "duck", "dog"],
    ["hen", "cat", "goat"],
    ["rabbit", "frog", "fish"],
  ],
};

/** Self-check: every word pictured and recorded, every page winnable. */
export const checkRounds = (): string[] => checkLesson(LESSON);
