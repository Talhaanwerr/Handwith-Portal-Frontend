"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { C } from "@shared/components/construction/palette";

/**
 * MATERIALS, SAFETY AND HAND PROPS — the countable, sortable, matchable
 * stuff of the site (bricks and blocks stack in exact counts for counting
 * games), and the orange layer that says "careful here". Wooden crates and
 * barrels are NOT here: reuse the pirate theme's (wood is wood — README).
 */

/** A stack of bricks in a running bond. `count` rows for counting games. */
export function BrickStack({
  rows = 3,
  className = "",
}: {
  rows?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const h = 22;
  const bricks = [];
  for (let r = 0; r < rows; r++) {
    const y = 96 - (r + 1) * h;
    const off = r % 2 === 0 ? 0 : 22;
    for (let b = 0; b < 3; b++) {
      const x = 10 + off + b * 44;
      if (x + 40 <= 160)
        bricks.push(
          <rect
            key={`${r}-${b}`}
            x={x}
            y={y}
            width="40"
            height={h - 3}
            rx="4"
            fill={C.BRICK}
            stroke={C.BRICK_DEEP}
            strokeWidth="2.5"
          />
        );
    }
  }
  return (
    <svg viewBox="0 0 170 100" className={`pl-art ${className}`} aria-hidden="true">
      {bricks}
    </svg>
  );
}

/** Concrete blocks with their two hollow cores. */
export function BlockStack({
  count = 2,
  className = "",
}: {
  count?: 1 | 2 | 3;
  className?: string;
}) {
  const block = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect
        x={x}
        y={y}
        width="64"
        height="36"
        rx="4"
        fill={C.CONCRETE}
        stroke={C.CONCRETE_DEEP}
        strokeWidth="3"
      />
      <rect x={x + 9} y={y + 8} width="18" height="20" rx="3" fill={C.CONCRETE_DEEP} />
      <rect x={x + 37} y={y + 8} width="18" height="20" rx="3" fill={C.CONCRETE_DEEP} />
    </g>
  );
  return (
    <svg viewBox="0 0 160 100" className={`pl-art ${className}`} aria-hidden="true">
      {count >= 3 && block(46, 12)}
      {count >= 2 && block(14, 54)}
      {block(count >= 2 ? 82 : 48, 54)}
    </svg>
  );
}

/** A pile of stacked timber planks. */
export function PlankStack({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 80" className={`pl-art ${className}`} aria-hidden="true">
      {[56, 40, 24].map((y, i) => (
        <rect
          key={y}
          x={14 + i * 4}
          y={y}
          width={152 - i * 8}
          height="14"
          rx="4"
          fill={i === 1 ? C.WOOD_MID : C.WOOD}
          stroke={C.WOOD_LINE}
          strokeWidth="2.5"
        />
      ))}
      <g stroke={C.WOOD_LINE} strokeWidth="2" opacity="0.5">
        <path d="M40 60 h30 M110 44 h30 M60 28 h30" fill="none" />
      </g>
    </svg>
  );
}

/** Stacked pipes in a pyramid. */
export function PipeStack({ className = "" }: { className?: string }) {
  const pipe = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r="18" fill={C.STEEL} stroke={C.STEEL_LINE} strokeWidth="3" />
      <circle cx={x} cy={y} r="10" fill={C.CHARCOAL} />
    </g>
  );
  return (
    <svg viewBox="0 0 140 90" className={`pl-art ${className}`} aria-hidden="true">
      {pipe(38, 66)}
      {pipe(76, 66)}
      {pipe(114 - 18, 66)}
      {pipe(57, 34)}
      {pipe(76 + 1, 34)}
    </svg>
  );
}

