"use client";

import { BrickShell, type ShellModule } from "@games/brick-lab/engine/BrickShell";
import { HERO_FACTORY, HERO_PLATE, HERO_TOWER } from "@games/brick-lab/constants/models";
import { ColorSort } from "@games/brick-count-sort/components/ColorSort";
import { NumberTower } from "@games/brick-count-sort/components/NumberTower";

const MODULES: readonly ShellModule[] = [
  {
    id: "sort",
    label: "Color Sort",
    hero: HERO_FACTORY,
    heroPlate: HERO_PLATE,
    plateColor: "#8494A8",
    doneClip: "instr-sort-done",
    play: (api) => <ColorSort api={api} />,
  },
  {
    id: "tower",
    label: "Number Tower",
    hero: HERO_TOWER,
    heroPlate: HERO_PLATE,
    plateColor: "#5B8FD6",
    doneClip: "count-done",
    play: (api) => <NumberTower api={api} />,
  },
];

/**
 * SORT & COUNT — one brick game, two modules picked on its title screen:
 * Color Sort (the factory belt and colour crates) and Number Tower (stack
 * exactly the number asked). Both run on the shared brick engine.
 */
export function BrickCountSortGame() {
  return (
    <BrickShell
      title="Sort & Count"
      tagline="Pick a game!"
      hero={HERO_TOWER}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-countsort-welcome"
      modules={MODULES}
    />
  );
}
