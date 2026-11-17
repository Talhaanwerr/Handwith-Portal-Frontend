"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { WordLessonShell, makeLesson } from "@games/word-lesson/components/WordLesson";
import { LESSON_MODULES, lessonRounds } from "@games/word-lesson/constants/lesson";
import { LESSON } from "@games/words-out/constants/lesson";

const useWordsOutStore = createModuleStore(
  "words-out-progress",
  LESSON_MODULES,
  lessonRounds(LESSON)
);
const KIT = makeLesson(LESSON);

/**
 * FIRST WORDS: OUT AND ABOUT — My First Words, lesson in the park: meet three
 * words, find them, match a shadow, peekaboo, and put one away. The lesson
 * engine is the word-lesson kit’s; this game is only its words and room.
 */
export function WordsOutGame() {
  const store = useWordsOutStore();
  return <WordLessonShell lesson={LESSON} store={store} kit={KIT} />;
}
