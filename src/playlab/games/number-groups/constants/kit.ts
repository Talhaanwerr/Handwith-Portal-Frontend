/**
 * What Count & Match and Number Hunt share about their modules: how a module
 * is described on its home card, how many rounds it has, how a finished run
 * is scored, the tray shuffle, and the helpers each game's `checkRounds()`
 * is written with. Number Hunt imports all of it from here.
 */

import { unit } from "@shared/utils/hash";

export interface ModuleInfo<Id extends string = string> {
  id: Id;
  name: string;
  /** What the child does — read out to screen readers on the home card. */
  tag: string;
  /** The card's frame colour and its darker edge. */
  accent: string;
  edge: string;
  /** The clip said when its home card is tapped (the module's name and what to do). */
  clip: string;
}

/** A game's own lines around its modules: said on its title screen (before
 *  "Pick one!") and on its star card (after the cheer). Clip ids. */
export interface GameVoice {
  welcome: string;
  done: string;
}

/** Four rounds in every module of both games. */
export const ROUND_COUNT = 4;
const NUMBERS = [1, 2, 3, 4, 5] as const;

/** Stars for a finished module: no misses is three, a few is two, else one. */
export function starsFor(misses: number): number {
  if (misses === 0) return 3;
  if (misses <= 3) return 2;
  return 1;
}

/**
 * The loose pieces of a drag round, in a deterministic shuffle of `items`
 * that never matches the order of the targets above them (a child must look,
 * not just drag straight down).
 */
export function shuffled(items: readonly number[], seed: number): number[] {
  const out = [...items].sort((a, b) => unit(seed * 31 + a) - unit(seed * 31 + b));
  if (out.every((v, i) => v === items[i])) out.push(out.shift() as number);
  return out;
}

export const inRange = (n: number) => Number.isInteger(n) && n >= 1 && n <= 5;
export const distinct = <T>(xs: readonly T[]) => new Set(xs).size === xs.length;

/**
 * The bookkeeping of a `checkRounds()`: `need(ok, msg)` records a problem,
 * `covers` insists every number 1–5 is played somewhere in a module,
 * `noRepeats` that no two rounds are the same, and `trayOk` that a drag
 * round's tray holds exactly the targets' numbers in a different order.
 */
export function roundChecker() {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };
  return {
    problems,
    need,
    covers(name: string, seen: ReadonlySet<number>) {
      for (const n of NUMBERS) need(seen.has(n), `${name}: ${n} never appears`);
    },
    noRepeats(name: string, keys: readonly string[]) {
      need(distinct(keys), `${name}: two rounds are identical`);
    },
    trayOk(name: string, tray: readonly number[], targets: readonly number[]) {
      const sorted = (xs: readonly number[]) => [...xs].sort().join();
      need(sorted(tray) === sorted(targets), `${name}: tray is not the targets' numbers`);
      need(tray.join() !== targets.join(), `${name}: tray in the same order as the targets`);
    },
  };
}
