"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useBirthdayPartyStore } from "@games/birthday-party/store/birthdayPartyStore";
import { MODULES, VOICE, type ModuleId } from "@games/birthday-party/constants/rounds";
import { PartyWorld } from "@games/birthday-party/components/BdcWorld";
import { ModuleMini } from "@games/birthday-party/components/BdcMinis";
import { BoGuide } from "@games/birthday-party/components/PartyGuide";
import { EachRound } from "@games/birthday-party/components/EachRound";
import { CandlesRound } from "@games/birthday-party/components/CandlesRound";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  each: EachRound,
  candles: CandlesRound,
};

/**
 * BIRTHDAY PARTY — one-to-one correspondence and numeral → quantity, 1 to 5,
 * at a party in Candy Land. Two modules of four rounds: One for Each (a
 * cupcake onto every friend's plate, then how many?) and Candles on the Cake
 * (as many candles as the birthday friend's age, then blow them out).
 *
 * The shell, the chrome, the celebrations and the store are Count & Match's
 * (`@games/number-groups`); the world is Letter Treats' Candy Land. Only the
 * party props (hats, cake, candles, badge, table) are drawn here.
 */
export function BirthdayPartyGame() {
  const store = useBirthdayPartyStore();
  return (
    // no teacher: the birthday friend stands in his corner and says his lines
    <div className="bdc-game">
      <NgShell
        title="Birthday Party"
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<PartyWorld />}
        guide={BoGuide}
      />
    </div>
  );
}
