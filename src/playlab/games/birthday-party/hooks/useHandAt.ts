"use client";

import { useEffect, useRef, useState } from "react";
import { useIdleHand } from "@shared/hooks/useIdleHand";

/** Where the teaching hand presses and where it lets go, in stage pixels.
 *  The same point twice is a tap. */
export interface HandPath {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * The idle teaching hand of every board in Birthday Party and Rocket
 * Countdown: after 7 s without a touch (`useIdleHand`) while `armed`, the
 * next move is measured — in an animation frame, never during render — and
 * returned for `TeachingHand`, then measured again whenever the screen
 * changes size. `resetKey` is the board's state (the count, the phase): a
 * change starts the wait over, and a path measured for an older state is
 * never shown. Mount the hand with `key={String(resetKey)}`.
 */
export function useHandAt(
  armed: boolean,
  resetKey: string | number,
  measure: () => HandPath | null
): HandPath | null {
  const idle = useIdleHand(armed, resetKey);
  const [hand, setHand] = useState<{ path: HandPath; key: string } | null>(null);
  const measureRef = useRef(measure);
  useEffect(() => {
    measureRef.current = measure;
  });

  useEffect(() => {
    if (!idle) return;
    const key = String(resetKey);
    const run = () => {
      const path = measureRef.current();
      setHand(path ? { path, key } : null);
    };
    const raf = requestAnimationFrame(run);
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", run);
    };
  }, [idle, resetKey]);

  return idle && hand && hand.key === String(resetKey) ? hand.path : null;
}
