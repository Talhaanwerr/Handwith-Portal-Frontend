"use client";

import type { ComponentType } from "react";
import { CandyDefs } from "@games/letter-treats/components/candy-world/CandyDefs";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useRocketCountdownStore } from "@games/rocket-countdown/store/rocketCountdownStore";
import { MODULES, VOICE, type ModuleId } from "@games/rocket-countdown/constants/rounds";
import { SpaceWorld } from "@games/rocket-countdown/components/RocketParts";
import { ModuleMini } from "@games/rocket-countdown/components/RkcMinis";
import { CountRound } from "@games/rocket-countdown/components/CountRound";
import { FuelRound } from "@games/rocket-countdown/components/FuelRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  count: CountRound,
  fuel: FuelRound,
};

/**
 * ROCKET COUNTDOWN — counting backwards and numeral → quantity, 1 to 5, at a
 * launch pad in space. Two modules of four rounds: Count Down (tap the
 * tower's stars from the biggest to 1, then blast off to the planet) and
 * Fuel the Rocket (as many star cells as the fuel window says, then pull Go!).
 *
 * The shell, the chrome, the celebrations and the store are Count & Match's
 * (`@games/number-groups`); the drag and the idle hand are Birthday Party's;
 * the world is Space ABC's. Only the pad, tower, cells, tank and lever are
 * drawn here.
 */
export function RocketCountdownGame() {
  const store = useRocketCountdownStore();
  return (
    // no teacher on the stage (the .rkc-game wrapper hides the slot)
    <div className="rkc-game">
      <NgShell
        title="Rocket Countdown"
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<SpaceWorld />}
      >
        {/* Letter Treats' gradients, for the rocket, the astronaut and the stars */}
        <CandyDefs />
      </NgShell>
    </div>
  );
}
