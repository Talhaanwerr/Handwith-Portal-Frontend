"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  RHYME_ROUNDS,
  MODULES,
  MODULE_IDS,
  VOICE,
  type ModuleId,
} from "@games/rhyme-or-not/constants/rounds";
import { RynWorld } from "@games/rhyme-or-not/components/RynWorld";
import { ModuleMini } from "@games/rhyme-or-not/components/RynMini";
import { YesNoRound } from "@games/rhyme-or-not/components/YesNoRound";

const useRhymeOrNotStore = createModuleStore("rhyme-or-not-progress", MODULE_IDS, RHYME_ROUNDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  rhyme: YesNoRound,
};

/**
 * RHYME TIME: YES OR NO? — the first rung of hearing rhyme. Two pictures
 * come on the sunny stage one after the other, each word said; the child
 * answers "Do they rhyme?" with a big thumbs-up or thumbs-down.
 *
 * Count & Match's shell in its guided layout, one module (one activity, one
 * game), Apple Basket's wrapper (no teacher: the stage is the game).
 */
export function RhymeOrNotGame() {
  const store = useRhymeOrNotStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Rhyme Time"
        guided
        single
        roundCount={RHYME_ROUNDS}
        breakEvery={1}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<RynWorld />}
      />
    </div>
  );
}
