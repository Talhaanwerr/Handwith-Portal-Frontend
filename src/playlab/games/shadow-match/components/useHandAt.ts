"use client";

import { useEffect, useState, type RefObject } from "react";
import { playClip } from "@shared/audio/voice";
import { centreIn } from "@games/number-groups/components/NgKit";

export interface HandPath {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * Where the idle teaching hand goes, measured against the stage when it
 * appears (and on resize): from `from` to `to` — the same element twice for a
 * tap. `from` and `to` must be stable (useCallback).
 */
export function useHandAt(
  idle: boolean,
  stageRef: RefObject<HTMLDivElement | null>,
  from: () => Element | null | undefined,
  to: () => Element | null | undefined
): HandPath | null {
  const [hand, setHand] = useState<HandPath | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => {
      const a = from();
      const b = to();
      if (!a || !b) return;
      const p = centreIn(stageRef.current, a);
      const q = centreIn(stageRef.current, b);
      setHand({ fx: p.x, fy: p.y, tx: q.x, ty: q.y });
    };
    void playClip("instr-watch-carefully");
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, stageRef, from, to]);
  return idle ? hand : null;
}
