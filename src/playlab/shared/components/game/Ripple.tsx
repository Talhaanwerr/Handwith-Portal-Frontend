"use client";

import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";

interface RippleProps {
  /** Seconds before the first ring. */
  delay?: number;
  /** How many rings, one after another. */
  count?: number;
  /** Seconds between rings. */
  gap?: number;
  /** Rings draw IN toward the centre instead of out — a field pulling. */
  inward?: boolean;
  /** Ring diameter before Framer scales it. */
  size?: string;
}

/**
 * Rings spreading from the centre of a positioned parent — a splash where the
 * letter lands, the shockwave of a BOOM, or (inward) a magnet's pull.
 *
 * Centred by margin so Framer keeps the transform for the spread. The colour
 * is `--pl-ring`, set by whoever owns the moment, so the same rings are white
 * water in the ocean and the pearl's own glow around the pearl.
 */
export function Ripple({ delay = 0, count = 2, gap = 0.18, inward = false, size }: RippleProps) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className="pl-ripple"
          style={size ? cssVars({ "--pl-size": size }) : undefined}
          initial={{ scale: inward ? 2.4 : 0.2, opacity: 0 }}
          animate={{ scale: inward ? 0.2 : 2.4, opacity: [0, 0.9, 0] }}
          transition={{ delay: delay + i * gap, duration: 0.9, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
