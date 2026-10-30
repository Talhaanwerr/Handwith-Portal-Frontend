"use client";

import { MODULE_IDS } from "@games/number-train/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Number Train's progress — Count & Match's store, its own key. */
export const useNumberTrainStore = createModuleStore("number-train-progress", MODULE_IDS);
