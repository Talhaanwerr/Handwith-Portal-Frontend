"use client";

import { MODULE_IDS } from "@games/number-hunt/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Number Hunt's progress — the same store as Count & Match's, its own key. */
export const useNumberHuntStore = createModuleStore("number-hunt-progress", MODULE_IDS);
