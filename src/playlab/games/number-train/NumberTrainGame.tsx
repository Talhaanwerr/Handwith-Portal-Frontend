"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useNumberTrainStore } from "@games/number-train/store/numberTrainStore";
import { MODULES, VOICE, type ModuleId } from "@games/number-train/constants/rounds";
import { TrainWorld, ModuleMini } from "@games/number-train/components/TrainArt";
import { BuildRound } from "@games/number-train/components/BuildRound";
import { MissingRound } from "@games/number-train/components/MissingRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  build: BuildRound,
  missing: MissingRound,
};

/**
 * NUMBER TRAIN — number order 1 to 5 on a train in the garden. Two modules:
 * Build the Train (drag the carriages on in order) and Missing Carriage (fill
 * the one gap). Shell, stage, celebrations and store come from
 * `@games/number-groups`, like Number Hunt.
 */
export function NumberTrainGame() {
  const store = useNumberTrainStore();
  return (
    // `ntr-game` hides the shared teacher and gives the board his room back
    <div className="ntr-game">
      <NgShell
        title="Number Train"
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<TrainWorld />}
      />
    </div>
  );
}
