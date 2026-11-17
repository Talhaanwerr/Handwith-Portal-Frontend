"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { CabinWorld } from "@games/plane-seats/components/CabinWorld";
import { MODULES, MODULE_IDS, VOICE, type ModuleId } from "@games/plane-snacks/constants/rounds";
import { ModuleMini } from "@games/plane-snacks/components/SnackMinis";
import { SnackRound } from "@games/plane-snacks/components/SnackRound";
import { WindowRound } from "@games/plane-snacks/components/WindowRound";

const usePlaneSnacksStore = createModuleStore("plane-snacks-progress", MODULE_IDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  snacks: SnackRound,
  window: WindowRound,
};

/**
 * SNACK TIME IN THE SKY — a thinking game on board Plane Seats' aeroplane.
 * Snack Trolley: the trolley rolls down the aisle and each passenger thinks
 * of a snack — tap it on the trolley and it flies to them. Window Spy:
 * something flies past the big window — tap the picture of what flew past.
 *
 * Count & Match's shell (title screen, How to Play, rounds, star card) in
 * its guided layout: centred screens, the line in the top bar, the hand on
 * round one. The cabin, the seats and the passengers are Plane Seats' art,
 * reused as they are. No teacher on the stage (`.apa-game` hides him).
 */
export function PlaneSnacksGame() {
  const store = usePlaneSnacksStore();
  return (
    <div className="apa-game psn-game">
      <NgShell
        title="Snack Time in the Sky"
        guided
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<CabinWorld />}
      />
    </div>
  );
}
