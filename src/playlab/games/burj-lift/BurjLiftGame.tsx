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
 * of the Burj Khalifa. A girl and a boy take turns, three rides a round: drag
 * the child into the open lift, press up once for every floor until it stops
 * at theirs (Up or Down?: the picture and number in their bubble; Colour
 * Floors: the colour of their balloon), then press down to bring the empty
 * lift back for the next one.
 *
 * Count & Match's shell in its guided layout (centred, the guide bar on top,
 * the hand showing each move by itself in the first round); the Dubai world
 * and the tower are Burj Khalifa's art, reused as they are.
 */
export function BurjLiftGame() {
  const store = useBurjLiftStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Burj Lift"
        guided
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
