"use client";

import { useEffect, useState } from "react";

/** How long a child may sit without touching before the teaching hand shows
 *  them the next move. One number for every drag game in PlayLab. */
export const IDLE_HAND_MS = 7000;

/**
 * The idle teaching hand's clock, shared by every drag game.
 *
 * Returns true once the child has not touched the screen for `ms` while
 * `armed` (the board is waiting for a move — not mid-drag, not celebrating).
 * Any touch anywhere hides the hand again and restarts the clock, and so does
 * a change of `resetKey` (pass the round or the number of pieces placed, so
 * the clock starts over after every move). The game decides WHAT the hand
 * demonstrates — usually the next unplaced piece to its target — and mounts
 * the shared `TeachingHand` while this is true:
 *
 *   const idle = useIdleHand(phase === "play" && !dragging, placed.size);
 *   {idle && next && <TeachingHand fx={…} fy={…} tx={…} ty={…} />}
 */
export function useIdleHand(armed: boolean, resetKey?: unknown, ms: number = IDLE_HAND_MS) {
  const [touches, setTouches] = useState(0);
  // Which wait the timer last fired for. A touch or a new resetKey starts a
  // new wait, so a hand fired for an older one simply stops matching — no
  // state has to be cleared by hand.
  const wait = `${String(resetKey)}#${touches}`;
  const [firedFor, setFiredFor] = useState<string | null>(null);

  useEffect(() => {
    const onTouch = () => setTouches((n) => n + 1);
    window.addEventListener("pointerdown", onTouch, true);
    return () => window.removeEventListener("pointerdown", onTouch, true);
  }, []);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setFiredFor(wait), ms);
    return () => clearTimeout(t);
  }, [armed, wait, ms]);

  return armed && firedFor === wait;
}
