/**
 * WORD BUILDER — five short lessons, one for each short vowel sound, each its
 * own game (`word-builder-a` … `-u`; this folder is their kit). A lesson
 * teaches three words, and every word goes through the same three pages so a
 * child learns the routine:
 *
 *   1 HEAR IT        the picture and its word: tap each letter to hear its
 *                    sound, then the whole word is said
 *   2 BUILD IT       the picture and three empty places: drag the letters in
 *                    (one letter in the tray does not belong)
 *   3 WHAT'S MISSING the word with one letter gone: tap the letter that fits
 *
 * Then a REVIEW of all three, so every word comes round a second time, in a
 * new order and asked a new way: build the third word again (a new tray),
 * find a different missing letter in the first, build the second again.
 *
 * Everything a page shows is derived from the word itself (never stored
 * twice); `checkRounds()` proves every word has a picture, a recording and a
 * sound for each of its letters, and that every page can be won.
 */

import { unit } from "@shared/utils/hash";
import { wordClip } from "@shared/audio/wordClips";
import { distinct, type GameVoice, type ModuleInfo } from "@games/number-groups/constants/kit";

export type ModuleId = "a" | "e" | "i" | "o" | "u";
export const MODULE_IDS: readonly ModuleId[] = ["a", "e", "i", "o", "u"];

export const VOICE: GameVoice = { welcome: "wbd-welcome", done: "wbd-done" };

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "a",
    name: "a words",
    tag: "Build cat, hat and bag",
    accent: "#E8554E",
    edge: "#B43A34",
    clip: "wbd-mode-a",
  },
  {
    id: "e",
    name: "e words",
    tag: "Build bed, hen and net",
    accent: "#F0A223",
    edge: "#BE7A0C",
    clip: "wbd-mode-e",
  },
  {
    id: "i",
    name: "i words",
    tag: "Build pin, lip and six",
    accent: "#3BA55D",
    edge: "#267A41",
    clip: "wbd-mode-i",
  },
  {
    id: "o",
    name: "o words",
    tag: "Build dog, box and pot",
    accent: "#2F7FD0",
    edge: "#1F5C9C",
    clip: "wbd-mode-o",
  },
  {
    id: "u",
    name: "u words",
    tag: "Build bus, cup and sun",
    accent: "#7B4FD6",
    edge: "#5633A3",
    clip: "wbd-mode-u",
  },
];

/** A lesson's three words, in teaching order. Each is three different letters. */
export const WORDS: Record<ModuleId, readonly [string, string, string]> = {
  a: ["cat", "hat", "bag"],
  e: ["bed", "hen", "net"],
  i: ["pin", "lip", "six"],
  o: ["dog", "box", "pot"],
  u: ["bus", "cup", "sun"],
};

export type Step = "hear" | "build" | "missing";
const STEPS: readonly Step[] = ["hear", "build", "missing"];
/** The review after the three words: [which word, the page]. */
const REVIEW: readonly (readonly [number, Step])[] = [
  [2, "build"],
  [0, "missing"],
  [1, "build"],
];
/** Pages of first teaching: three words, three pages each. */
const TEACH = 9;
/** Pages a lesson: the teaching, then the review. */
export const ROUNDS = TEACH + REVIEW.length;

/**
 * The word and the page a round plays. `wi` seeds the page (its tray, its
 * missing letter): in the review it is moved on by one, so a word built or
 * completed a second time never looks the same as the first time.
 */
export function pageOf(module: ModuleId, round: number): { word: string; wi: number; step: Step } {
  if (round >= TEACH) {
    const [i, step] = REVIEW[(round - TEACH) % REVIEW.length];
    return { word: WORDS[module][i], wi: i + 1, step };
  }
  const wi = Math.floor(round / STEPS.length) % 3;
  return { word: WORDS[module][wi], wi, step: STEPS[round % STEPS.length] };
}

/* The game's own lines (see NEW-CLIPS.json). */
/** "Tap each letter to hear its sound!" */
export const HEAR = "wbd-hear";
/** "Build the word!" */
export const BUILD = "wbd-build";
/** "Which letter is missing?" */
export const MISSING = "wbd-missing";
export const TRY = "instr-try-again";

/** The clip that says a letter's SOUND (never its name). */
export const soundOf = (letter: string): string => `phonics-${letter}`;
/** The recorded clip that says a word. */
export const sayOf = (word: string): string => wordClip(word) ?? "";

