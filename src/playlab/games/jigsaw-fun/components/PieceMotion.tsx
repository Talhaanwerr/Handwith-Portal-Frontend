"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";

/** How long a dropped piece takes to glide into its place. */
export const GLIDE_MS = 200;

/**
 * A piece gliding the last little way into its place (Jigsaw Fun and Tangram
 * Town): centred on its place at stage pixels (x, y), it starts where the
 * finger let go — (dx, dy) away — and eases in over GLIDE_MS. A CSS
 * animation of transform only, so the compositor runs it without the page.
 */
export function GlideIn({
  x,
  y,
  dx,
  dy,
  w,
  h,
  children,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  w: number;
  h: number;
  children: ReactNode;
}) {
  return (
    <span
      className="jf-glide"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        animationDuration: `${GLIDE_MS}ms`,
        ...cssVars({ "--jf-gx": `${dx}px`, "--jf-gy": `${dy}px` }),
      }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export interface HandPath {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * The shared teaching hand for an idle board: `measure` says where the next
 * move starts and ends (stage pixels, the drag engine's own root). Measured
 * once it is on screen and again whenever the window changes size, so the
 * hand always lands on the real piece and the real place.
 */
export function IdleHand({ measure }: { measure: () => HandPath | null }) {
  const [path, setPath] = useState<HandPath | null>(null);
  useEffect(() => {
    const run = () => setPath(measure());
    const frame = requestAnimationFrame(run);
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", run);
    };
  }, [measure]);
  return path ? <TeachingHand {...path} /> : null;
}
