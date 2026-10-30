import { memo } from "react";
import type { BrickColor } from "./geometry";

/**
 * A falling brick for the celebrations: two CSS boxes and two stud dots, no
 * SVG. The rain animates twenty of these at once, and the full 3D brick
 * (gradients, studs, outlines) made the star card drop to ~11 fps; at
 * confetti size the cheap one reads the same.
 */
export const ConfettiBrick = memo(function ConfettiBrick({ color }: { color: BrickColor }) {
  return <span className={`bk-cbrick bk-c--${color}`} aria-hidden="true" />;
});

export const CONFETTI_COLORS: readonly BrickColor[] = [
  "red",
  "yellow",
  "blue",
  "green",
  "orange",
  "pink",
];
