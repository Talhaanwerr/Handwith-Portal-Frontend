/**
 * Drum Beats — adding by DOING, for three-year-olds.
 *
 * A big drum and a row of five empty dots. "Tap the drum two times!" — each
 * beat lights the next dot blue and says the count; after the second beat
 * the drum rests. "Now one more!" — it wakes, and the next beat lights a red
 * dot and says "three". The sum fills in: "2 + 1 = 3". The child adds their
 * own beats rather than things on a table, and can't over-tap: the drum
 * only takes as many beats as it asked for.
 *
 *   • "little" — LITTLE BEATS: totals up to 4.
 *   • "big"    — BIG BEATS: totals up to 5.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "little" | "big";
export const MODULE_IDS: readonly ModuleId[] = ["little", "big"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "little",
    name: "Little Beats",
    tag: "Up to 4",
    accent: "#2F8FCB",
    edge: "#1F6C9C",
    clip: "drb-mode-little",
  },
  {
    id: "big",
    name: "Big Beats",
    tag: "Up to 5",
    accent: "#E8574F",
    edge: "#B83A34",
    clip: "drb-mode-big",
  },
];

export const VOICE: GameVoice = { welcome: "drb-welcome", done: "brick-plus-all" };

/** The dots: five in a row, the most a round ever needs. */
export const DOTS = [0, 1, 2, 3, 4] as const;

export interface BeatRound {
  /** First beats (blue)… */
  a: number;
  /** …then this many more (red). */
  b: number;
}

export const ROUNDS: Readonly<Record<ModuleId, readonly BeatRound[]>> = {
  little: [
    { a: 1, b: 1 },
    { a: 2, b: 1 },
    { a: 1, b: 2 },
    { a: 2, b: 2 },
  ],
  big: [
    { a: 3, b: 1 },
    { a: 2, b: 3 },
    { a: 4, b: 1 },
    { a: 3, b: 2 },
  ],
};

/** "Tap the drum two times!" */
export const firstClip = (a: number) => `drb-tap-${a}`;
/** "Now one more!" / "Now two more!" (one more is Pond Numbers' line). */
export const moreClip = (b: number) => (b === 1 ? "pond-one-more" : `drb-more-${b}`);

/** Self-check: four rounds a module, five dots are enough, a line for every step. */
export function checkRounds(has: (id: string) => boolean): string[] {
  const { problems, need } = roundChecker();
  for (const id of MODULE_IDS) {
    const rs = ROUNDS[id];
    const max = id === "little" ? 4 : 5;
    need(rs.length === ROUND_COUNT, `${id}: ${rs.length} rounds`);
    need(distinct(rs.map((r) => `${r.a}+${r.b}`)), `${id}: a round repeats`);
    for (const r of rs) {
      need(r.a >= 1 && r.b >= 1 && r.a + r.b <= max, `${id}: ${r.a}+${r.b}`);
      need(has(firstClip(r.a)) && has(moreClip(r.b)), `${id}: a line is missing`);
    }
  }
  return problems;
}
