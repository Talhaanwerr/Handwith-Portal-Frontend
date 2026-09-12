"use client";

import { motion } from "framer-motion";

/**
 * Light slanting down through water.
 *
 * The ocean's answer to Jungle Spy's sunburst: one conic gradient hung above
 * the top edge so its rays fan DOWN across the celebration. It sits behind
 * everything at z-0 and only FADES IN — it used to sway, but a masked disc
 * wider than the screen re-composited every frame is exactly the kind of
 * thing that made phones stutter through a celebration, and the sway was
 * barely visible under everything else that moves.
 *
 * Clipped by its own wrapper: the disc is deliberately wider than the
 * screen, and unclipped it would widen the overlay's scroll area. Shared by
 * the three water games so none of them draws its own light.
 */
export function GodRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.span
        className="pl-godrays"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      />
    </div>
  );
}
