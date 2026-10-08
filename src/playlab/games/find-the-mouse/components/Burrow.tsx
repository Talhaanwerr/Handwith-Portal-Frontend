"use client";

import { memo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { Burst } from "@shared/components/game/Burst";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { MouseFoot, MouseHead, MouseTail } from "@games/find-the-mouse/components/SceneArt";
import { BURROWS } from "@games/find-the-mouse/constants/scene";
import { shake } from "@games/find-the-mouse/utils/shake";

/** Where a mouse's head is: down inside the hole, just its ears and eyes over
 *  the rim (the "ears" clue), poking out of it (clipped by the round opening,
 *  like a cartoon mouse-hole), or popped right out. */
export type HeadState = "in" | "peek" | "out" | "popped";

const HEAD = {
  in: { y: "118%", scale: 1 },
  peek: { y: "44%", scale: 1 },
  out: { y: "6%", scale: 1 },
  popped: { y: "-50%", scale: 1.14 },
} as const;
const SLIDE = { type: "spring", stiffness: 240, damping: 22 } as const;
const POP = { type: "spring", stiffness: 330, damping: 13 } as const;

const BURST_COLORS = ["#FFD93D", "#3DAB72", "#54A0FF", "#FF7EA8", "#FFFFFF"] as const;
const BURST_PIECES = BURST_COLORS.map((c, i) => (
  <span key={i} className="ftm-burst-piece" style={cssVars({ "--pl-color": c })} />
));

interface BurrowProps {
  index: number;
  /** Draw a mouse in this hole at all. */
  hasMouse: boolean;
  head: HeadState;
  /** Soft pulsing ring — "you can tap me now". */
  hint?: boolean;
  /** Tapped wrongly: crossed out for good. */
  wrong?: boolean;
  /** The number this mouse was counted as, if any. */
  badge?: number | null;
  /** The mouse is hiding in here with its tail or a foot left out as a clue
   *  (the "ears" clue is a head state instead). */
  clue?: "tail" | "foot" | null;
  /** Idle bob while out (count mode, where mice wait to be counted). */
  bob?: boolean;
  /** Null = not tappable right now. */
  onTap: ((index: number) => void) | null;
  ariaLabel: string;
}

/**
 * ONE MOUSE-HOLE in the cheese's front face.
 *
 * Layers, back to front: the dark opening; a round MASK holding the mouse's
 * head (so a head that is "out" shows only inside the hole, the way a mouse
 * peeks from a mouse-hole); a rim shade that darkens the head's top as if it
 * were still in the hole's shadow; then the hint ring, the cross, the badge.
 * On "popped" the mask opens and the head jumps clear with a burst.
 *
 * Memoised, and placed with left/top + negative margins (never a centring
 * transform) so the wrong-answer shake can own `transform`.
 */
export const Burrow = memo(function Burrow({
  index,
  hasMouse,
  head,
  hint = false,
  wrong = false,
  badge = null,
  clue = null,
  bob = false,
  onTap,
  ariaLabel,
}: BurrowProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const spot = BURROWS[index];

  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);

  return (
    <button
      ref={ref}
      type="button"
      className={`ftm-burrow ${head === "popped" ? "ftm-burrow--open" : ""} ${
        wrong ? "ftm-burrow--wrong" : ""
      } ${onTap ? "ftm-burrow--live" : ""} ${clue ? "ftm-burrow--clue" : ""}`}
      style={cssVars({
        "--x-l": `${spot.land.x}%`,
        "--y-l": `${spot.land.y}%`,
        "--x-p": `${spot.port.x}%`,
        "--y-p": `${spot.port.y}%`,
        "--s": spot.s,
        "--delay": `${index * 0.15}s`,
      })}
      disabled={!onTap}
      onClick={onTap ? () => onTap(index) : undefined}
      aria-label={ariaLabel}
    >
      <span className="ftm-burrow-hole" aria-hidden="true" />

      <span className="ftm-burrow-mask" aria-hidden="true">
        {clue && <span className="ftm-rump" />}
        {hasMouse && (
          <motion.span
            className="ftm-head"
            initial={HEAD.in}
            animate={HEAD[head]}
            transition={head === "popped" ? POP : SLIDE}
          >
            <span
              className={
                head === "peek"
                  ? "ftm-head-peek"
                  : bob && head === "out"
                    ? "ftm-head-bob"
                    : "ftm-head-still"
              }
            >
              <MouseHead />
            </span>
          </motion.span>
        )}
      </span>
      <span className="ftm-burrow-shade" aria-hidden="true" />

      {clue && (
        <motion.span
          className={clue === "tail" ? "ftm-tail" : "ftm-foot"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
          aria-hidden="true"
        >
          {clue === "tail" ? <MouseTail /> : <MouseFoot />}
        </motion.span>
      )}

      {hint && <span className="ftm-burrow-ring" aria-hidden="true" />}

      {head === "popped" && hasMouse && (
        <span className="ftm-burst-anchor" aria-hidden="true">
          <Burst pieces={BURST_PIECES} count={18} size="clamp(8px, 2.6cqh, 18px)" />
        </span>
      )}

      {wrong && (
        <span className="ftm-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}

      {badge != null && (
        <motion.span
          className="ftm-badge-num font-rounded font-black"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 15 }}
          aria-hidden="true"
        >
          {badge}
        </motion.span>
      )}
    </button>
  );
});
