"use client";

import { VEHICLES } from "@games/magic-colours/constants/vehicles";
import { VehiclePicture } from "@games/magic-colours/components/VehiclePicture";
import { ROUNDS, type ModuleId } from "@games/magic-colours/constants/rounds";

/** Each theme's first vehicle, half coloured, so the card shows the game:
 *  some parts in colour, some still blank. */
const HALF: Readonly<Record<ModuleId, ReadonlySet<string>>> = Object.fromEntries(
  (Object.keys(ROUNDS) as ModuleId[]).map((m) => {
    const parts = VEHICLES[ROUNDS[m][0]].parts;
    return [m, new Set(parts.slice(0, Math.ceil(parts.length / 2)).map((p) => p.id))];
  })
) as unknown as Record<ModuleId, ReadonlySet<string>>;

/** A theme in miniature for its title card and the star card. */
export function ModuleMini({ id }: { id: ModuleId }) {
  const vehicle = VEHICLES[ROUNDS[id][0]];
  return (
    <span className={`mgc-mini mgc-mini--${vehicle.terrain}`}>
      <VehiclePicture vehicle={vehicle} coloured={HALF[id]} className="mgc-mini-pic" />
    </span>
  );
}
