"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { StreetBackdrop } from "@games/tiny-toy-shop/components/ShopParts";
import { MODULES, MODULE_IDS, VOICE, type ModuleId } from "@games/drum-beats/constants/rounds";
import { ModuleMini } from "@games/drum-beats/components/BeatMinis";
import { BigRound, LittleRound } from "@games/drum-beats/components/BeatRound";

const useDrumBeatsStore = createModuleStore("drum-beats-progress", MODULE_IDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  little: LittleRound,
  big: BigRound,
};

/**
 * DRUM BEATS — adding by doing. Tap the drum the times it asks (blue dots),
 * then "Now … more!" (red dots); the sum fills in with the total.
 *
 * Count & Match's shell, Tiny Toy Shop's plain warm room, the portal's Fluent drum
 * and Apple Basket's sum strip. No teacher on the stage: the drum is the game.
 */
export function DrumBeatsGame() {
  const store = useDrumBeatsStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Drum Beats"
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<StreetBackdrop />}
      />
    </div>
  );
}
