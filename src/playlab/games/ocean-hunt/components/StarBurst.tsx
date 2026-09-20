"use client";

import { motion } from "framer-motion";

/**
 * The burst of little stars the reference plays when the right letter lands
 * — a LOCAL celebration at the bubble, distinct from the full-screen
 * CelebrationOverlay (which stays for finishing things; this is the spark
 * for one good drop).
 *
 * Star positions are PRECOMPUTED with fixed decimals: trig in render would
 * serialize differently on server and client and is exactly the hydration
 * mismatch the portal has been burned by before.
 */
const STARS: readonly { dx: string; dy: string; s: number; d: number }[] = (() => {
  const out: { dx: string; dy: string; s: number; d: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const dist = 46 + (i % 3) * 22;
    out.push({
      dx: (Math.cos(angle) * dist).toFixed(2),
      dy: (Math.sin(angle) * dist).toFixed(2),
      s: 0.7 + (i % 4) * 0.18,
      d: (i % 5) * 0.03,
    });
  }
  return out;
})();

/** Fills its (non-animated) positioned parent; stars radiate from its centre. */
export function StarBurst() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {STARS.map((star, i) => (
        <motion.span
          key={i}
          /* centred by CSS margins, NOT pl-center-self: Framer overwrites the
             transform on anything it animates — the corner-pile lesson. */
          className="oh-burst-star"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Number(star.dx),
            y: Number(star.dy),
            scale: [0, star.s, star.s * 0.6],
            opacity: [1, 1, 0],
            rotate: i % 2 === 0 ? 120 : -120,
          }}
          transition={{ duration: 0.9, delay: star.d, ease: "easeOut" }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}
