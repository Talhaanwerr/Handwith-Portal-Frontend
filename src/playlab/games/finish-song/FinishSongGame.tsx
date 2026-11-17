"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  MODULES,
  MODULE_IDS,
  SONG_ROUNDS,
  VOICE,
  type ModuleId,
} from "@games/finish-song/constants/rounds";
import { FmsWorld } from "@games/finish-song/components/FmsWorld";
import { ModuleMini } from "@games/finish-song/components/FmsMini";
import { SongRound } from "@games/finish-song/components/SongRound";

const useFinishSongStore = createModuleStore("finish-song-progress", MODULE_IDS, SONG_ROUNDS);

const ROUNDS: Record<ModuleId, ComponentType<RoundProps>> = {
  sing: SongRound,
};

/**
 * FINISH MY SONG — a bird in a golden evening meadow sings a little song
 * with its last word missing; three eggs in its nest hatch into pictures and
 * the child taps the one that rhymes, so the bird can sing the whole line.
 *
 * Count & Match's shell in its guided layout, one module, Apple Basket's
 * wrapper (no teacher: the bird is the guide).
 */
export function FinishSongGame() {
  const store = useFinishSongStore();
  return (
    <div className="apa-game">
      <NgShell
        title="Finish My Song"
        guided
        single
        roundCount={SONG_ROUNDS}
        breakEvery={3}
        voice={VOICE}
        store={store}
        modules={MODULES}
        rounds={ROUNDS}
        Mini={ModuleMini}
        world={<FmsWorld />}
      />
    </div>
  );
}
