"use client";

import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { HatArt } from "@games/magic-hat/components/HatArt";
import type { ModuleId } from "@games/magic-hat/constants/rounds";

/** Magic Hat Swap in miniature for its home card: the cat card, and an "h"
 *  block over the magic hat. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini mht-mini" data-module={id} aria-hidden="true">
      <span className="mht-mini-card">
        <span className="mht-mini-pic">
          <RhymePic word="cat" />
        </span>
        <span className="mht-mini-word">
          <span className="mht-first">c</span>at
        </span>
      </span>
      <span className="mht-mini-hat">
        <span className="mht-block mht-mini-block" style={{ color: "#E0408A" }}>
          <span className="mht-block-face">h</span>
        </span>
        <HatArt />
      </span>
    </span>
  );
}
