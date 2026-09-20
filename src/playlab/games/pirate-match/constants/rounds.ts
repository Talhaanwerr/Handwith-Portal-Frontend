/**
 * The shape of one Pirate Match round: the target letter plus its companion
 * letters, and the order each side shows them in.
 *
 * DETERMINISTIC throughout — the same letter always deals the same round
 * (the portal's predictability rule, and no Math.random near render).
 */
export const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** How the companions are chosen. */
export type MatchDifficulty = "easy" | "hard";

/** Letters on the board when the alphabet allows a full round. */
const ROUND_SIZE = 3;

/** Companions beside the target — the board minus the letter being learned. */
const COMPANION_COUNT = ROUND_SIZE - 1;

/**
 * HARD companions: fixed offsets co-prime with 26, so they LOOK scattered
 * ("C, J, R") while every letter of the alphabet keeps appearing as a
 * companion across a run. This is the original behaviour, unchanged.
 */
const HARD_OFFSETS = [7, 15] as const;

/**
 * EASY companions: indices into the letters BEFORE the target.
 *
 * Two seeded picks spread across the range come first, so E does not forever
 * deal "C, D" — the child should meet the whole of the alphabet they have
 * already learned, not just the letter next door. Whatever those two miss is
 * topped up from the letters NEAREST the target, which are both the most
 * useful distractors and always available.
 *
 * The pool is the target's own index, so it grows as the child moves through
 * the alphabet: A has nothing before it, B has one letter, C onwards have the
 * full pair. That is the difficulty curve the mode is named for, and it falls
 * out of the rule rather than being tuned on top of it.
 */
function precedingCompanions(targetIndex: number, count: number): number[] {
  const picked: number[] = [];
  const take = (i: number) => {
    if (i >= 0 && i < targetIndex && !picked.includes(i)) picked.push(i);
  };

  if (targetIndex > 0) {
    // Two spread picks from a hash of the target. A hash rather than
    // arithmetic on the index itself: any `targetIndex * k` term vanishes
    // under `% targetIndex`, which is how a first attempt here ended up
    // dealing "B" in every single round from C onward.
    const seed = scatterSeed(targetIndex);
    take(seed % targetIndex);
    take((seed >>> 11) % targetIndex);
  }
  for (let i = targetIndex - 1; i >= 0 && picked.length < count; i--) take(i);

  return picked.slice(0, count);
}

/** A stable scatter value for a target. Knuth's multiplicative hash — used
 *  only to spread the companion picks, so nothing depends on its exact
 *  output, only on it being deterministic and not a multiple of the index. */
function scatterSeed(n: number): number {
  return Math.imul(n + 1, 2654435761) >>> 0;
}

/**
 * The letters on the board for a target — target first.
 *
 * EASY rounds near the start of the alphabet are SHORTER, not padded: A has no
 * letters before it and B has one, so those boards carry one and two tiles.
 * Nothing downstream assumes three — the star row, the pair counter and both
 * column orders all read this list's length — so a short board is a real
 * round, and the first two letters being gentle is the point of the mode.
 */
export function roundLetters(target: string, difficulty: MatchDifficulty): string[] {
  const i = Math.max(0, ALPHA.indexOf(target.toUpperCase()));

  if (difficulty === "hard") {
    return [ALPHA[i], ...HARD_OFFSETS.map((off) => ALPHA[(i + off) % ALPHA.length])];
  }
  return [ALPHA[i], ...precedingCompanions(i, COMPANION_COUNT).map((k) => ALPHA[k])];
}

/** How many pairs one round is worth. */
export function roundSize(target: string, difficulty: MatchDifficulty): number {
  return roundLetters(target, difficulty).length;
}

/** Pairs across a run of targets — the denominator of the progress pill.
 *  Summed rather than multiplied by ROUND_SIZE because Easy's first rounds
 *  are shorter. */
export function pairsIn(queue: readonly string[], difficulty: MatchDifficulty): number {
  return queue.reduce((total, letter) => total + roundSize(letter, difficulty), 0);
}

/** Everything a round needs on screen: the two columns, already ordered. */
export interface MatchRound {
  /** Left column — the letters on their wooden planks. */
  letters: string[];
  /** Right column — the picture cards, in a different order. */
  cards: string[];
}

/**
 * Deal one round.
 *
 * ONE function rather than the `leftOrder` / `rightOrder` pair it replaces.
 * Those were always called together and each rebuilt the round from scratch —
 * `rightOrder` called `leftOrder`, which called `roundLetters` — so a board
 * was computed twice per render and the two columns were only guaranteed to
 * agree because both happened to be deterministic. Returning them together
 * makes that guarantee structural, and leaves the level a single call site.
 */
export function buildRound(target: string, difficulty: MatchDifficulty): MatchRound {
  const dealt = roundLetters(target, difficulty);

  // The left column rotates per letter, so the target is not always on top.
  const rotation = Math.max(0, ALPHA.indexOf(target.toUpperCase())) % dealt.length;
  const letters = [...dealt.slice(rotation), ...dealt.slice(0, rotation)];

  // The right column is rotated one further, so a pair never sits on the same
  // row as its partner: a straight-across match teaches rows, a crossed one
  // teaches LETTERS. A one-tile board has no row to cross.
  const cards = letters.length > 1 ? [...letters.slice(1), letters[0]] : letters;

  return { letters, cards };
}
