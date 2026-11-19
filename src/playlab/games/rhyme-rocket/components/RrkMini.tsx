"use client";

import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { RocketArt } from "@games/rhyme-rocket/components/RocketArt";
import type { ModuleId } from "@games/rhyme-rocket/constants/rounds";

/** Rhyme Rocket in miniature for its home card: a jar planet, and the star
 *  rocket flying up to it. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini rrk-mini" data-module={id} aria-hidden="true">
      <span className="rrk-mini-planet">
        <span className="rrk-mini-pic">
          <RhymePic word="jar" />
        </span>
      </span>
      <span className="rrk-mini-rocket">
        <RocketArt word="star" flame />
      </span>
    </span>
  );
}
