"use client";

import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import type { ModuleId } from "@games/rhyme-match/constants/rounds";

/** Rhyme Match in miniature for its home card: the pad with a dog and a frog
 *  paired, and a sun left over below. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini rym-mini" data-module={id} aria-hidden="true">
      <span className="rym-mini-pad">
        <span className="rym-mini-pic">
          <RhymePic word="dog" />
        </span>
        <span className="rym-mini-pic">
          <RhymePic word="frog" />
        </span>
      </span>
      <span className="rym-mini-pic rym-mini-pic--left">
        <RhymePic word="sun" />
      </span>
    </span>
  );
}
