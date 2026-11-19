/**
 * Magic Colours: Space — Magic Colours' "space" theme as a game of its own:
 * space vehicles among the stars: rocket, space shuttle, satellite, moon
 * buggy and flying saucer, one a round. The vehicles, rounds, worlds and lines all live in
 * @games/magic-colours.
 */

import { moduleOf, roundsOf } from "@games/magic-colours/constants/rounds";

export const TITLE = "Paint My Ride: Space";
export const MODULES = [moduleOf("space")] as const;
/** One vehicle a round, all of the theme's. */
export const ROUND_TOTAL = roundsOf("space");
/** Its own best stars. */
export const STORE_KEY = "colours-space-progress";
