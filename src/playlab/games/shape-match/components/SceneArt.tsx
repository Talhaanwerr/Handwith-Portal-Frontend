"use client";

import type { ReactNode } from "react";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { cssVars } from "@shared/styles/cssVars";
import { decorOf, spotsOf, type Scene } from "@games/shape-match/constants/scenes";
import type { ThingId } from "@games/shape-match/constants/things";

/**
 * THE THINGS THAT LIVE IN A PICTURE.
 *
 * The picture activity used to cut a drawing into rectangles. A three-year-old
 * cannot read a rectangle: half a lion and a corner of sky is not a piece of
 * anything they recognise. So a piece is now a WHOLE THING — the sun, the
 * tree, the ball, the rabbit — and the gap it came out of is that same thing,
 * faint, waiting. "The sun goes in the sun-shaped hole" is a rule a small
 * child can see from across the room.
 *
 * Every drawing fits the same 100 x 100 box as the portal's shared animals,
 * so the two sets mix in one registry and a scene can be built from either.
 * Flat fills, heavy outlines, no gradients: the same box of crayons as the
 * shapes.
 */

const INK = "#3D3D5C";

/* ── The things this game draws itself ───────────────────────────────────── */

const Sun = () => (
  <svg viewBox="0 0 100 100">
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <rect
        key={a}
        x="46"
        y="4"
        width="8"
        height="20"
        rx="4"
        fill="#FFC93C"
        transform={`rotate(${a} 50 50)`}
      />
    ))}
    <circle cx="50" cy="50" r="27" fill="#FFD84D" stroke="#E8A417" strokeWidth="4" />
    <circle cx="41" cy="45" r="3.4" fill={INK} />
    <circle cx="59" cy="45" r="3.4" fill={INK} />
    <path d="M42 58q8 8 16 0" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

const Cloud = () => (
  <svg viewBox="0 0 100 100">
    <path
      d="M24 70c-9 0-16-7-16-15s7-15 16-15c1-10 9-18 19-18 8 0 15 5 18 12 2-1 4-1 6-1 9 0 16 7 16 16s-7 16-16 16Z"
      fill="#FFFFFF"
      stroke="#BFD9EA"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  </svg>
);

const Tree = () => (
  <svg viewBox="0 0 100 100">
    <rect x="43" y="56" width="14" height="36" rx="5" fill="#A9702F" />
    <circle cx="50" cy="38" r="26" fill="#5FCB52" stroke="#38982F" strokeWidth="4" />
    <circle cx="30" cy="50" r="16" fill="#5FCB52" stroke="#38982F" strokeWidth="4" />
    <circle cx="70" cy="50" r="16" fill="#5FCB52" stroke="#38982F" strokeWidth="4" />
    <circle cx="38" cy="34" r="5" fill="#F4553D" />
    <circle cx="62" cy="44" r="5" fill="#F4553D" />
  </svg>
);

const Flower = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 92V54" stroke="#38982F" strokeWidth="7" strokeLinecap="round" />
    <path d="M50 74c-12 0-18-7-18-13 11 0 18 6 18 13Z" fill="#5FCB52" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse
        key={a}
        cx="50"
        cy="22"
        rx="12"
        ry="16"
        fill="#FF7EB6"
        stroke="#D44C8B"
        strokeWidth="3"
        transform={`rotate(${a} 50 42)`}
      />
    ))}
    <circle cx="50" cy="42" r="11" fill="#FFC93C" stroke="#D99A11" strokeWidth="3" />
  </svg>
);

const Ball = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="52" r="36" fill="#F4553D" stroke="#C32E18" strokeWidth="4" />
    <path d="M14 52h72" stroke="#FFFFFF" strokeWidth="8" />
    <path d="M50 16c14 14 14 58 0 72" fill="none" stroke="#FFFFFF" strokeWidth="8" />
  </svg>
);

const Boat = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 12 78 56H50Z" fill="#FFFFFF" stroke="#BFD9EA" strokeWidth="3.4" />
    <path d="M46 12v46" stroke="#A9702F" strokeWidth="6" strokeLinecap="round" />
    <path d="M16 62h68l-12 22H28Z" fill="#F4553D" stroke="#C32E18" strokeWidth="4" />
  </svg>
);

