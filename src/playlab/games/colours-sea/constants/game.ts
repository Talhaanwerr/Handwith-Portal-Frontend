/**
 * Magic Colours: Sea — Magic Colours' "sea" theme as a game of its own:
 * boats on the sea: sailboat, speedboat, fishing boat, submarine, ship
 * and ferry, one a round. The vehicles, rounds, worlds and lines all live in
 * @games/magic-colours.
 */

import { moduleOf, roundsOf } from "@games/magic-colours/constants/rounds";

export const TITLE = "Paint My Ride: Sea";
export const MODULES = [moduleOf("sea")] as const;
/** One vehicle a round, all of the theme's. */
export const ROUND_TOTAL = roundsOf("sea");
/** Its own best stars. */
export const STORE_KEY = "colours-sea-progress";
