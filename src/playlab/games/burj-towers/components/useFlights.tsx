"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import type { RootPoint } from "@shared/utils/pointer";

/** How long a dropped piece takes to settle in, or to glide home. */
export const SNAP_MS = 240;
export const BACK_MS = 280;

interface Flight<T> {
  id: number;
  item: T;
  /** Start point and travel, stage pixels. */
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** Size at the start and at the end. */
  s0: number;
  s1: number;
  ms: number;
}

/**
 * WHAT A DROPPED PIECE DOES NEXT — it glides from where the finger let go to
 * where it belongs (its place, or back home), and `land` runs when it gets
 * there. Count & Match's drag (`useMatchDrag`) does the same with its
 * numerals: landing is on the CLOCK, never on the animation's own callback,
 * and the piece in its place is drawn in the same render that removes the
 * gliding one, so nothing blinks.
 */
export function useFlights<T>() {
  const [flights, setFlights] = useState<readonly Flight<T>[]>([]);
  const next = useRef(0);
  const schedule = useScheduler();

  const fly = useCallback(
    (
      item: T,
      from: RootPoint,
      to: RootPoint,
      { ms, s0 = 1, s1 = 1, land }: { ms: number; s0?: number; s1?: number; land?: () => void }
    ) => {
      const f: Flight<T> = {
        id: ++next.current,
        item,
        x: from.x,
        y: from.y,
        dx: to.x - from.x,
        dy: to.y - from.y,
        s0,
        s1,
        ms,
      };
      setFlights((all) => [...all, f]);
      schedule(() => {
        setFlights((all) => all.filter((x) => x.id !== f.id));
        land?.();
      }, ms);
    },
    [schedule]
  );

  /** The gliding pieces, for the stage's overlay. `render` draws one. */
  const layer = (render: (item: T) => ReactNode) =>
    flights.map((f) => (
      <motion.div
        key={f.id}
        className="ng-flight pl-at"
        style={cssVars({ "--pl-x": `${f.x}px`, "--pl-y": `${f.y}px` })}
        initial={{ x: 0, y: 0, scale: f.s0 }}
        animate={{ x: f.dx, y: f.dy, scale: f.s1 }}
        transition={{ duration: f.ms / 1000, ease: "easeOut" }}
        aria-hidden="true"
      >
        {render(f.item)}
      </motion.div>
    ));

  const flying = (match: (item: T) => boolean) => flights.some((f) => match(f.item));

  return { fly, layer, flying, busy: flights.length > 0 };
}
