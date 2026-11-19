"use client";

import { memo, type ComponentType } from "react";
import { SpaceWorld as RocketSpace } from "@games/rocket-countdown/components/RocketParts";
import type { Terrain } from "@games/magic-colours/constants/vehicles";
import type { ModuleId } from "@games/magic-colours/constants/rounds";

/**
 * MAGIC COLOURS' WORLDS — calm, full-bleed scenes the vehicles stand in.
 * Plain layers laid out in the stage's own units, so the road, the water,
 * the building site's dirt and the moon's dust line up with the board at
 * every size: the board's floor (`.mgc-play .ng-main`'s bottom) sits inside
 * that strip. Only the clouds move, slowly, and only sideways.
 *
 *   • the town street — road vehicles, emergency vehicles on wheels;
 *   • the sea         — boats, the submarine, the lifeboat;
 *   • the sky         — nothing below but far hills;
 *   • space           — Rocket Countdown's (Space ABC's) starry scene, with a
 *                       strip of grey moon dust for the moon buggy;
 *   • the site        — a building site: dirt, cones and a barrier.
 */

function Sky({ clouds = 2 }: { clouds?: 2 | 3 }) {
  return (
    <>
      <span className="mgc-sun" />
      {(["a", "b", "c"] as const).slice(0, clouds).map((k) => (
        <svg
          key={k}
          className={`mgc-cloud mgc-cloud--${k}`}
          viewBox="0 0 120 50"
          aria-hidden="true"
        >
          <path d="M20,44 Q2,44 4,30 Q6,18 22,20 Q26,4 46,6 Q62,0 72,14 Q90,8 98,22 Q118,22 116,36 Q114,46 98,44 Z" />
        </svg>
      ))}
    </>
  );
}

function Hills() {
  return (
    <svg className="mgc-hills" viewBox="0 0 400 60" preserveAspectRatio="none">
      <path d="M0,60 L0,34 Q60,4 130,26 Q190,44 250,18 Q320,-6 400,28 L400,60 Z" fill="#a6dc8a" />
      <path d="M0,60 L0,44 Q90,22 180,42 Q270,58 330,36 Q370,24 400,34 L400,60 Z" fill="#86c96c" />
    </svg>
  );
}

/** A row of houses and shops behind the pavement: flat colours, square windows. */
function Town() {
  const houses = [
    { x: 0, w: 46, h: 46, c: "#f3b9a7", r: "#d9776a" },
    { x: 50, w: 40, h: 62, c: "#fde3a1", r: "#e3a93f" },
    { x: 94, w: 52, h: 40, c: "#b9dcf2", r: "#6aa7d6" },
    { x: 150, w: 38, h: 70, c: "#d6c6f1", r: "#9a84d6" },
    { x: 192, w: 50, h: 50, c: "#c4e8be", r: "#79bf6d" },
    { x: 246, w: 42, h: 64, c: "#f8c9d8", r: "#de7fa0" },
    { x: 292, w: 54, h: 44, c: "#fde3a1", r: "#e3a93f" },
    { x: 350, w: 50, h: 58, c: "#f3b9a7", r: "#d9776a" },
  ];
  return (
    <svg className="mgc-town" viewBox="0 0 400 80" preserveAspectRatio="xMidYMax slice">
      {houses.map((h) => (
        <g key={h.x}>
          <rect x={h.x} y={80 - h.h} width={h.w} height={h.h} fill={h.c} />
          <rect x={h.x} y={80 - h.h} width={h.w} height="6" fill={h.r} />
          {Array.from({ length: Math.floor((h.h - 16) / 16) }, (_, row) =>
            [0, 1].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={h.x + 8 + col * (h.w / 2 - 4)}
                y={80 - h.h + 12 + row * 16}
                width={h.w / 2 - 16}
                height="9"
                rx="1.5"
                fill="#ffffff"
                opacity="0.85"
              />
            ))
          )}
        </g>
      ))}
    </svg>
  );
}

/** The town street: houses, a pavement and the road. */
export const RoadWorld = memo(function RoadWorld() {
  return (
    <div className="mgc-world mgc-world--road" aria-hidden="true">
      <Sky />
      <Hills />
      <Town />
      <span className="mgc-pavement" />
      <span className="mgc-road">
        <span className="mgc-lane" />
      </span>
    </div>
  );
});

