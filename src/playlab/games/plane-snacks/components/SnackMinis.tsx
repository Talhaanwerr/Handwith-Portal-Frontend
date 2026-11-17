"use client";

import { Thing } from "@games/number-groups/components/SumParts";
import {
  SnackSeat,
  StillSnack,
  ThoughtBubble,
  Trolley,
} from "@games/plane-snacks/components/SnackParts";
import { BigWindow } from "@games/plane-snacks/components/WindowParts";
import type { ModuleId } from "@games/plane-snacks/constants/rounds";

/**
 * A module in miniature for its home card (sized in the card picture's own
 * cq units, see `.psn-mini`). Snack Trolley: a passenger thinking of juice
 * beside the trolley; Window Spy: the big window with a bird outside.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "snacks")
    return (
      <span className="psn-mini psn-mini--snacks" aria-hidden="true">
        <SnackSeat who="panda" happy={false}>
          <ThoughtBubble want="juice" />
        </SnackSeat>
        <span className="psn-mini-cart">
          <Trolley rolling={false}>
            <StillSnack id="apple" />
            <StillSnack id="juice" />
          </Trolley>
        </span>
      </span>
    );
  return (
    <span className="psn-mini psn-mini--window" aria-hidden="true">
      <BigWindow>
        <span className="psn-flight psn-flight--still">
          <span className="psn-flyer">
            <span className="psn-flyer-pic">
              <Thing id="bird" />
            </span>
          </span>
        </span>
      </BigWindow>
    </span>
  );
}
