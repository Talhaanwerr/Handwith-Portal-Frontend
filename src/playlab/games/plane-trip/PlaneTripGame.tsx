"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { MODULES, MODULE_IDS, VOICE, type ModuleId } from "@games/plane-trip/constants/rounds";
import { AirportWorld } from "@games/plane-trip/components/TripArt";
import { ModuleMini } from "@games/plane-trip/components/TripMinis";
import { BagRound } from "@games/plane-trip/components/BagRound";
import { PackRound } from "@games/plane-trip/components/PackRound";

const usePlaneTripStore = createModuleStore("plane-trip-progress", MODULE_IDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  bags: BagRound,
  pack: PackRound,
};

/**
 * PLANE TRIP — matching and sorting at the airport, no numbers: give each
 * suitcase off the baggage belt to the passenger whose tag shows it, and
 * pack the sunny-trip and snowy-trip suitcases before the plane takes off.
 *
 * Count & Match's shell; the airport and the plane are drawn here; the
 * passengers are Plane Seats' (Fluent animals on drawn bodies). No teacher
 * on the stage (`.apa-game` hides him).
 */
export function PlaneTripGame() {
  const store = usePlaneTripStore();
  return (
    <div className="apa-game ptr-game">
      <NgShell
        title="Plane Trip"
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<AirportWorld />}
      />
    </div>
  );
}
