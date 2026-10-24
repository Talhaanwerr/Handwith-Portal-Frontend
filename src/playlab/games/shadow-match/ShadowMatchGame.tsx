"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useShadowMatchStore } from "@games/shadow-match/store/shadowMatchStore";
import { MODULES, VOICE, type ModuleId } from "@games/shadow-match/constants/rounds";
import { ClassroomWorld } from "@games/shadow-match/components/ShmWorld";
import { ModuleMini } from "@games/shadow-match/components/ShmMinis";
import { FindShadowRound } from "@games/shadow-match/components/FindShadowRound";
import { BigSmallRound } from "@games/shadow-match/components/BigSmallRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  find: FindShadowRound,
  size: BigSmallRound,
};

/**
 * SHADOW MATCH MYSTERY — shape matching, then big / small. Two modules
 * of four rounds on Count & Match's shell (`@games/number-groups`), in Blend
 * & Seek's calm classroom: Find the Shadow (drag a picture onto its shadow)
 * and Big or Small (tap the big or the small shadow).
 */
export function ShadowMatchGame() {
  const store = useShadowMatchStore();
  return (
    <NgShell
      title="Shadow Match Mystery"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={<ClassroomWorld />}
    />
  );
}
