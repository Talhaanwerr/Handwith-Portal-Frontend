"use client";

import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { Bird } from "@games/finish-song/components/Bird";
import type { ModuleId } from "@games/finish-song/constants/rounds";

/** Finish My Song in miniature for its home card: the bird singing beside a
 *  hat sitting up in a cracked egg. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini fms-mini" data-module={id} aria-hidden="true">
      <span className="fms-mini-bird">
        <Bird singing />
      </span>
      <span className="fms-mini-egg">
        <RhymePic word="hat" />
      </span>
    </span>
  );
}
