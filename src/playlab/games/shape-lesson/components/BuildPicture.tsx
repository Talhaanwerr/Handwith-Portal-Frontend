"use client";

import { memo } from "react";
import type { PictureId } from "@games/shape-lesson/constants/lessons";

/**
 * Page 6's pictures, each missing its shapes: a car without its wheels
 * (circle), a house without its windows (square), a boat without its sails
 * (triangle), a train without its carriages (rectangle), a night sky without
 * its stars (star). Drawn in a 400 × 300 box; the gaps and the shapes put in
 * them are laid over it by the page, at the lesson's `build.gaps`. The puffs
 * of smoke and the moon's smile only show once the picture comes alive.
 */
export const BuildPicture = memo(function BuildPicture({ picture }: { picture: PictureId }) {
  return (
    <svg viewBox="0 0 400 300" className="msh-pic-svg" aria-hidden="true">
      {picture === "car" && <Car />}
      {picture === "house" && <House />}
      {picture === "boat" && <Boat />}
      {picture === "train" && <Train />}
      {picture === "sky" && <Sky />}
    </svg>
  );
});

const Car = () => (
  <>
    <rect width="400" height="300" fill="#CDEEFF" />
    <circle cx="352" cy="46" r="26" fill="#FFE066" />
    <rect y="252" width="400" height="48" fill="#6C7486" />
    {[30, 140, 250, 360].map((x) => (
      <rect key={x} x={x} y="272" width="50" height="8" rx="4" fill="#F5F5F5" />
    ))}
    <g className="msh-pic-body">
      <path
        d="M118 120 Q130 66 176 64 H252 Q292 66 306 120 Z"
        fill="#2F86F0"
        stroke="#1A519E"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M144 116 Q152 82 180 80 H206 V116 Z" fill="#DFF3FF" />
      <path d="M218 116 V80 H248 Q276 82 284 116 Z" fill="#DFF3FF" />
      <rect
        x="42"
        y="116"
        width="330"
        height="96"
        rx="34"
        fill="#FFCE2E"
        stroke="#B8870A"
        strokeWidth="6"
      />
      <circle cx="354" cy="148" r="12" fill="#FFF6C8" />
      <rect x="44" y="150" width="22" height="16" rx="6" fill="#F2463F" />
      {/* the dark arches the wheels go in */}
      <path d="M78 212 A46 46 0 0 1 170 212 Z" fill="#3A3A48" />
      <path d="M238 212 A46 46 0 0 1 330 212 Z" fill="#3A3A48" />
    </g>
    <g className="msh-puff">
      <circle cx="26" cy="190" r="14" fill="#FFFFFF" />
      <circle cx="10" cy="176" r="10" fill="#FFFFFF" />
    </g>
  </>
);

const House = () => (
  <>
    <rect width="400" height="300" fill="#D6ECFF" />
    <rect y="286" width="400" height="14" fill="#6BC24A" />
    <rect x="262" y="20" width="30" height="60" fill="#B23A2E" />
    <g className="msh-puff">
      <circle cx="277" cy="10" r="10" fill="#FFFFFF" />
      <circle cx="294" cy="-2" r="8" fill="#FFFFFF" />
    </g>
    <path
      d="M70 100 L202 18 L334 100 Z"
      fill="#F2463F"
      stroke="#A92621"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <rect x="92" y="96" width="220" height="192" fill="#FFE8C2" stroke="#C79A5A" strokeWidth="6" />
    <rect x="222" y="204" width="60" height="84" rx="8" fill="#8A5A2E" />
    <circle cx="270" cy="248" r="5" fill="#FFE066" />
  </>
);