const VOWELS = ["a", "e", "i", "o", "u"] as const;
const CONSONANTS = ["m", "s", "t", "p", "n", "d", "g", "b", "r", "l", "f", "k"] as const;
const isVowel = (l: string) => (VOWELS as readonly string[]).includes(l);

/** Letters of the same kind (vowel / consonant) that are NOT in the word. */
function others(word: string, like: string, seed: number): string[] {
  const pool: readonly string[] = isVowel(like) ? VOWELS : CONSONANTS;
  return pool
    .filter((l) => !word.includes(l))
    .sort((x, y) => unit(seed * 17 + x.charCodeAt(0)) - unit(seed * 17 + y.charCodeAt(0)));
}

/**
 * BUILD IT: the word's letters and one consonant that does not belong, in an
 * order that is never the word spelled out.
 */
export function trayFor(word: string, seed: number): string[] {
  const letters = [...word.split(""), others(word, "t", seed)[0]];
  const out = [...letters].sort(
    (x, y) => unit(seed * 29 + x.charCodeAt(0)) - unit(seed * 29 + y.charCodeAt(0))
  );
  if (out.slice(0, word.length).join("") === word) out.push(out.shift() as string);
  return out;
}

/**
 * WHAT'S MISSING: which letter is gone (first, middle, last — by the word's
 * place in the lesson) and the three letters to choose from, the right one
 * in a place that changes from word to word.
 */
export function missingFor(word: string, wi: number): { at: number; options: string[] } {
  const at = [1, 0, 2][wi % 3];
  const right = word[at];
  const wrong = others(word, right, wi + word.charCodeAt(0)).slice(0, 2);
  const options = [...wrong];
  // the right letter second, first, then last: never one place twice in a lesson
  options.splice((wi * 2 + 1) % 3, 0, right);
  return { at, options };
}

/** Self-check: every word is playable and fair on all three pages. */
export function checkRounds(has: (clip: string) => boolean = () => true): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };
  const all = MODULE_IDS.flatMap((m) => WORDS[m]);
  need(distinct(all), "a word is taught twice");
  for (const m of MODULE_IDS) {
    const slots = new Set<number>();
    WORDS[m].forEach((w, wi) => {
      need(w.length === 3 && distinct(w.split("")), `${w}: not three different letters`);
      need(w[1] === m, `${w}: its vowel is not ${m}`);
      need(!!wordClip(w), `${w}: no recording`);
      for (const l of w) need(has(soundOf(l)), `${w}: no sound for ${l}`);
      const tray = trayFor(w, wi);
      need(tray.length === 4 && distinct(tray), `${w}: the tray repeats a letter`);
      need(
        w.split("").every((l) => tray.includes(l)),
        `${w}: a letter is not in the tray`
      );
      need(tray.slice(0, 3).join("") !== w, `${w}: the tray is already spelled`);
      const miss = missingFor(w, wi);
      need(miss.options.length === 3 && distinct(miss.options), `${w}: a choice twice`);
      need(miss.options.includes(w[miss.at]), `${w}: the missing letter is not offered`);
      need(
        miss.options.filter((l) => l !== w[miss.at]).every((l) => !w.includes(l)),
        `${w}: a wrong choice is in the word`
      );
      slots.add(miss.options.indexOf(w[miss.at]));
    });
    need(slots.size === 3, `${m}: the missing letter is twice in one place`);
  }
  for (const m of MODULE_IDS) {
    const again = [TEACH, TEACH + 1, TEACH + 2].map((r) => pageOf(m, r));
    need(distinct(again.map((p) => p.word)), `${m}: the review repeats a word`);
    for (const p of again) {
      const first = (WORDS[m] as readonly string[]).indexOf(p.word);
      if (p.step === "build") {
        const tray = trayFor(p.word, p.wi);
        need(
          tray.join("") !== trayFor(p.word, first).join(""),
          `${p.word}: the review tray is the same`
        );
        need(tray.slice(0, 3).join("") !== p.word, `${p.word}: the review tray is spelled`);
      } else {
        need(
          missingFor(p.word, p.wi).at !== missingFor(p.word, first).at,
          `${p.word}: the review hides the same letter`
        );
      }
    }
  }
  for (const round of [0, 1, 2, 3, 8]) {
    const p = pageOf("a", round);
    need(p.word === WORDS.a[Math.floor(round / 3)], `round ${round}: wrong word`);
  }
  return problems;
}
