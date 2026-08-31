/**
 * The shape of one Pirate Match round: the target letter plus two companion
 * letters, and the order each side shows them in.
 *
 * DETERMINISTIC throughout — the same letter always deals the same round
 * (the portal's predictability rule, and no Math.random near render). The
 * companions sit at fixed offsets co-prime with 26, so they LOOK scattered
 * ("C, J, R") while every letter of the alphabet keeps appearing as a
 * companion across a run.
 */
export const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** The three letters on the board for a target — target first. */
export function roundLetters(target: string): string[] {
  const i = Math.max(0, ALPHA.indexOf(target.toUpperCase()));
  return [ALPHA[i], ALPHA[(i + 7) % 26], ALPHA[(i + 15) % 26]];
}

/** Left column order (letters) — a deterministic per-letter rotation. */
export function leftOrder(target: string): string[] {
  const letters = roundLetters(target);
  const r = Math.max(0, ALPHA.indexOf(target.toUpperCase())) % 3;
  return [...letters.slice(r), ...letters.slice(0, r)];
}

/** Right column order (pictures) — rotated one further so a pair never sits
 *  on the same row as its partner: a straight-across match teaches rows, a
 *  crossed one teaches LETTERS. */
export function rightOrder(target: string): string[] {
  const left = leftOrder(target);
  return [left[1], left[2], left[0]];
}
