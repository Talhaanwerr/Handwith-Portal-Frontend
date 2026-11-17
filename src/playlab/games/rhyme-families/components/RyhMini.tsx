"use client";

import { cssVars } from "@shared/styles/cssVars";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { HouseArt } from "@games/rhyme-families/components/HouseArt";
import { ROOF, type ModuleId } from "@games/rhyme-families/constants/rounds";

/** Rhyme Houses in miniature for its home card: the cat house, a hat going in. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini ryh-mini" data-module={id} aria-hidden="true">
      <span className="ryh-mini-house" style={cssVars({ "--ryh-roof": ROOF.cat ?? "#F2734B" })}>
        <HouseArt />
        <span className="ryh-sign">
          <RhymePic word="cat" />
        </span>
      </span>
      <span className="ryh-mini-pic">
        <RhymePic word="hat" />
      </span>
    </span>
  );
}
