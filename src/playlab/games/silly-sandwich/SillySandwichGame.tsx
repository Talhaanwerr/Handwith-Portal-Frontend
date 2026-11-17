"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  MODULES,
  MODULE_IDS,
  SANDWICH_ROUNDS,
  VOICE,
  type ModuleId,
} from "@games/silly-sandwich/constants/rounds";
import { SswWorld } from "@games/silly-sandwich/components/SswWorld";
import { ModuleMini } from "@games/silly-sandwich/components/SswMini";
import { MakeRound } from "@games/silly-sandwich/components/MakeRound";

const useSillySandwichStore = createModuleStore(
  "silly-sandwich-progress",
  MODULE_IDS,
  SANDWICH_ROUNDS
);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  make: MakeRound,
};

/**
 * SILLY SANDWICH — hearing rhyme by feeding a monster: Munch asks for
 * something that rhymes with his word, and the child stacks the two rhyming
 * fillings from the tray onto his bread (the others get a funny "yuck!").
 * Rhyme Time's words and pictures, Count & Match's shell in its guided
 * layout, one module, six sandwiches.
 */
export function SillySandwichGame() {
  const store = useSillySandwichStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Silly Sandwich"
        guided
        single
        roundCount={SANDWICH_ROUNDS}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<SswWorld />}
      />
    </div>
  );
}
