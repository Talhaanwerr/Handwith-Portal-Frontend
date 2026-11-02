"use client";

import { memo } from "react";
import { CandyScene } from "@games/letter-treats/components/CandyScene";

/**
 * BIRTHDAY PARTY'S WORLD — Letter Treats' Candy Land, reused as it is: the
 * candy sky (`lt-wash`), rainbow, clouds, the castle on the hills and the
 * two big framing sweet trees (the `soft` density, so the party table is the
 * only busy thing). Its `CandyDefs` also paint the animal guests. Behind the
 * title screen, the star card and every round.
 */
export const PartyWorld = memo(function PartyWorld() {
  return (
    <div className="bdc-world lt-wash" aria-hidden="true">
      <CandyScene variant="soft" />
    </div>
  );
});

/** The party table the guests sit behind: a wooden top and a frilled cloth.
 *  It spans the whole row; the plates stand on it. */
export const PartyTable = memo(function PartyTable() {
  return (
    <span className="bdc-table" aria-hidden="true">
      <span className="bdc-table-top" />
      <span className="bdc-table-cloth" />
    </span>
  );
});
