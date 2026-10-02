"use client";

import { memo, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Confetti } from "@shared/components/game/Confetti";
import { CelebrationMotif } from "@shared/components/game/CelebrationMotif";
import { GodRays } from "@shared/components/game/GodRays";
import { cssVars } from "@shared/styles/cssVars";
import { playCelebrationSound } from "@shared/audio/sfx";
import { playClip, sayAfter, stopVoice } from "@shared/audio/voice";
import { unit } from "@shared/utils/hash";

/**
 * The puzzle games' celebrations — Jigsaw Fun and Tangram Town, and Sort Two
 * Ways, On & Off, Count & Match and Number Hunt borrow them.
 *   • PieceBurst — the instant a piece clicks in, confetti flies out of it.
 *   • RoundCheer — a finished puzzle: a star stamps down on it, confetti falls
 *     and the game's own cast (the picture's animal, the tangram pieces) rains
 *     among sparkles.
 *   • FinaleRain — behind a star card: light pours down, confetti, the cast.
 *
 * Each is built to cost little on the frame it starts, because that frame is
 * the one the child is watching: a burst is plain CSS keyframes (no
 * JavaScript per bit, no layout read), and the shared Framer-driven rain
 * (`CelebrationMotif`) joins a beat after the confetti instead of on the same
 * frame, with fewer pieces than before.
 */

const CONFETTI_COLORS = ["#FFD93D", "#FF7EA8", "#54A0FF", "#3DAB72", "#F08A24", "#B35FD9"];

/** Golden-ratio steps spread the bits evenly round the circle. */
const GOLDEN = 0.6180339887;

/**
 * A burst's bits, worked out once at load: where each flies (vmin from the
 * piece, the reach of the portal's shared `Burst`), how it spins, its size,
 * and when. The shared `Burst` animates each bit with Framer, which measures
 * every bit's keyframes on the drop frame (its vmin targets need a DOM read
 * per bit); one CSS animation per bit starts with no work at all.
 */
const BITS: readonly CSSProperties[] = Array.from({ length: 18 }, (_, i) => {
  const angle = ((i * GOLDEN + unit(i) * 0.08) % 1) * Math.PI * 2;
  const reach = 22 + unit(i * 3) * 24;
  return cssVars({
    "--pl-color": CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    "--jf-dx": `${(Math.cos(angle) * reach).toFixed(2)}vmin`,
    "--jf-dy": `${(Math.sin(angle) * reach).toFixed(2)}vmin`,
    "--jf-spin": `${(unit(i * 11) * 720 - 360).toFixed(0)}deg`,
    "--jf-scale": (0.6 + unit(i * 7) * 0.8).toFixed(2),
    "--jf-delay": `${(unit(i * 13) * 0.06).toFixed(2)}s`,
    "--jf-dur": `${(0.62 + unit(i * 17) * 0.2).toFixed(2)}s`,
  });
});

/** How long to keep a PieceBurst mounted: every bit has landed by then. */
export const BURST_MS = 900;

/** Confetti out of a piece that just clicked in, at stage pixels (x, y).
 *  Mount it for BURST_MS, then unmount it. */
export const PieceBurst = memo(function PieceBurst({ x, y }: { x: number; y: number }) {
  return (
    <span className="jf-burst" style={{ left: x, top: y }} aria-hidden="true">
      <span className="jf-burst-ring" />
      {BITS.map((style, i) => (
        <span key={i} className={`jf-bit ${i % 2 ? "jf-bit--long" : ""}`} style={style} />
      ))}
    </span>
  );
});

/** True once `ms` have passed since mount — for a layer that should join a
 *  celebration a beat late rather than on its first, busiest frame. */
function useAfter(ms: number): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return on;
}

/** The cast raining among sparkles, joining `after` ms into a celebration. */
function CastRain({
  cast,
  after,
  count,
}: {
  cast: readonly ReactNode[];
  after: number;
  count: number;
}) {
  const on = useAfter(after);
  return on ? (
    <CelebrationMotif motif="sparkle" count={count} extras={cast} extraEvery={2} extraScale={2.4} />
  ) : null;
}

/** Where a finished puzzle's star sticks, as a share of the puzzle's box —
 *  its top-right corner, never over what the child made. */
export const STAMP_AT = { x: 0.95, y: 0.06 } as const;

/** A finished puzzle: a star stamps down on its corner, confetti falls over
 *  the whole stage, and `cast` rains among sparkles. */
export const RoundCheer = memo(function RoundCheer({
  cast,
  stampX,
  stampY,
  label,
}: {
  cast: readonly ReactNode[];
  /** Where the stamp lands (stage pixels) — a corner of the finished puzzle. */
  stampX: number;
  stampY: number;
  label: string;
}) {
  return (
    <div className="jf-cheer" role="status" aria-label={label}>
      <Confetti count={30} />
      <CastRain cast={cast} after={280} count={16} />
      <span className="jf-stamp-at" style={{ left: stampX, top: stampY }}>
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

/** Behind a puzzle game's star card: light pours down, confetti falls, and
 *  once the card has landed the cast rains among sparkles. */
export function FinaleRain({ cast }: { cast: readonly ReactNode[] }) {
  return (
    <>
      <GodRays />
      <Confetti count={36} />
      <CastRain cast={cast} after={450} count={20} />
    </>
  );
}

/**
 * A star card's voice: a beat after it opens the cheer `clipId` is spoken,
 * then the celebration sound plays and `thenId` (when given) is said after
 * it; leaving the card stops the voice.
 */
export function useFinaleCheer(clipId: string, thenId?: string): void {
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      void playClip(clipId).then(() => {
        if (cancelled) return;
        playCelebrationSound();
        if (thenId) void sayAfter(thenId);
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
      stopVoice();
    };
  }, [clipId, thenId]);
}