/** Cement bags leaning on each other. */
export function CementBags({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 90" className={`pl-art ${className}`} aria-hidden="true">
      <g>
        <rect
          x="16"
          y="34"
          width="56"
          height="48"
          rx="10"
          fill={C.PAPER}
          stroke={C.SAND_DEEP}
          strokeWidth="3"
          transform="rotate(-6 44 58)"
        />
        <rect
          x="72"
          y="30"
          width="56"
          height="52"
          rx="10"
          fill={C.PAPER}
          stroke={C.SAND_DEEP}
          strokeWidth="3"
          transform="rotate(5 100 56)"
        />
        <path
          d="M28 52 h32"
          stroke={C.CONCRETE_DEEP}
          strokeWidth="7"
          strokeLinecap="round"
          transform="rotate(-6 44 58)"
        />
        <path
          d="M84 50 h32"
          stroke={C.CONCRETE_DEEP}
          strokeWidth="7"
          strokeLinecap="round"
          transform="rotate(5 100 56)"
        />
      </g>
    </svg>
  );
}

export type PileKind = "dirt" | "sand" | "gravel";

/** A material pile — dirt, sand or gravel. */
export function MaterialPile({
  kind = "dirt",
  className = "",
}: {
  kind?: PileKind;
  className?: string;
}) {
  const fill = kind === "sand" ? C.SAND : kind === "gravel" ? C.GRAVEL : C.DIRT;
  const line = kind === "sand" ? C.SAND_DEEP : kind === "gravel" ? C.STEEL_DEEP : C.DIRT_LINE;
  return (
    <svg viewBox="0 0 180 90" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M12 82 Q90 8 168 82 Z"
        fill={fill}
        stroke={line}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {kind === "gravel" ? (
        <g fill={C.STEEL_DEEP} opacity="0.7">
          <circle cx="70" cy="58" r="4" />
          <circle cx="96" cy="46" r="4.5" />
          <circle cx="118" cy="62" r="4" />
          <circle cx="86" cy="70" r="3.5" />
        </g>
      ) : (
        <path d="M56 60 Q90 44 126 60" fill="none" stroke={line} strokeWidth="2.5" opacity="0.5" />
      )}
    </svg>
  );
}

/* ── Safety ── */

/** The traffic cone — reflective band and all. */
export function TrafficCone({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-cone`;
  return (
    <svg viewBox="0 0 90 110" className={`pl-art ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.ORANGE} />
          <stop offset="1" stopColor={C.ORANGE_DEEP} />
        </linearGradient>
      </defs>
      <path
        d="M36 16 Q45 8 54 16 L72 88 H18 Z"
        fill={`url(#${gid})`}
        stroke={C.ORANGE_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M30 46 L60 46 L64 62 L26 62 Z" fill={C.WHITE} opacity="0.92" />
      <rect
        x="8"
        y="86"
        width="74"
        height="14"
        rx="6"
        fill={C.ORANGE_DEEP}
        stroke={C.ORANGE_DEEP}
        strokeWidth="2"
      />
    </svg>
  );
}

/** The striped barricade on two legs. */
export function Barricade({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 110" className={`pl-art ${className}`} aria-hidden="true">
      <rect
        x="16"
        y="26"
        width="168"
        height="30"
        rx="6"
        fill={C.WHITE}
        stroke={C.STEEL_LINE}
        strokeWidth="3"
      />
      <g fill={C.ORANGE}>
        <path d="M28 26 L58 56 L40 56 L16 32 L16 26 Z" />
        <path d="M76 26 L106 56 L88 56 L58 26 Z" />
        <path d="M124 26 L154 56 L136 56 L106 26 Z" />
        <path d="M172 26 L184 38 L184 50 L178 56 L154 26 Z" />
      </g>
      <g stroke={C.STEEL} strokeWidth="7" strokeLinecap="round">
        <path d="M40 56 L28 102 M160 56 L172 102" fill="none" />
        <path d="M52 56 L64 102 M148 56 L136 102" fill="none" />
      </g>
    </svg>
  );
}

export type SignKind = "dig" | "hardhat" | "slow" | "crane";

