"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useSillyRobotStore } from "@games/silly-robot/store/sillyRobotStore";
import { MODULES, VOICE, type ModuleId } from "@games/silly-robot/constants/rounds";
import { SiteWorld } from "@games/silly-robot/components/SrbWorld";
import { ModuleMini } from "@games/silly-robot/components/SrbMinis";
import { FixRound } from "@games/silly-robot/components/FixRound";
import { PeekRound } from "@games/silly-robot/components/PeekRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  fix: FixRound,
  peek: PeekRound,
};

/**
 * FIX THE SILLY ROBOT — subitising 1 to 5 (seeing how many without counting).
 * Two modules of four rounds on the calm building site: Fix the Robot (give
 * the robot back the part whose dots match its tummy) and Quick Look (the
 * tummy flashes its dots; tap the number). Shell, stage, celebrations, drag
 * and store are Count & Match's, from `@games/number-groups`.
 */
export function SillyRobotGame() {
  const store = useSillyRobotStore();
  return (
    <NgShell
      title="Fix the Silly Robot"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={<SiteWorld />}
    />
  );
}
