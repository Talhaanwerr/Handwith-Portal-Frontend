"use client";

import { useCallback, useState, useRef, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playPickUpSound, playSnapSound, playThudSound } from "@shared/audio/sfx";
import { centreIn } from "@games/number-groups/components/NgKit";

/** How long a piece takes to settle into its place, or to glide home. */
const SNAP_MS = 220;
const BACK_MS = 260;

/** Which piece sits in each place, or null for an empty one. */
export type Seats = readonly (number | null)[];

interface Flight {
  id: number;
  piece: number;
  /** Start point and travel, stage pixels. */
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** Size at the start and at the end (a place may be smaller than the tray). */
  s0: number;
  s1: number;
}

/**
 * A SET OF THE SAME THING, PUT IN PLACES ONE BY ONE — the drag of every
 * board in Birthday Party and Rocket Countdown: a cupcake onto each plate,
 * candles onto the cake, star cells into the fuel tank. The pieces are all
 * alike (ids 0…n-1, each with its own home in the tray), and the count is
 * what matters, not which piece went where.
 *
 * Built on the portal's `useDragDrop` (no render per finger move), like Count
 * & Match's `useMatchDrag`, and judged on the drop:
 *   • over a drop zone with room → it counts at once (snap; the round says
 *     the new count) while the piece settles into its place;
 *   • over a FULL zone → it glides home with a soft thud (`onBounce`);
 *   • on open ground → it glides home, silently. A tap is never a drop.
 * `remove(seat)` sends a placed piece back to its home in the tray.
 *
 * `seatFor(zone, seats)` says which place a drop on a zone fills: a plate is
 * its own zone with one place; a cake or a tank is one zone with many.
 */