/** The diamond site sign — pick the symbol. */
export function SiteSign({
  kind = "dig",
  className = "",
}: {
  kind?: SignKind;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 130 170" className={`pl-art ${className}`} aria-hidden="true">
      <rect
        x="59"
        y="86"
        width="12"
        height="76"
        rx="5"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="3"
      />
      <rect
        x="20"
        y="18"
        width="90"
        height="90"
        rx="14"
        transform="rotate(45 65 63)"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="4"
      />
      <g
        stroke={C.HAZARD_INK}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {kind === "dig" && (
          <>
            <path d="M46 74 L64 56 L74 66 L58 82" />
            <path d="M74 66 Q86 60 88 48" />
            <path d="M42 82 Q54 88 62 80" />
          </>
        )}
        {kind === "hardhat" && (
          <>
            <path d="M44 70 Q44 48 65 48 Q86 48 86 70" />
            <path d="M38 72 H92" />
          </>
        )}
        {kind === "slow" && (
          <>
            <path d="M46 64 H76" />
            <path d="M68 52 L82 64 L68 76" />
          </>
        )}
        {kind === "crane" && (
          <>
            <path d="M52 84 V46 H86" />
            <path d="M78 46 V60" />
            <circle cx="78" cy="66" r="5" fill={C.HAZARD_INK} stroke="none" />
          </>
        )}
      </g>
    </svg>
  );
}

/** A sag of warning tape between two posts. */
export function WarningTape({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 90" className={`pl-art ${className}`} aria-hidden="true">
      <g stroke={C.STEEL} strokeWidth="7" strokeLinecap="round">
        <path d="M18 10 V84" fill="none" />
        <path d="M222 10 V84" fill="none" />
      </g>
      <path
        d="M18 26 Q120 58 222 26 L222 40 Q120 72 18 40 Z"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <g fill={C.HAZARD_INK}>
        <path d="M40 31 L58 36 L52 49 L34 44 Z" />
        <path d="M92 40 L110 44 L104 57 L86 53 Z" />
        <path d="M144 44 L162 41 L166 54 L148 57 Z" />
        <path d="M192 34 L208 29 L214 41 L198 47 Z" />
      </g>
    </svg>
  );
}

