/**
 * Fruit Puzzles — Fruit Puzzles' "easy" module as a game of its own: all six
 * fruits in two or three big pieces, one a round. The cuts, rounds and lines
 * all live in @games/fruit-puzzles.
 */

import { moduleOf } from "@games/fruit-puzzles/constants/rounds";

export const TITLE = "Fruit Puzzles";
export const MODULES = [moduleOf("easy")] as const;
/** Its own best stars, apart from the old two-module game's. */
export const STORE_KEY = "fruit-easy-progress";
