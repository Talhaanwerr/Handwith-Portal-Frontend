/**
 * First Words: Out and About — the lesson’s words and its six pages (see
 * word-lesson/constants/lesson.ts for what each page does). Every word has a
 * Fluent 3D picture and a recorded clip — `checkLesson()` proves it.
 */

import { checkLesson, type Lesson } from "@games/word-lesson/constants/lesson";

export const LESSON: Lesson = {
  id: "words-out",
  title: "First Words: Out and About",
  scene: "park",
  voice: { welcome: "fw-out-welcome", done: "fw-done" },
  module: {
    id: "learn",
    name: "Out and About",
    tag: "Meet things outside, then find them",
    accent: "#3D8BE0",
    edge: "#2A66A8",
    clip: "fw-out-mode",
  },
  putIn: "fw-in-wagon",
  meet: ["car", "tree", "ball"],
  where2: { options: ["sun", "bus"], target: "bus" },
  where3: { options: ["kite", "car", "flower"], target: "kite" },
  shadow: { piece: "bike", shadows: ["train", "bike"] },
  peek: { spots: ["car", "flower", "ball"], target: "ball" },
  put: { options: ["flower", "umbrella"], target: "flower" },
  // played three words at a time (see `sets` in the kit)
  sets: [
    ["car", "tree", "ball"],
    ["sun", "bus", "kite"],
    ["flower", "train", "bike"],
  ],
};

/** Self-check: every word pictured and recorded, every page winnable. */
export const checkRounds = (): string[] => checkLesson(LESSON);
