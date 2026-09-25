"use client";

import { memo } from "react";
import { DirtGround, Scaffolding, HouseBuild } from "@shared/components/construction/SiteWorld";
import { Excavator, TowerCrane } from "@shared/components/construction/SiteVehicles";
import { SiteWorker } from "@shared/components/construction/SiteCrew";
import { BrickStack, TrafficCone } from "@shared/components/construction/SiteMaterials";
import { FloatingClouds } from "@shared/components/animations/FloatingClouds";

/**
 * THE BUILDING SITE — the world every Word Site screen stands in, composed
 * from the shared construction theme and drawn here exactly zero times.
 *
 * Laid out to the reference picture, back to front:
 *
 *   sky            a plain blue gradient in CSS with the shared drifting
 *                  clouds over it. NOT `SiteSky`, whose big yellow sun is the
 *                  one thing the reference does not have.
 *   city           flat grey towers with window grids, far behind
 *   structure      the half-built frame and its scaffolding, mid-ground
 *   crane          STANDING ON THE GROUND at the left, mast full height, jib
 *                  reaching across the frame with a slab hanging off it. It
 *                  used to float in the top corner, which is exactly as odd
 *                  as it sounds
 *   digger         the big yellow tracked excavator, arm out, front and centre
 *   worker         the hard-hatted bricklayer at his wall on the right
 *
 * The machines are deliberately LARGE — in the reference they fill the frame,
 * and a site drawn small reads as wallpaper rather than a place.
 */
export const SiteScene = memo(function SiteScene({ cheer = false }: { cheer?: boolean }) {
  return (
    <div className="cv-site" aria-hidden="true">
      <FloatingClouds />

      {/* the city, far back */}
      <div className="cv-skyline">
        <span className="cv-tower cv-tower--a" />
        <span className="cv-tower cv-tower--b" />
        <span className="cv-tower cv-tower--c" />
        <span className="cv-tower cv-tower--d" />
        <span className="cv-tower cv-tower--e" />
        <span className="cv-tower cv-tower--f" />
      </div>

      {/* the building going up, and the scaffolding around it */}
      <HouseBuild className="cv-site-frame" stage={2} />
      <Scaffolding className="cv-site-scaffold" ladder />

      {/* the crane stands on the dirt, full height, jib over the frame */}
      <TowerCrane className="cv-site-crane" load="beam" hookDrop={0.35} />

      <DirtGround className="cv-site-ground" />

      {/* the machines, big, on the ground */}
      <Excavator className="cv-site-digger" pose="digging" facing="right" />
      <TrafficCone className="cv-site-cone cv-site-cone--l" />
      <TrafficCone className="cv-site-cone cv-site-cone--r" />

      {/* the bricklayer at his wall */}
      <div className="cv-site-crew">
        <SiteWorker className="cv-site-worker" pose={cheer ? "thumbsup" : "carrying"} />
        <BrickStack className="cv-site-wall" rows={4} />
      </div>
    </div>
  );
});
