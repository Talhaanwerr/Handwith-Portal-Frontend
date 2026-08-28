/**
 * The portal's praise, in one place.
 *
 * Nine short cheers rotate across the alphabet. The pick is DETERMINISTIC
 * per letter — finishing "E" always earns the same word, which keeps praise
 * as predictable as everything else here — while neighbouring letters get
 * different words, so a run through the alphabet never sounds like a stuck
 * record.
 *
 * Every id exists in the audio manifest, so the shown word ALWAYS comes from
 * `clipText(id)` and can never drift from what the voice says — the
 * manifest-as-single-source rule.
 */
export const CHEER_IDS = [
  "cheer-great-job",
  "cheer-excellent",
  "cheer-well-done",
  "cheer-fantastic",
  "cheer-amazing",
  "cheer-wonderful",
  "cheer-you-did-it",
  "cheer-youre-doing-great",
  "cheer-yoo-hoo",
] as const;

export type CheerId = (typeof CHEER_IDS)[number];

/** The cheer for a letter (or any stable seed). Same seed, same cheer. */
export function cheerFor(seed: string | number): CheerId {
  const n = typeof seed === "number" ? seed : Math.max(0, seed.toUpperCase().charCodeAt(0) - 65);
  return CHEER_IDS[n % CHEER_IDS.length];
}
