/**
 * Rhyme Time: Yes or No? — the first step of hearing rhymes, for three- to
 * five-year-olds: two pictures come one after the other, each word said
 * ("cat"… "hat"), and "Do they rhyme?" — a big green thumbs-up or a big red
 * thumbs-down. Five pairs a round, two or three that rhyme; the
 * first rounds use the plainest rhymes (cat/hat, moon/spoon).
 *
 * One module (the portal gives each activity one game), five rounds, with a
 * Continue / Back break card after each.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "rhyme";
export const MODULE_IDS: readonly ModuleId[] = ["rhyme"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "rhyme",
    name: "Rhyme Time",
    tag: "Listen, then tap yes or no",
    accent: "#E8574F",
    edge: "#B83A34",
    clip: "ryn-mode-rhyme",
  },
];

export const VOICE: GameVoice = { welcome: "ryn-welcome", done: "ryn-done" };

/** "Do they rhyme?" */
export const ASK = "ryn-ask";
/** "Yes! They rhyme!" — Rhyme Match says it too. */
export const SAY_YES = "ryn-yes";
/** "No, they don't rhyme." */
export const SAY_NO = "ryn-no";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const RHYME_ROUNDS = 5;

export type Pair = readonly [Word, Word];

/** Each round's five pairs, in the order they come (a break card after each). */
export const ROUNDS: readonly (readonly Pair[])[] = [
  [
    ["cat", "hat"],
    ["moon", "spoon"],
    ["dog", "sun"],
    ["bus", "fish"],
    ["cake", "snake"],
  ],
  [
    ["car", "ball"],
    ["dog", "frog"],
    ["duck", "shoe"],
    ["hen", "cup"],
    ["car", "star"],
  ],
  [
    ["house", "mouse"],
    ["box", "fox"],
    ["apple", "bed"],
    ["train", "rain"],
    ["lion", "key"],
  ],
  [
    ["bear", "sun"],
    ["bug", "mug"],
    ["whale", "drum"],
    ["cow", "fish"],
    ["hen", "pen"],
  ],
  [
    ["tree", "key"],
    ["egg", "leg"],
    ["ball", "hat"],
    ["can", "fan"],
    ["van", "duck"],
  ],
];

/** Self-check: five rounds of five pairs, two or three rhyming in each, the
 *  answer never the same four times running, and no pair twice. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === RHYME_ROUNDS, `${ROUNDS.length} rounds`);
  need(ROUNDS.length >= ROUND_COUNT, "fewer rounds than the kit plays");
  const keys: string[] = [];
  ROUNDS.forEach((r, i) => {
    need(r.length === 5, `round ${i}: ${r.length} pairs`);
    const yes = r.filter(([a, b]) => rhymes(a, b)).length;
    need(yes === 2 || yes === 3, `round ${i}: ${yes} rhymes`);
    need(
      !r.every(([a, b], j) => j === 0 || rhymes(a, b) !== rhymes(r[j - 1][0], r[j - 1][1])),
      `round ${i}: the answers just take turns`
    );
    for (const [a, b] of r) {
      need(a !== b, `round ${i}: ${a} with itself`);
      keys.push([a, b].sort().join("-"));
    }
  });
  need(distinct(keys), "a pair comes twice");
  // the first pair of the game is a rhyme, so the hand first shows "yes"
  need(rhymes(...ROUNDS[0][0]), "the first pair does not rhyme");
  return problems;
}
