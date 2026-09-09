"use client";

import { motion } from "framer-motion";

/**
 * Light slanting down through water.
 *
 * The ocean's answer to Jungle Spy's sunburst: one conic gradient hung above
 * the top edge so its rays fan DOWN across the celebration, swaying slowly the
 * way light does when the surface moves. It sits behind everything at z-0.
 *
 * Clipped by its own wrapper: the disc is deliberately far wider than the
 * screen, and unclipped it would widen the overlay's scroll area. Shared by
 * the three water games so none of them draws its own light.
 */
export function GodRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.span
        className="pl-godrays"
        initial={{ opacity: 0, rotate: -3 }}
        animate={{ opacity: 1, rotate: [-3, 3, -3] }}
        transition={{
          opacity: { duration: 0.8 },
          rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}