const Fish = () => (
  <svg viewBox="0 0 100 100">
    <path d="M84 50 96 34v32Z" fill="#F08A2E" />
    <ellipse cx="50" cy="50" rx="34" ry="24" fill="#FFB03A" stroke="#D9770F" strokeWidth="4" />
    <circle cx="32" cy="43" r="6" fill="#FFFFFF" />
    <circle cx="30" cy="43" r="3" fill={INK} />
    <path d="M56 32c6 10 6 26 0 36" fill="none" stroke="#D9770F" strokeWidth="4" />
  </svg>
);

const Kite = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 8 78 42 50 76 22 42Z" fill="#9B5DE5" stroke="#6F35BC" strokeWidth="4" />
    <path d="M50 8v68M22 42h56" stroke="#FFFFFF" strokeWidth="3" />
    <path
      d="M50 76q8 8 0 16t0 16"
      fill="none"
      stroke="#6F35BC"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
  </svg>
);

const Apple = () => (
  <svg viewBox="0 0 100 100">
    <path
      d="M50 28c16-9 30 4 30 22 0 20-14 38-30 38S20 70 20 50c0-18 14-31 30-22Z"
      fill="#F4553D"
      stroke="#C32E18"
      strokeWidth="4"
    />
    <path d="M50 28V12" stroke="#A9702F" strokeWidth="5" strokeLinecap="round" />
    <path d="M52 20c6-8 14-9 18-6 1 8-6 13-18 11Z" fill="#5FCB52" />
  </svg>
);

const Star = () => (
  <svg viewBox="0 0 100 100">
    <path
      d="m50 8 13 26 29 4-21 20 5 29-26-14-26 14 5-29L8 38l29-4Z"
      fill="#FFC93C"
      stroke="#D99A11"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 100 100">
    <path
      d="M62 10a42 42 0 1 0 0 80 48 48 0 0 1 0-80Z"
      fill="#FFE27A"
      stroke="#E8A417"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  </svg>
);

const Snowman = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="70" r="24" fill="#FFFFFF" stroke="#BFD9EA" strokeWidth="4" />
    <circle cx="50" cy="34" r="17" fill="#FFFFFF" stroke="#BFD9EA" strokeWidth="4" />
    <rect x="32" y="14" width="36" height="7" rx="3" fill={INK} />
    <rect x="39" y="0" width="22" height="16" rx="3" fill={INK} />
    <circle cx="44" cy="32" r="3" fill={INK} />
    <circle cx="56" cy="32" r="3" fill={INK} />
    <path d="M50 38l12 4-12 4Z" fill="#F08A2E" />
    <circle cx="50" cy="62" r="3.4" fill={INK} />
    <circle cx="50" cy="76" r="3.4" fill={INK} />
  </svg>
);

const House = () => (
  <svg viewBox="0 0 100 100">
    <path
      d="M50 10 92 46H8Z"
      fill="#F4553D"
      stroke="#C32E18"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <rect x="18" y="46" width="64" height="44" fill="#FFE2A8" stroke="#D9A44F" strokeWidth="4" />
    <rect x="42" y="62" width="20" height="28" rx="2" fill="#A9702F" />
    <rect
      x="24"
      y="56"
      width="14"
      height="14"
      rx="2"
      fill="#7FD6FB"
      stroke="#4FA6D6"
      strokeWidth="3"
    />
    <rect
      x="66"
      y="56"
      width="14"
      height="14"
      rx="2"
      fill="#7FD6FB"
      stroke="#4FA6D6"
      strokeWidth="3"
    />
  </svg>
);

