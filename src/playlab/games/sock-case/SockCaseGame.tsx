"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { PlayroomWorld } from "@games/number-groups/components/NgWorlds";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useSockCaseStore } from "@games/sock-case/store/sockCaseStore";
import { MODULES, VOICE, type ModuleId } from "@games/sock-case/constants/rounds";
import { ModuleMini } from "@games/sock-case/components/SkcMinis";
import { PairRound } from "@games/sock-case/components/PairRound";
import { OddRound } from "@games/sock-case/components/OddRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  pair: PairRound,
  odd: OddRound,
};

/**
 * THE MISSING SOCK CASE — matching pairs and the odd one out, as a gentle
 * detective story. Two modules of four rounds in Jigsaw Fun's playroom, with
 * a washing line and a laundry basket: Find the Pair (drag the matching sock
 * onto the empty peg) and The Odd Sock (tap the sock with no partner; the
 * magnifying glass solves the case and the pairs are counted). Shell, chrome,
 * celebrations and store are Count & Match's (`@games/number-groups`); only
 * the socks, the peg, the basket and the glass are drawn here.
 */
export function SockCaseGame() {
  const store = useSockCaseStore();
  return (
    <NgShell
      title="The Missing Sock Case"
      voice={VOICE}
      store={store}
      modules={MODULES}
      rounds={ROUNDS}
      Mini={ModuleMini}
      world={
        <div className="skc-world" aria-hidden="true">
          <PlayroomWorld roomy />
        </div>
      }
    />
  );
}
