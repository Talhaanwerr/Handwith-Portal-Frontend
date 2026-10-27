"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useCarGarageStore } from "@games/car-garage/store/carGarageStore";
import { MODULES, VOICE, type ModuleId } from "@games/car-garage/constants/rounds";
import { GarageWorld } from "@games/car-garage/components/GarageWorld";
import { ModuleMini } from "@games/car-garage/components/GarageMinis";
import { BuildRound } from "@games/car-garage/components/BuildRound";
import { MissingRound } from "@games/car-garage/components/MissingRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  build: BuildRound,
  missing: MissingRound,
};

/**
 * BUILD-A-CAR GARAGE — putting a thing together in order, and seeing what is
 * missing, for children from two. Two modules of four rounds on the garage
 * yard: Build the Car (body → four wheels, counted → roof → windows, one
 * step at a time) and Missing Part (give a finished car back the part it
 * lost, among things that could never go on a car). The car is drawn here
 * from separate parts (`components/CarArt`) and shared with The Messy Car
 * Wash. Shell, stage, celebrations and store are Count & Match's, from
 * `@games/number-groups`.
 */
export function CarGarageGame() {
  const store = useCarGarageStore();
  return (
    <NgShell
      title="Build-a-Car Garage"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={<GarageWorld />}
    />
  );
}
