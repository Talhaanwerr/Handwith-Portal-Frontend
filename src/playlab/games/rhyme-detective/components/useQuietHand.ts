"use client";

import { useEffect, useState, type RefObject } from "react";
import { centreIn } from "@games/number-groups/components/NgKit";
import type { HandPath } from "@games/shadow-match/components/useHandAt";

/**
 * Where the idle teaching hand taps, measured against the stage when it
 * appears (and on resize). Shadow Match's `useHandAt` without its "Watch
 * carefully!": these games' hands are SILENT, so the hand can never cut the
 * round's spoken words off. `target` must be stable (useCallback).
 */
export function useQuietHand(
  idle: boolean,
  stageRef: RefObject<HTMLDivElement | null>,
  target: () => Element | null | undefined
): HandPath | null {
  const [hand, setHand] = useState<HandPath | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => {
      const el = target();
      if (!el) return;
      const p = centreIn(stageRef.current, el);
      setHand({ fx: p.x, fy: p.y, tx: p.x, ty: p.y });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, stageRef, target]);
  return idle ? hand : null;
}
