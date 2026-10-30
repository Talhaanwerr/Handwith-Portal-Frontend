"use client";

import { memo } from "react";
import { SiteScene } from "@games/cvc-match/components/SiteScene";

/** Word Site's building site, calm: sky, clouds and dirt. Nothing moves. */
export const SiteWorld = memo(function SiteWorld() {
  return (
    <div className="srb-world" aria-hidden="true">
      <SiteScene calm />
    </div>
  );
});
