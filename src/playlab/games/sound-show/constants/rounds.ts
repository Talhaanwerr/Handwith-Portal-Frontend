import { wordClip } from "@shared/audio/wordClips";

/**
 * SOUND SHOW — Level 1 Phonics, for toddlers: hear a letter's sound, then
 * find the picture that starts with it.
 *
 * Ten rounds on the Phonics Game Show stage. The first five offer just TWO
 * pictures, the last five three — the same letters a toddler meets first
 * (s, m, b, d, c, then h, f, l, n, p), each with a picture and a recording
 * the portal already has. The other pictures are written by hand so that
 * none of them starts with the round's sound, and the right one moves
 * between the places so a toddler can't learn "always the left one".
 */

export interface Round {
  /** The letter whose sound is taught and asked for. */
  letter: string;
  /** The pictures on the stage, in order; exactly one starts with `letter`. */
  pictures: readonly string[];
}

export const ROUNDS: readonly Round[] = [
  { letter: "s", pictures: ["cup", "sun"] },
  { letter: "m", pictures: ["mouse", "hat"] },
  { letter: "b", pictures: ["egg", "bus"] },
  { letter: "d", pictures: ["dog", "juice"] },
  { letter: "c", pictures: ["lion", "cat"] },
  { letter: "h", pictures: ["nest", "hat", "fox"] },
  { letter: "f", pictures: ["penguin", "sun", "fox"] },
  { letter: "l", pictures: ["lion", "cup", "tie"] },
  { letter: "n", pictures: ["whale", "nest", "dog"] },
  { letter: "p", pictures: ["mouse", "egg", "penguin"] },
] as const;

export const TOTAL_ROUNDS = ROUNDS.length;

/** The right picture of a round. */
export const answerOf = (r: Round): string => r.pictures.find((p) => p[0] === r.letter) ?? "";

/** The ask, in the new voice: "Find something that starts with" + the sound ("sss"). */
export const askLines = (r: Round): string[] => ["instr-find-starts-with", `phonics-${r.letter}`];

/** Stars for a run of toddlers: generous, from first-tap answers. */
export function starsFor(firstTry: number): number {
  if (firstTry >= TOTAL_ROUNDS - 2) return 3;
  if (firstTry >= Math.ceil(TOTAL_ROUNDS / 2)) return 2;
  return 1;
}

/**
 * Self-check: exactly one picture starts with the letter, every picture has
 * a recording, the sound and the ask are recorded, and the right picture is
 * not always in the same place.
 */
export function checkRounds(has: (id: string) => boolean): string[] {
  const errs: string[] = [];
  const places = new Set<number>();
  for (const r of ROUNDS) {
    const right = r.pictures.filter((p) => p[0] === r.letter);
    if (right.length !== 1) errs.push(`${r.letter}: ${right.length} right pictures`);
    for (const p of r.pictures) if (!wordClip(p)) errs.push(`${r.letter}: no recording for ${p}`);
    if (!has(`phonics-${r.letter}`)) errs.push(`${r.letter}: no sound`);
    for (const id of askLines(r)) if (!has(id)) errs.push(`${r.letter}: no ${id}`);
    places.add(r.pictures.indexOf(answerOf(r)));
  }
  if (places.size < 2) errs.push("the right picture is always in the same place");
  return errs;
}
