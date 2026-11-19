"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { VOICE } from "@games/magic-colours/constants/rounds";
import { ModuleMini } from "@games/magic-colours/components/McMinis";
import { THEME_ROUNDS } from "@games/magic-colours/components/ColourRound";
import { THEME_WORLD } from "@games/magic-colours/components/McWorlds";
import { MODULES, ROUND_TOTAL, STORE_KEY, TITLE } from "@games/colours-sea/constants/game";

const useColoursSeaStore = createModuleStore(STORE_KEY, ["sea"] as const, ROUND_TOTAL);

const ROUNDS: Record<"sea", ComponentType<RoundProps>> = { sea: THEME_ROUNDS.sea };
const World = THEME_WORLD.sea;

/**
 * MAGIC COLOURS: SEA — boats on the sea: sailboat, speedboat, fishing boat, submarine, ship
 * and ferry.
 * Each rolls in and is named; tap each blank part and its colour pops in and
 * is named; colour them all, hear its name again, and away it goes.
 *
 * Magic Colours' "sea" theme on its own: Count & Match's shell, guided
 * and `single` (one Play card on the title screen, no "Pick another" on the
 * star card). Everything else is Magic Colours'.
 */
export function ColoursSeaGame() {
  const store = useColoursSeaStore();
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