/** The blinking site light. `blink` opt-in, off by default. */
export function SiteLight({
  blink = false,
  className = "",
}: {
  blink?: boolean;
  className?: string;
}) {
  const lamp = (
    <circle cx="45" cy="26" r="14" fill={C.ORANGE} stroke={C.ORANGE_DEEP} strokeWidth="3" />
  );
  return (
    <svg viewBox="0 0 90 110" className={`pl-art ${className}`} aria-hidden="true">
      {blink ? (
        <motion.g
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {lamp}
        </motion.g>
      ) : (
        lamp
      )}
      <rect
        x="30"
        y="38"
        width="30"
        height="14"
        rx="5"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="3"
      />
      <path
        d="M36 52 L28 100 H62 L54 52 Z"
        fill={C.YELLOW}
        stroke={C.YELLOW_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M33 70 H57 L59 82 H31 Z" fill={C.HAZARD_INK} opacity="0.9" />
    </svg>
  );
}

/* ── Hand props ── */

/** The classic red toolbox. */
export function ToolBox({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 100" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M56 30 q0 -14 19 -14 q19 0 19 14"
        fill="none"
        stroke={C.STEEL_LINE}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect
        x="18"
        y="30"
        width="114"
        height="56"
        rx="10"
        fill={C.BRICK}
        stroke={C.BRICK_DEEP}
        strokeWidth="3.5"
      />
      <path d="M18 52 H132" stroke={C.BRICK_DEEP} strokeWidth="3" />
      <rect
        x="64"
        y="44"
        width="22"
        height="14"
        rx="4"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="2.5"
      />
    </svg>
  );
}

/** A friendly claw hammer. */
export function SiteHammer({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`pl-art ${className}`} aria-hidden="true">
      <g transform="rotate(-34 60 60)">
        <rect
          x="52"
          y="30"
          width="16"
          height="76"
          rx="7"
          fill={C.WOOD}
          stroke={C.WOOD_LINE}
          strokeWidth="3"
        />
        <path
          d="M34 32 h52 q10 0 10 10 v4 h-30 q-6 10 -18 8 q-16 -2 -14 -22 Z"
          fill={C.STEEL}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** A wrench. */
export function SiteWrench({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`pl-art ${className}`} aria-hidden="true">
      <g
        transform="rotate(38 60 60)"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      >
        <path d="M52 34 h16 v56 h-16 Z" />
        <path d="M40 18 q20 -12 40 0 l-8 14 q-12 -6 -24 0 Z" />
        <path d="M40 104 q20 12 40 0 l-8 -14 q-12 6 -24 0 Z" />
      </g>
    </svg>
  );
}

/** A shovel standing in the dirt. */
export function SiteShovel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 160" className={`pl-art ${className}`} aria-hidden="true">
      <path
        d="M32 10 h26 v10 h-8 v14 h-10 V20 h-8 Z"
        fill={C.WOOD}
        stroke={C.WOOD_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect
        x="40"
        y="32"
        width="10"
        height="66"
        rx="5"
        fill={C.WOOD}
        stroke={C.WOOD_LINE}
        strokeWidth="3"
      />
      <path
        d="M30 96 h30 q6 22 -15 36 q-21 -14 -15 -36 Z"
        fill={C.STEEL}
        stroke={C.STEEL_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M20 140 Q45 128 70 140 L70 148 L20 148 Z"
        fill={C.DIRT}
        stroke={C.DIRT_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The wheelbarrow — loadable. */
export function Wheelbarrow({
  loaded = false,
  className = "",
}: {
  loaded?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 180 110" className={`pl-art ${className}`} aria-hidden="true">
      {loaded && (
        <path
          d="M42 40 Q78 16 116 40 L112 48 L46 48 Z"
          fill={C.DIRT}
          stroke={C.DIRT_LINE}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      <path
        d="M34 44 h92 l-12 30 q-2 6 -8 6 h-52 q-6 0 -8 -6 Z"
        fill={C.ORANGE}
        stroke={C.ORANGE_DEEP}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M126 48 L164 40 L166 48 L132 56 Z"
        fill={C.WOOD}
        stroke={C.WOOD_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <g stroke={C.STEEL_LINE} strokeWidth="5" strokeLinecap="round">
        <path d="M56 80 L48 100 M104 80 L112 100" fill="none" />
      </g>
      <circle cx="36" cy="92" r="15" fill={C.TRACK} stroke={C.CHARCOAL} strokeWidth="3" />
      <circle cx="36" cy="92" r="5" fill={C.STEEL} />
    </svg>
  );
}

/** A rolled or open blueprint. */
export function Blueprint({ open = true, className = "" }: { open?: boolean; className?: string }) {
  if (!open)
    return (
      <svg viewBox="0 0 120 60" className={`pl-art ${className}`} aria-hidden="true">
        <rect
          x="12"
          y="18"
          width="96"
          height="26"
          rx="13"
          fill={C.BLUEPRINT}
          stroke={C.STEEL_LINE}
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="31"
          r="9"
          fill={C.BLUEPRINT_LINE}
          stroke={C.STEEL_LINE}
          strokeWidth="2.5"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 170 120" className={`pl-art ${className}`} aria-hidden="true">
      <rect
        x="14"
        y="14"
        width="142"
        height="92"
        rx="8"
        fill={C.BLUEPRINT}
        stroke={C.STEEL_LINE}
        strokeWidth="3.5"
      />
      <g stroke={C.BLUEPRINT_LINE} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.95">
        <path d="M40 82 V52 L66 34 L92 52 V82 Z" />
        <path d="M52 82 V66 h12 v16" />
        <path d="M110 44 h28 M110 58 h28 M110 72 h20" strokeWidth="2.5" opacity="0.8" />
      </g>
    </svg>
  );
}
