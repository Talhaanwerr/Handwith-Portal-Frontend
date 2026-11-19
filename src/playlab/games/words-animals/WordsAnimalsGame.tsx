"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { WordLessonShell, makeLesson } from "@games/word-lesson/components/WordLesson";
import { LESSON_MODULES, lessonRounds } from "@games/word-lesson/constants/lesson";
import { LESSON } from "@games/words-animals/constants/lesson";

const useWordsAnimalsStore = createModuleStore(
  "words-animals-progress",
  LESSON_MODULES,
  lessonRounds(LESSON)
);
const KIT = makeLesson(LESSON);

/**
 * FIRST WORDS: ANIMALS — My First Words, lesson in the barn, three animals
 * at a time: meet them, find each one, peekaboo and put-away with them, a four-piece puzzle of each, then a cheer and Continue or Back before
 * the next three. The engine is the word-lesson kit’s; this game is only its
 * words and room.
 */
export function WordsAnimalsGame() {
  const store = useWordsAnimalsStore();
  return <WordLessonShell lesson={LESSON} store={store} kit={KIT} />;
}
