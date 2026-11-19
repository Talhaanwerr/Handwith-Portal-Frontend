"use client";

import { useEffect, useState, type RefObject } from "react";
import { playClip } from "@shared/audio/voice";
import { centreIn } from "@games/number-groups/components/NgKit";
import type { HandPath } from "@games/shadow-match/components/useHandAt";

/**
 * Shadow Match's `useHandAt` with one change: the hand can come SILENTLY.
 * On round one the guided shell brings the hand after 1.8 s, while the round
 * is still saying its words — a "Watch carefully!" then would cut them off.
 * So round one's hand only shows; later rounds' (after 7 s idle) also speak.
 * Shared by Rhyme Rocket and Silly Sandwich. `from` and `to` must be stable.
 */
export function useQuietHand(
  idle: boolean,
  voiced: boolean,
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
    if (voiced) void playClip("instr-watch-carefully");
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, voiced, stageRef, from, to]);
  return idle ? hand : null;
}
