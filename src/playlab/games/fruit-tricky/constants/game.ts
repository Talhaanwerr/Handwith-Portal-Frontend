/**
 * Tricky Fruit Puzzles — Fruit Puzzles' "tricky" module as a game of its own:
 * all six fruits in four pieces, one a round. The cuts, rounds and lines all
 * live in @games/fruit-puzzles.
 */

import { moduleOf } from "@games/fruit-puzzles/constants/rounds";

export const TITLE = "Tricky Fruit Puzzles";
export const MODULES = [moduleOf("tricky")] as const;
/** Its own best stars, apart from the old two-module game's. */
export const STORE_KEY = "fruit-tricky-progress";
