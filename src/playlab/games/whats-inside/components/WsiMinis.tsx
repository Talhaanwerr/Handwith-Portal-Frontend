"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { Chest } from "@games/whats-inside/components/Chest";
import { OPEN_LID, PEEKS, PEEK_LIDS, type ModuleId } from "@games/whats-inside/constants/rounds";

/**
 * Each module in miniature, for its home card and the star card — built from
 * the module's own pieces: a chest with a cat's ears peeking out of it; two
 * shut chests and an open one with a ball inside.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "peek")
    return (
      <span className="ng-mini wsi-mini" aria-hidden="true">
        <span className="wsi-mini-chest wsi-mini-chest--big">
          <Chest lid={PEEK_LIDS[0]} toy={<Picture id="cat" />} rise={PEEKS[0]} inside />
        </span>
        <span className="wsi-mini-q font-rounded font-black">?</span>
      </span>
    );
  return (
    <span className="ng-mini wsi-mini" aria-hidden="true">
      <span className="wsi-mini-chest wsi-mini-chest--l">
        <Chest lid={0} toy={null} rise={0} inside={false} />
      </span>
      <span className="wsi-mini-chest wsi-mini-chest--m">
        <Chest lid={OPEN_LID} toy={<Picture id="ball" />} rise={0.9} inside />
      </span>
      <span className="wsi-mini-chest wsi-mini-chest--r">
        <Chest lid={0} toy={null} rise={0} inside={false} />
      </span>
    </span>
  );
}
