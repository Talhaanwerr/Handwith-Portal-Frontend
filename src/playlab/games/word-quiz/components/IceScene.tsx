"use client";

import {
  ArcticSky,
  ArcticAurora,
  ArcticCloud,
  Snowfall,
} from "@shared/components/arctic/ArcticSky";
import { SnowGround, Iceberg, IceCliff, Igloo } from "@shared/components/arctic/ArcticLand";
import { ArcticPine } from "@shared/components/arctic/ArcticCamp";
import { Penguin, PolarBear } from "@shared/components/arctic/ArcticAnimals";

/**
 * THE ICE — the world every Snow Words screen stands in, composed from the
 * shared arctic theme and drawn here exactly zero times.
 *
 * Back to front: a daylight sky with an aurora and drifting clouds, an ice
 * cliff and two bergs on the horizon, the snow ground, then the igloo with a
 * penguin beside it and a bear on the far side. Snow falls over the lot.
 *
 * `crowd` is off on the question screens: there the board is the thing being
 * read, so the ice keeps to the horizon and only the sky moves.
 */
export function IceScene({ crowd = false }: { crowd?: boolean }) {
  return (
    <div className="wq-ice" aria-hidden="true">
      <ArcticSky className="wq-ice-sky" moon={false} />
      <ArcticAurora className="wq-ice-aurora" />
      <ArcticCloud className="wq-ice-cloud wq-ice-cloud--a" />
      <ArcticCloud className="wq-ice-cloud wq-ice-cloud--b" />

      <IceCliff className="wq-ice-cliff" />
      <Iceberg className="wq-ice-berg wq-ice-berg--a" />
      <Iceberg className="wq-ice-berg wq-ice-berg--b" />
      <SnowGround className="wq-ice-ground" />

      {crowd && (
        <>
          <Igloo className="wq-ice-igloo" />
          <ArcticPine className="wq-ice-pine" />
          <Penguin className="wq-ice-penguin" />
          <PolarBear className="wq-ice-bear" />
        </>
      )}

      <Snowfall count={crowd ? 26 : 14} />
    </div>
  );
}
