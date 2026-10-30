"use client";

import { Thing } from "@games/number-groups/components/SumParts";
import type { ModuleId } from "@games/drum-beats/constants/rounds";

/** A module in miniature for its home card: the drum and its row of dots. */
export function ModuleMini({ id }: { id: ModuleId }) {
  const [a, b] = id === "little" ? [1, 1] : [2, 3];
  return (
    <span className="drb-mini" aria-hidden="true">
      <span className="drb-mini-drum">
        <Thing id="drum" />
      </span>
      <span className="drb-mini-dots">
        {Array.from({ length: a + b }, (_, i) => (
          <span key={i} className={`drb-mini-dot ${i < a ? "drb-dot--blue" : "drb-dot--red"}`} />
        ))}
      </span>
    </span>
  );
}
