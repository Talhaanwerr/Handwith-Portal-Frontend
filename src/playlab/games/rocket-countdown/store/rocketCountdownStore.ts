"use client";

import { MODULE_IDS } from "@games/rocket-countdown/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Rocket Countdown's progress — Count & Match's store, its own key. */
export const useRocketCountdownStore = createModuleStore("rocket-countdown-progress", MODULE_IDS);
