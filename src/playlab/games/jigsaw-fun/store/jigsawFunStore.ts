"use client";

import { createPuzzleStore } from "@games/jigsaw-fun/store/puzzleStore";
import { MODULE_IDS, starsFor, type ModuleId } from "@games/jigsaw-fun/constants/jigsaw";

/** Saved under the same name as before levels: an old run through 4 → 6 → 9
 *  played every cut, so its stars carry to all three levels. */
export const useJigsawFunStore = createPuzzleStore<ModuleId>({
  name: "jigsaw-fun-progress",
  modules: MODULE_IDS,
  starsFor,
  legacy: ["easy", "medium", "hard"],
});
