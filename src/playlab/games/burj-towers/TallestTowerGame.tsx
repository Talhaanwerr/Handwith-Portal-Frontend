"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { DubaiWorld } from "@shared/components/dubai/DubaiWorld";
import { MODULES, MODULE_IDS, VOICE, type ModuleId } from "@games/burj-towers/constants/rounds";
import { ModuleMini } from "@games/burj-towers/components/TowerMinis";
import { TallShortRound } from "@games/burj-towers/components/TallShortRound";
import { OrderRound } from "@games/burj-towers/components/OrderRound";

const useTallestTowerStore = createModuleStore("burj-towers-progress", MODULE_IDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  tallshort: TallShortRound,
  order: OrderRound,
};

/**
 * TALLEST TOWER — a size game (tall and short, putting in order) with Burj
 * Khalifa towers in Dubai, all drag and drop. Tall or Short?: two towers,
 * "Which tower is taller?" / "…shorter?" — drag the gold star onto it. Line
 * Them Up: three towers, dragged short to tall onto a stand, copying the
 * little polaroid in the corner. No numbers anywhere: the heights are only
 * drawn.
 *
 * Count & Match's shell (title screen, How to Play, rounds, star card); the
 * Dubai world and the towers are Burj Khalifa's art (DubaiWorld, BurjTower),
 * reused as they are. No teacher on the stage: the towers are the game.
 * Guided: every screen centred, the line in the thin bar at the top, and the
 * teaching hand showing each drag by itself on the first round.
 */
export function TallestTowerGame() {
  const store = useTallestTowerStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Tallest Tower"
        guided
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<DubaiWorld time="day" />}
      />
    </div>
  );
}
