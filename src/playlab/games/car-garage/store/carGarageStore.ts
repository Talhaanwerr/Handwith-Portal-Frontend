"use client";

import { MODULE_IDS } from "@games/car-garage/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Build-a-Car Garage's progress — Count & Match's store, its own key. */
export const useCarGarageStore = createModuleStore("car-garage-progress", MODULE_IDS);
