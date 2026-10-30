/**
 * Fix the Silly Robot — every round, as data, and the check that proves it fair.
 *
 * SUBITISING, 1 to 5: seeing how many at a glance, without counting. The dots
 * are always laid out as the face of a die (Pond Numbers' `DotFace`), the
 * pattern a four-year-old learns to read as a shape. Two modules of four
 * rounds, each ONE mechanic:
 *
 *   • "fix"  — FIX THE ROBOT. The robot's tummy screen shows N dots and one
 *     part is missing (its place outlined). Three spare parts lie on the
 *     ground, each holding a dot card; tap or drag the one whose dots match.
 *   • "peek" — QUICK LOOK. The tummy flashes N dots for two seconds and
 *     closes; tap the matching numeral. "Peek again" re-opens it for a second.
 *
 * Answers are DERIVED (the right choice is the one equal to `n`), never stored
 * twice, and `checkRounds()` proves every round is solvable and fair.
 */

import {
  ROUND_COUNT,
  distinct,
  inRange,
  roundChecker,
  shuffled,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "fix" | "peek";
export const MODULE_IDS: readonly ModuleId[] = ["fix", "peek"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "fix",
    name: "Fix the Robot",
    tag: "Find the same dots",
    accent: "#2E7FD6",
    edge: "#1F5FA6",
    clip: "srb-mode-fix",
  },
  {
    id: "peek",
    name: "Quick Look",
    tag: "Tap the number",
    accent: "#F08A24",
    edge: "#C06A12",
    clip: "srb-mode-peek",
  },
];

export const VOICE: GameVoice = { welcome: "srb-welcome", done: "srb-done" };

/** The robot's removable parts. The left leg never comes off. */
export type PartId = "arm-l" | "arm-r" | "leg-r" | "head";

/** The ask said for each kind of missing part. */
export const PART_ASK: Record<PartId, string> = {
  "arm-l": "srb-fix-arm",
  "arm-r": "srb-fix-arm",
  "leg-r": "srb-fix-leg",
  head: "srb-fix-head",
};

/** One round: the number on the tummy, and the two wrong numbers beside it. */
export interface DotsRound {
  /** The tummy's dots — the answer. */
  n: number;
  /** The two wrong choices. */
  others: readonly [number, number];
}

export interface FixRound extends DotsRound {
  /** The part that has fallen off. */
  part: PartId;
}

export const FIX_ROUNDS: readonly FixRound[] = [
  { n: 2, part: "arm-l", others: [4, 5] },
  { n: 3, part: "leg-r", others: [1, 5] },
  { n: 4, part: "head", others: [2, 5] },
  { n: 5, part: "arm-r", others: [1, 3] },
];

export const PEEK_ROUNDS: readonly DotsRound[] = [
  { n: 3, others: [1, 5] },
  { n: 1, others: [2, 4] },
  { n: 4, others: [2, 5] },
  { n: 5, others: [3, 1] },
];

/** The three choices, in a fixed shuffle (the answer not always first). */
export function choicesFor(r: DotsRound, seed: number): number[] {
  return shuffled([r.n, ...r.others], seed);
}
export const fixChoices = (round: number) => choicesFor(FIX_ROUNDS[round], 41 + round);
export const peekChoices = (round: number) => choicesFor(PEEK_ROUNDS[round], 67 + round);

/** The dot colours: the tummy screen's, and the spare parts' cards. */
export const DOT_SCREEN = "#7CF0C8";
export const DOT_CARD = "#2E7FD6";

/** How long the tummy stays open in Quick Look, and on "Peek again". */
export const FLASH_MS = 2000;
export const PEEK_MS = 1000;

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, covers, noRepeats } = roundChecker();
  need(FIX_ROUNDS.length === ROUND_COUNT, `fix: ${FIX_ROUNDS.length} rounds`);
  need(PEEK_ROUNDS.length === ROUND_COUNT, `peek: ${PEEK_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  const fair = (name: string, r: DotsRound, choices: readonly number[]) => {
    const all = [r.n, ...r.others];
    need(all.every(inRange), `${name}: a number outside 1–5`);
    need(distinct(all), `${name}: two choices with the same number`);
    need(choices.length === 3, `${name}: not three choices`);
    need(choices.filter((c) => c === r.n).length === 1, `${name}: not exactly one right choice`);
    // a four-year-old should not have to tell two near neighbours apart at once
    need(
      r.others.some((o) => Math.abs(o - r.n) >= 2),
      `${name}: both wrong choices are next to the answer`
    );
  };

  const seenFix = new Set<number>();
  FIX_ROUNDS.forEach((r, i) => {
    [r.n, ...r.others].forEach((v) => seenFix.add(v));
    fair(`fix ${i}`, r, fixChoices(i));
  });
  covers("fix", seenFix);
  need(distinct(FIX_ROUNDS.map((r) => r.part)), "fix: the same part falls off twice");
  noRepeats(
    "fix",
    FIX_ROUNDS.map((r) => String(r.n))
  );

  const seenPeek = new Set<number>();
  PEEK_ROUNDS.forEach((r, i) => {
    [r.n, ...r.others].forEach((v) => seenPeek.add(v));
    fair(`peek ${i}`, r, peekChoices(i));
  });
  covers("peek", seenPeek);
  noRepeats(
    "peek",
    PEEK_ROUNDS.map((r) => String(r.n))
  );
  need(FLASH_MS >= 1500 && PEEK_MS >= 800, "peek: the tummy is not open long enough");
  return problems;
}
