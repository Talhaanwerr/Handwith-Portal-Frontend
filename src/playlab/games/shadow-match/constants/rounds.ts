/**
 * Shadow Match Mystery — every round, as data, and the check that proves it fair.
 *
 *   • "find" — FIND THE SHADOW. One picture, big; three shadows below. Drag
 *     the picture onto its own shadow (or tap the shadow).
 *   • "size" — BIG OR SMALL. Two shadows of the same thing, one big, one small.
 *     "Tap the BIG shadow" / "…the SMALL shadow" — tap one.
 *
 * Answers are derived from the data, never stored twice.
 */

import type { PictureId } from "@games/blend-read/components/PictureArt";
import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "find" | "size";
export const MODULE_IDS: readonly ModuleId[] = ["find", "size"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "find",
    name: "Find the Shadow",
    tag: "Drag it to its shadow",
    accent: "#8E5BD9",
    edge: "#6A3FB0",
    clip: "shm-mode-find",
  },
  {
    id: "size",
    name: "Big or Small",
    tag: "Tap the big or small shadow",
    accent: "#3DAB72",
    edge: "#2B8A57",
    clip: "shm-mode-size",
  },
];

export const VOICE: GameVoice = { welcome: "shm-welcome", done: "shm-done" };

/** Pictures that have a recorded `name-<id>` clip. */
export const NAMED: ReadonlySet<PictureId> = new Set<PictureId>([
  "train",
  "apple",
  "lion",
  "shoe",
  "house",
  "snake",
  "bus",
  "whale",
  "cat",
  "frog",
  "hat",
]);

/* ── Find the Shadow ──────────────────────────────────────────────────────── */

export interface FindRound {
  /** The picture shown big. */
  target: PictureId;
  /** The three shadows, left to right — the target's among them once. */
  shadows: readonly PictureId[];
  /** The size of the target's own shadow (1 = same size as the others). */
  size: number;
}

export const FIND_ROUNDS: readonly FindRound[] = [
  { target: "train", shadows: ["house", "train", "cat"], size: 1 },
  { target: "apple", shadows: ["apple", "whale", "shoe"], size: 1 },
  { target: "lion", shadows: ["snake", "house", "lion"], size: 1 },
  { target: "shoe", shadows: ["frog", "shoe", "hat"], size: 0.7 },
];

export const findAnswer = (r: FindRound) => r.shadows.indexOf(r.target);

/* ── Big or Small ─────────────────────────────────────────────────────────── */

export type Ask = "big" | "small";

export interface SizeRound {
  picture: PictureId;
  ask: Ask;
  /** Which of the two shadows is the big one: 0 left, 1 right. */
  bigSide: 0 | 1;
  /** How big the small one is next to the big one (0.45–0.6). */
  smallScale: number;
}

export const SIZE_ROUNDS: readonly SizeRound[] = [
  { picture: "train", ask: "big", bigSide: 1, smallScale: 0.5 },
  { picture: "snake", ask: "small", bigSide: 0, smallScale: 0.5 },
  { picture: "bus", ask: "big", bigSide: 0, smallScale: 0.55 },
  { picture: "whale", ask: "small", bigSide: 1, smallScale: 0.55 },
];

/** The side to tap, derived. */
export const sizeAnswer = (r: SizeRound): 0 | 1 =>
  r.ask === "big" ? r.bigSide : r.bigSide === 0 ? 1 : 0;

/* ── The self-check ───────────────────────────────────────────────────────── */

export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();
  need(FIND_ROUNDS.length === ROUND_COUNT, `find: ${FIND_ROUNDS.length} rounds`);
  need(SIZE_ROUNDS.length === ROUND_COUNT, `size: ${SIZE_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  FIND_ROUNDS.forEach((r, i) => {
    need(r.shadows.length === 3, `find ${i}: not three shadows`);
    need(distinct(r.shadows), `find ${i}: the same shadow twice`);
    need(r.shadows.filter((s) => s === r.target).length === 1, `find ${i}: target not there once`);
    need(r.size >= 0.6 && r.size <= 1.2, `find ${i}: shadow size ${r.size} unfair`);
  });
  need(distinct(FIND_ROUNDS.map((r) => r.target)), "find: a target twice");
  need(new Set(FIND_ROUNDS.map(findAnswer)).size === 3, "find: the answer is not in every place");

  SIZE_ROUNDS.forEach((r, i) => {
    need(
      r.smallScale >= 0.4 && r.smallScale <= 0.6,
      `size ${i}: the small one is ${r.smallScale} — it must be clearly smaller`
    );
    need(i === 0 || r.ask !== SIZE_ROUNDS[i - 1].ask, `size ${i}: same ask as the round before`);
  });
  need(distinct(SIZE_ROUNDS.map((r) => r.picture)), "size: a picture twice");
  need(new Set(SIZE_ROUNDS.map(sizeAnswer)).size === 2, "size: the answer is always one side");
  noRepeats(
    "size",
    SIZE_ROUNDS.map((r) => r.picture + r.ask)
  );
  return problems;
}
