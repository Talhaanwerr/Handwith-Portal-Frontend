"use client";

import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import { FuelCell, NumberStar } from "@games/rocket-countdown/components/RocketParts";
import type { ModuleId } from "@games/rocket-countdown/constants/rounds";

const RocketArt = VOCAB_ART.rocket;

/**
 * Each module in miniature, for its home card and the star card: the rocket
 * beside the stars 3, 2, 1 (Count Down), and the rocket with its fuel window
 * beside a star cell (Fuel the Rocket).
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini rkc-mini" aria-hidden="true">
      <span className="rkc-mini-rocket">
        <RocketArt />
        {id === "fuel" && <span className="rkc-mini-window font-rounded font-black">3</span>}
      </span>
      {id === "count" ? (
        <span className="rkc-mini-stars">
          {[3, 2, 1].map((n) => (
            <span key={n} className="rkc-mini-star">
              <NumberStar n={n} />
            </span>
          ))}
        </span>
      ) : (
        <span className="rkc-mini-cells">
          {[0, 1, 2].map((k) => (
            <span key={k} className="rkc-mini-cell">
              <FuelCell />
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
