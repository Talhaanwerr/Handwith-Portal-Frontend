"use client";

import { motion } from "framer-motion";
import { FloatingClouds } from "@shared/components/animations/FloatingClouds";
import { cssVars } from "@shared/styles/cssVars";
import { unit } from "@shared/utils/hash";

/**
 * THE PLACE THE WHOLE GAME HAPPENS: blue sky, soft clouds, two green hills
 * and a bright meadow across the bottom.
 *
 * It is mounted ONCE, behind every screen, so the sky never restarts and the
 * clouds never jump when one activity replaces another — the child simply
 * looks up and it is the same afternoon. The portal's own drifting clouds do
 * the sky; only the ground is this game's.
 *
 * Tuft positions come from the shared fixed hash rather than Math.random, so
 * the meadow is identical on the server, on the client and on every replay.
 */

/** Grass along the top edge of the meadow: where each tuft stands, how big
 *  it is and how fast it sways. Worked out once, at module load. */
const TUFTS = Array.from({ length: 14 }, (_, i) => ({
  x: Number((2 + (i * 96) / 14 + unit(i * 5) * 4).toFixed(2)),
  size: Number((3.4 + unit(i * 7) * 2.6).toFixed(2)),
  sway: Number((3.2 + unit(i * 11) * 2.4).toFixed(2)),
  delay: Number((unit(i * 13) * 1.6).toFixed(2)),
  tall: i % 3 === 0,
}));

function Blades() {
  return (
    <svg viewBox="0 0 40 30" className="sm-art">
      <path
        d="M20 30C18 22 14 17 8 13c6 1 10 5 12 10ZM20 30c2-9 6-14 12-18-6 1-10 6-12 12ZM20 30c0-8 1-14 3-20-4 5-5 12-5 20Z"
        fill="#3FA83A"
      />
    </svg>
  );
}

export function Meadow() {
  return (
    <div className="sm-meadow" aria-hidden="true">
      <span className="sm-sun" />
      <FloatingClouds />

      <span className="sm-hill sm-hill--far" />
      <span className="sm-hill sm-hill--near" />
      <span className="sm-ground" />

      {TUFTS.map((tuft, i) => (
        <motion.span
          key={i}
          className="sm-tuft"
          data-tall={tuft.tall ? "yes" : undefined}
          style={cssVars({ "--sm-x": tuft.x + "%", "--sm-w": tuft.size + "%" })}
          animate={{ rotate: [-4, 4, -4] }}
          transition={{
            duration: tuft.sway,
            delay: tuft.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Blades />
        </motion.span>
      ))}
    </div>
  );
}
