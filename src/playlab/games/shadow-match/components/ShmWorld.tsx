"use client";

import { memo } from "react";
import { ClassroomScene } from "@games/blend-read/components/ClassroomScene";

/** Blend & Seek's classroom, calm — the walls cleared. Nothing moves. */
export const ClassroomWorld = memo(function ClassroomWorld() {
  return (
    <div className="shm-classroom" aria-hidden="true">
      <ClassroomScene calm />
    </div>
  );
});
