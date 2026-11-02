"use client";

import { Thing } from "@games/number-groups/components/SumParts";
import { ItemPicture, LuggageTag, Snowflake, Suitcase } from "@games/plane-trip/components/TripArt";
import type { ModuleId } from "@games/plane-trip/constants/rounds";

/** A module in miniature for its home card. */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "bags")
    return (
      <span className="ptr-mini" aria-hidden="true">
        <span className="ptr-mini-tag">
          <LuggageTag bag={{ colour: "red", pattern: "hearts" }} />
        </span>
        <span className="ptr-mini-bag">
          <Suitcase bag={{ colour: "red", pattern: "hearts" }} />
        </span>
      </span>
    );
  return (
    <span className="ptr-mini" aria-hidden="true">
      <span className="ptr-mini-side ptr-mini-side--sunny">
        <span className="ptr-mini-pic">
          <Thing id="sun" />
        </span>
        <span className="ptr-mini-pic">
          <ItemPicture item="icecream" />
        </span>
      </span>
      <span className="ptr-mini-side ptr-mini-side--snowy">
        <span className="ptr-mini-pic">
          <Snowflake />
        </span>
        <span className="ptr-mini-pic">
          <ItemPicture item="mittens" />
        </span>
      </span>
    </span>
  );
}
