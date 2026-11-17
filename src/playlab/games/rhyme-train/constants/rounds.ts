/**
 * Rhyme Train Station — sort a whole platform of passengers by rhyme. A
 * train waits at the station; each carriage door shows a picture (moon,
 * car…). Passengers stand on the platform, each holding a picture card
 * (spoon, star, jar). The child drags every passenger into the carriage
 * whose picture rhymes with theirs; when everyone is sitting at a window
 * the train toots and drives away, and the next one pulls in.
 *
 * Two carriages in rounds 1–3, three in rounds 4–6. Six rounds, one module.
 * Every word is Rhyme Time's (`rhyme-or-not/constants/words`): each has a
 * picture and a recording.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { checkWords, rhymes, type Word } from "@games/rhyme-or-not/constants/words";

export type ModuleId = "train";
export const MODULE_IDS: readonly ModuleId[] = ["train"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "train",
    name: "Rhyme Train Station",
    tag: "Put each passenger in the carriage that rhymes",
    accent: "#E2553F",
    edge: "#B23A28",
    clip: "rtr-mode-train",
  },
];

export const VOICE: GameVoice = { welcome: "rtr-welcome", done: "rtr-done" };

/** "Who rides in which carriage?" — after the train and the passengers. */
export const WHO = "rtr-who";
/** "Toot toot! Off we go!" — everyone is aboard. */
export const TOOT = "rtr-toot";

/** Rounds a run: the game hands it to its store and to NgShell (`roundCount`). */
export const TRAIN_ROUNDS = 6;

/** A window holds this many passengers per carriage. */
export const SEATS = 2;

export interface TrainRound {
  /** The carriages, front (by the engine) to back, by the picture on their door. */
  cars: readonly Word[];
  /** The passengers on the platform, left to right. */
  riders: readonly Word[];
}

export const ROUNDS: readonly TrainRound[] = [
  { cars: ["moon", "car"], riders: ["star", "spoon", "jar"] },
  { cars: ["cake", "hen"], riders: ["pen", "snake", "ten"] },
  { cars: ["van", "box"], riders: ["fox", "fan", "can"] },
  { cars: ["cat", "tree", "drum"], riders: ["key", "thumb", "rat", "hat"] },
  { cars: ["dog", "train", "nest"], riders: ["vest", "frog", "rain", "log"] },
  { cars: ["hen", "house", "cap"], riders: ["mouse", "map", "ten", "pen"] },
];

/** The carriage a passenger rides in (derived, never stored twice). */
export const carOf = (r: TrainRound, w: Word): number => r.cars.findIndex((c) => rhymes(c, w));

/** The carriages' paint, front to back. */
export const PAINT = ["#2FA3A0", "#F0A223", "#7B4FD6"] as const;

/** Self-check: two then three carriages of different families; every
 *  passenger rides in exactly one carriage and is never a carriage's own
 *  word; each carriage gets someone and has room for all of them; the first
 *  passenger is not always for the front carriage. */
export function checkRounds(): string[] {
  const { problems, need } = roundChecker();
  problems.push(...checkWords());
  need(ROUNDS.length === TRAIN_ROUNDS, `${ROUNDS.length} rounds`);
  need(ROUNDS.length >= ROUND_COUNT, "fewer rounds than the kit plays");
  const firsts: number[] = [];
  ROUNDS.forEach((r, i) => {
    need(r.cars.length === (i < 3 ? 2 : 3), `round ${i}: ${r.cars.length} carriages`);
    need(distinct(r.cars), `round ${i}: a carriage twice`);
    need(distinct(r.riders), `round ${i}: a passenger twice`);
    for (let a = 0; a < r.cars.length; a++)
      for (let b = a + 1; b < r.cars.length; b++)
        need(!rhymes(r.cars[a], r.cars[b]), `round ${i}: two carriages rhyme`);
    for (const w of r.riders) {
      need(!r.cars.includes(w), `round ${i}: ${w} is a carriage's own word`);
      need(
        r.cars.filter((c) => rhymes(c, w)).length === 1,
        `round ${i}: ${w} fits not one carriage`
      );
    }
    r.cars.forEach((c, k) => {
      const n = r.riders.filter((w) => carOf(r, w) === k).length;
      need(n >= 1, `round ${i}: nobody for ${c}`);
      need(n <= SEATS, `round ${i}: too many for ${c}`);
    });
    need(r.riders.length >= 3 && r.riders.length <= 4, `round ${i}: ${r.riders.length} passengers`);
    firsts.push(carOf(r, r.riders[0]));
  });
  need(new Set(firsts).size >= 2, "the first passenger always rides up front");
  return problems;
}
