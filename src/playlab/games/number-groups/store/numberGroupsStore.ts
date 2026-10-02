"use client";

import { MODULE_IDS } from "@games/number-groups/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Count & Match's progress. The key predates the rename and is kept so
 *  saved stars carry over (its old modules are dropped on load). */
export const useNumberGroupsStore = createModuleStore("number-groups-progress", MODULE_IDS);
