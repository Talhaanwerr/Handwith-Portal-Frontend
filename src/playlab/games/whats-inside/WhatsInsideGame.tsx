"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useWhatsInsideStore } from "@games/whats-inside/store/whatsInsideStore";
import { MODULES, VOICE, type ModuleId } from "@games/whats-inside/constants/rounds";
import { CoveWorld } from "@games/whats-inside/components/WsiWorld";
import { ModuleMini } from "@games/whats-inside/components/WsiMinis";
import { PeekRound } from "@games/whats-inside/components/PeekRound";
import { WhereRound } from "@games/whats-inside/components/WhereRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  peek: PeekRound,
  where: WhereRound,
};

/**
 * WHAT'S INSIDE? — recognition and prediction with treasure chests. Two
 * modules of four rounds in Pirate Match's cove: Peek & Guess (a toy peeks
 * out of a chest; tap what it is — each wrong guess shows a little more) and
 * Where Did It Go? (watch a toy hop into a chest, the chests may swap; tap
 * the right one). Shell, chrome, celebrations and store are Count & Match's
 * (`@games/number-groups`); the chest is the Pirate theme's, in layers; the
 * toys are the portal's pictures.
 */
export function WhatsInsideGame() {
  const store = useWhatsInsideStore();
  return (
    <NgShell
      title="What's Inside?"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={<CoveWorld />}
    />
  );
}
