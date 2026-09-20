/**
 * Vocabulary reuse note: the repo has two existing "letter → word" systems —
 * letter-treats' TREAT_ALPHABET (5 words/letter, image-only, no audio) and
 * letter-tracing's anchor words (1 word/letter, image AND pre-generated
 * audio: the `word-a`…`word-z` manifest clips already say "Apple!", "Ball!"…
 * matching this exact list). Only the second has audio, and this puzzle
 * needs audio, so this game cross-imports FROM letter-tracing rather than
 * inventing a third vocabulary dataset or duplicating art. This is the one
 * new architectural pattern in this game — every other game folder is
 * self-contained plus shared/ — so it lives in this single file rather than
 * scattered across the game, and can be promoted to shared/ in one move if
 * that's preferred long-term.
 */
import { ANCHOR_ART } from "@games/letter-tracing/components/illustrations/AnchorArt";
import { getLetterWord } from "@games/letter-tracing/constants/phonics";

export { ANCHOR_ART, getLetterWord };

/**
 * The object PHOTO for a word — deliberately the SAME files letter-tracing
 * already reads (`public/games/letter-tracing/objects/<word>.jpg`, lowercase,
 * spaces → dashes). Both games use the identical anchor-word list, so
 * pointing at one folder means a photo dropped in for tracing shows up here
 * too, and there is exactly one copy of every object image in the repo.
 *
 * Any word without a photo falls back to its ANCHOR_ART illustration, so
 * partially-filled folders are fine (see VocabObject).
 */
export function objectPhotoPath(word: string): string {
  return `/games/letter-tracing/objects/${word.toLowerCase().replace(/\s+/g, "-")}.jpg`;
}

/** The pre-generated audio clip id for a letter's anchor word (e.g. "word-a"
 *  → "Apple!"). Already exists for all 26 letters — see shared/audio/manifest.json. */
export function vocabClipId(letter: string): string {
  return `word-${letter.toLowerCase()}`;
}
