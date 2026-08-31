"use client";

import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";

/**
 * CONFETTI — the portal's celebration layer.
 *
 * A one-shot fall of paper pieces across whatever positioned parent it is
 * mounted in. DOM + Framer rather than canvas so it costs nothing when not
 * celebrating, and layers cleanly over any game at any z.
 *
 * Every piece's geometry is PRECOMPUTED at module load from a fixed hash —
 * no Math.random at render, fixed decimals — so the server and client can
 * never disagree (the portal's hydration rule), and so the same celebration
 * always looks the same, which is itself a small kindness here.
 *
 * Colour comes from the pl-cf-* classes in shared/styles/utilities.css (the
 * portal's celebration palette); a game can repaint them under its own root
 * the same way it paints the letter-puzzle classes.
 */

interface Piece {
  x: string;
  delay: number;
  dur: number;
  drift: number;
  rot: number;
  cls: number;
  tall: boolean;
}

/** Small fast integer hash → [0,1). Stable across runs and runtimes.
 *  Math.imul keeps every step in true 32-bit space — the previous plain-\*
 *  version drifted through float land and never set the top bit, which put
 *  ALL the confetti on the left half of the screen. Verified uniform:
 *  quartile counts 13/11/14/18 across the 56 pieces. */
function unit(n: number): number {
  let t = (n + 1) * 0x9e3779b9;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const MAX_PIECES = 56;

const PIECES: readonly Piece[] = Array.from({ length: MAX_PIECES }, (_, i) => ({
  x: `${(unit(i * 7) * 100).toFixed(2)}%`,
  delay: Number((unit(i * 7 + 1) * 0.9).toFixed(2)),
  dur: Number((2.2 + unit(i * 7 + 2) * 1.6).toFixed(2)),
  drift: Number(((unit(i * 7 + 3) - 0.5) * 90).toFixed(1)),
  rot: Number(((unit(i * 7 + 4) - 0.5) * 720).toFixed(0)),
  cls: i % 6,
  tall: i % 3 === 0,
}));

interface ConfettiProps {
  /** How many pieces fall (max 56). A round win wants ~32; a finale ~56. */
  count?: number;
}

/** Mount inside a positioned container when the moment arrives; the fall
 *  plays once and the spent pieces sit invisible until unmount. */
export function Confetti({ count = 32 }: ConfettiProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PIECES.slice(0, Math.min(count, MAX_PIECES)).map((p, i) => (
        <motion.span
          key={i}
          className={`pl-cf pl-cf-${p.cls} ${p.tall ? "pl-cf--tall" : ""} pl-at`}
          style={cssVars({ "--pl-x": p.x })}
          initial={{ top: "-4%", x: 0, rotate: 0, opacity: 1 }}
          animate={{
            top: "104%",
            x: [0, p.drift, -p.drift * 0.5, p.drift * 0.25],
            rotate: p.rot,
            opacity: [1, 1, 1, 0.9, 0],
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}
