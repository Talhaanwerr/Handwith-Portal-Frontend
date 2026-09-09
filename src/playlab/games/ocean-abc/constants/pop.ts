/**
 * Bubble Pop — the rules of the stage, with no React in sight.
 *
 * Everything here is pure: given a state and a tick, it produces the next
 * state. The component owns the animation frame and the audio; this module
 * owns what a bubble IS and what may happen to it, which is what makes the
 * lifecycle testable and keeps the two concerns from growing into each other.
 */

/**
 * Where a bubble is in its life.
 *
 *   rising       — released at the sea bed, drifting up
 *   parachuting  — reached the top unpopped, now floating back down
 *   popped       — tapped correctly; kept for one beat so the burst can play
 *   dismissed    — tapped, but it was the wrong letter; says its name and goes
 *   missed       — parachuted all the way down without being caught
 *
 * The last three are terminal. They are states rather than an immediate
 * removal so the exit animation has something to animate FROM, and so the
 * endings can be told apart without a second flag — `popped` scores, `missed`
 * may still earn another rise, and `dismissed` always leaves.
 */
export type BubblePhase = "rising" | "parachuting" | "popped" | "dismissed" | "missed";

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
  /** How many times this bubble has been rescued from a parachute. */
  rescues: number;
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
/**
 * Parachutes drift down more slowly than bubbles rise — a falling target is
 * the harder thing to hit, and the rescue is meant to be catchable.
 *
 * Not MUCH slower, though. A bubble that is never popped occupies one of the
 * few live slots for its whole rise plus its whole fall; at the first value
 * tried here that came to 29 seconds, long enough for parachutes to fill the
 * screen and choke off new bubbles.
 */
export const FALL_SPEED = 0.075;
/** Never more than this many on screen at once, whatever the spawn roll.
 *  Five is what a four-year-old can actually scan; the cap is also what paces
 *  the game, since spawning simply stops while the water is full. */
export const MAX_ALIVE = 5;
/** Milliseconds between spawn attempts — the low and high end of the range. */
export const SPAWN_GAP_MS: readonly [number, number] = [1500, 2900];
/** A bubble may be rescued this many times before the next miss retires it,
 *  so a child who cannot catch one is not stuck with it forever. */
export const MAX_RESCUES = 2;
/** How long a popped or missed bubble stays in the list for its exit beat. */
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
  let roll = random() * total;
  for (const g of SPAWN_GROUP_WEIGHTS) {
    roll -= g.weight;
    if (roll < 0) return g.size;
  }
  return 1;
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
      // Reached the surface unpopped — turn over and float back down. This is
      // the second chance, not a failure: nothing is lost yet.
      return y >= 1 ? { ...b, y: 1, phase: "parachuting" as const } : { ...b, y };
    }
    if (b.phase === "parachuting") {
      const y = b.y - FALL_SPEED * dt;
      return y <= 0 ? { ...b, y: 0, phase: "missed" as const } : { ...b, y };
    }
    return b;
  });
}

/**
 * What tapping a bubble does.
 *
 * Returns the outcome rather than performing it, so the caller owns the sound
 * and the score and this stays testable. A tap on a bubble that is already
 * finishing is "ignored", which is what makes rapid tapping safe.
 */
export type TapOutcome = "popped" | "rescued" | "wrong" | "ignored";

export function tapOutcome(bubble: Bubble | undefined): TapOutcome {
  if (!bubble || isFinished(bubble.phase)) return "ignored";
  // A parachute is caught first and popped later: catching it is the whole
  // point of the mechanic, so even the target letter rises again rather than
  // popping straight from the parachute.
  if (bubble.phase === "parachuting") return "rescued";
  return bubble.isTarget ? "popped" : "wrong";
}

/** Has this bubble's life ended? One predicate, so the loop, the tap handler
 *  and the retirement pass can never disagree about what counts as over. */
export function isFinished(phase: BubblePhase): boolean {
  return phase === "popped" || phase === "dismissed" || phase === "missed";
}
