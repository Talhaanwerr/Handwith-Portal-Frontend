/**
 * Number Train — every round, as data, and the check that proves it fair.
 *
 * Number order, 1 to 5, on a little train in the garden. Two modules of four
 * rounds, each ONE mechanic:
 *
 *   • "build"   — BUILD THE TRAIN. The engine waits with empty carriage
 *     places; the carriages wait shuffled in the yard. Drag (or tap) them on
 *     in order: only the NEXT number clicks on.
 *   • "missing" — MISSING CARRIAGE. A whole train with one gap; tap (or drag)
 *     the missing number from three choices.
 *
 * Answers are derived, never stored twice. The module plumbing is Count &
 * Match's, from `@games/number-groups/constants/kit`.
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

export type ModuleId = "build" | "missing";
export const MODULE_IDS: readonly ModuleId[] = ["build", "missing"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "build",
    name: "Build the Train",
    tag: "Drag in order",
    accent: "#E5484D",
    edge: "#B8363A",
    clip: "ntr-mode-build",
  },
  {
    id: "missing",
    name: "Missing Carriage",
    tag: "Find the gap",
    accent: "#2E7FD6",
    edge: "#1F5FA6",
    clip: "ntr-mode-missing",
  },
];

export const VOICE: GameVoice = { welcome: "ntr-welcome", done: "ntr-done" };

/** Each number's carriage paint. */
export const PAINT: Record<number, { face: string; edge: string }> = {
  1: { face: "#E5484D", edge: "#B8363A" },
  2: { face: "#F08A24", edge: "#C06A12" },
  3: { face: "#3DAB72", edge: "#2B8A57" },
  4: { face: "#2E7FD6", edge: "#1F5FA6" },
  5: { face: "#8E5BD9", edge: "#6B3FB3" },
};

/** 1, 2, … n — the train in order. */
export const trainOf = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

/* ── Build the Train ──────────────────────────────────────────────────────── */

/** How many carriages each round's train has. */
export const BUILD_ROUNDS: readonly number[] = [3, 4, 5, 5];

/** The yard: the carriages, shuffled, never in the answer order. */
export function buildYard(r: number): number[] {
  return shuffled(trainOf(BUILD_ROUNDS[r]), 41 + r);
}

/* ── Missing Carriage ─────────────────────────────────────────────────────── */

export interface MissingRound {
  /** How long the train is. */
  length: number;
  /** The missing number (its place is `missing - 1`). */
  missing: number;
  /** The three choices, left to right. */
  choices: readonly number[];
}

export const MISSING_ROUNDS: readonly MissingRound[] = [
  { length: 4, missing: 3, choices: [5, 3, 1] },
  { length: 5, missing: 2, choices: [2, 4, 5] },
  { length: 5, missing: 4, choices: [3, 1, 4] },
  { length: 3, missing: 1, choices: [4, 2, 1] },
];

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. */
export function checkRounds(): string[] {
  const { problems, need, covers, noRepeats, trayOk } = roundChecker();

  need(BUILD_ROUNDS.length === ROUND_COUNT, `build: ${BUILD_ROUNDS.length} rounds`);
  need(MISSING_ROUNDS.length === ROUND_COUNT, `missing: ${MISSING_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  let seen = new Set<number>();
  BUILD_ROUNDS.forEach((n, i) => {
    need(n >= 3 && n <= 5, `build ${i}: ${n} carriages`);
    need(i === 0 || n >= BUILD_ROUNDS[i - 1], `build ${i}: the train got shorter`);
    trainOf(n).forEach((v) => seen.add(v));
    trayOk(`build ${i}`, buildYard(i), trainOf(n));
  });
  covers("build", seen);
  noRepeats(
    "build",
    BUILD_ROUNDS.map((n, i) => buildYard(i).join())
  );

  seen = new Set();
  MISSING_ROUNDS.forEach((r, i) => {
    trainOf(r.length).forEach((v) => seen.add(v));
    need(r.length >= 3 && r.length <= 5, `missing ${i}: length ${r.length}`);
    need(r.missing >= 1 && r.missing <= r.length, `missing ${i}: the gap is off the train`);
    need(r.choices.length === 3, `missing ${i}: not three choices`);
    need(r.choices.every(inRange), `missing ${i}: a choice outside 1–5`);
    need(distinct(r.choices), `missing ${i}: a choice twice`);
    need(
      r.choices.filter((c) => c === r.missing).length === 1,
      `missing ${i}: the answer is not exactly one choice`
    );
  });
  covers("missing", seen);
  need(distinct(MISSING_ROUNDS.map((r) => r.missing)), "missing: the same gap twice");
  need(
    new Set(MISSING_ROUNDS.map((r) => r.choices.indexOf(r.missing))).size >= 3,
    "missing: the answer sits in the same place too often"
  );
  noRepeats(
    "missing",
    MISSING_ROUNDS.map((r) => `${r.length}-${r.missing}`)
  );

  return problems;
}
