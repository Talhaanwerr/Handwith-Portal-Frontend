"use client";

import { memo } from "react";
import { PirateWorld } from "@games/pirate-match/components/MatchScreens";
import { IslandMound } from "@shared/components/pirate/PirateOcean";

/**
 * WHAT'S INSIDE?'S WORLD — Pirate Match's cove, reused as it is (the layered
 * sea, the island and its palm), without the ship, which would crowd the
 * chests. Along the bottom, the Pirate theme's own sandy `IslandMound`,
 * stretched wide, is the beach the chests (and the teacher) stand on.
 * Nothing here moves.
 */
export const CoveWorld = memo(function CoveWorld() {
  return (
    <div className="wsi-world" aria-hidden="true">
      <PirateWorld ship={false} />
      <div className="wsi-shore">
        <IslandMound />
      </div>
    </div>
  );
});