const Butterfly = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="30" cy="36" rx="20" ry="22" fill="#FF7EB6" stroke="#D44C8B" strokeWidth="3.4" />
    <ellipse cx="70" cy="36" rx="20" ry="22" fill="#FF7EB6" stroke="#D44C8B" strokeWidth="3.4" />
    <ellipse cx="34" cy="68" rx="15" ry="16" fill="#9B5DE5" stroke="#6F35BC" strokeWidth="3.4" />
    <ellipse cx="66" cy="68" rx="15" ry="16" fill="#9B5DE5" stroke="#6F35BC" strokeWidth="3.4" />
    <rect x="46" y="26" width="8" height="54" rx="4" fill={INK} />
    <path d="M50 26 40 10M50 26l10-16" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

const Bird = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="48" cy="56" rx="30" ry="24" fill="#3DA5F4" stroke="#1476C0" strokeWidth="4" />
    <circle cx="70" cy="38" r="17" fill="#5AB5FA" stroke="#1476C0" strokeWidth="4" />
    <circle cx="74" cy="35" r="3.4" fill={INK} />
    <path d="M86 40l14 4-14 5Z" fill="#F08A2E" />
    <path d="M40 52c10 0 18 8 18 18-12 2-20-6-18-18Z" fill="#1E8AD6" />
    <path d="M18 62l-14 8 16 2Z" fill="#1476C0" />
  </svg>
);

/* ── The registry ────────────────────────────────────────────────────────── */

/** Everything a scene can be built from: this game's things, plus the
 *  portal's shared animals — the game draws no animal of its own. */
export const SCENE_ART: Record<ThingId, () => ReactNode> = {
  sun: Sun,
  cloud: Cloud,
  tree: Tree,
  flower: Flower,
  ball: Ball,
  boat: Boat,
  fish: Fish,
  kite: Kite,
  apple: Apple,
  star: Star,
  moon: Moon,
  snowman: Snowman,
  house: House,
  butterfly: Butterfly,
  bird: Bird,
  lion: ANIMAL_ART.lion,
  rabbit: ANIMAL_ART.rabbit,
  penguin: ANIMAL_ART.penguin,
  bear: ANIMAL_ART.bear,
  frog: ANIMAL_ART.frog,
  cat: ANIMAL_ART.cat,
  dog: ANIMAL_ART.dog,
  turtle: ANIMAL_ART.turtle,
  monkey: ANIMAL_ART.monkey,
  elephant: ANIMAL_ART.elephant,
  horse: ANIMAL_ART.horse,
  whale: ANIMAL_ART.whale,
};

/** One thing, drawn. */
export function Thing({ art }: { art: ThingId }) {
  const Art = SCENE_ART[art];
  return Art ? <Art /> : null;
}

/* ── A whole picture ─────────────────────────────────────────────────────── */

interface PictureProps {
  scene: Scene;
  /** Pieces NOT to draw — the gaps the board fills in with its own buttons.
   *  Left out entirely, the picture is complete: that is what the start
   *  screen's cards and the "well done" screen show. */
  hide?: readonly number[];
}

/**
 * The picture itself: sky, ground, its furniture and its things, all
 * positioned in PERCENTAGES so the same drawing works as a thumbnail on a
 * card, as a board to play on, and as the big picture at the end.
 */
export function ScenePicture({ scene, hide }: PictureProps) {
  const spots = spotsOf(scene);
  const decor = decorOf(scene);
  return (
    <span
      className="sm-scene-art"
      style={cssVars({
        "--sm-paper": scene.paper,
        "--sm-band": scene.band,
        "--sm-band-h": scene.bandHeight + "%",
      })}
      aria-hidden="true"
    >
      <span className="sm-scene-band" />

      {decor.map((spot, i) => (
        <span
          key={"d" + i}
          className="sm-scene-thing"
          style={cssVars({
            "--sm-x": spot.x + "%",
            "--sm-y": spot.y + "%",
            "--sm-w": spot.size + "%",
          })}
        >
          <Thing art={spot.art} />
        </span>
      ))}

      {spots.map((spot, i) =>
        hide?.includes(i) ? null : (
          <span
            key={"p" + i}
            className="sm-scene-thing"
            style={cssVars({
              "--sm-x": spot.x + "%",
              "--sm-y": spot.y + "%",
              "--sm-w": spot.size + "%",
            })}
          >
            <Thing art={spot.art} />
          </span>
        )
      )}
    </span>
  );
}
