"use client";

import { MODULE_IDS } from "@games/tiny-toy-shop/constants/rounds";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";

/** Tiny Toy Shop's progress — the shared module store, its own key. */
export const useTinyToyShopStore = createModuleStore("tiny-toy-shop-progress", MODULE_IDS);
