"use client";

import { memo } from "react";
import {
  ArtShelf,
  Bunting,
  Rug,
  WindowArt,
} from "@games/color-shape-friends/components/SceneDecor";

/**
 * BERRY'S PLAYROOM — the one world every screen of this game happens in.
 *
 * A painted wall with a polka-dot pattern, bunting, a window and an art
 * shelf; a beadboard wainscot; a wooden floor with a braided rug. It is
 * mounted ONCE by the root, behind the screens, so the room holds still
 * while only each activity's props cross-fade over it. The wall, wainscot
 * and floor are plain CSS layers (they stretch to any screen); the furniture
 * is SVG from SceneDecor, placed by the stylesheet. `data-screen` on the
 * root lets a screen move a piece of furniture out of its way.
 */
export const Playroom = memo(function Playroom() {
  return (
    <div className="csf-room" aria-hidden="true">
      <div className="csf-wall" />
      <div className="csf-bunting">
        <Bunting />
      </div>
      <div className="csf-window">
        <WindowArt />
      </div>
      <div className="csf-artshelf">
        <ArtShelf />
      </div>
      <div className="csf-wainscot" />
      <div className="csf-floor" />
      <div className="csf-rug">
        <Rug />
      </div>
    </div>
  );
});
