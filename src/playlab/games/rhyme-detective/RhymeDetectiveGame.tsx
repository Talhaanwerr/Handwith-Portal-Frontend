"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  DETECTIVE_ROUNDS,
  MODULES,
  MODULE_IDS,
  VOICE,
  type ModuleId,
} from "@games/rhyme-detective/constants/rounds";
import { RdtWorld } from "@games/rhyme-detective/components/RdtWorld";
import { ModuleMini } from "@games/rhyme-detective/components/RdtMini";
import { FindRound } from "@games/rhyme-detective/components/FindRound";

const useRhymeDetectiveStore = createModuleStore(
  "rhyme-detective-progress",
  MODULE_IDS,
  DETECTIVE_ROUNDS
);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  find: FindRound,
};

/**
 * RHYME DETECTIVE — search a cosy room for the thing that rhymes. The case
 * file shows a picture, the detective's glass names everything in the room,
 * and the child taps the rhyme hiding on a shelf, the bed or the floor.
 *
 * Count & Match's shell in its guided layout, one module, Apple Basket's
 * wrapper (no teacher: the room is the game).
 */
export function RhymeDetectiveGame() {
  const store = useRhymeDetectiveStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Rhyme Detective"
        guided
        single
        roundCount={DETECTIVE_ROUNDS}
        breakEvery={3}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<RdtWorld scene="bedroom" floor />}
      />
    </div>
  );
}
