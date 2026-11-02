"use client";

import { MODULE_IDS } from "@games/birthday-party/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Birthday Party's progress — Count & Match's store, its own key. */
export const useBirthdayPartyStore = createModuleStore("birthday-party-progress", MODULE_IDS);