export function useFillDrag({
  stageRef,
  seats,
  seatFor,
  locked,
  onPlaced,
  onBounce,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  /** How many places there are. */
  seats: number;
  seatFor: (zone: number, seats: Seats) => number | null;
  locked: boolean;
  /** A piece is in: its place, how many are in now, and the zone it went on. */
  onPlaced: (seat: number, count: number, zone: HTMLElement | undefined) => void;
  /** A piece was dropped on a zone with no room. */
  onBounce?: (zone: number) => void;
}) {
  const zones = useRef(new Map<number, HTMLElement>());
  const homes = useRef(new Map<number, HTMLElement>());
  const places = useRef(new Map<number, HTMLElement>());
  const [filled, setFilled] = useState<Seats>(() => Array.from({ length: seats }, () => null));
  /** The truth at once — drops are judged on it before React re-renders. */
  const filledRef = useRef<(number | null)[]>(Array.from({ length: seats }, () => null));
  const [flights, setFlights] = useState<readonly Flight[]>([]);
  const [slop, setSlop] = useState(20);
  const flightId = useRef(0);
  const schedule = useScheduler();

  const fly = useCallback(
    (
      piece: number,
      from: { x: number; y: number },
      to: Element | undefined,
      s0: number,
      s1: number
    ) => {
      const end = centreIn(stageRef.current, to);
      const f: Flight = {
        id: ++flightId.current,
        piece,
        x: from.x,
        y: from.y,
        dx: end.x - from.x,
        dy: end.y - from.y,
        s0,
        s1,
      };
      setFlights((all) => [...all, f]);
      // landing is on the CLOCK, never on the animation's own callback
      schedule(
        () => setFlights((all) => all.filter((x) => x.id !== f.id)),
        s1 === 1 ? BACK_MS : SNAP_MS
      );
    },
    [schedule, stageRef]
  );

  /** How much smaller (or bigger) a piece is in a place than in the tray. */
  const scaleIn = useCallback((seat: number, piece: number) => {
    const home = homes.current.get(piece)?.getBoundingClientRect().width ?? 0;
    const place = places.current.get(seat)?.getBoundingClientRect().width ?? 0;
    return home > 0 && place > 0 ? Math.min(1.6, Math.max(0.4, place / home)) : 1;
  }, []);

  const commit = useCallback(() => setFilled([...filledRef.current]), []);

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: stageRef,
    targets: zones,
    slopPx: slop,
    onDrop: (piece, zone, info) => {
      if (!info.moved) return;
      if (zone !== null) {
        const seat = seatFor(zone, filledRef.current);
        if (seat !== null && filledRef.current[seat] === null) {
          filledRef.current[seat] = piece;
          commit();
          fly(piece, info, places.current.get(seat), 1, scaleIn(seat, piece));
          playSnapSound();
          const count = filledRef.current.filter((p) => p !== null).length;
          onPlaced(seat, count, zones.current.get(zone));
          return;
        }
        playThudSound();
        onBounce?.(zone);
      }
      fly(piece, info, homes.current.get(piece), 1, 1);
    },
  });

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, piece: number) => {
      if (locked) return;
      const home = homes.current.get(piece);
      if (home) {
        const r = home.getBoundingClientRect();
        setSlop(Math.round(Math.min(r.width, r.height) * 0.3));
      }
      if (start(e, piece)) playPickUpSound();
    },
    [locked, start]
  );

  /** Take the piece out of a place and send it home. */
  const remove = useCallback(
    (seat: number) => {
      const piece = filledRef.current[seat];
      if (piece === null || piece === undefined) return;
      const from = centreIn(stageRef.current, places.current.get(seat));
      const s0 = scaleIn(seat, piece);
      filledRef.current[seat] = null;
      commit();
      fly(piece, from, homes.current.get(piece), s0, 1);
      playPickUpSound();
    },
    [commit, fly, scaleIn, stageRef]
  );

  const registerZone = useCallback((k: number, el: HTMLElement | null) => {
    if (el) zones.current.set(k, el);
    else zones.current.delete(k);
  }, []);
  const registerSeat = useCallback((k: number, el: HTMLElement | null) => {
    if (el) places.current.set(k, el);
    else places.current.delete(k);
  }, []);
  const registerHome = useCallback((p: number, el: HTMLElement | null) => {
    if (el) homes.current.set(p, el);
    else homes.current.delete(p);
  }, []);

  const flying = (piece: number) => flights.some((f) => f.piece === piece);
  /** A piece is out of the tray while it is carried, flying, or placed. */
  const away = (piece: number) => dragging === piece || flying(piece) || filled.includes(piece);
  /** A place shows its piece once the piece has landed there. */
  const shows = (seat: number) => {
    const p = filled[seat];
    return p !== null && p !== undefined && !flying(p);
  };
  const count = filled.filter((p) => p !== null).length;

  /** The carried piece and the flying pieces, drawn in the stage's overlay.
   *  `render` draws a piece by its id; `pieceClass` sizes it as in the tray. */
  const layer = (render: (piece: number) => ReactNode, pieceClass: string) => (
    <>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="ng-flight pl-at"
          style={cssVars({ "--pl-x": `${f.x}px`, "--pl-y": `${f.y}px` })}
          initial={{ x: 0, y: 0, scale: f.s0 }}
          animate={{ x: f.dx, y: f.dy, scale: f.s1 }}
          transition={{ duration: (f.s1 === 1 ? BACK_MS : SNAP_MS) / 1000, ease: "easeOut" }}
          aria-hidden="true"
        >
          <span className={`bdc-carried ${pieceClass}`}>{render(f.piece)}</span>
        </motion.div>
      ))}
      {dragging !== null && (
        <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
          <span className={`bdc-carried bdc-carried--lifted ${pieceClass}`}>
            {render(dragging)}
          </span>
        </div>
      )}
    </>
  );

  /** Elements the idle hand is measured against. */
  const homeEl = useCallback((p: number) => homes.current.get(p), []);
  const zoneEl = useCallback((k: number) => zones.current.get(k), []);
  const seatEl = useCallback((k: number) => places.current.get(k), []);

  return {
    filled,
    count,
    over,
    dragging,
    /** Something is carried or still flying — the board is not waiting. */
    busy: dragging !== null || flights.length > 0,
    pickUp,
    remove,
    registerZone,
    registerSeat,
    registerHome,
    away,
    shows,
    layer,
    homeEl,
    zoneEl,
    seatEl,
  };
}
