"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { unit } from "@shared/utils/hash";

/**
 * The thing a world throws in the air when something goes right.
 *
 *   leaf   — jungle: leaves spinning down through the canopy
 *   bubble — water: a column of bubbles rising to the surface
 *   steam  — kitchen: puffs lifting off the soup
 *   sparkle— candy and space: soft twinkles drifting up
 */
export type Motif = "leaf" | "bubble" | "steam" | "sparkle";

interface CelebrationMotifProps {
  motif: Motif;
  /** How many pieces. Keep it modest — this plays OVER a celebration that
   *  already has confetti or sparkles of its own. */
  count?: number;
  /**
   * Extra things to throw among the motif pieces — a world's own cast.
   *
   * Jungle Spy rains its ANIMALS along with the leaves, which is far more
   * its own than generic confetti was. The motion stays here (one precomputed
   * set of paths, no loop); only the drawing is the caller's, so a game can
   * personalise a celebration without owning an animation.
   *
   * Every `extraEvery`th piece is drawn from this list instead of the motif,
   * so the cast is a garnish and the motif still carries the screen.
   */
  extras?: readonly ReactNode[];
  extraEvery?: number;
  /** Extras are usually bigger than a leaf — scales them up as a group. */
  extraScale?: number;
}

/** Pieces available. Generous: a celebration wants a SHOWER, and a caller
 *  that only needs a sprinkle just asks for fewer. */
const MAX = 64;

/**
 * Columns the fall is divided into.
 *
 * Dispersion is STRATIFIED, not random: each piece is assigned to a column and
 * jittered inside it, so the screen is covered evenly by construction. Pure
 * hashing — what this used to do — clusters, because nothing stops six
 * consecutive values landing in the same third of the width; the result was a
 * thin, patchy fall with bald patches down one side.
 */
const COLUMNS = 11;

/**
 * PRECOMPUTED at module load from the shared fixed hash — no Math.random at
 * render, fixed decimals — so the server and client can never disagree (the
 * portal's hydration rule), and the same celebration always looks the same.
 */
interface Piece {
  x: string;
  delay: number;
  dur: number;
  drift: number;
  spin: number;
  scale: number;
}

const PIECES: Piece[] = Array.from({ length: MAX }, (_, i) => {
  // Walk the columns in a stride co-prime with COLUMNS, so consecutive pieces
  // land far apart across the width instead of marching left to right — the
  // fall reads as scattered even though the coverage is even.
  const column = (i * 4) % COLUMNS;
  const jitter = unit(i * 3);
  const bandWidth = 100 / COLUMNS;

  return {
    x: `${(column * bandWidth + 0.12 * bandWidth + jitter * 0.76 * bandWidth).toFixed(2)}%`,
    // Delays are spread evenly across the window and then jittered, so the
    // shower is CONTINUOUS. Bunching every piece into the first second left
    // the screen empty for the rest of the celebration.
    delay: Number((((i % 22) / 22) * 1.5 + unit(i * 3 + 1) * 0.28).toFixed(3)),
    dur: Number((2.3 + unit(i * 3 + 2) * 1.7).toFixed(3)),
    drift: Number((unit(i * 5) * 64 - 32).toFixed(2)),
    spin: Number((unit(i * 7) * 300 - 150).toFixed(2)),
    scale: Number((0.62 + unit(i * 11) * 0.72).toFixed(3)),
  };
});

/**
 * A themed particle layer for a celebration — leaves, bubbles or steam
 * instead of the same confetti everywhere.
 *
 * ONE COMPONENT, FOUR WORLDS. Each game passes its own motif rather than
 * growing its own particle code, so a jungle win rains leaves and an ocean win
 * sends up bubbles without either game owning an animation.
 *
 * NO ANIMATION LOOP. Every piece is a single declarative Framer transition, so
 * the browser runs the whole thing on the compositor and there is nothing to
 * schedule, poll or tear down beyond unmounting the element. Mount it inside a
 * positioned parent when the moment arrives.
 */
export function CelebrationMotif({
  motif,
  count = 12,
  extras,
  extraEvery = 3,
  extraScale = 2.1,
}: CelebrationMotifProps) {
  const rises = motif === "bubble" || motif === "steam" || motif === "sparkle";
  const cast = extras ?? [];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PIECES.slice(0, Math.min(count, MAX)).map((p, i) => {
        // Every extraEvery'th piece is one of the game's own, so the cast is
        // sprinkled through the fall rather than clumped at the start.
        const extra =
          cast.length && i % extraEvery === extraEvery - 1
            ? cast[Math.floor(i / extraEvery) % cast.length]
            : null;
        const scale = extra ? p.scale * extraScale : p.scale;

        return (
          <motion.span
            key={i}
            className={`pl-cm ${extra ? "pl-cm--extra" : `pl-cm--${motif}`} pl-at`}
            style={cssVars({ "--pl-x": p.x, "--pl-scale": `${scale}` })}
            initial={{ top: rises ? "104%" : "-8%", x: 0, rotate: 0, opacity: 0 }}
            animate={{
              top: rises ? "-8%" : "104%",
              x: [0, p.drift, -p.drift * 0.5, p.drift * 0.25],
              // Animals tumble gently; a leaf spins freely.
              rotate: extra ? p.spin * 0.25 : motif === "leaf" ? p.spin : 0,
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: p.dur, delay: p.delay, ease: "easeInOut" }}
          >
            {extra ?? <Shape motif={motif} />}
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * The portal's celebration palette — the six colours the confetti already
 * uses, so a letter shower matches the pieces falling beside it. Exported for
 * the bursts that throw letters too (Letter Hunt's BOOM).
 */
export const CELEBRATION_COLORS = [
  "var(--color-gold)",
  "var(--color-blush)",
  "var(--color-plum-light)",
  "var(--color-jade-light)",
  "var(--color-ocean-light)",
  "var(--color-coral)",
] as const;

/**
 * The letter being celebrated, ready to fall among the motif.
 *
 * EVERY game's celebration rains its own letter. It is the one thing the child
 * has just earned, so a shower of it is not decoration — it is the lesson,
 * repeated, in the portal's celebration colours. Games pass the result as
 * `extras`, usually alongside a cast of their own.
 *
 * Memoised on the glyph, so a round builds these once rather than on every
 * frame of an already-animating screen.
 */
export function useLetterFall(glyph: string, count = 5): readonly ReactNode[] {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (
        <span
          key={`fall-${i}`}
          className="pl-cm-letter font-rounded font-black"
          style={cssVars({ "--pl-color": CELEBRATION_COLORS[i % CELEBRATION_COLORS.length] })}
        >
          {glyph}
        </span>
      )),
    [glyph, count]
  );
}

/** The drawing for one piece. Flat and simple — these are read at a glance,
 *  in motion, behind a heading. */
function Shape({ motif }: { motif: Motif }) {
  if (motif === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <path d="M12 1 C21 7 22 17 12 23 C2 17 3 7 12 1 Z" className="pl-cm-fill" />
        <path d="M12 4 L12 21" className="pl-cm-line" fill="none" strokeWidth="1.4" />
      </svg>
    );
  }
  if (motif === "bubble") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <circle cx="12" cy="12" r="10" className="pl-cm-fill" />
        <circle cx="8.5" cy="8.5" r="3" className="pl-cm-shine" />
      </svg>
    );
  }
  if (motif === "steam") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <ellipse cx="12" cy="12" rx="11" ry="8" className="pl-cm-fill" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <path
        d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z"
        className="pl-cm-fill"
      />
    </svg>
  );
}
