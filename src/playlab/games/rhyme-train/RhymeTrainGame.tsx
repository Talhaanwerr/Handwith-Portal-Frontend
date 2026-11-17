"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  MODULES,
  MODULE_IDS,
  TRAIN_ROUNDS,
  VOICE,
  type ModuleId,
} from "@games/rhyme-train/constants/rounds";
import { RtrWorld } from "@games/rhyme-train/components/RtrWorld";
import { ModuleMini } from "@games/rhyme-train/components/RtrMini";
import { TrainRound } from "@games/rhyme-train/components/TrainRound";

const useRhymeTrainStore = createModuleStore("rhyme-train-progress", MODULE_IDS, TRAIN_ROUNDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  train: TrainRound,
};

/**
 * RHYME TRAIN STATION — sort a platform of passengers onto the train by
 * rhyme: each rides in the carriage whose door picture rhymes with the card
 * they hold. Everyone aboard, the train toots away and the next pulls in.
 * Count & Match's shell in its guided layout, one module.
 */
export function RhymeTrainGame() {
  const store = useRhymeTrainStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Rhyme Train Station"
        guided
        single
        roundCount={TRAIN_ROUNDS}
        breakEvery={2}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<RtrWorld />}
      />
    </div>
  );
}
