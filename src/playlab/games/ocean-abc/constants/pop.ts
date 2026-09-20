/**
 * Bubble Pop — the rules of the stage, with no React in sight.
 *
 * Everything here is pure: given a state and a tick, it produces the next
 * state. The component owns the animation frame and the audio; this module
 * owns what a bubble IS and what may happen to it, which is what makes the
 * lifecycle testable and keeps the two concerns from growing into each other.
 *
 * THE WHOLE GAME, in six lines:
 *
 *   1. Bubbles rise from the sea bed. Each carries the letter the child is
 *      hunting (a TARGET) or another letter (a DECOY).
 *   2. Tap a target → it POPS. That is a point.
 *   3. Tap a decoy → it wobbles, says its own name, and leaves. Not a point,
 *      not a penalty, and it never comes back.
 *   4. A target that reaches the surface unpopped opens a PARACHUTE and floats
 *      back down — the second chance. Tapping the parachute pops it: a point,
 *      same as any pop.
 *   5. A decoy that reaches the surface just drifts away. Decoys NEVER
 *      parachute — a parachute is only ever the letter the child wants.
 *   6. A parachute that reaches the sea bed uncaught is gone. Nothing lost;
 *      the spawner keeps another target coming.
 *
 * "5 Times" ends at five pops; "Unlimited" runs until the child says Next.
 */

/**
 * Where a bubble is in its life.
 *
 *   rising       — released at the sea bed, drifting up
 *   parachuting  — a TARGET that reached the surface unpopped, floating back
 *                  down for its second chance
 *   popped       — tapped correctly, rising or parachuting; kept for one beat
 *                  so the burst can play
 *   dismissed    — a decoy the child tapped; says its name and goes
 *   escaped      — a decoy that reached the surface untouched; drifts off
 *   missed       — a parachute that reached the sea bed uncaught; goes
 *
 * The last four are terminal. They are states rather than an immediate
 * removal so the exit animation has something to animate FROM, and so the
 * endings can be told apart without a second flag — only `popped` scores.
 */
export type BubblePhase = "rising" | "parachuting" | "popped" | "dismissed" | "escaped" | "missed";

export interface Bubble {
  id: number;
  /** The glyph as displayed — already cased for the round. */
  glyph: string;
  /** Is this the letter the child is hunting? */
  isTarget: boolean;
  phase: BubblePhase;
  /** 0 at the left edge of the play area, 1 at the right. */
  x: number;
  /** 0 at the sea bed, 1 at the surface. */
  y: number;
  /** Size multiplier applied to the carrier bubble. */
  scale: number;
}

/** The two ways a standalone Bubble Pop round can end. */
export type PopMode = "five" | "unlimited";

/** Correct pops that finish a round in "5 Times". */
export const TARGET_GOAL = 5;

/* ── Pacing ────────────────────────────────────────────────────────────────
   Tuned for four-year-olds: a bubble takes its time crossing the screen, and
   there are never so many at once that the screen has to be scanned rather
   than read. */

/** Screen heights per second while rising — a ~10s trip bottom to top. */
export const RISE_SPEED = 0.1;
/** Parachutes drift down more slowly than bubbles rise — a falling letter is
 *  the harder thing to hit, and the second chance is meant to be catchable.
 *  Not MUCH slower: a parachute holds one of the few live slots for its whole
 *  fall, and at half speed the water filled with parachutes and choked off
 *  new bubbles. */
export const FALL_SPEED = 0.075;
/** Never more than this many on screen at once, whatever the spawn roll.
 *  Five is what a four-year-old can actually scan; the cap is also what paces
 *  the game, since spawning simply stops while the water is full. */
export const MAX_ALIVE = 5;
/** Milliseconds between spawn attempts — the low and high end of the range. */
export const SPAWN_GAP_MS: readonly [number, number] = [1500, 2900];
/** How long a finished bubble stays in the list for its exit beat. */
export const EXIT_MS = 420;

/**
 * How many bubbles a single release contains.
 *
 * Weighted, not uniform: one at a time is the rhythm of the game, two is
 * common enough to keep it from feeling metronomic, and three is an occasional
 * flourish. Expressed as a table because "sometimes 2, occasionally 3" is a
 * design decision that should be readable and adjustable in one place rather
 * than buried in a comparison chain.
 */
