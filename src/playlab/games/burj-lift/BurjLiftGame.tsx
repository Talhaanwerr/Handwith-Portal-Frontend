"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { DubaiWorld } from "@shared/components/dubai/DubaiWorld";
import { MODULES, MODULE_IDS, VOICE, type ModuleId } from "@games/burj-lift/constants/rounds";
import { ModuleMini } from "@games/burj-lift/components/LiftMinis";
import { MatchRound, UpDownRound } from "@games/burj-lift/components/LiftRound";

const useBurjLiftStore = createModuleStore("burj-lift-progress", MODULE_IDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  updown: UpDownRound,
  match: MatchRound,
};

/**
 * BURJ LIFT — a thinking game with the glass lift that runs up the outside
 * of the Burj Khalifa. Three passengers a round, each wanting a floor. Up or
 * Down?: their bubble shows the picture of their floor — press up or down.
 * Picture Floors: they hold a balloon — tap the floor of the same colour.
 * The lift rides there and the passenger hops out happy.
 *
 * Count & Match's shell (title screen, How to Play, rounds, star card); the
 * Dubai world and the tower are Burj Khalifa's art, reused as they are.
 */
export function BurjLiftGame() {
  const store = useBurjLiftStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Burj Lift"
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<DubaiWorld time="day" />}
      />
    </div>
  );
}
