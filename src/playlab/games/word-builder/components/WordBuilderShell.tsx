"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { SiteScene } from "@games/cvc-match/components/SiteScene";
import { MODULES, ROUNDS, VOICE, type ModuleId } from "@games/word-builder/constants/rounds";
import { WbdMini } from "@games/word-builder/components/WbdMini";
import { makeRound } from "@games/word-builder/components/WbdRounds";

/**
 * WORD BUILDER — one lesson as its own game. Each `word-builder-*` game calls
 * this ONCE at module level with its vowel and gets its component back: the
 * lesson's three words, each heard letter by letter, built by dragging its
 * letters into place, then finished by finding its missing letter; then all
 * three come round again in a review. A break card (Continue / Back) follows
 * every word.
 *
 * Kit folder, not a game. Count & Match's shell, guided and `single` (the
 * title and one Play button); the building site and the pictures are Word
 * Site's.
 */
export function makeWordBuilder(id: ModuleId): ComponentType {
  const info = MODULES.filter((m) => m.id === id);
  const useStore = createModuleStore(`word-builder-${id}-progress`, [id] as const, ROUNDS);
  const rounds = { [id]: makeRound(id) } as Record<ModuleId, ComponentType<RoundProps>>;
  return function WordBuilderLesson() {
    const store = useStore();
    return (
      <div className="apa-game wbd-game">
        <NgShell
          title={`Word Builder: ${id} words`}
          guided
          single
          roundCount={ROUNDS}
          breakEvery={3}
          voice={VOICE}
          store={store}
          modules={info}
          rounds={rounds}
          Mini={WbdMini}
          world={<SiteScene calm />}
        />
      </div>
    );
  };
}
