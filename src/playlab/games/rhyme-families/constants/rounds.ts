/**
 * Rhyme Houses — the third rung: word FAMILIES. Little houses stand in a row,
 * each with a word-family picture on its front (the cat house is the -at
 * house, the dog house the -og house…). Pictures come up the path one at a
 * time; the child drags each to the house whose word it rhymes with (hat →
 * the cat house) and hears the pair, "hat, cat!".
 *
 * Two houses in the first rounds, then three. Six rounds, one module. Five
 * families have two more words with a picture and a recording besides the
 * house's own (Rhyme Time's word list): -at, -og, -ar, -en, -an — so a
 * two-house round has four pictures and a three-house round six.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "houses";
export const MODULE_IDS: readonly ModuleId[] = ["houses"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "houses",
    name: "Rhyme Houses",
    tag: "Take each picture to its rhyming house",
    accent: "#2F8FCB",
    edge: "#1F6C9C",
    clip: "ryh-mode-houses",
  },
];

export const VOICE: GameVoice = { welcome: "ryh-welcome", done: "ryh-done" };

/** "Which house?" — after each picture's word. */
export const WHICH = "ryh-which";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const HOUSE_ROUNDS = 6;

/** Each family's house: its roof colour (the picture on its front is the word). */
export const ROOF: Readonly<Partial<Record<Word, string>>> = {
  cat: "#F2734B",
  dog: "#3F95D8",
  car: "#9C5BD0",
  hen: "#F0A223",
  van: "#2FA58F",
};

export interface HouseRound {
  /** The houses, left to right, by the word on their front. */
  houses: readonly Word[];
  /** The pictures, in the order they come up the path. */
  pictures: readonly Word[];
}

export const ROUNDS: readonly HouseRound[] = [
  { houses: ["cat", "dog"], pictures: ["hat", "frog", "rat", "log"] },
  { houses: ["car", "hen"], pictures: ["star", "pen", "ten", "jar"] },
  { houses: ["cat", "dog", "van"], pictures: ["frog", "can", "hat", "log", "fan", "rat"] },
  { houses: ["car", "hen", "cat"], pictures: ["pen", "star", "hat", "ten", "rat", "jar"] },
  { houses: ["van", "dog", "car"], pictures: ["log", "jar", "can", "frog", "star", "fan"] },
  { houses: ["hen", "van", "cat"], pictures: ["ten", "can", "rat", "pen", "hat", "fan"] },
];

/** Which house a picture belongs in (derived, never stored twice). */
export const homeOf = (r: HouseRound, w: Word): number => r.houses.findIndex((h) => rhymes(h, w));

/** Self-check: two then three houses of different families, every picture
 *  rhymes with exactly one house and is never a house's own word, each house
 *  gets two, and no picture comes twice in a round or three times running to
 *  the same house. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === HOUSE_ROUNDS, `${ROUNDS.length} rounds`);
  need(ROUNDS.length >= ROUND_COUNT, "fewer rounds than the kit plays");
  ROUNDS.forEach((r, i) => {
    need(r.houses.length === (i < 2 ? 2 : 3), `round ${i}: ${r.houses.length} houses`);
    need(r.pictures.length === r.houses.length * 2, `round ${i}: ${r.pictures.length} pictures`);
    need(distinct(r.pictures), `round ${i}: a picture twice`);
    for (let a = 0; a < r.houses.length; a++) {
      need(!!ROOF[r.houses[a]], `round ${i}: no roof colour for ${r.houses[a]}`);
      for (let b = a + 1; b < r.houses.length; b++)
        need(!rhymes(r.houses[a], r.houses[b]), `round ${i}: two houses rhyme`);
      need(r.pictures.filter((w) => homeOf(r, w) === a).length === 2, `round ${i}: house ${a}`);
    }
    r.pictures.forEach((w, j) => {
      need(!r.houses.includes(w), `round ${i}: ${w} is a house's own word`);
      need(
        r.houses.filter((h) => rhymes(h, w)).length === 1,
        `round ${i}: ${w} rhymes with no house, or two`
      );
      need(
        j < 2 ||
          homeOf(r, w) !== homeOf(r, r.pictures[j - 1]) ||
          homeOf(r, w) !== homeOf(r, r.pictures[j - 2]),
        `round ${i}: three in a row to one house`
      );
    });
  });
  // the first picture goes to the first house: the hand's first move is short
  need(homeOf(ROUNDS[0], ROUNDS[0].pictures[0]) === 0, "the first picture is not for house 1");
  return problems;
}
