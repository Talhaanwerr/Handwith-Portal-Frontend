"use client";

import { useCallback, useState, type ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useTinyToyShopStore } from "@games/tiny-toy-shop/store/tinyToyShopStore";
import { MODULES, VOICE, type ModuleId } from "@games/tiny-toy-shop/constants/rounds";
import { StreetBackdrop } from "@games/tiny-toy-shop/components/ShopParts";
import { ModuleMini } from "@games/tiny-toy-shop/components/TysMinis";
import { PickRound } from "@games/tiny-toy-shop/components/PickRound";
import { AddRound } from "@games/tiny-toy-shop/components/AddRound";
import { LevelPicker } from "@games/tiny-toy-shop/components/LevelPicker";
import { useAddLevel } from "@games/tiny-toy-shop/store/addLevelStore";

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  pick: PickRound,
  add: AddRound,
};

/**
 * TINY TOY SHOP — counting and adding toys, 1 to 5, at a little shop on
 * Sesame Street. Two modules of four rounds: Pick the Toys (tap the toys the
 * customer wants into the basket) and Add Them Up (two little groups, tap the
 * total). The shell, stage chrome, celebrations and store are Count & Match's
 * (`@games/number-groups`).
 */
export function TinyToyShopGame() {
  const store = useTinyToyShopStore();
  const setLevel = useAddLevel((s) => s.setLevel);
  // Add Them Up asks "How hard?" first; its Play then starts that level.
  const [ask, setAsk] = useState<(() => void) | null>(null);
  const beforeStart = useCallback((m: ModuleId, go: () => void) => {
    if (m !== "add") return false;
    setAsk(() => go);
    return true;
  }, []);
  return (
    // `tys-game` hides the shared teacher and gives the board his room back
    <div className="tys-game">
      <NgShell
        title="Tiny Toy Shop"
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<StreetBackdrop />}
        beforeStart={beforeStart}
      />
      {ask && (
        <LevelPicker
          onClose={() => setAsk(null)}
          onPick={(level) => {
            setLevel(level);
            const go = ask;
            setAsk(null);
            go();
          }}
        />
      )}
    </div>
  );
}
