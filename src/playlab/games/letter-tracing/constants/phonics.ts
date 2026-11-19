/** Anchor words — real words that every TTS engine pronounces correctly.
 *  Hearing "b … buh … ball" teaches the sound even on engines that mangle
 *  the isolated "buh". This is exactly how phonics is taught to children. */
export const LETTER_WORDS: Record<string, string> = {
  A: "apple",
  B: "ball",
  C: "cat",
  D: "dog",
  E: "egg",
  F: "fish",
  G: "goat",
  H: "hat",
  I: "igloo",
  J: "jam",
  K: "kite",
  L: "lion",
  M: "moon",
  N: "nest",
  O: "octopus",
  P: "penguin",
  Q: "queen",
  R: "rabbit",
  S: "sun",
  T: "tiger",
  U: "umbrella",
  V: "van",
  W: "water",
  X: "box",
  Y: "yo-yo",
  Z: "zebra",
};

export function getLetterWord(letter: string): string {
  return LETTER_WORDS[letter.toUpperCase()] ?? "";
}
