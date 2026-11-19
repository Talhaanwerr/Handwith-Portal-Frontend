"use client";

import { useMemo } from "react";
import { FruitMiniSvg } from "@games/fruit-puzzles/components/FruitArt";
import { ROUNDS, piecesOf, type ModuleId } from "@games/fruit-puzzles/constants/rounds";

/** A module in miniature for its home card and the star card: its first
 *  fruit on a plate, in its pieces, pulled a little apart. */
export function ModuleMini({ id }: { id: ModuleId }) {
  const r = ROUNDS[id][0];
  const pieces = useMemo(() => piecesOf(r.rays), [r.rays]);
  return (
    <span className="frp-mini" aria-hidden="true">
      <FruitMiniSvg fruit={r.fruit} pieces={pieces} />
    </span>
  );
}
