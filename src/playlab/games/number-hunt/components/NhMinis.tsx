"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { QuantityCard } from "@games/number-hunt/components/QuantityCard";
import type { ModuleId } from "@games/number-hunt/constants/rounds";

/**
 * Each Number Hunt module in miniature, for its card on the title screen and
 * the star card — built from the module's own pieces: a ball and a drum
 * wearing a 5, a dot card over the box numbered 4.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "find")
    return (
      <span className="ng-mini" aria-hidden="true">
        <span className="nh-mini-obj">
          <Picture id="ball" />
          <span className="nh-obj-tag font-rounded font-black">5</span>
        </span>
        <span className="nh-mini-obj nh-mini-obj--b">
          <Picture id="drum" />
          <span className="nh-obj-tag font-rounded font-black">5</span>
        </span>
      </span>
    );
  return (
    <span className="ng-mini" aria-hidden="true">
      <span className="nh-mini-qcard">
        <QuantityCard look="dots" count={4} />
      </span>
      <span className="nh-mini-bin font-rounded font-black">4</span>
    </span>
  );
}
