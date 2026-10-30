"use client";

import { memo } from "react";
import { cssVars } from "@shared/styles/cssVars";
import { Picture, type PictureId } from "@games/blend-read/components/PictureArt";

/**
 * A picture's shadow: the SAME picture, blacked out and see-through, on a
 * pale spotlight patch. Static — the filter never moves. `stretch` lengthens
 * it along its length (scaleX); `size` shrinks or grows it.
 */
export const Shadow = memo(function Shadow({
  id,
  stretch = 1,
  size = 1,
}: {
  id: PictureId;
  stretch?: number;
  size?: number;
}) {
  return (
    <span
      className="shm-sil"
      style={cssVars({ "--shm-sx": String(stretch * size), "--shm-sy": String(size) })}
      aria-hidden="true"
    >
      <Picture id={id} />
    </span>
  );
});
