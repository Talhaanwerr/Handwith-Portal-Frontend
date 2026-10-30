"use client";

import { MODULE_IDS } from "@games/animal-repair/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** The repair shop's progress — Count & Match's store, its own key. */
export const useAnimalRepairStore = createModuleStore("animal-repair-progress", MODULE_IDS);
