"use client";

import { Robot, ScreenDots, SparePart } from "@games/silly-robot/components/RobotArt";
import type { ModuleId } from "@games/silly-robot/constants/rounds";

/**
 * Each module in miniature, for its home card and the star card: the robot
 * missing an arm with the matching spare beside it; the robot's tummy and
 * the numeral it shows.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "fix")
    return (
      <span className="ng-mini srb-mini" aria-hidden="true">
        <span className="srb-mini-robot">
          <Robot missing="arm-l" belly={<ScreenDots count={2} />} />
        </span>
        <span className="srb-mini-spare">
          <SparePart id="arm-l" count={2} />
        </span>
      </span>
    );
  return (
    <span className="ng-mini srb-mini" aria-hidden="true">
      <span className="srb-mini-robot">
        <Robot belly={<ScreenDots count={3} />} />
      </span>
      <span className="srb-mini-num font-rounded font-black">3</span>
    </span>
  );
}
