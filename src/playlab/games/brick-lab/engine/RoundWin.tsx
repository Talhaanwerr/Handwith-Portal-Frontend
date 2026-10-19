"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { unit } from "@shared/utils/hash";
import { CONFETTI_COLORS, ConfettiBrick } from "./ConfettiBrick";

/**
 * Little bricks raining down, moved by TRANSFORM only (one CSS animation per
 * brick). The puzzle games' shared cast rain animates `top`, which made the
 * browser recalculate styles every frame — 0.8 s of style work in a 2 s brick
 * celebration (measured); this one costs almost nothing. Positions come from
 * the portal's fixed hash, never Math.random.
 */
export const BrickRain = memo(function BrickRain({ count = 14 }: { count?: number }) {
  return (
    <div className="bk-rain" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="bk-rain-drop"
          style={cssVars({
            "--bk-rx": `${(4 + unit(i * 5) * 92).toFixed(1)}%`,
            "--bk-rd": `${(0.15 + unit(i * 7) * 0.9).toFixed(2)}s`,
            "--bk-rt": `${(1.5 + unit(i * 11) * 1.1).toFixed(2)}s`,
            "--bk-rr": `${Math.round(unit(i * 13) * 540 - 270)}deg`,
            "--bk-rs": (0.7 + unit(i * 17) * 0.6).toFixed(2),
          })}
        >
          <ConfettiBrick color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />
        </span>
      ))}
    </div>
  );
});

const CHIP_COLORS = ["#FFD93D", "#FF7EA8", "#54A0FF", "#3DAB72", "#F08A24", "#B35FD9"];

/**
 * Paper confetti the same way: CSS keyframes on transform and opacity, no
 * per-frame JavaScript. (The shared Framer confetti writes each piece's
 * transform every frame, which still cost ~0.5 s of style work per win.)
 */
export const ChipRain = memo(function ChipRain({ count = 30 }: { count?: number }) {
  return (
    <div className="bk-rain" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`bk-chip ${i % 3 === 0 ? "bk-chip--tall" : ""}`}
          style={cssVars({
            "--bk-rx": `${(unit(i * 3 + 1) * 100).toFixed(1)}%`,
            "--bk-rd": `${(unit(i * 7 + 2) * 0.7).toFixed(2)}s`,
            "--bk-rt": `${(1.6 + unit(i * 11 + 3) * 1.2).toFixed(2)}s`,
            "--bk-rr": `${Math.round(unit(i * 13 + 4) * 900 - 450)}deg`,
            "--bk-rs": "1",
            "--bk-chip": CHIP_COLORS[i % CHIP_COLORS.length],
          })}
        />
      ))}
    </div>
  );
});

/** A finished round on a brick board: a star stamps down in the corner,
 *  confetti falls and little bricks rain through it. */
export const RoundWin = memo(function RoundWin({ label }: { label: string }) {
  return (
    <div className="bk-win" role="status" aria-label={label}>
      <ChipRain count={30} />
      <BrickRain count={12} />
      <span className="bk-stamp-at">
        <motion.span
          className="jf-stamp"
          initial={{ scale: 2.4, opacity: 0, rotate: -24 }}
          animate={{ scale: 1, opacity: 1, rotate: -8 }}
          transition={{ type: "spring", stiffness: 260, damping: 13, delay: 0.15 }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 1.5l2.9 6.8 7.4.6-5.6 4.9 1.7 7.2L12 17.1l-6.4 3.9 1.7-7.2-5.6-4.9 7.4-.6L12 1.5z"
              fill="#FFD93D"
              stroke="#F4A73E"
              strokeWidth="1"
            />
          </svg>
        </motion.span>
      </span>
    </div>
  );
});
