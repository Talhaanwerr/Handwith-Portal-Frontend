"use client";

import { memo, useEffect, useRef } from "react";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { TILE_MAX } from "@games/pond-numbers/constants/rounds";

/**
 * The answer row both modules share: tiles 1..TILE_MAX on the dock. The
 * right tile lights green; a wrong one is crossed out and can't be tapped
 * again (GAME_DEV's wrong-answer rule). `onPick` null = not answerable yet.
 */
export function NumberTiles({
  lit,
  wrong,
  onPick,
}: {
  lit: number | null;
  wrong: readonly number[];
  onPick: ((value: number) => void) | null;
}) {
  return (
    <div className="pn-tiles" role="group" aria-label="How many?">
      {Array.from({ length: TILE_MAX }, (_, k) => (
        <Tile
          key={k + 1}
          value={k + 1}
          lit={lit === k + 1}
          wrong={wrong.includes(k + 1)}
          onPick={onPick}
        />
      ))}
    </div>
  );
}

const Tile = memo(function Tile({
  value,
  lit,
  wrong,
  onPick,
}: {
  value: number;
  lit: boolean;
  wrong: boolean;
  onPick: ((value: number) => void) | null;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);

  const live = !!onPick && !wrong && !lit;
  return (
    <button
      ref={ref}
      type="button"
      className={`pn-tile font-rounded font-black ${lit ? "pn-tile--lit" : ""} ${
        wrong ? "pn-tile--wrong" : ""
      }`}
      disabled={!live}
      onClick={live ? () => onPick(value) : undefined}
      aria-label={`${value}`}
    >
      <span className="pn-tile-glyph">{value}</span>
      {wrong && (
        <span className="pn-tile-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
