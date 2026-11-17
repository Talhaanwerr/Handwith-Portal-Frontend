"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  HOUSE_ROUNDS,
  MODULES,
  MODULE_IDS,
  VOICE,
  type ModuleId,
} from "@games/rhyme-families/constants/rounds";
import { RyhWorld } from "@games/rhyme-families/components/RyhWorld";
import { ModuleMini } from "@games/rhyme-families/components/RyhMini";
import { HousesRound } from "@games/rhyme-families/components/HousesRound";

const useRhymeFamiliesStore = createModuleStore(
  "rhyme-families-progress",
  MODULE_IDS,
  HOUSE_ROUNDS
);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  houses: HousesRound,
};

/**
 * RHYME HOUSES — the third rung of hearing rhyme: word families. Each house
 * holds one family (the cat house: hat, rat); the child takes each picture
 * that comes up the path to the house it rhymes with. Rhyme Time's words and
 * pictures, Count & Match's shell in its guided layout, one module.
 */
export function RhymeFamiliesGame() {
  const store = useRhymeFamiliesStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Rhyme Houses"
        guided
        single
        roundCount={HOUSE_ROUNDS}
        breakEvery={1}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<RyhWorld />}
      />
    </div>
  );
}
