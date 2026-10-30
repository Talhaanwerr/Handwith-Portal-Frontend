"use client";

import { memo } from "react";

/**
 * A plain, calm backdrop for the repair shop: one soft wall and a floor band.
 * Replaces the playroom with its patterned carpet; the shop's own props (the
 * bench, the parts rack) still sit on top of it as before.
 */
export const PlainWorld = memo(function PlainWorld() {
  return (
    <div className="arp-plain" aria-hidden="true">
      <div className="arp-plain-floor" />
    </div>
  );
});
