"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  MODULES,
  ROUNDS,
  VOICE,
  titleOf,
  type ModuleId,
} from "@games/rainbow-words/constants/rounds";
import { RbwMini } from "@games/rainbow-words/components/RbwMini";
import { RbwWorld } from "@games/rainbow-words/components/RbwWorld";
import { makeRound } from "@games/rainbow-words/components/RbwRounds";

/**
 * RAINBOW WORDS — one sight-word lesson as its own game. Each
 * `rainbow-words-*` game calls this ONCE at module level with its colour and
 * gets its component back: three sight words, each met, found among three and
 * caught on the clouds, then all three again in sentences. A break card
 * (Continue / Back) follows every word.
 *
 * Kit folder, not a game. Count & Match's shell, guided and `single` (the
 * title and one Play button); the meadow and its rainbow are drawn here.
 */
export function makeRainbowWords(id: ModuleId): ComponentType {
  const info = MODULES.filter((m) => m.id === id);
  const useStore = createModuleStore(`rainbow-words-${id}-progress`, [id] as const, ROUNDS);
  const rounds = { [id]: makeRound(id) } as Record<ModuleId, ComponentType<RoundProps>>;
  return function RainbowWordsLesson() {
    const store = useStore();
    return (
      <div className="apa-game rbw-game">
        <NgShell
          title={titleOf(id)}
          guided
          single
          roundCount={ROUNDS}
          breakEvery={3}
          voice={VOICE}
          store={store}
          modules={info}
          rounds={rounds}
          Mini={RbwMini}
          world={<RbwWorld lesson={id} />}
        />
      </div>
    );
  };
}
