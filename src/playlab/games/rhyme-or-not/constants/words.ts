/**
 * THE RHYME WORDS — every word the three rhyme games (Rhyme Time, Rhyme Match,
 * Rhyme Houses) show and say, with the sound it ends in.
 *
 * A word is here only when the portal has BOTH a picture a three-year-old
 * names without guessing (Fluent 3D, `fluentSrc`) AND a recorded clip that
 * says it (`wordClip`) — a rhyme game that cannot say its words is no rhyme
 * game. Words that would need a new recording (bat, pig, bee, mop…) or whose
 * picture is a guess (fog, hug, pan, jet, ox, king, zip) were left out on
 * purpose. `checkWords()` proves both halves for every word.
 *
 * `rime` is the sound a word ends in: two words rhyme when it is the same.
 * The words that rhyme with nothing else here (sun, bus, ball…) are the "no"
 * pictures; their rime is their own.
 */

import { fluentSrc } from "@shared/constants/fluent3d";
import { wordClip } from "@shared/audio/wordClips";

export const WORDS = {
  cat: "at",
  hat: "at",
  rat: "at",
  dog: "og",
  frog: "og",
  log: "og",
  car: "ar",
  star: "ar",
  jar: "ar",
  box: "ox",
  fox: "ox",
  drum: "um",
  thumb: "um",
  hen: "en",
  pen: "en",
  ten: "en",
  van: "an",
  can: "an",
  fan: "an",
  bug: "ug",
  mug: "ug",
  cake: "ake",
  snake: "ake",
  moon: "oon",
  spoon: "oon",
  house: "ouse",
  mouse: "ouse",
  tree: "ee",
  key: "ee",
  train: "ain",
  rain: "ain",
  egg: "eg",
  leg: "eg",
  nest: "est",
  vest: "est",
  tie: "ie",
  eye: "ie",
  cap: "ap",
  map: "ap",
  pin: "in",
  bin: "in",
  // rhyme with none of the others
  sun: "un",
  bus: "us",
  ball: "all",
  cup: "up",
  fish: "ish",
  duck: "uck",
  bed: "ed",
  lion: "ion",
  shoe: "oe",
  apple: "ple",
  whale: "ale",
  bear: "ear",
  cow: "ow",
  banana: "ana",
} as const;

export type Word = keyof typeof WORDS;

/** The words whose spelling does not end in their rime. */
const SPELT: Partial<Record<Word, string>> = { key: "ey", eye: "ye", thumb: "umb", egg: "gg" };

export const rhymes = (a: Word, b: Word): boolean => a !== b && WORDS[a] === WORDS[b];

/** The picture of a word (every word has one — `checkWords`). */
export const wordSrc = (w: Word): string => fluentSrc(w) ?? "";

/** The recorded clip that says a word (every word has one — `checkWords`). */
export const clipFor = (w: Word): string => wordClip(w) ?? "";

/** Self-check: a picture and a recording for every word, and each rime is
 *  really how the word ends. */
export function checkWords(): string[] {
  const problems: string[] = [];
  for (const w of Object.keys(WORDS) as Word[]) {
    if (!fluentSrc(w)) problems.push(`${w}: no picture`);
    if (!wordClip(w)) problems.push(`${w}: no recording`);
    if (!w.endsWith(SPELT[w] ?? WORDS[w])) problems.push(`${w}: does not end in -${WORDS[w]}`);
  }
  return problems;
}
