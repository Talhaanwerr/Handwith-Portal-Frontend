"use client";

import { cssVars } from "@shared/styles/cssVars";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { EngineArt } from "@games/rhyme-train/components/TrainArt";
import { PAINT, type ModuleId } from "@games/rhyme-train/constants/rounds";

/** Rhyme Train Station in miniature for its home card: the engine and the car
 *  carriage, a star passenger at its window. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini rtr-mini" data-module={id} aria-hidden="true">
      <span className="rtr-train">
        <span className="rtr-engine">
          <EngineArt puff={false} />
        </span>
        <span className="rtr-car" style={cssVars({ "--rtr-paint": PAINT[0] })}>
          <span className="rtr-car-roof" />
          <span className="rtr-car-body">
            <span className="rtr-windows">
              <span className="rtr-window">
                <span className="rtr-sitter">
                  <span className="rtr-sitter-card">
                    <RhymePic word="star" />
                  </span>
                </span>
              </span>
              <span className="rtr-window" />
            </span>
            <span className="rtr-door">
              <span className="rtr-door-pic">
                <RhymePic word="car" />
              </span>
            </span>
          </span>
          <span className="rtr-wheels">
            <span className="rtr-wheel" />
            <span className="rtr-wheel" />
          </span>
        </span>
      </span>
    </span>
  );
}
