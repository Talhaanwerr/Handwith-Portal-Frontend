"use client";

import { PaxFigure, SeatBack, SeatFront, Ticket } from "@games/plane-seats/components/SeatParts";
import type { ModuleId, Passenger } from "@games/plane-seats/constants/rounds";

/** A seat drawn still (no button: the home card is the button). */
function MiniSeat({ n, who }: { n: number; who: Passenger }) {
  return (
    <span className="pls-seat pls-seat--mini">
      <SeatBack />
      <span className="pls-seat-num font-rounded font-black">{n}</span>
      <span className="pls-seat-spot">
        <span className="pls-pax pls-pax--seated">
          <PaxFigure who={who} />
        </span>
      </span>
      <SeatFront />
    </span>
  );
}

/** A module in miniature for its home card. */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "number")
    return (
      <span className="pls-mini pls-mini--number" aria-hidden="true">
        <MiniSeat n={3} who="bear" />
        <Ticket seat={3} used={false} />
      </span>
    );
  return (
    <span className="pls-mini pls-mini--sums" aria-hidden="true">
      <Ticket seat={3} sum={[2, 1]} used={false} />
    </span>
  );
}
