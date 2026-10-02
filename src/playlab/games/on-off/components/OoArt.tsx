"use client";

import { memo } from "react";
import { cssVars } from "@shared/styles/cssVars";
import { Picture } from "@games/blend-read/components/PictureArt";
import { Playroom as RoomWorld } from "@games/color-shape-friends/components/Playroom";
import { Rug } from "@games/color-shape-friends/components/SceneDecor";
import { Playroom as PuzzleRoom } from "@games/jigsaw-fun/components/JfStage";
import { PerchTreeArt } from "@games/sesame-activities/components/SesameArt";
import { TableAndChair } from "@games/counting-numbers/components/CountingArt";
import type { BackdropId, Box, SurfaceId } from "@games/on-off/constants/scenes";

/**
 * On & Off draws NOTHING of its own: every world and every piece of
 * furniture is another game's art, imported as is.
 *
 *   worlds    room      Rainbow Shapes' playroom (bunting, window,
 *                       art shelf, braided rug, honey floor)
 *             playroom  Jigsaw Fun's puzzle-paper playroom and wooden floor
 *             dining    Play Street Pals' dining room (mint wallpaper, rail,
 *                       checked tiles)
 *             park      Play Street Pals' park (sky, sun, hills, grass) —
 *                       without its drifting clouds, so nothing moves
 *   surfaces  bed, box, chair — Twemoji via Picture; tree — Street Pals'
 *             PerchTreeArt; table — Numbers 1 – 5's TableAndChair; rug —
 *             Rainbow Shapes' Rug
 *
 * Each world's floor height is a knob its own stylesheet already has
 * (`--csf-floor-h`, `.jf-table`'s height, `--sa-floor`); on-off.css sets it
 * under `.oo-root` so the furniture stands on the floor at every size.
 */
export const Backdrop = memo(function Backdrop({ id }: { id: BackdropId }) {
  if (id === "room")
    return (
      <div className="oo-bg oo-bg--room" aria-hidden="true">
        <RoomWorld />
      </div>
    );
  if (id === "playroom")
    return (
      <div className="oo-bg oo-bg--playroom" aria-hidden="true">
        <PuzzleRoom />
      </div>
    );
  if (id === "dining")
    return (
      <div className="oo-bg oo-bg--dining sa-world sa-world--dining" aria-hidden="true">
        <div className="sa-ground sa-ground--tiles" />
      </div>
    );
  return (
    <div className="oo-bg oo-bg--park sa-world sa-world--park" aria-hidden="true">
      <span className="sa-sun" />
      <div className="sa-hills" />
      <div className="sa-ground sa-ground--grass" />
    </div>
  );
});

/** One surface drawing, filling its box. */
export const SurfaceArt = memo(function SurfaceArt({ id }: { id: SurfaceId }) {
  switch (id) {
    case "tree":
      return <PerchTreeArt />;
    case "table":
      return <TableAndChair />;
    case "rug":
      return <Rug />;
    default:
      return <Picture id={id} />;
  }
});

/**
 * A box's landscape and portrait placement as CSS custom properties, read by
 * `.oo-at` (on-off.css), which turns them into left/top/width/height in u.
 */
export function boxVars(land: Box, port: Box) {
  return cssVars({
    "--oo-lx": land.x,
    "--oo-ly": land.y,
    "--oo-lw": land.w,
    "--oo-lh": land.h,
    "--oo-px": port.x,
    "--oo-py": port.y,
    "--oo-pw": port.w,
    "--oo-ph": port.h,
  });
}
