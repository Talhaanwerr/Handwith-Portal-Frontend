"use client";

import { useEffect, useState } from "react";
import { sayAfter } from "@shared/audio/voice";
import type { CarryPoint } from "@games/shape-match/hooks/useCarry";

/**
 * THE GHOST HAND THAT SHOWS A CHILD HOW A BOARD IS PLAYED.
 *
 * All four boards of this game teach themselves the same way: wait out the
 * spoken banner, then a hand picks the right thing up and carries it where it
 * belongs, on a loop, until the child touches anything. Each board used to
 * carry its own copy of that — the same state, the same timer, the same
 * "watch carefully", four times over, drifting apart one constant at a time.
 * The only thing that really differs is WHICH thing the hand should carry and
 * WHERE, so that is all a board passes in.
 *
 * WHY THE HAND REMEMBERS A TOUCH COUNT. The board reads `at` back against the
 * live count (`hand.at === touches`), so the first thing a child touches
 * dismisses the demonstration without this hook having to know anything about
 * the board's drag engine.
 */

/** After the banner has been read out, never over it. */
export const HAND_AFTER_MS = 3000;

/** "Watch carefully!" — the portal's own line, said as the hand appears. */
const WATCH_CLIP = "instr-watch-carefully";

export interface DemoHand {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  /** How many things had been touched when the hand set off. */
  at: number;
}

interface DemoOptions {
  /** Show the child how it is played, unasked. */
  teach: boolean;
  /** The board's live touch count, and the reader for it. */
  touches: number;
  touchCount: () => number;
  /**
   * Where the hand should travel, measured at the moment it sets off. Return
   * null when there is nothing to demonstrate; a board that has not been laid
   * out yet answers (0, 0) and is left alone until it has been.
   *
   * Must be memoised: it is this hook's dependency, so an unstable one keeps
   * restarting the timer and the hand never arrives.
   */
  route: () => { from: CarryPoint; to: CarryPoint } | null;
  /** How long to wait first, when this board's banner is longer than most. */
  afterMs?: number;
}

export function useDemoHand({
  teach,
  touches,
  touchCount,
  route,
  afterMs = HAND_AFTER_MS,
}: DemoOptions): DemoHand | null {
  const [hand, setHand] = useState<DemoHand | null>(null);

  useEffect(() => {
    if (!teach || touches > 0) return;
    const timer = setTimeout(() => {
      const path = route();
      if (!path) return;
      if (path.from.x === 0 && path.from.y === 0) return;
      setHand({ fx: path.from.x, fy: path.from.y, tx: path.to.x, ty: path.to.y, at: touchCount() });
      void sayAfter(WATCH_CLIP);
    }, afterMs);
    return () => clearTimeout(timer);
  }, [teach, touches, touchCount, route, afterMs]);

  return hand;
}
