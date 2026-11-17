/**
 * Rhyme Match — the second rung: given a word, FIND the one that rhymes.
 * A target picture on the garden pad ("cat"); three pictures below it — one
 * rhymes (hat), two don't (sun, bus). The child drags the rhyming one onto
 * the pad; the two snap together as a pair and both words are said.
 *
 * Five targets a round, five rounds (a break card after each), one module. The words are Rhyme Time's
 * (`rhyme-or-not/constants/words`): each has a picture and a recording.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "match";
export const MODULE_IDS: readonly ModuleId[] = ["match"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "match",
    name: "Rhyme Match",
    tag: "Drag the picture that rhymes",
    accent: "#3DAB72",
    edge: "#2B8A57",
    clip: "rym-mode-match",
  },
];

export const VOICE: GameVoice = { welcome: "rym-welcome", done: "rym-done" };

/** "Find the one that rhymes with" — the target's word follows. */
export const FIND = "rym-find";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const MATCH_ROUNDS = 5;

export interface MatchItem {
  target: Word;
  /** Left to right: one rhymes with the target, two don't. */
  options: readonly [Word, Word, Word];
}

export const ROUNDS: readonly (readonly MatchItem[])[] = [
  [
    { target: "cat", options: ["hat", "sun", "bus"] },
    { target: "dog", options: ["ball", "frog", "cup"] },
    { target: "moon", options: ["fish", "duck", "spoon"] },
    { target: "cake", options: ["bed", "snake", "lion"] },
    { target: "car", options: ["apple", "shoe", "star"] },
  ],
  [
    { target: "house", options: ["mouse", "cow", "sun"] },
    { target: "box", options: ["bear", "fox", "bus"] },
    { target: "hen", options: ["cup", "ball", "pen"] },
    { target: "train", options: ["rain", "fish", "whale"] },
    { target: "bug", options: ["lion", "mug", "apple"] },
  ],
  [
    { target: "drum", options: ["duck", "bed", "thumb"] },
    { target: "van", options: ["can", "whale", "shoe"] },
    { target: "tree", options: ["cow", "key", "sun"] },
    { target: "egg", options: ["ball", "bus", "leg"] },
    { target: "nest", options: ["vest", "cup", "fish"] },
  ],
  [
    { target: "tie", options: ["bear", "eye", "duck"] },
    { target: "cap", options: ["map", "apple", "lion"] },
    { target: "pin", options: ["shoe", "whale", "bin"] },
    { target: "star", options: ["cow", "jar", "bed"] },
    { target: "frog", options: ["log", "banana", "sun"] },
  ],
  [
    { target: "hat", options: ["bus", "rat", "fish"] },
    { target: "ten", options: ["hen", "ball", "cup"] },
    { target: "fan", options: ["duck", "apple", "van"] },
    { target: "dog", options: ["bear", "log", "shoe"] },
    { target: "can", options: ["bed", "fan", "cow"] },
  ],
];

/** Where the rhyming picture is (derived, never stored twice). */
export const answerOf = (m: MatchItem): number => m.options.findIndex((o) => rhymes(o, m.target));

/** Self-check: five rounds of five, exactly one rhyme among each three, the
 *  answer not in the same place every time, and no rhyme pair twice. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === MATCH_ROUNDS, `${ROUNDS.length} rounds`);
  need(ROUNDS.length >= ROUND_COUNT, "fewer rounds than the kit plays");
  const pairs: string[] = [];
  ROUNDS.forEach((r, i) => {
    need(r.length === 5, `round ${i}: ${r.length} targets`);
    need(distinct(r.map((m) => m.target)), `round ${i}: a target twice`);
    need(new Set(r.map(answerOf)).size >= 2, `round ${i}: the answer is always in one place`);
    for (const m of r) {
      need(distinct(m.options), `round ${i} ${m.target}: an option twice`);
      need(!m.options.includes(m.target), `round ${i} ${m.target}: the target is an option`);
      need(
        m.options.filter((o) => rhymes(o, m.target)).length === 1,
        `round ${i} ${m.target}: not exactly one rhyme`
      );
      pairs.push([m.target, m.options[answerOf(m)]].sort().join("-"));
    }
  });
  need(distinct(pairs), "a rhyme pair comes twice");
  return problems;
}
