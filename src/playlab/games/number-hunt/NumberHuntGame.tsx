"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useNumberHuntStore } from "@games/number-hunt/store/numberHuntStore";
import { MODULES, VOICE, type ModuleId } from "@games/number-hunt/constants/rounds";
import { RoomWorld } from "@games/number-hunt/components/NhWorlds";
import { ModuleMini } from "@games/number-hunt/components/NhMinis";
import { FindRound } from "@games/number-hunt/components/FindRound";
import { BoxesRound } from "@games/number-hunt/components/BoxesRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  find: FindRound,
  boxes: BoxesRound,
};

/**
 * NUMBER HUNT — numerals out in the world and groups put away, 1 to 5. Two
 * modules, each ONE mechanic for four rounds: Find the Number (tap every
 * thing wearing the number asked for) and Group Boxes (drag each quantity
 * card into the box with its number).
 *
 * Count & Match's sibling: the shell, the stage chrome, the title and star
 * screens, the celebrations, the drag and the store all come from
 * `@games/number-groups`; this folder holds only Number Hunt's own modules,
 * worlds and art.
 */
export function NumberHuntGame() {
  const store = useNumberHuntStore();
  return (
    <NgShell
      title="Number Hunt"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={<RoomWorld />}
    />
  );
}
