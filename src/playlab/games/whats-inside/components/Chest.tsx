"use client";

import { memo, useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { P } from "@shared/components/pirate/palette";

/**
 * A TREASURE CHEST THAT HOLDS A TOY — the Pirate theme's `TreasureChest`
 * (same 220 × 190 drawing, same palette, same hinge), taken apart into its
 * layers so something can sit INSIDE it: the shared chest is one picture
 * with gold always in it when open, so a toy could neither peek out from
 * under its lid nor be missing from it.
 *
 * Back to front: the lid (it swings up and back on its hinge, so a toy
 * standing in the chest is in front of it), the dark inside, the toy — in a
 * box that hides everything below the rim — and the front of the chest.
 * `rise` is how much of the toy shows above the rim (0 = all inside).
 */

/** The rim, as a share of the chest's height (y = 104 of 190). */
export const RIM = 104 / 190;

const LID_SPRING = { type: "spring" as const, stiffness: 120, damping: 15 };
const RISE_SPRING = { type: "spring" as const, stiffness: 150, damping: 15 };

export const Chest = memo(function Chest({
  lid,
  toy,
  rise,
  inside,
}: {
  /** The lid's angle on its hinge, degrees: 0 shut, about −80 wide open. */
  lid: number;
  /** The toy in the chest, if any (a picture filling its box). */
  toy: ReactNode;
  /** How much of the toy shows above the rim. */
  rise: number;
  /** The dark inside shows (the lid is up). */
  inside: boolean;
}) {
  return (
    <span className="wsi-chest">
      <motion.span
        className="wsi-chest-lid"
        initial={false}
        animate={{ rotate: lid }}
        transition={LID_SPRING}
      >
        <LidArt />
      </motion.span>
      <span className={`wsi-chest-inside ${inside ? "is-open" : ""}`}>
        <InsideArt />
      </span>
      <span className="wsi-chest-mouth">
        {toy && (
          <motion.span
            className="wsi-toy"
            initial={false}
            animate={{ y: `${(1 - rise) * 100}%` }}
            transition={RISE_SPRING}
          >
            {toy}
          </motion.span>
        )}
      </span>
      <span className="wsi-chest-body">
        <BodyArt />
      </span>
    </span>
  );
});

function LidArt() {
  const uid = useId().replace(/:/g, "");
  const wood = `${uid}-lid`;
  return (
    <svg viewBox="0 0 220 190" className="wsi-art" aria-hidden="true">
      <defs>
        <linearGradient id={wood} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.WOOD_LIGHT} />
          <stop offset="1" stopColor={P.WOOD_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M32 104 V84 Q32 40 110 40 Q188 40 188 84 V104 Z"
        fill={`url(#${wood})`}
        stroke={P.WOOD_LINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect
        x="70"
        y="42"
        width="14"
        height="62"
        rx="4"
        fill={P.WOOD_GOLD}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      <rect
        x="136"
        y="42"
        width="14"
        height="62"
        rx="4"
        fill={P.WOOD_GOLD}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      <path d="M32 100 H188" stroke={P.WOOD_LINE} strokeWidth="3" opacity="0.5" />
      <path
        d="M50 58 Q80 46 110 46"
        fill="none"
        stroke={P.WHITE}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.28"
      />
    </svg>
  );
}

/** The inside of the chest, seen over the front rim when the lid is up. */
function InsideArt() {
  return (
    <svg viewBox="0 0 220 190" className="wsi-art" aria-hidden="true">
      <path d="M36 106 Q36 80 110 78 Q184 80 184 106 Z" fill={P.WOOD_LINE} />
      <path d="M44 106 Q46 88 110 86 Q174 88 176 106 Z" fill="#3B2312" />
    </svg>
  );
}

function BodyArt() {
  const uid = useId().replace(/:/g, "");
  const wood = `${uid}-body`;
  return (
    <svg viewBox="0 0 220 190" className="wsi-art" aria-hidden="true">
      <defs>
        <linearGradient id={wood} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.WOOD_LIGHT} />
          <stop offset="1" stopColor={P.WOOD_DEEP} />
        </linearGradient>
      </defs>
      {/* the soft shadow on the sand, and the chest's solid dark edge */}
      <ellipse cx="110" cy="178" rx="92" ry="9" fill="#5A3A1A" opacity="0.25" />
      <path d="M32 110 H188 V164 Q188 178 174 178 H46 Q32 178 32 164 Z" fill={P.WOOD_LINE} />
      <path
        d="M32 104 H188 V158 Q188 172 174 172 H46 Q32 172 32 158 Z"
        fill={`url(#${wood})`}
        stroke={P.WOOD_LINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect
        x="70"
        y="104"
        width="14"
        height="68"
        rx="4"
        fill={P.WOOD_GOLD}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      <rect
        x="136"
        y="104"
        width="14"
        height="68"
        rx="4"
        fill={P.WOOD_GOLD}
        stroke={P.WOOD_LINE}
        strokeWidth="2.5"
      />
      <path d="M36 140 H184" stroke={P.WOOD_LINE} strokeWidth="2.5" opacity="0.4" />
      <rect
        x="98"
        y="102"
        width="24"
        height="26"
        rx="6"
        fill={P.GOLD}
        stroke={P.GOLD_LINE}
        strokeWidth="3"
      />
      <circle cx="110" cy="112" r="3.5" fill={P.GOLD_LINE} />
      <rect x="108" y="112" width="4" height="8" rx="2" fill={P.GOLD_LINE} />
    </svg>
  );
}

/** A tiny sparkle burst behind a toy that just popped out (decoration). */
export function Sparkles() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="-50 -50 100 100" className="wsi-art" aria-hidden="true">
      {rays.map((a, i) => (
        <path
          key={a}
          d={i % 2 ? "M0 -30 L3 -40 L0 -48 L-3 -40 Z" : "M0 -26 L4 -38 L0 -50 L-4 -38 Z"}
          fill={i % 2 ? "#FFF3B0" : P.GOLD}
          transform={`rotate(${a})`}
        />
      ))}
    </svg>
  );
}
