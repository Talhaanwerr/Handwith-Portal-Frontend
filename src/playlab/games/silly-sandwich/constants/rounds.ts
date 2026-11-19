/**
 * Silly Sandwich — hearing rhyme as cooking for a hungry monster. Munch the
 * monster stands behind the kitchen counter holding a slice of bread: "I want
 * something that rhymes with… cat!". Four round fillings wait on the tray —
 * two rhyme (hat, rat), two don't (sun, fish). Every rhyming one the child
 * drags onto the bread stays there and Munch munches; a filling that doesn't
 * rhyme gets a funny "yuck!" face and hops back to the tray. With both rhymes
 * on, the lid goes on and Munch takes a big bite.
 *
 * One sandwich a round, six rounds, one module. Two rhymes a sandwich needs
 * a family of three words; the word list (`rhyme-or-not/constants/words`) has
 * five (-at, -og, -ar, -en, -an), so the last round asks for -at again with
 * a different word and different leftovers.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "make";
export const MODULE_IDS: readonly ModuleId[] = ["make"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "make",
    name: "Silly Sandwich",
    tag: "Give the monster the fillings that rhyme",
    accent: "#F28C28",
    edge: "#C0661A",
    clip: "ssw-mode-make",
  },
];

export const VOICE: GameVoice = { welcome: "ssw-welcome", done: "ssw-done" };

/** "I want something that rhymes with" — the round's word follows. */
export const WANT = "ssw-want";
/** "Yum! One more!" — after a rhyme, while the sandwich still needs one. */
export const MORE = "ssw-more";
/** "Yuck! Silly!" — a filling that doesn't rhyme. */
export const YUCK = "ssw-yuck";
/** "Big bite! Chomp!" — the finished sandwich. */
export const BITE = "ssw-bite";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const SANDWICH_ROUNDS = 6;
/** Rhyming fillings a sandwich needs. */
export const NEEDED = 2;

export interface Order {
  /** The word Munch asks for. */
  target: Word;
  /** The tray, left to right: two rhyme with the target, two don't. */
  tray: readonly [Word, Word, Word, Word];
}

export const ROUNDS: readonly Order[] = [
  { target: "cat", tray: ["sun", "hat", "fish", "rat"] },
  { target: "dog", tray: ["frog", "ball", "log", "cup"] },
  { target: "star", tray: ["duck", "car", "bed", "jar"] },
  { target: "hen", tray: ["pen", "shoe", "apple", "ten"] },
  { target: "fan", tray: ["whale", "van", "bear", "can"] },
  { target: "rat", tray: ["lion", "cat", "cow", "hat"] },
];

/** The tray places that rhyme (derived, never stored twice). */
export const rhymesIn = (o: Order): number[] =>
  o.tray.flatMap((w, i) => (rhymes(w, o.target) ? [i] : []));

/** Self-check: six orders, two rhymes and two leftovers a tray, leftovers
 *  that rhyme with nothing on the tray, and the rhymes not always in the same
 *  places. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === SANDWICH_ROUNDS, `${ROUNDS.length} rounds`);
  need(ROUNDS.length >= ROUND_COUNT, "fewer rounds than the kit plays");
  ROUNDS.forEach((o, i) => {
    need(distinct(o.tray), `round ${i}: a filling twice`);
    need(!o.tray.includes(o.target), `round ${i}: the target is on the tray`);
    const hits = rhymesIn(o);
    need(hits.length === NEEDED, `round ${i}: ${hits.length} rhymes`);
    const rest = o.tray.filter((_, j) => !hits.includes(j));
    need(
      rest.every((a) => o.tray.every((b) => !rhymes(a, b))),
      `round ${i}: a leftover rhymes with something`
    );
  });
  need(new Set(ROUNDS.map((o) => rhymesIn(o).join())).size >= 3, "the rhymes sit in one place");
  return problems;
}
