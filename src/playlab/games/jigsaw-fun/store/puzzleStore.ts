"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asRecord, numberMap } from "@shared/utils/persisted";
import { LEVELS, bestKey, type Level } from "@games/jigsaw-fun/constants/levels";

/** home (the pictures) → level (how hard) → play (one puzzle) → complete. */
export type PuzzleScreen = "home" | "level" | "play" | "complete";

export interface PuzzleState<M extends string> {
  screen: PuzzleScreen;
  module: M | null;
  level: Level;
  misses: number;
  /** Best stars per picture AND level, keyed by `bestKey` — the only thing
   *  kept between visits. */
  best: Partial<Record<string, number>>;

  setScreen: (s: PuzzleScreen) => void;
  toHome: () => void;
  /** A picture was picked: ask how hard. */
  choose: (m: M) => void;
  /** Play the chosen picture at `level` — a fresh puzzle, no misses yet. */
  play: (level: Level) => void;
  miss: () => void;
  /** That puzzle is done: keep its stars if they beat the best, show the card.
   *  Only while that very puzzle is on screen — a finished board's delayed
   *  call must not pull a child who already went Back onto a star card. */
  finish: (module: M, level: Level) => void;
}

/**
 * The puzzle games' store (Jigsaw Fun and Tangram Town differ only in their
 * pictures and their star rule). Persisted: the best stars, nothing else.
 *
 * Before levels existed (Sept 2026) a picture was ONE run through every cut —
 * `best: { lion: 2 }`. `legacy` names the levels that run played; its stars
 * are carried to each of them. That is never generous: the old stars counted
 * the misses of the whole run, and one level's misses can only be fewer.
 */
export function createPuzzleStore<M extends string>({
  name,
  modules,
  starsFor,
  legacy,
}: {
  name: string;
  modules: readonly M[];
  starsFor: (misses: number) => number;
  legacy: readonly Level[];
}) {
  const keys = new Set(modules.flatMap((m) => LEVELS.map((l) => bestKey(m, l))));
  return create<PuzzleState<M>>()(
    persist(
      (set) => ({
        screen: "home",
        module: null,
        level: "easy",
        misses: 0,
        best: {},

        setScreen: (screen) => set({ screen }),
        toHome: () => set({ screen: "home", misses: 0 }),
        choose: (module) => set({ module, screen: "level" }),
        play: (level) => set({ level, misses: 0, screen: "play" }),
        miss: () => set((s) => ({ misses: s.misses + 1 })),
        finish: (module, level) =>
          set((s) => {
            if (s.screen !== "play" || s.module !== module || s.level !== level) return {};
            const key = bestKey(module, level);
            const stars = Math.max(s.best[key] ?? 0, starsFor(s.misses));
            return { screen: "complete", best: { ...s.best, [key]: stars } };
          }),
      }),
      {
        name,
        partialize: (s) => ({ best: s.best }),
        // GAME_DEV: validate what comes back — only known picture/level
        // keys, 1–3 stars; an old per-picture best fills its levels in.
        merge: (persisted, current) => {
          const saved = asRecord(persisted)?.best;
          const best: Partial<Record<string, number>> = numberMap(saved, (k) => keys.has(k), 1, 3);
          const old = numberMap(saved, modules, 1, 3);
          for (const m of modules) {
            const stars = old[m];
            if (stars === undefined) continue;
            for (const l of legacy) best[bestKey(m, l)] = Math.max(best[bestKey(m, l)] ?? 0, stars);
          }
          return { ...current, best };
        },
      }
    )
  );
}

/** A picture's best stars at any level — what its card on the picker shows. */
export function bestOf(best: Partial<Record<string, number>>, module: string): number {
  return Math.max(0, ...LEVELS.map((l) => best[bestKey(module, l)] ?? 0));
}
