"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { WordLessonShell, makeLesson } from "@games/word-lesson/components/WordLesson";
import { LESSON_MODULES, lessonRounds } from "@games/word-lesson/constants/lesson";
import { LESSON } from "@games/words-body/constants/lesson";

const useWordsBodyStore = createModuleStore(
  "words-body-progress",
  LESSON_MODULES,
  lessonRounds(LESSON)
);
const KIT = makeLesson(LESSON);

/**
 * FIRST WORDS: CLOTHES — My First Words, lesson in the bedroom: meet three
 * words, find them, match a shadow, peekaboo, and put one away. The lesson
 * engine is the word-lesson kit’s; this game is only its words and room.
 */
export function WordsBodyGame() {
  const store = useWordsBodyStore();
  return <WordLessonShell lesson={LESSON} store={store} kit={KIT} />;
}
