"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { PlateArt } from "@games/sesame-activities/components/SesameArt";
import { CakeArt, Candle, GuestHead } from "@games/birthday-party/components/PartyArt";
import type { ModuleId } from "@games/birthday-party/constants/rounds";

/**
 * Each module in miniature, for its home card and the star card, built from
 * the module's own pieces: two friends in party hats with a cupcake on each
 * plate (One for Each), and the cake with three lit candles (Candles on the
 * Cake).
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "each")
    return (
      <span className="ng-mini bdc-mini" aria-hidden="true">
        {(["bear", "cat"] as const).map((g, i) => (
          <span key={g} className={`bdc-mini-seat bdc-mini-seat--${i}`}>
            <span className="bdc-mini-head">
              <GuestHead who={g} paint={i} />
            </span>
            <span className="bdc-mini-plate">
              <PlateArt />
            </span>
            <span className="bdc-mini-cupcake">
              <Picture id="cupcake" />
            </span>
          </span>
        ))}
      </span>
    );
  return (
    <span className="ng-mini bdc-mini" aria-hidden="true">
      <span className="bdc-mini-cake">
        <span className="bdc-mini-candles">
          {[0, 1, 2].map((k) => (
            <span key={k} className="bdc-mini-candle">
              <Candle paint={k} lit blown={false} />
            </span>
          ))}
        </span>
        <CakeArt />
      </span>
    </span>
  );
}
