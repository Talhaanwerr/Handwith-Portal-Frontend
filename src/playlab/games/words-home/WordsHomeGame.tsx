"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { WordLessonShell, makeLesson } from "@games/word-lesson/components/WordLesson";
import { LESSON_MODULES, lessonRounds } from "@games/word-lesson/constants/lesson";
import { LESSON } from "@games/words-home/constants/lesson";

const useWordsHomeStore = createModuleStore(
  "words-home-progress",
  LESSON_MODULES,
  lessonRounds(LESSON)
);
const KIT = makeLesson(LESSON);

/**
 * FIRST WORDS: AT HOME — My First Words, lesson in the living room: meet three
 * words, find them, match a shadow, peekaboo, and put one away. The lesson
 * engine is the word-lesson kit’s; this game is only its words and room.
 */
export function WordsHomeGame() {
  const store = useWordsHomeStore();
  return <WordLessonShell lesson={LESSON} store={store} kit={KIT} />;
}
