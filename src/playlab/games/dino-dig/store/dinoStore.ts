"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_CROSSINGS } from "@games/dino-dig/constants/rounds";

/** "case-select" — BIG or small letters, right after picking a mode.
 *  "stones-start" — River Crossing's own doorway: Start from A, and Continue
 *  only when a crossing is saved mid-way in the chosen case. Feed skips that
 *  screen because a feed session is 10 quick taps that always start fresh. */
export type DinoScreen = "splash" | "case-select" | "stones-start" | "play" | "complete";
export type DinoMode = "feed" | "stones";
export type LetterCase = "upper" | "lower";

interface DinoState {
  screen: DinoScreen;
  mode: DinoMode;
  /** Which case the child chose — display only; letters stay canonical
   *  UPPERCASE in every data structure and audio clip id. */
  letterCase: LetterCase;
  /** River Crossing progress PER CASE: crossings completed (0–7). Two fields
   *  because crossing the big-letter river is different learning from the
   *  small-letter one — finishing one must not consume the other. The
   *  uppercase field keeps its old name so saves from before the case choice
   *  carry straight over. */
  stonesRound: number;
  stonesRoundLower: number;
  /** The letters served in the just-finished feed session (finale tiles). */
  feedLetters: string[];
  setScreen: (s: DinoScreen) => void;
  /** Splash mode pick — the tap that also unlocks audio. Both modes go to
   *  the case choice next. */
  startMode: (m: DinoMode) => void;
  /** BIG/small chosen — feed starts playing, stones opens its doorway. */
  pickCase: (c: LetterCase) => void;
  /** River Crossing from the very beginning — crossing 1, letter A. */
  startStonesFresh: () => void;
  /** Resume the saved crossing. Only offered when one is saved mid-way. */
  continueStones: () => void;
  completeFeed: (letters: string[]) => void;
  /** One dino across; lands on "complete" when all seven have crossed. */
  crossingDone: () => void;
  playAgain: () => void;
}

export const useDinoStore = create<DinoState>()(
  persist(
    (set) => ({
      screen: "splash",
      mode: "feed",
      letterCase: "upper",
      stonesRound: 0,
      stonesRoundLower: 0,
      feedLetters: [],
      setScreen: (screen) => set({ screen }),
      startMode: (mode) => set({ mode, screen: "case-select" }),
      pickCase: (letterCase) =>
        set((s) => ({
          letterCase,
          screen: s.mode === "stones" ? "stones-start" : "play",
        })),
      startStonesFresh: () =>
        set((s) => ({
          mode: "stones",
          screen: "play",
          [s.letterCase === "lower" ? "stonesRoundLower" : "stonesRound"]: 0,
        })),
      continueStones: () =>
        set((s) => {
          const key = s.letterCase === "lower" ? "stonesRoundLower" : "stonesRound";
          // a finished river has nothing to continue — defensive reset in case
          // this is ever reached with stale state; the UI hides Continue then
          return { mode: "stones", screen: "play", [key]: s[key] >= TOTAL_CROSSINGS ? 0 : s[key] };
        }),
      completeFeed: (feedLetters) => set({ feedLetters, screen: "complete" }),
      crossingDone: () =>
        set((s) => {
          const key = s.letterCase === "lower" ? "stonesRoundLower" : "stonesRound";
          const next = s[key] + 1;
          return next >= TOTAL_CROSSINGS ? { [key]: next, screen: "complete" } : { [key]: next };
        }),
      playAgain: () =>
        set((s) => ({
          screen: "play",
          ...(s.mode === "stones"
            ? { [s.letterCase === "lower" ? "stonesRoundLower" : "stonesRound"]: 0 }
            : null),
        })),
    }),
    {
      name: "dino-dig-progress",
      // screen/mode are session flow; a stale `roundIndex` from the earlier
      // dig prototype may linger in storage and is simply ignored
      partialize: (s) => ({
        stonesRound: s.stonesRound,
        stonesRoundLower: s.stonesRoundLower,
        letterCase: s.letterCase,
      }),
    }
  )
);

/** The active case's crossing progress — read this rather than picking a
 *  field by hand (the same helper shape jungle-spy exposes for its cases). */
export function stonesRoundFor(
  state: Pick<DinoState, "stonesRound" | "stonesRoundLower">,
  c: LetterCase
): number {
  return c === "lower" ? state.stonesRoundLower : state.stonesRound;
}

/** Display form of a canonical letter for a case. Data stays uppercase. */
export function displayLetter(letter: string, c: LetterCase): string {
  return c === "lower" ? letter.toLowerCase() : letter.toUpperCase();
}
