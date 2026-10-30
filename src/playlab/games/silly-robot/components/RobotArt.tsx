"use client";

import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { DotFace } from "@games/pond-numbers/components/PondArt";
import { DOT_CARD, DOT_SCREEN, type PartId } from "@games/silly-robot/constants/rounds";

/**
 * THE SILLY ROBOT — a missing prop, drawn here. Candy ABC's robot
 * (`VOCAB_ART.robot`) is one flat picture with a tiny chest panel, so it can
 * neither lose a part nor show five dots; this one is built in its colours
 * from separate parts (head, two arms, two legs) around a big tummy screen.
 *
 * Robot units: the viewBox is 100 × 124. `BOX` is each removable part's
 * bounding box — the outlined gap when it is missing, the drag target, and
 * the viewBox a spare part is drawn in.
 */

const C = {
  body: "#6FC3F0",
  bodyDeep: "#3D8FC9",
  metal: "#B8C4D0",
  metalDeep: "#8494A6",
  eye: "#2BB585",
  red: "#E5484D",
  ink: "#2B3A4A",
  screen: "#1E3550",
} as const;

export const BOX: Record<PartId, { x: number; y: number; w: number; h: number }> = {
  head: { x: 27, y: 0, w: 46, h: 40 },
  "arm-l": { x: 6, y: 44, w: 18, h: 38 },
  "arm-r": { x: 76, y: 44, w: 18, h: 38 },
  "leg-r": { x: 51, y: 85, w: 23, h: 35 },
};

/** The tummy screen, in robot units (the dots are laid over it in HTML). */
const SCREEN = { x: 32, y: 47, w: 36, h: 34 };

function Arm({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="46" width="14" height="30" rx="7" fill={C.metal} />
      <rect x={x + 3} y="49" width="3" height="20" rx="1.5" fill="#FFFFFF" opacity="0.5" />
      <circle cx={x + 7} cy="77" r="5" fill={C.metalDeep} />
    </g>
  );
}

function Leg({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="86" width="14" height="24" rx="5" fill={C.metal} />
      <rect x={x - 3} y="106" width="21" height="12" rx="5" fill={C.metalDeep} />
    </g>
  );
}

/** One removable part, in robot units. */
export function PartShape({ id }: { id: PartId }) {
  if (id === "arm-l") return <Arm x={8} />;
  if (id === "arm-r") return <Arm x={78} />;
  if (id === "leg-r") return <Leg x={55} />;
  return (
    <g>
      <rect x="48" y="5" width="4" height="8" fill={C.metalDeep} />
      <circle cx="50" cy="5" r="4.5" fill={C.red} />
      <rect x="29" y="11" width="42" height="27" rx="9" fill={C.metal} />
      <rect x="33" y="14" width="12" height="4" rx="2" fill="#FFFFFF" opacity="0.55" />
      <circle cx="41" cy="23" r="4.8" fill="#FFFFFF" />
      <circle cx="59" cy="23" r="4.8" fill="#FFFFFF" />
      <circle cx="41.6" cy="23.6" r="2.8" fill={C.eye} />
      <circle cx="59.6" cy="23.6" r="2.8" fill={C.eye} />
      <path
        d="M42 30.5 Q50 36 58 30.5"
        fill="none"
        stroke={C.ink}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  );
}

/** The outlined place a part is missing from. */
function Gap({ id }: { id: PartId }) {
  const b = BOX[id];
  return (
    <rect
      className="srb-gap-line"
      x={b.x + 1}
      y={b.y + 1}
      width={b.w - 2}
      height={b.h - 2}
      rx="6"
      fill="rgba(255,255,255,0.45)"
      stroke="#F2C94C"
      strokeWidth="2.2"
      strokeDasharray="4 3"
    />
  );
}

/**
 * The robot. `missing` is the part that has fallen off (its place outlined
 * and registered as the drop target through `gapRef`); `belly` is drawn over
 * the tummy screen; `happy` sets off the wiggle.
 */
export const Robot = memo(function Robot({
  missing = null,
  belly,
  happy = false,
  gapRef,
  className = "",
}: {
  missing?: PartId | null;
  belly: ReactNode;
  happy?: boolean;
  gapRef?: (el: HTMLElement | null) => void;
  className?: string;
}) {
  const gap = missing ? BOX[missing] : null;
  return (
    <motion.div
      className={`srb-robot ${className}`}
      animate={happy ? { rotate: [0, -7, 7, -5, 5, 0], y: [0, -8, 0, -6, 0, 0] } : { rotate: 0 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 100 124" className="srb-robot-svg" aria-hidden="true">
        <ellipse cx="50" cy="119" rx="34" ry="4.5" fill="rgba(60,40,20,0.22)" />
        <Leg x={31} />
        {missing !== "leg-r" && <PartShape id="leg-r" />}
        {missing !== "arm-l" && <PartShape id="arm-l" />}
        {missing !== "arm-r" && <PartShape id="arm-r" />}
        <rect x="44" y="35" width="12" height="7" fill={C.metalDeep} />
        <rect x="22" y="40" width="56" height="48" rx="11" fill={C.body} />
        <rect x="22" y="74" width="56" height="14" rx="7" fill={C.bodyDeep} opacity="0.45" />
        <rect
          x={SCREEN.x - 2}
          y={SCREEN.y - 2}
          width={SCREEN.w + 4}
          height={SCREEN.h + 4}
          rx="7"
          fill={C.bodyDeep}
        />
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="6" fill={C.screen} />
        {missing !== "head" && <PartShape id="head" />}
        {missing && <Gap id={missing} />}
      </svg>
      <span
        className="srb-belly"
        style={cssVars({
          "--srb-x": `${SCREEN.x}%`,
          "--srb-y": `${(SCREEN.y / 124) * 100}%`,
          "--srb-w": `${SCREEN.w}%`,
          "--srb-h": `${(SCREEN.h / 124) * 100}%`,
        })}
      >
        {belly}
      </span>
      {gap && (
        <span
          ref={gapRef}
          className="srb-gap"
          style={cssVars({
            "--srb-x": `${gap.x}%`,
            "--srb-y": `${(gap.y / 124) * 100}%`,
            "--srb-w": `${gap.w}%`,
            "--srb-h": `${(gap.h / 124) * 100}%`,
          })}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
});

/** A spare part lying on the ground: the part, and the dot card it holds. */
export const SparePart = memo(function SparePart({ id, count }: { id: PartId; count: number }) {
  const b = BOX[id];
  return (
    <span className="srb-spare-art">
      <svg viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`} className="srb-spare-part" aria-hidden="true">
        <PartShape id={id} />
      </svg>
      <span className="srb-spare-card">
        <DotFace count={count} color={DOT_CARD} />
      </span>
    </span>
  );
});

/** The tummy's dots, glowing on the screen. */
export function ScreenDots({ count }: { count: number }) {
  return (
    <span className="srb-screen-dots">
      <DotFace count={count} color={DOT_SCREEN} />
    </span>
  );
}