const Boat = () => (
  <>
    <rect width="400" height="300" fill="#D8F3FF" />
    <circle cx="60" cy="50" r="24" fill="#FFE066" />
    <g className="msh-pic-body">
      <rect x="198" y="52" width="9" height="150" rx="4" fill="#8A5A2E" />
      <path d="M207 52 L242 62 L207 72 Z" fill="#F2463F" />
      <path
        d="M78 172 H330 L300 222 H108 Z"
        fill="#F2463F"
        stroke="#A92621"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <rect x="110" y="186" width="190" height="10" fill="#FFFFFF" opacity="0.7" />
    </g>
    <path
      d="M0 222 Q25 210 50 222 T100 222 T150 222 T200 222 T250 222 T300 222 T350 222 T400 222 V300 H0 Z"
      fill="#2F86F0"
    />
    <path
      d="M0 252 Q25 240 50 252 T100 252 T150 252 T200 252 T250 252 T300 252 T350 252 T400 252 V300 H0 Z"
      fill="#1A6FD0"
    />
  </>
);

const Train = () => (
  <>
    <rect width="400" height="300" fill="#FFF0D6" />
    <rect y="240" width="400" height="60" fill="#C9B79C" />
    {[10, 50, 90, 130, 170, 210, 250, 290, 330, 370].map((x) => (
      <rect key={x} x={x} y="244" width="22" height="16" rx="3" fill="#8A6A4E" />
    ))}
    <rect y="242" width="400" height="6" fill="#8F96A3" />
    <g className="msh-pic-body">
      {/* the carriages' chassis and wheels (the carriages are the gaps) */}
      {[74, 178].map((x) => (
        <g key={x}>
          <rect x={x - 44} y="206" width="88" height="12" rx="5" fill="#4A4A58" />
          <circle cx={x - 22} cy="228" r="13" fill="#3A3A48" />
          <circle cx={x + 22} cy="228" r="13" fill="#3A3A48" />
          <circle cx={x - 22} cy="228" r="5" fill="#C9CDD6" />
          <circle cx={x + 22} cy="228" r="5" fill="#C9CDD6" />
        </g>
      ))}
      <rect x="118" y="208" width="16" height="7" fill="#4A4A58" />
      <rect x="222" y="208" width="16" height="7" fill="#4A4A58" />
      {/* the engine */}
      <rect
        x="236"
        y="148"
        width="80"
        height="66"
        rx="10"
        fill="#2F86F0"
        stroke="#1A519E"
        strokeWidth="6"
      />
      <rect
        x="300"
        y="100"
        width="76"
        height="114"
        rx="10"
        fill="#F2463F"
        stroke="#A92621"
        strokeWidth="6"
      />
      <rect x="314" y="116" width="48" height="36" rx="6" fill="#DFF3FF" />
      <rect x="250" y="112" width="24" height="38" rx="4" fill="#3A3A48" />
      <circle cx="262" cy="230" r="17" fill="#3A3A48" />
      <circle cx="338" cy="230" r="17" fill="#3A3A48" />
      <circle cx="262" cy="230" r="6" fill="#C9CDD6" />
      <circle cx="338" cy="230" r="6" fill="#C9CDD6" />
    </g>
    <g className="msh-puff">
      <circle cx="262" cy="92" r="13" fill="#FFFFFF" />
      <circle cx="244" cy="72" r="10" fill="#FFFFFF" />
    </g>
  </>
);

const Sky = () => (
  <>
    <rect width="400" height="300" fill="#3B2580" />
    {[
      [30, 30],
      [150, 140],
      [260, 30],
      [370, 40],
      [250, 170],
      [40, 170],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#FFF3B0" />
    ))}
    <path d="M0 240 Q120 200 220 232 T400 220 V300 H0 Z" fill="#5A3E9E" />
    <path d="M0 270 Q160 246 280 266 T400 262 V300 H0 Z" fill="#43307F" />
    {/* the moon, who smiles once the stars are home */}
    <g transform="translate(150 196)">
      <circle r="34" fill="#FFF3B0" />
      <circle cx="-11" cy="-6" r="4" fill="#5A3E9E" />
      <circle cx="11" cy="-6" r="4" fill="#5A3E9E" />
      <path
        className="msh-smile"
        d="M-12 8 Q0 20 12 8"
        stroke="#5A3E9E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        className="msh-flat"
        d="M-10 11 H10"
        stroke="#5A3E9E"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>
  </>
);
