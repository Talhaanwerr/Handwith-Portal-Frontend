/**
 * Magic Colours: Construction — Magic Colours' "build" theme as a game of its own:
 * building-site machines in their real colours: digger, dump truck,
 * crane, cement mixer, bulldozer and road roller, one a round. The vehicles, rounds, worlds and lines all live in
 * @games/magic-colours.
 */

import { moduleOf, roundsOf } from "@games/magic-colours/constants/rounds";

export const TITLE = "Paint My Ride: Construction";
export const MODULES = [moduleOf("build")] as const;
/** One vehicle a round, all of the theme's. */
export const ROUND_TOTAL = roundsOf("build");
/** Its own best stars. */
export const STORE_KEY = "colours-build-progress";
