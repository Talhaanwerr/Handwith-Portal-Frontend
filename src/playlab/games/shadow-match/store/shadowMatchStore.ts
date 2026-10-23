"use client";

import { MODULE_IDS } from "@games/shadow-match/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Shadow Match Mystery's progress — Count & Match's store, its own key. */
export const useShadowMatchStore = createModuleStore("shadow-match-progress", MODULE_IDS);