export const SeaWorld = memo(function SeaWorld() {
  return (
    <div className="mgc-world mgc-world--sea" aria-hidden="true">
      <Sky />
      <svg className="mgc-island" viewBox="0 0 160 40" preserveAspectRatio="xMidYMax meet">
        <path d="M0,40 Q40,6 82,12 Q130,18 160,40 Z" fill="#9fd486" />
      </svg>
      <span className="mgc-sea">
        <svg className="mgc-waves" viewBox="0 0 400 20" preserveAspectRatio="none">
          <path
            d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10 T400,10 L400,20 L0,20 Z"
            fill="#4fb3e8"
          />
        </svg>
      </span>
    </div>
  );
});

/** High up: more clouds, and only far, low hills at the very bottom. */
export const SkyWorld = memo(function SkyWorld() {
  return (
    <div className="mgc-world mgc-world--sky" aria-hidden="true">
      <Sky clouds={3} />
      <svg className="mgc-far-hills" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path d="M0,40 L0,22 Q70,2 150,18 Q230,32 300,12 Q360,0 400,16 L400,40 Z" fill="#b8e3a4" />
      </svg>
    </div>
  );
});

/** Space: Rocket Countdown's scene, and grey moon dust along the bottom. */
export const SpaceWorld = memo(function SpaceWorld() {
  return (
    <div className="mgc-world mgc-world--space" aria-hidden="true">
      <RocketSpace />
      <svg className="mgc-moon" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path d="M0,40 L0,10 Q100,0 200,8 Q300,16 400,6 L400,40 Z" fill="#c9ceda" />
        <ellipse cx="70" cy="24" rx="16" ry="4" fill="#aeb4c4" />
        <ellipse cx="250" cy="28" rx="22" ry="5" fill="#aeb4c4" />
        <ellipse cx="350" cy="20" rx="10" ry="3" fill="#aeb4c4" />
      </svg>
    </div>
  );
});

/** A building site: hills, a striped barrier, dirt and two cones. */
export const SiteWorld = memo(function SiteWorld() {
  return (
    <div className="mgc-world mgc-world--site" aria-hidden="true">
      <Sky />
      <Hills />
      <svg className="mgc-barrier" viewBox="0 0 400 30" preserveAspectRatio="xMidYMax slice">
        <rect x="0" y="6" width="400" height="12" fill="#ffffff" />
        {Array.from({ length: 20 }, (_, i) => (
          <path
            key={i}
            d={`M${i * 20},18 L${i * 20 + 10},6 L${i * 20 + 18},6 L${i * 20 + 8},18 Z`}
            fill="#f08a24"
          />
        ))}
        {[20, 140, 260, 380].map((x) => (
          <rect key={x} x={x - 2} y="6" width="4" height="24" fill="#8a6a4a" />
        ))}
      </svg>
      <span className="mgc-dirt" />
      <svg className="mgc-cone mgc-cone--a" viewBox="0 0 30 36">
        <path d="M11,2 L19,2 L28,32 L2,32 Z" fill="#f08a24" />
        <path d="M8,13 L22,13 L24,20 L6,20 Z" fill="#ffffff" />
        <rect x="0" y="31" width="30" height="5" rx="2" fill="#c96a14" />
      </svg>
      <svg className="mgc-cone mgc-cone--b" viewBox="0 0 30 36">
        <path d="M11,2 L19,2 L28,32 L2,32 Z" fill="#f08a24" />
        <path d="M8,13 L22,13 L24,20 L6,20 Z" fill="#ffffff" />
        <rect x="0" y="31" width="30" height="5" rx="2" fill="#c96a14" />
      </svg>
    </div>
  );
});

/** The scene each kind of vehicle is played in. */
export const WORLDS: Readonly<Record<Terrain, ComponentType>> = {
  road: RoadWorld,
  sea: SeaWorld,
  sky: SkyWorld,
  space: SpaceWorld,
  site: SiteWorld,
};

/** The scene behind each game's title screen and star card. */
export const THEME_WORLD: Readonly<Record<ModuleId, ComponentType>> = {
  road: RoadWorld,
  sea: SeaWorld,
  sky: SkyWorld,
  space: SpaceWorld,
  emergency: RoadWorld,
  build: SiteWorld,
};
