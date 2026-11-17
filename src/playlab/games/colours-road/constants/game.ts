/**
 * Magic Colours: On the Road — Magic Colours' "road" theme as a game of its own:
 * a town street of everyday vehicles: car, bus, taxi, school bus,
 * ice cream van and scooter, one a round. The vehicles, rounds, worlds and lines all live in
 * @games/magic-colours.
 */

import { moduleOf, roundsOf } from "@games/magic-colours/constants/rounds";

export const TITLE = "Paint My Ride: On the Road";
export const MODULES = [moduleOf("road")] as const;
/** One vehicle a round, all of the theme's. */
export const ROUND_TOTAL = roundsOf("road");
/** Its own best stars. */
export const STORE_KEY = "colours-road-progress";
