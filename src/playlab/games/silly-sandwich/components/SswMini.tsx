"use client";

import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { Munch, MunchHands } from "@games/silly-sandwich/components/Munch";
import { BreadBase } from "@games/silly-sandwich/components/BreadArt";
import type { ModuleId } from "@games/silly-sandwich/constants/rounds";

/** Silly Sandwich in miniature for its home card: Munch, happy, holding his
 *  bread with a hat and a rat on it. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini ssw-mini" data-module={id} aria-hidden="true">
      <span className="ssw-mini-munch">
        <span className="ssw-munch-body">
          <Munch face="munch" />
        </span>
        <span className="ssw-sandwich">
          <span className="ssw-bread">
            <BreadBase />
          </span>
          <span className="ssw-slice ssw-slice--0">
            <span className="ssw-slice-pic">
              <RhymePic word="hat" />
            </span>
          </span>
          <span className="ssw-slice ssw-slice--1">
            <span className="ssw-slice-pic">
              <RhymePic word="rat" />
            </span>
          </span>
        </span>
        <span className="ssw-hands">
          <MunchHands />
        </span>
      </span>
    </span>
  );
}
