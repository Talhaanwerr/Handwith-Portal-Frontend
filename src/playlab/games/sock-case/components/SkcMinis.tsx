"use client";

import { GlassOver, SockArt } from "@games/sock-case/components/SockArt";
import type { ModuleId, Sock } from "@games/sock-case/constants/rounds";

const RED_STRIPES: Sock = { colour: "red", pattern: "stripes" };
const BLUE_STRIPES: Sock = { colour: "blue", pattern: "stripes" };
const RED_DOTS: Sock = { colour: "red", pattern: "dots" };

/**
 * Each module in miniature, for its home card and the star card — built from
 * the module's own pieces: a pair of red striped socks side by side on the
 * line; three socks on the line with the magnifying glass over the lonely one.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "pair")
    return (
      <span className="ng-mini skc-mini" aria-hidden="true">
        <span className="skc-mini-rope" />
        <span className="skc-mini-sock skc-mini-sock--a">
          <SockArt sock={RED_STRIPES} />
        </span>
        <span className="skc-mini-sock skc-mini-sock--b">
          <SockArt sock={RED_STRIPES} />
        </span>
      </span>
    );
  return (
    <span className="ng-mini skc-mini" aria-hidden="true">
      <span className="skc-mini-rope" />
      <span className="skc-mini-sock skc-mini-sock--l">
        <SockArt sock={BLUE_STRIPES} />
      </span>
      <span className="skc-mini-sock skc-mini-sock--m">
        <SockArt sock={RED_DOTS} />
      </span>
      <span className="skc-mini-sock skc-mini-sock--r">
        <SockArt sock={BLUE_STRIPES} />
      </span>
      <span className="skc-mini-glass">
        <GlassOver sock={RED_DOTS} />
      </span>
    </span>
  );
}
