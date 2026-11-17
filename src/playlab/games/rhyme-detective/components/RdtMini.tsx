"use client";

import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import type { ModuleId } from "@games/rhyme-detective/constants/rounds";

/** Rhyme Detective in miniature for its home card: the case file's cat, and
 *  the hat under the magnifying glass. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini rdt-mini" data-module={id} aria-hidden="true">
      <span className="rdt-mini-case">
        <RhymePic word="cat" />
      </span>
      <span className="rdt-mini-lens">
        <RhymePic word="hat" />
      </span>
    </span>
  );
}
