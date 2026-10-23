"use client";

import { MODULE_IDS } from "@games/sock-case/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** The Missing Sock Case's progress — Count & Match's store, its own key. */
export const useSockCaseStore = createModuleStore("sock-case-progress", MODULE_IDS);
