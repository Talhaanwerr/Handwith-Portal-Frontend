"use client";

import { MODULE_IDS } from "@games/whats-inside/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** What's Inside?'s progress — Count & Match's store, its own key. */
export const useWhatsInsideStore = createModuleStore("whats-inside-progress", MODULE_IDS);
