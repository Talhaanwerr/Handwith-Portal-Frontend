"use client";

import type { ComponentType } from "react";
import { CandyDefs } from "@games/letter-treats/components/candy-world/CandyDefs";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { PlainWorld } from "@games/animal-repair/components/PlainWorld";
import { useAnimalRepairStore } from "@games/animal-repair/store/animalRepairStore";
import { MODULES, VOICE, type ModuleId } from "@games/animal-repair/constants/rounds";
import { ModuleMini } from "@games/animal-repair/components/ArpMinis";
import { MissingRound, SillyRound } from "@games/animal-repair/components/RepairRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  missing: MissingRound,
  silly: SillyRound,
};

/**
 * SILLY ANIMAL REPAIR SHOP — soft toys come to the bench to be mended. Two
 * modules of four rounds in Berry's playroom (Number Hunt's room, with a
 * workbench and a tool rack): What's Missing? (drag the lost part back on)
 * and Silly Mix-up (tap the other toy's part off, then drag the right one
 * on). Shell, stage, celebrations and store are Count & Match's, from
 * `@games/number-groups`; the toys are drawn in Candy ABC's style, so its
 * gradients are mounted once here.
 */
export function AnimalRepairGame() {
  const store = useAnimalRepairStore();
  return (
    <NgShell
      title="Silly Animal Repair Shop"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={<PlainWorld />}
    >
      <CandyDefs />
    </NgShell>
  );
}
