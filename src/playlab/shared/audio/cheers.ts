/**
 * The portal's praise, in one place.
 *
 * FIVE short cheers rotate across the alphabet. The pick is DETERMINISTIC
 * per letter — finishing "E" always earns the same word, which keeps praise
 * as predictable as everything else here — while neighbouring letters get
 * different words, so a run through the alphabet never sounds like a stuck
 * record.
 *
 * Five, not nine: the pool used to carry four clips that added no praise a
 * child could hear apart. "Fantastic!" sat in the same slot as "Amazing!" and
 * "Wonderful!"; "You're doing great!" repeated "Great job!"; "Yoo hoo!" is an
 * attention-call, not praise; and "Excellent!" pointed at an mp3 that was
 * never recorded, so three letters in every game using this rotation fell
 * silent. What is left alternates on purpose — praise for the WORK
 * ("Great job!", "Well done!"), a plain exclamation ("Amazing!",
 * "Wonderful!"), and praise for the CHILD ("You did it!").
 *
 * This list is the ONLY cheer rotation in the portal. Screens used to keep
 * private copies that drifted apart; import `cheerFor` instead of writing a
 * new array — a cheer that is not in the manifest plays as silence.
 *
 * Every id exists in the audio manifest, so the shown word ALWAYS comes from
 * `clipText(id)` and can never drift from what the voice says — the
 * manifest-as-single-source rule.
 */
export const CHEER_IDS = [
  "cheer-great-job",
  "cheer-amazing",
  "cheer-well-done",
  "cheer-wonderful",
  "cheer-you-did-it",
] as const;

export type CheerId = (typeof CHEER_IDS)[number];

/** The cheer for a letter (or any stable seed). Same seed, same cheer. */
export function cheerFor(seed: string | number): CheerId {
  const n = typeof seed === "number" ? seed : Math.max(0, seed.toUpperCase().charCodeAt(0) - 65);
  return CHEER_IDS[n % CHEER_IDS.length];
}
