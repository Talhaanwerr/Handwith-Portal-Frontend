"use client";

import { fluentSrc } from "@shared/constants/fluent3d";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import type { ModuleId } from "@games/rhyme-or-not/constants/rounds";

/** Rhyme Time in miniature for its home card: a cat and a hat, and a thumbs-up. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini ryn-mini" data-module={id} aria-hidden="true">
      <span className="ryn-mini-pic">
        <RhymePic word="cat" />
      </span>
      <span className="ryn-mini-pic">
        <RhymePic word="hat" />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ryn-mini-thumb" src={fluentSrc("thumb") ?? ""} alt="" draggable={false} />
    </span>
  );
}
