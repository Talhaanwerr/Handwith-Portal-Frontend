/**
 * Magic Colours: Emergency — Magic Colours' "emergency" theme as a game of its own:
 * emergency vehicles in their real colours: fire engine, police car,
 * ambulance, rescue helicopter, lifeboat and tow truck, one a round. The vehicles, rounds, worlds and lines all live in
 * @games/magic-colours.
 */

import { moduleOf, roundsOf } from "@games/magic-colours/constants/rounds";

export const TITLE = "Paint My Ride: Emergency";
export const MODULES = [moduleOf("emergency")] as const;
/** One vehicle a round, all of the theme's. */
export const ROUND_TOTAL = roundsOf("emergency");
/** Its own best stars. */
export const STORE_KEY = "colours-emergency-progress";
