"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { MODULES, MODULE_IDS, VOICE, type ModuleId } from "@games/plane-seats/constants/rounds";
import { CabinWorld } from "@games/plane-seats/components/CabinWorld";
import { ModuleMini } from "@games/plane-seats/components/SeatMinis";
import { NumberRound, SumsRound } from "@games/plane-seats/components/TicketRound";

const usePlaneSeatsStore = createModuleStore("plane-seats-progress", MODULE_IDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  number: NumberRound,
  sums: SumsRound,
};

/**
 * PLANE SEATS — numbers 1 to 5 on an aeroplane. One row of five big seats,
 * numbered left to right: passengers walk up with boarding passes and sit
 * in the seat on their ticket (a numeral, or a little dot sum).
 *
 * Count & Match's shell; the cabin is drawn here; the passengers are the
 * portal's Fluent animals. No teacher on the stage (Apple Basket's
 * `.apa-game` hides him): the seats are the game.
 */
export function PlaneSeatsGame() {
  const store = usePlaneSeatsStore();
  return (
    <div className="apa-game pls-game">
      <NgShell
        title="Plane Seats"
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
