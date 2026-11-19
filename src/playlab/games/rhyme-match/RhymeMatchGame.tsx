"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  MATCH_ROUNDS,
  MODULES,
  MODULE_IDS,
  VOICE,
  type ModuleId,
} from "@games/rhyme-match/constants/rounds";
import { RymWorld } from "@games/rhyme-match/components/RymWorld";
import { ModuleMini } from "@games/rhyme-match/components/RymMini";
import { MatchRound } from "@games/rhyme-match/components/MatchRound";

const useRhymeMatchStore = createModuleStore("rhyme-match-progress", MODULE_IDS, MATCH_ROUNDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  match: MatchRound,
};

/**
 * RHYME MATCH — the second rung of hearing rhyme: given a word, find the one
 * that rhymes, and drag it onto the pad beside it. Rhyme Time's words and
 * pictures, Count & Match's shell in its guided layout, one module.
 */
export function RhymeMatchGame() {
  const store = useRhymeMatchStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Rhyme Match"
        guided
        single
        roundCount={MATCH_ROUNDS}
        breakEvery={1}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<RymWorld />}
      />
    </div>
  );
}
