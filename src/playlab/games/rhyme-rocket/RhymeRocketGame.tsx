"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  MODULES,
  MODULE_IDS,
  ROCKET_ROUNDS,
  VOICE,
  type ModuleId,
} from "@games/rhyme-rocket/constants/rounds";
import { RrkWorld } from "@games/rhyme-rocket/components/RrkWorld";
import { ModuleMini } from "@games/rhyme-rocket/components/RrkMini";
import { FlyRound } from "@games/rhyme-rocket/components/FlyRound";

const useRhymeRocketStore = createModuleStore("rhyme-rocket-progress", MODULE_IDS, ROCKET_ROUNDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  fly: FlyRound,
};

/**
 * RHYME ROCKET — hearing rhyme as a flight: the rocket on the launch pad
 * carries a word, and the child flies it up to the one planet (of three)
 * whose picture rhymes with it. Rhyme Time's words and pictures, Count &
 * Match's shell in its guided layout, one module, six rounds of three trips.
 */
export function RhymeRocketGame() {
  const store = useRhymeRocketStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Rhyme Rocket"
        guided
        single
        roundCount={ROCKET_ROUNDS}
        breakEvery={2}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<RrkWorld />}
      />
    </div>
  );
}