export const SPAWN_GROUP_WEIGHTS: readonly { size: number; weight: number }[] = [
  { size: 1, weight: 6 },
  { size: 2, weight: 3 },
  { size: 3, weight: 1 },
];

/**
 * At least one bubble in every group of this many carries the target letter,
 * so a child hunting "S" is never left watching decoys drift by.
 */
export const TARGET_EVERY = 3;

/** Lanes a bubble can be released in. Spread across the width and never at the
 *  very edge, so a wide bubble stays fully on screen at any viewport. */
export const LANES: readonly number[] = [0.12, 0.28, 0.44, 0.6, 0.76, 0.9];

/** Size tiers, cycled so the sea keeps some variety without any lane being
 *  reliably the big one. */
export const SCALES: readonly number[] = [1, 0.82, 0.94, 0.76, 0.88];

/* ── Deterministic randomness ──────────────────────────────────────────────
   The portal's contract is that a letter replays the same way, and no
   Math.random ever runs during render. The spawn pattern still has to feel
   unpredictable, so it is driven by a SEEDED generator: same letter, same
   sequence, but nothing a child could learn to anticipate. */

/** mulberry32 — small, fast, good enough for pacing decisions. */
export function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable seed for a letter, so "S" always deals the same rhythm. The mode
 *  is mixed in so the two modes do not play an identical opening. */
export function seedFor(letter: string, mode: PopMode): number {
  const base = letter.toUpperCase().charCodeAt(0) || 65;
  const modeSalt = mode === "five" ? 0x5f : 0xa1;
  return (Math.imul(base + 1, 2654435761) ^ modeSalt) >>> 0;
}

/** Pick a group size from the weight table. */
export function rollGroupSize(random: () => number): number {
  const total = SPAWN_GROUP_WEIGHTS.reduce((n, g) => n + g.weight, 0);
  const roll = random() * total;
  const picked = SPAWN_GROUP_WEIGHTS.reduce<{ left: number; size: number | null }>(
    (acc, g) =>
      acc.size !== null
        ? acc
        : acc.left - g.weight < 0
          ? { left: 0, size: g.size }
          : { left: acc.left - g.weight, size: null },
    { left: roll, size: null }
  );
  return picked.size ?? 1;
}

/** Milliseconds until the next release. */
export function rollSpawnGap(random: () => number): number {
  const [lo, hi] = SPAWN_GAP_MS;
  return lo + random() * (hi - lo);
}

/**
 * Advance every bubble by `dt` seconds and apply the lifecycle rules.
 *
 * Pure and total: it never mutates its input, and every bubble comes out in
 * exactly one phase. The component calls this from its animation frame, which
 * is the only place time passes.
 */
export function stepBubbles(bubbles: readonly Bubble[], dt: number): Bubble[] {
  return bubbles.map((b) => {
    if (isFinished(b.phase)) return b;
    if (b.phase === "rising") {
      const y = b.y + RISE_SPEED * dt;
      if (y < 1) return { ...b, y };
      // At the surface unpopped. The letter the child is hunting opens a
      // parachute and comes back down — the second chance, nothing lost. A
      // decoy simply escapes: it was never the point, and a decoy parachute
      // would only be one more wrong thing to tap.
      return { ...b, y: 1, phase: b.isTarget ? ("parachuting" as const) : ("escaped" as const) };
    }
    // parachuting — down to the sea bed, and gone if it gets there
    const y = b.y - FALL_SPEED * dt;
    return y <= 0 ? { ...b, y: 0, phase: "missed" as const } : { ...b, y };
  });
}

/**
 * What tapping a bubble does.
 *
 * Returns the outcome rather than performing it, so the caller owns the sound
 * and the score and this stays testable. A tap on a bubble that is already
 * finishing is "ignored", which is what makes rapid tapping safe. Only
 * targets ever parachute, so a parachute tapped is simply a pop — the second
 * chance, taken.
 */
export type TapOutcome = "popped" | "wrong" | "ignored";

export function tapOutcome(bubble: Bubble | undefined): TapOutcome {
  if (!bubble || isFinished(bubble.phase)) return "ignored";
  return bubble.isTarget ? "popped" : "wrong";
}

/** Has this bubble's life ended? One predicate, so the loop, the tap handler
 *  and the retirement pass can never disagree about what counts as over. */
export function isFinished(phase: BubblePhase): boolean {
  return phase === "popped" || phase === "dismissed" || phase === "escaped" || phase === "missed";
}
