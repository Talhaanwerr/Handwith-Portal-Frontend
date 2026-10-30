/** What an idle callback is told about the time it has left. */
export interface IdleBudget {
  timeRemaining: () => number;
}

/**
 * Runs `step` in the browser's next idle moment, for background work that
 * must not land on an animation frame (building sounds, composing music).
 *
 * Safari has no `requestIdleCallback`; there it falls back to a short timeout
 * with a REAL ~8 ms budget measured from the clock, so a caller that loops
 * "while time remains" still yields instead of running everything at once.
 */
export function whenIdle(step: (budget: IdleBudget) => void, timeout = 2000): void {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(step, { timeout });
    return;
  }
  window.setTimeout(() => {
    const end = performance.now() + 8;
    step({ timeRemaining: () => Math.max(0, end - performance.now()) });
  }, 40);
}
