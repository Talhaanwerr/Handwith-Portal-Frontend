"use client";

import { MODULE_IDS } from "@games/silly-robot/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Fix the Silly Robot's progress — Count & Match's store, its own key. */
export const useSillyRobotStore = createModuleStore("silly-robot-progress", MODULE_IDS);
