"use client";

import { memo } from "react";
import { FigureSvg } from "@games/tangram-town/components/TangramArt";
import { ALL_PLACED, FIGURES } from "@games/tangram-town/constants/tangram";

/**
 * The art studio: a wall papered with faint tangram shapes, a desk along the
 * bottom, and — where there is wall to see them (the picker, the finale) — a
 * pinboard of tangram drawings and a shelf. All still, and memoised: nothing
 * a puzzle does can change it.
 */
export const Studio = memo(function Studio({ roomy = false }: { roomy?: boolean }) {
  return (
    <div className="tt-world" aria-hidden="true">
      <div className="tt-wall" />
      {roomy && (
        <>
          <div className="tt-pinboard">
            {FIGURES.slice(0, 3).map((f, i) => (
              <span key={f.id} className={`tt-pin-card tt-pin-card--${i}`}>
                <FigureSvg fig={f} filled={ALL_PLACED} guide="none" />
              </span>
            ))}
          </div>
          <div className="tt-shelf">
            <span className="tt-shelf-cup" />
            <span className="tt-shelf-pencil tt-shelf-pencil--a" />
            <span className="tt-shelf-pencil tt-shelf-pencil--b" />
            <span className="tt-shelf-pencil tt-shelf-pencil--c" />
            <span className="tt-shelf-book tt-shelf-book--a" />
            <span className="tt-shelf-book tt-shelf-book--b" />
          </div>
        </>
      )}
      <div className="tt-desk" />
    </div>
  );
});
