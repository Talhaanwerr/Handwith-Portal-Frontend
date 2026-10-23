"use client";

import { PartCard, ToyAnimal } from "@games/animal-repair/components/AnimalParts";
import type { ModuleId } from "@games/animal-repair/constants/rounds";

/**
 * Each module in miniature, for its home card and the star card, built from
 * the module's own pieces: a bunny missing its ears (their dashed outline on
 * its head) beside the ears' card; a cat wearing a bunny's ears.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "missing")
    return (
      <span className="ng-mini arp-mini" aria-hidden="true">
        <span className="arp-mini-toy">
          <ToyAnimal
            animal="bunny"
            wear={{ tail: "bunny-tail" }}
            gap={{ kind: "ears", part: "bunny-ears" }}
            mood="sad"
          />
        </span>
        <span className="arp-mini-card">
          <PartCard id="bunny-ears" />
        </span>
      </span>
    );
  return (
    <span className="ng-mini arp-mini" aria-hidden="true">
      <span className="arp-mini-toy arp-mini-toy--mid">
        <ToyAnimal animal="cat" wear={{ ears: "bunny-ears", tail: "cat-tail" }} mood="puzzled" />
      </span>
    </span>
  );
}
