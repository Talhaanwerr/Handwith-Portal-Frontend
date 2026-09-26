"use client";

import { motion } from "framer-motion";

/** Geometry of the ring, in the SVG's own units. */
const SIZE = 120;
const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The score, as a ring that fills to the fraction answered correctly.
 *
 * The number in the middle is the answer a grown-up reads; the ring is the
 * answer a child reads. Drawn with `stroke-dasharray` rather than an arc path
 * so the fill can animate from empty without recomputing any geometry.
 */
export function ScoreDonut({ score, total }: { score: number; total: number }) {
  const fraction = total > 0 ? score / total : 0;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="wq-donut"
      role="img"
      aria-label={`You scored ${score} out of ${total}`}
    >
      <circle className="wq-donut-track" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} />
      <motion.circle
        className="wq-donut-fill"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - fraction) }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      />
      <text className="wq-donut-score font-rounded" x="50%" y="50%" textAnchor="middle" dy="0.34em">
        {score}/{total}
      </text>
    </svg>
  );
}
