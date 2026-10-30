"use client";

import { create } from "zustand";
import type { AddLevel } from "@games/tiny-toy-shop/constants/rounds";

/** The Add Them Up level the child picked (Easy / Medium / Hard). */
export const useAddLevel = create<{ level: AddLevel; setLevel: (l: AddLevel) => void }>()(
  (set) => ({
    level: "add1",
    setLevel: (level) => set({ level }),
  })
);
