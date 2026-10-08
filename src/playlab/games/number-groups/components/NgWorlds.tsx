"use client";

import { memo } from "react";
import { Playroom as JigsawPlayroom } from "@games/jigsaw-fun/components/JfStage";
import { PerchTreeArt } from "@games/sesame-activities/components/SesameArt";

/**
 * COUNT & MATCH'S WORLDS — backdrops the portal already has, reused as they
 * are. Nothing here moves. (Number Hunt's are in its own NhWorlds.)
 *
 *   • the playroom — Jigsaw Fun's puzzle-paper wall and wooden table (the
 *                    title screen, the star card, Number Cards);
 *   • the park     — Play Street Pals' park: sky, sun, rolling hills and
 *                    grass, with its perch tree at the edge (Count the
 *                    Plates' picnic). The park's rules are written for that
 *                    game's set, so its paint is restated here under `ng-`.
 */

export const PlayroomWorld = memo(function PlayroomWorld({ roomy = false }: { roomy?: boolean }) {
  return <JigsawPlayroom roomy={roomy} />;
});

export const ParkWorld = memo(function ParkWorld() {
  return (
    <div className="ng-park" aria-hidden="true">
      <span className="ng-park-sun" />
      <span className="ng-park-hills" />
      <span className="ng-park-tree">
        <PerchTreeArt />
      </span>
      <span className="ng-park-grass" />
    </div>
  );
});
