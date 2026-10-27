import { wordClip } from "@shared/audio/wordClips";

/**
 * ODD SOUND OUT — Level 3 Phonics: four pictures, three of them start with
 * the same sound. Tap the one that does not.
 *
 * The step up from Sound Show (hear a sound, find its picture) and Phonics
 * Game Show (see a picture, find its letter): here there is NO letter on the
 * stage — the child has to hear the four words and compare their first
 * sounds. Every word is named aloud as its card lifts, so a picture that
 * could be called two things (a jet, a plane) is never a trap.
 *
 * Only single first sounds — no blends (st, sp) or digraphs (sh, ch) — and
 * only pictures with a clean recording. The odd one moves between all four
 * places so the answer is never "always the last one".
 */

export interface Round {
  /** The sound three of the pictures share. */
  letter: string;
  /** The four pictures, in the order they sit and are named. */
  pictures: readonly string[];
}

export const ROUNDS: readonly Round[] = [
  { letter: "b", pictures: ["ball", "cat", "bus", "bed"] },
  { letter: "c", pictures: ["cup", "cake", "sun", "car"] },
  { letter: "p", pictures: ["hat", "pineapple", "pizza", "penguin"] },
  { letter: "m", pictures: ["mouse", "milk", "map", "fox"] },
  { letter: "s", pictures: ["snake", "lemon", "sun", "soup"] },
  { letter: "t", pictures: ["ten", "tie", "jar", "teeth"] },
  { letter: "h", pictures: ["pin", "hat", "hen", "house"] },
  { letter: "l", pictures: ["lion", "lemon", "leg", "net"] },
  { letter: "n", pictures: ["nest", "bus", "net", "nut"] },
  { letter: "j", pictures: ["jar", "juice", "bed", "jet"] },
] as const;

export const TOTAL_ROUNDS = ROUNDS.length;

/** The odd one out: the only picture that does not start with the shared sound. */
export const oddOf = (r: Round): string => r.pictures.find((p) => p[0] !== r.letter) ?? "";

/** Stars from how many rounds were right at the first tap. */
export function starsFor(firstTry: number): number {
  if (firstTry >= TOTAL_ROUNDS - 1) return 3;
  if (firstTry >= Math.ceil(TOTAL_ROUNDS * 0.6)) return 2;
  return 1;
}

/**
 * Self-check: exactly one odd picture, four different pictures, every one
 * recorded, the shared sound recorded, and the odd one not always in the
 * same place.
 */
export function checkRounds(has: (id: string) => boolean): string[] {
  const errs: string[] = [];
  const places = new Set<number>();
  for (const r of ROUNDS) {
    const odd = r.pictures.filter((p) => p[0] !== r.letter);
    if (r.pictures.length !== 4) errs.push(`${r.letter}: ${r.pictures.length} pictures`);
    if (odd.length !== 1) errs.push(`${r.letter}: ${odd.length} odd pictures`);
    if (new Set(r.pictures).size !== r.pictures.length) errs.push(`${r.letter}: repeated picture`);
    for (const p of r.pictures) if (!wordClip(p)) errs.push(`${r.letter}: no recording for ${p}`);
    if (!has(`phonics-${r.letter}`)) errs.push(`${r.letter}: no sound`);
    places.add(r.pictures.indexOf(oddOf(r)));
  }
  if (places.size < 4) errs.push("the odd picture does not visit every place");
  return errs;
}
