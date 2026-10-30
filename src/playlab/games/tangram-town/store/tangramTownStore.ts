"use client";

import { createPuzzleStore } from "@games/jigsaw-fun/store/puzzleStore";
import { MODULE_IDS, starsFor, type ModuleId } from "@games/tangram-town/constants/tangram";

/** Saved under the same name as before levels: an old run built each figure
 *  with lines and then without — today's Medium and Hard — so its stars carry
 *  to those two. */
export const useTangramTownStore = createPuzzleStore<ModuleId>({
  name: "tangram-town-progress",
  modules: MODULE_IDS,
  starsFor,
  legacy: ["medium", "hard"],
});
