"use client";

import { memo } from "react";
import { Playroom as BerryPlayroom } from "@games/color-shape-friends/components/Playroom";
import { ClassroomScene } from "@games/blend-read/components/ClassroomScene";

/**
 * NUMBER HUNT'S WORLDS — backdrops the portal already has, reused as they
 * are. Nothing here moves.
 *
 *   • Berry's room  — Color & Shape Friends' playroom: bunting, wainscot,
 *                     floor and rug (the title screen, the star card, Find
 *                     the Number), given its variables under `nh-`;
 *   • the classroom — Blend & Seek's classroom, bare (Group Boxes).
 */

export const RoomWorld = memo(function RoomWorld() {
  return (
    <div className="nh-csf" aria-hidden="true">
      <BerryPlayroom />
    </div>
  );
});

export const ClassroomWorld = memo(function ClassroomWorld() {
  return (
    <div className="nh-classroom" aria-hidden="true">
      <ClassroomScene bare />
    </div>
  );
});
