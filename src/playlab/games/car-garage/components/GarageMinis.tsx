"use client";

import { CarArt } from "@games/car-garage/components/CarArt";
import { CarLift } from "@games/car-garage/components/GarageWorld";
import { PieceArt } from "@games/car-garage/components/StepStrip";
import { OddArt } from "@games/car-garage/components/OddArt";
import type { ModuleId } from "@games/car-garage/constants/rounds";

/**
 * Each module in miniature, for its home card and the star card — built from
 * the module's own pieces: a car half built on the lift with its next wheel
 * beside it; a car missing a wheel, with the wheel and a square wheel.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "build")
    return (
      <span className="ng-mini bcg-mini" aria-hidden="true">
        <span className="bcg-mini-rig">
          <span className="bcg-mini-lift">
            <CarLift />
          </span>
          <span className="bcg-mini-car">
            <CarArt
              body="car"
              colour="red"
              on={["body", "lights", "wheel-2", "wheel-0"]}
              ghost
              glow={["wheel-1", "wheel-3"]}
              face="sleep"
            />
          </span>
        </span>
        <span className="bcg-mini-part bcg-mini-part--a">
          <PieceArt body="car" colour="red" kind="wheel" />
        </span>
      </span>
    );
  return (
    <span className="ng-mini bcg-mini" aria-hidden="true">
      <span className="bcg-mini-rig">
        <span className="bcg-mini-lift">
          <CarLift />
        </span>
        <span className="bcg-mini-car">
          <CarArt
            body="van"
            colour="yellow"
            on={["body", "lights", "wheel-0", "wheel-2", "wheel-3", "roof", "windows"]}
            ghost
            glow={["wheel-1"]}
          />
        </span>
      </span>
      <span className="bcg-mini-part bcg-mini-part--a">
        <PieceArt body="van" colour="yellow" kind="wheel" />
      </span>
      <span className="bcg-mini-part bcg-mini-part--b">
        <OddArt thing="square-wheel" />
      </span>
    </span>
  );
}
