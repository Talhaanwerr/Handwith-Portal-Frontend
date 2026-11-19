"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  HAT_ROUNDS,
  MODULES,
  MODULE_IDS,
  VOICE,
  type ModuleId,
} from "@games/magic-hat/constants/rounds";
import { MhtWorld } from "@games/magic-hat/components/MhtWorld";
import { ModuleMini } from "@games/magic-hat/components/MhtMini";
import { SwapRound } from "@games/magic-hat/components/SwapRound";

const useMagicHatStore = createModuleStore("magic-hat-progress", MODULE_IDS, HAT_ROUNDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  swap: SwapRound,
};

/**
 * MAGIC HAT SWAP — rhyme by changing the first sound: drag a letter block
 * into the wizard's hat and the word on the card turns into its rhyme (cat →
 * hat → rat). Count & Match's shell in its guided layout, one module, six
 * word families.
 */
export function MagicHatGame() {
  const store = useMagicHatStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Magic Hat Swap"
        guided
        single
        roundCount={HAT_ROUNDS}
        breakEvery={3}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<MhtWorld />}
      />
    </div>
  );
}
