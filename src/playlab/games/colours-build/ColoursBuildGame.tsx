"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { VOICE } from "@games/magic-colours/constants/rounds";
import { ModuleMini } from "@games/magic-colours/components/McMinis";
import { THEME_ROUNDS } from "@games/magic-colours/components/ColourRound";
import { THEME_WORLD } from "@games/magic-colours/components/McWorlds";
import { MODULES, ROUND_TOTAL, STORE_KEY, TITLE } from "@games/colours-build/constants/game";

const useColoursBuildStore = createModuleStore(STORE_KEY, ["build"] as const, ROUND_TOTAL);

const ROUNDS: Record<"build", ComponentType<RoundProps>> = { build: THEME_ROUNDS.build };
const World = THEME_WORLD.build;

/**
 * MAGIC COLOURS: CONSTRUCTION — building-site machines in their real colours: digger, dump truck,
 * crane, cement mixer, bulldozer and road roller.
 * Each rolls in and is named; tap each blank part and its colour pops in and
 * is named; colour them all, hear its name again, and away it goes.
 *
 * Magic Colours' "build" theme on its own: Count & Match's shell, guided
 * and `single` (one Play card on the title screen, no "Pick another" on the
 * star card). Everything else is Magic Colours'.
 */
export function ColoursBuildGame() {
  const store = useColoursBuildStore();
  return (
    <div className="apa-game mgc-game">
      <NgShell
        title={TITLE}
        guided
        single
        roundCount={ROUND_TOTAL}
        voice={{ ...VOICE, welcome: "pmr-welcome" }}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<World />}
      />
    </div>
  );
}
