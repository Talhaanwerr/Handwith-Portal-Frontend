/**
 * Magic Colours: Sky — Magic Colours' "sky" theme as a game of its own:
 * things that fly: aeroplane, helicopter, biplane, hot-air balloon and
 * airship, one a round. The vehicles, rounds, worlds and lines all live in
 * @games/magic-colours.
 */

import { moduleOf, roundsOf } from "@games/magic-colours/constants/rounds";

export const TITLE = "Paint My Ride: Sky";
export const MODULES = [moduleOf("sky")] as const;
/** One vehicle a round, all of the theme's. */
export const ROUND_TOTAL = roundsOf("sky");
/** Its own best stars. */
export const STORE_KEY = "colours-sky-progress";
