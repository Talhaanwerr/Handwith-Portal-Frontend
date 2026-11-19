"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { GAME_ROUNDS, VOICE } from "@games/fruit-puzzles/constants/rounds";
import { ModuleMini } from "@games/fruit-puzzles/components/FruitMinis";
import { TrickyRound } from "@games/fruit-puzzles/components/PuzzleRound";
import { FrpWorld } from "@games/fruit-puzzles/components/FrpWorld";
import { MODULES, STORE_KEY, TITLE } from "@games/fruit-tricky/constants/game";

const useFruitTrickyStore = createModuleStore(STORE_KEY, ["tricky"] as const, GAME_ROUNDS);

const ROUNDS: Record<"tricky", ComponentType<RoundProps>> = { tricky: TrickyRound };

/**
 * TRICKY FRUIT PUZZLES — a fruit lies in four pieces round a plate; drag
 * each piece back to its place until the fruit is whole. All six fruits a run.
 *
 * Fruit Puzzles' "tricky" module on its own: Count & Match's shell, guided and
 * `single` (one Play card on the title screen, no "Pick another" on the star
 * card), `GAME_ROUNDS` (six) rounds a run. Everything else is Fruit Puzzles'.
 */
export function FruitTrickyGame() {
  const store = useFruitTrickyStore();
  return (
    <div className="apa-game frp-game">
      <NgShell
        title={TITLE}
        guided
        single
        roundCount={GAME_ROUNDS}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<FrpWorld />}
      />
    </div>
  );
}
