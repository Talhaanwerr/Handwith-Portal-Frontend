"use client";

import { createContext, useContext } from "react";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";

/**
 * Whether the game asked NgShell for the GUIDED layout (`<NgShell guided>`):
 * the title screen, the board and the star card centred on the stage, the
 * instruction in the thin guide bar at the top (with the stars), the guide
 * small in the bottom-left corner, and the teaching hand showing each move
 * almost at once on the first round. NgStage, NgHome and NgComplete read it;
 * the layout itself is the `.ng-root--guided` block in number-groups.css.
 */
export const GuidedContext = createContext(false);

export const useGuided = (): boolean => useContext(GuidedContext);

/** How many rounds a run of this game has (NgShell's `roundCount`, the kit's
 *  four by default) — NgStage draws that many stars. */
export const RoundCountContext = createContext(ROUND_COUNT);

export const useRoundCount = (): number => useContext(RoundCountContext);
