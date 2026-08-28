"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { P } from "@shared/components/pirate/palette";

/**
 * THE TREASURE CHEST.
 *
 * One drawing, two states: `closed` and `open` — the lid is its own group
 * and swings on its hinge between them (a real transition when the prop
 * changes, framer's job, nothing looping). Open shows the gold inside.
 *
 * There is deliberately NO built-in "celebrating" particle effect: the
 * portal already owns celebration (shared Confetti + the sparkle canvas),
 * and a screen that wants a celebrating chest mounts those next to an open
 * chest — one particle system in the repo, not two.
 */
export function TreasureChest({
  state = "closed",
  className = "",
}: {
  state?: "closed" | "open";
  className?: string;
}) {
  const uid = useId();
  const bodyId = `${uid}-body`;
  const open = state === "open";

  return (
    <svg
      viewBox="0 0 220 190"
      className={`pp-art ${className}`}
      role="img"
      aria-label={open ? "An open treasure chest full of gold" : "A closed treasure chest"}
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.WOOD_LIGHT} />
          <stop offset="1" stopColor={P.WOOD_DEEP} />
        </linearGradient>
      </defs>

      {/* gold inside — only meaningful when the lid is up */}
      {open && (
        <g>
          <path
            d="M38 96 Q110 66 182 96 L182 110 H38 Z"
            fill={P.GOLD}
            stroke={P.GOLD_LINE}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="84" cy="88" r="9" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="2.5" />
          <circle cx="124" cy="82" r="9" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="2.5" />
          <circle cx="150" cy="90" r="8" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="2.5" />
          <path
            d="M104 78 l7 -10 l7 10 l-7 8 Z"
            fill={P.GEM_TEAL}
            stroke={P.SEA_DEEP}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* lid — swings on the back hinge */}
      <motion.g
        animate={{ rotate: open ? -78 : 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 17 }}
        style={{ originX: "32px", originY: "104px" }}
      >
        <path
          d="M32 104 V84 Q32 40 110 40 Q188 40 188 84 V104 Z"
          fill={`url(#${bodyId})`}
          stroke={P.WOOD_LINE}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* lid bands */}
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
      </motion.g>

      {/* body */}
      <path
        d="M32 104 H188 V158 Q188 172 174 172 H46 Q32 172 32 158 Z"
        fill={`url(#${bodyId})`}
        stroke={P.WOOD_LINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* body bands + plank line */}
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

      {/* lock */}
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

/** The single coin — the unit every pile is built from. */
export function GoldCoin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`pp-art ${className}`} aria-hidden="true">
      <circle cx="30" cy="30" r="26" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="3.5" />
      <circle cx="30" cy="30" r="18" fill="none" stroke={P.GOLD_DEEP} strokeWidth="2.5" />
      <path
        d="M30 20 v20 M24 24 h9 q4 0 4 4 t-4 4 h-9"
        fill="none"
        stroke={P.GOLD_LINE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 16 q6 -5 13 -4"
        fill="none"
        stroke={P.WHITE}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** A tidy little stack of three coins. */
export function CoinStack({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 70" className={`pp-art ${className}`} aria-hidden="true">
      {[44, 30, 16].map((y, i) => (
        <g key={i}>
          <ellipse
            cx="45"
            cy={y + 10}
            rx="32"
            ry="11"
            fill={P.GOLD_DEEP}
            stroke={P.GOLD_LINE}
            strokeWidth="3"
          />
          <ellipse
            cx="45"
            cy={y + 4}
            rx="32"
            ry="11"
            fill={P.GOLD}
            stroke={P.GOLD_LINE}
            strokeWidth="3"
          />
        </g>
      ))}
      <path
        d="M28 12 q8 -5 16 -4"
        fill="none"
        stroke={P.WHITE}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** A loose treasure pile — coins with a gem or two, for scene floors. */
export function CoinPile({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 90" className={`pp-art ${className}`} aria-hidden="true">
      <path
        d="M12 82 Q100 34 188 82 Z"
        fill={P.GOLD}
        stroke={P.GOLD_LINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="66" cy="66" r="12" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="3" />
      <circle cx="116" cy="58" r="12" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="3" />
      <circle cx="152" cy="70" r="10" fill={P.GOLD} stroke={P.GOLD_LINE} strokeWidth="3" />
      <path
        d="M88 56 l9 -12 l9 12 l-9 10 Z"
        fill={P.GEM_RED}
        stroke={P.PARROT_RED_DEEP}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M134 64 l7 -9 l7 9 l-7 8 Z"
        fill={P.GEM_TEAL}
        stroke={P.SEA_DEEP}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
