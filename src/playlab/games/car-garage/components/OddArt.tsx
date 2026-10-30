"use client";

import { memo } from "react";
import { Picture } from "@games/blend-read/components/PictureArt";
import { C } from "@shared/components/construction/palette";
import type { OddThing } from "@games/car-garage/constants/rounds";

/**
 * The things in Missing Part's tray that could NEVER go on a car. Most are
 * the portal's Twemoji pictures (a hat, a shoe, a crown, a flag, a bone);
 * the three a child might half-believe are car parts are drawn here, in the
 * car's own chunky style, so they are plainly wrong: a SQUARE wheel, a
 * steam train's chimney and a boat's sail. Each fills a square box.
 */
export const OddArt = memo(function OddArt({ thing }: { thing: OddThing }) {
  if (thing === "square-wheel")
    return (
      <svg viewBox="0 0 100 100" className="bcg-odd-svg" aria-hidden="true">
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="10"
          fill="#2F3640"
          stroke="#1E232A"
          strokeWidth="5"
        />
        <rect
          x="22"
          y="22"
          width="56"
          height="56"
          rx="6"
          fill="none"
          stroke="#454E5A"
          strokeWidth="4"
        />
        <rect
          x="33"
          y="33"
          width="34"
          height="34"
          rx="4"
          fill="#D3DAE2"
          stroke="#8C99A6"
          strokeWidth="4"
        />
        <rect x="45" y="45" width="10" height="10" rx="2" fill="#8C99A6" />
      </svg>
    );
  if (thing === "chimney")
    return (
      <svg viewBox="0 0 100 100" className="bcg-odd-svg" aria-hidden="true">
        <ellipse cx="50" cy="16" rx="16" ry="9" fill="#E9EEF2" opacity="0.9" />
        <ellipse cx="38" cy="10" rx="10" ry="6" fill="#FFFFFF" opacity="0.85" />
        <path
          d="M28 26 H72 L64 46 H36 Z"
          fill={C.CHARCOAL}
          stroke="#22262B"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect
          x="36"
          y="44"
          width="28"
          height="42"
          rx="3"
          fill={C.CHARCOAL}
          stroke="#22262B"
          strokeWidth="4"
        />
        <rect x="36" y="52" width="28" height="8" fill="#E5484D" />
        <rect
          x="26"
          y="84"
          width="48"
          height="10"
          rx="3"
          fill={C.STEEL_DEEP}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
        />
      </svg>
    );
  if (thing === "sail")
    return (
      <svg viewBox="0 0 100 100" className="bcg-odd-svg" aria-hidden="true">
        <rect
          x="46"
          y="6"
          width="7"
          height="82"
          rx="3"
          fill={C.WOOD_MID}
          stroke={C.WOOD_LINE}
          strokeWidth="2.5"
        />
        <path
          d="M55 10 L90 78 H55 Z"
          fill="#FFFFFF"
          stroke="#B9C4CF"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M55 46 L72 46 L78 58 H55 Z" fill="#E5484D" />
        <path
          d="M44 18 L16 74 H44 Z"
          fill="#F4F7FA"
          stroke="#B9C4CF"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 86 H86 L78 96 H22 Z"
          fill={C.WOOD}
          stroke={C.WOOD_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <span className="bcg-odd-pic">
      <Picture id={thing} />
    </span>
  );
});

/** What a screen reader hears for each odd thing. */
export const ODD_NAME: Record<OddThing, string> = {
  "square-wheel": "a square wheel",
  chimney: "a train chimney",
  sail: "a boat sail",
  hat: "a hat",
  shoe: "a shoe",
  crown: "a crown",
  flag: "a flag",
  bone: "a bone",
};
