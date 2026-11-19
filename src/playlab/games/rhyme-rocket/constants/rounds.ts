/**
 * Rhyme Rocket — hearing rhyme, as a flight. The rocket on the launch pad
 * shows a word in its window ("star"); three planets float across the sky,
 * each with a picture — one rhymes (jar), two don't (fish, duck). The child
 * flies the rocket up to the planet that rhymes; it docks, the planet glows,
 * both words are said, and the rocket blasts off.
 *
 * Three trips a round, six rounds, one module. The words are Rhyme Time's
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

export type ModuleId = "fly";
export const MODULE_IDS: readonly ModuleId[] = ["fly"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "fly",
    name: "Rhyme Rocket",
    tag: "Fly the rocket to the planet that rhymes",
    accent: "#4C5FD7",
    edge: "#2F3C9E",
    clip: "rrk-mode-fly",
  },
];

export const VOICE: GameVoice = { welcome: "rrk-welcome", done: "rrk-done" };

/** "I fly to the planet that rhymes with" — the rocket's word follows. */
export const FLY = "rrk-fly";
/** "Blast off!" — as the docked rocket zooms away. */
export const BLAST = "rrk-blast";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const ROCKET_ROUNDS = 6;
/** Trips (rocket words) in every round. */
export const TRIPS = 3;

export interface Trip {
  /** The word in the rocket's window. */
  target: Word;
  /** The planets, left to right: one rhymes with the target, two don't. */
  options: readonly [Word, Word, Word];
}

export const ROUNDS: readonly (readonly Trip[])[] = [
  [
    { target: "star", options: ["fish", "jar", "duck"] },
    { target: "cat", options: ["hat", "ball", "cup"] },
    { target: "moon", options: ["bus", "bed", "spoon"] },
  ],
  [
    { target: "dog", options: ["shoe", "apple", "frog"] },
    { target: "cake", options: ["snake", "lion", "cow"] },
    { target: "bug", options: ["whale", "mug", "bear"] },
  ],
  [
    { target: "house", options: ["banana", "mouse", "sun"] },
    { target: "hen", options: ["fish", "ball", "pen"] },
    { target: "train", options: ["rain", "cup", "duck"] },
  ],
  [
    { target: "box", options: ["bed", "fox", "shoe"] },
    { target: "tree", options: ["key", "lion", "bus"] },
    { target: "drum", options: ["apple", "cow", "thumb"] },
  ],
  [
    { target: "van", options: ["whale", "can", "bear"] },
    { target: "nest", options: ["sun", "cup", "vest"] },
    { target: "egg", options: ["leg", "ball", "fish"] },
  ],
  [
    { target: "tie", options: ["banana", "eye", "duck"] },
    { target: "cap", options: ["map", "bed", "lion"] },
    { target: "pin", options: ["shoe", "cow", "bin"] },
  ],
];

/** Which planet rhymes (derived, never stored twice). */
export const answerOf = (t: Trip): number => t.options.findIndex((o) => rhymes(o, t.target));

/** Self-check: six rounds of three trips, exactly one rhyming planet a trip,
 *  the right planet not always in one place, and no rhyme pair twice. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === ROCKET_ROUNDS, `${ROUNDS.length} rounds`);
  need(ROUNDS.length >= ROUND_COUNT, "fewer rounds than the kit plays");
  const pairs: string[] = [];
  ROUNDS.forEach((r, i) => {
    need(r.length === TRIPS, `round ${i}: ${r.length} trips`);
    need(distinct(r.map((t) => t.target)), `round ${i}: a target twice`);
    need(new Set(r.map(answerOf)).size >= 2, `round ${i}: the answer is always in one place`);
    for (const t of r) {
      need(distinct(t.options), `round ${i} ${t.target}: a planet twice`);
      need(!t.options.includes(t.target), `round ${i} ${t.target}: the target is a planet`);
      need(
        t.options.filter((o) => rhymes(o, t.target)).length === 1,
        `round ${i} ${t.target}: not exactly one rhyme`
      );
      pairs.push([t.target, t.options[answerOf(t)]].sort().join("-"));
    }
  });
  need(distinct(pairs), "a rhyme pair comes twice");
  return problems;
}
