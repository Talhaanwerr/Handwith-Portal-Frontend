import { shuffle } from "@shared/utils/random";
import {
  TREAT_ALPHABET,
  letterData,
  type TreatWord,
} from "@games/letter-treats/constants/alphabet";
import { hasRealArt } from "@games/letter-treats/components/TreatArt";

/**
 * The Alphabet Set challenge - "find something that starts with ...".
 *
 * Two rounds per letter, both built from the SAME vocabulary the child just
 * explored, so the challenge only ever asks about pictures they have seen:
 *
 *   round 1  NAME   "Can you find A?"                      (recorded: hunt-find-*)
 *   round 2  SOUND  "Find something that starts with ah!"  (treat-sound-*, then
 *                    the recorded phonics clip so the target sound is always heard)
 *
 * Four choices: the target plus three distractors from other letters. A
 * distractor must start with a DIFFERENT sound (C and K both say "kuh", so
 * a cat is never a distractor for a kite), and pictures that already have
 * real artwork are preferred, so a round is never a row of placeholders.
 * The target is always present - an impossible round cannot be built.
 */

export type RoundKind = "name" | "sound";

export interface ChallengeRound {
  kind: RoundKind;
  /** Clips that ask the question, in order. */
  promptClips: string[];
  target: TreatWord;
  /** Target + distractors, already shuffled. */
  choices: TreatWord[];
}

export const CHOICES_PER_ROUND = 4;
export const ROUNDS_PER_LETTER = 2;

/** Words of OTHER letters that are safe distractors for `letter`. */
function distractorPool(letter: string): TreatWord[] {
  const me = letterData(letter);
  return TREAT_ALPHABET.filter((l) => l.letter !== me.letter && l.sound !== me.sound).flatMap((l) =>
    l.vocabulary.filter((w) => w.initial)
  );
}

function pickDistractors(letter: string, count: number): TreatWord[] {
  const pool = shuffle(distractorPool(letter));
  const withArt = pool.filter((w) => hasRealArt(w.id));
  const picked = withArt.slice(0, count);
  // only if the art-backed pool is somehow short - today it never is
  for (const w of pool) {
    if (picked.length >= count) break;
    if (!picked.includes(w)) picked.push(w);
  }
  return picked;
}

export function buildChallenge(letter: string): ChallengeRound[] {
  const data = letterData(letter);
  const lower = data.lower;
  // targets: two DIFFERENT words that begin with the sound; real art first
  const candidates = shuffle(data.vocabulary.filter((w) => w.initial));
  const ranked = [
    ...candidates.filter((w) => hasRealArt(w.id)),
    ...candidates.filter((w) => !hasRealArt(w.id)),
  ];
  const kinds: RoundKind[] = ["name", "sound"];

  return kinds.slice(0, ROUNDS_PER_LETTER).map((kind, i) => {
    const target = ranked[i % ranked.length];
    return {
      kind,
      promptClips:
        kind === "name" ? [`hunt-find-${lower}`] : [`treat-sound-${lower}`, `phonics-${lower}`],
      target,
      choices: shuffle([target, ...pickDistractors(letter, CHOICES_PER_ROUND - 1)]),
    };
  });
}
