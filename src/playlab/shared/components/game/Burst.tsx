"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { unit } from "@shared/utils/hash";

/** Pieces a burst can throw. */
const MAX = 48;

/** Golden-ratio stepping spreads ANY count evenly around the arc — no table
 *  of positions per count, and no two consecutive pieces side by side. */
const GOLDEN = 0.6180339887;

/** A whole circle, in degrees: 0 is right, 90 is down, -90 is up. */
const FULL_CIRCLE: readonly [number, number] = [0, 360];
const DEFAULT_REACH: readonly [number, number] = [22, 46];

interface Shot {
  /** Where it flies to, in vmin from the centre. */
  dx: number;
  dy: number;
  /** Where it lands, in vmin below the centre — fountain mode only. */
  fall: number;
  scale: number;
  spin: number;
  delay: number;
  dur: number;
}

function aim(
  count: number,
  arc: readonly [number, number],
  reach: readonly [number, number]
): Shot[] {
  return Array.from({ length: count }, (_, i) => {
    const frac = (i * GOLDEN + unit(i) * 0.08) % 1;
    const angle = ((arc[0] + frac * (arc[1] - arc[0])) * Math.PI) / 180;
    const dist = reach[0] + unit(i * 3) * (reach[1] - reach[0]);
    return {
      dx: Number((Math.cos(angle) * dist).toFixed(2)),
      dy: Number((Math.sin(angle) * dist).toFixed(2)),
      fall: Number((36 + unit(i * 5) * 34).toFixed(2)),
      scale: Number((0.6 + unit(i * 7) * 0.8).toFixed(3)),
      spin: Number((unit(i * 11) * 720 - 360).toFixed(1)),
      delay: Number((unit(i * 13) * 0.12).toFixed(3)),
      dur: Number((1.0 + unit(i * 17) * 0.5).toFixed(3)),
    };
  });
}

interface BurstProps {
  /** What flies out. Cycled, so three drawings make a burst of forty. */
  pieces: readonly ReactNode[];
  count?: number;
  /** Seconds before the burst. */
  delay?: number;
  /** The slice of the circle pieces fly into, in degrees (0 right, -90 up).
   *  Whole circle by default; [-160, -20] is a fountain going up. Pass a
   *  constant — this is a memo key. */
  arc?: readonly [number, number];
  /** How far they fly, in vmin. Pass a constant — a memo key. */
  reach?: readonly [number, number];
  /** Fountain: pieces rise along their angle and then fall back past where
   *  they started, the way soup would. */
  gravity?: boolean;
  /** The box each piece is drawn in. */
  size?: string;
}

/**
 * A radial burst — pieces of the caller's choosing flung out from the centre
 * of a positioned parent.
 *
 * ONE COMPONENT, EVERY EXPLOSION. Letter Hunt's BOOM throws letter-shaped
 * shards; Magnet Match's soup fountains carrots and the letters that went in;
 * a snap onto a magnet throws sparks. The motion is here, precomputed and
 * deterministic; only the drawing is the game's.
 *
 * NO ANIMATION LOOP — one Framer transition per piece, unmount to clean up.
 * The wrapper does not clip (pieces are meant to fly well past the parent),
 * so mount it inside something that does.
 */
export function Burst({
  pieces,
  count = 24,
  delay = 0,
  arc = FULL_CIRCLE,
  reach = DEFAULT_REACH,
  gravity = false,
  size = "clamp(18px, 4vmin, 36px)",
}: BurstProps) {
  const shots = useMemo(() => aim(Math.min(count, MAX), arc, reach), [count, arc, reach]);
  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {shots.map((s, i) => {
        const start = delay + s.delay;
        return (
          <motion.span
            key={i}
            className="pl-burst-piece"
            style={cssVars({ "--pl-size": size })}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={
              gravity
                ? {
                    // up along the angle, then down past the start — a fountain
                    x: [0, `${s.dx}vmin`, `${(s.dx * 1.5).toFixed(2)}vmin`],
                    y: [0, `${s.dy}vmin`, `${s.fall}vmin`],
                    scale: [0, s.scale, s.scale],
                    opacity: [1, 1, 0],
                    rotate: s.spin,
                  }
                : {
                    x: `${s.dx}vmin`,
                    y: `${s.dy}vmin`,
                    scale: [0, s.scale, s.scale * 0.6],
                    opacity: [1, 1, 0],
                    rotate: s.spin,
                  }
            }
            transition={
              gravity
                ? {
                    delay: start,
                    duration: s.dur * 1.4,
                    times: [0, 0.42, 1],
                    ease: ["easeOut", "easeIn"],
                    opacity: { delay: start, duration: s.dur * 1.4, times: [0, 0.85, 1] },
                    rotate: { delay: start, duration: s.dur * 1.4, ease: "linear" },
                  }
                : {
                    delay: start,
                    duration: s.dur,
                    ease: "easeOut",
                    opacity: { delay: start, duration: s.dur, times: [0, 0.7, 1] },
                  }
            }
          >
            {pieces[i % pieces.length]}
          </motion.span>
        );
      })}
    </div>
  );
}
