"use client";

import type { ComponentType } from "react";
import { CandyDefs } from "@games/letter-treats/components/candy-world/CandyDefs";
import { useNumberGroupsStore } from "@games/number-groups/store/numberGroupsStore";
import { MODULES, VOICE, type ModuleId } from "@games/number-groups/constants/rounds";
import { NgShell } from "@games/number-groups/components/NgShell";
import { PlayroomWorld } from "@games/number-groups/components/NgWorlds";
import { ModuleMini } from "@games/number-groups/components/NgMinis";
import { PlatesRound } from "@games/number-groups/components/PlatesRound";
import { CardsRound } from "@games/number-groups/components/CardsRound";
import type { RoundProps } from "@games/number-groups/components/roundProps";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  plates: PlatesRound,
  cards: CardsRound,
};

/**
 * COUNT & MATCH (game id `number-groups`) — a number and the quantity it
 * names, 1 to 5, with real things to count. Two modules, each ONE mechanic
 * for four rounds: Count the Plates (tap the plate with that many) and
 * Number Cards (drag each numeral to the card with that many).
 *
 * The shell, the chrome, the celebrations and the drag are shared with
 * Number Hunt, which imports them from this folder.
 */
export function NumberGroupsGame() {
  const store = useNumberGroupsStore();
  return (
    <NgShell
      title="Count & Match"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={<PlayroomWorld roomy />}
    >
      {/* Letter Treats' fruit gradients, mounted once for the picnic */}
      <CandyDefs />
    </NgShell>
  );
}
