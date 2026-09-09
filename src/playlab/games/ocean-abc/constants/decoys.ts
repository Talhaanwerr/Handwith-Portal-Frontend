/**
 * Which letters stand in as distractors, and which never should.
 *
 * Lifted out of PopStage when that component was split into rules, loop and
 * view: this is data about the alphabet, not about bubbles, and the spawner
 * needs it without needing the component.
 */

/**
 * Letters that look near-identical to each other at a glance, especially in
 * lowercase. A decoy from this set turns "find your letter" into "tell two
 * identical vertical strokes apart", which is not the skill this stage is
 * teaching and is not a fair ask of a pre-reader.
 */
const CONFUSABLE: Record<string, readonly string[]> = {
  I: ["L", "J", "T"],
  L: ["I", "J"],
  J: ["I", "L"],
  O: ["Q", "C", "G", "D"],
  Q: ["O", "G"],
  C: ["O", "G"],
  G: ["C", "Q", "O"],
  D: ["O", "B", "P"],
  B: ["D", "P", "R"],
  P: ["B", "R", "Q"],
  R: ["B", "P"],
  M: ["N", "W"],
  N: ["M", "U"],
  W: ["M", "V"],
  V: ["W", "U", "Y"],
  U: ["V", "N"],
  E: ["F"],
  F: ["E"],
  S: ["Z"],
  Z: ["S"],
};

/** How many distinct decoy letters a round draws from. */
const DECOY_COUNT = 5;

/** Offsets from the target, spread around the alphabet so the crowd is
 *  familiar-but-different rather than the letter's immediate neighbours. */
const DECOY_OFFSETS = [3, 7, 11, 17, 22] as const;

const ALPHABET_SIZE = 26;
const CODE_A = 65;

/**
 * The letters the decoy bubbles wear — deterministic neighbours of the target
 * (never the target itself), so every letter meets a familiar-but-different
 * crowd and no randomness ever touches render.
 *
 * The fixed offsets alone were not enough: offset 3 from `i` lands on `l`, so
 * that round showed two indistinguishable strokes side by side. The walk skips
 * anything confusable with the target (and anything already taken) and keeps
 * stepping — still fully deterministic, still the same crowd every visit, just
 * never an unfair one.
 */
export function decoysFor(letter: string): string[] {
  const upper = letter.toUpperCase();
  const base = upper.charCodeAt(0) - CODE_A;
  const banned = new Set([upper, ...(CONFUSABLE[upper] ?? [])]);
  const out: string[] = [];

  for (const offset of DECOY_OFFSETS) {
    // Step forward from the intended offset until the letter is both allowed
    // and unused. A full lap always terminates.
    for (let step = 0; step < ALPHABET_SIZE; step++) {
      const candidate = String.fromCharCode(CODE_A + ((base + offset + step) % ALPHABET_SIZE));
      if (!banned.has(candidate) && !out.includes(candidate)) {
        out.push(candidate);
        break;
      }
    }
  }
  return out.slice(0, DECOY_COUNT);
}
