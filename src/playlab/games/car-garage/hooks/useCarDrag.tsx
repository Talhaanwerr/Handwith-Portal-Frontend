"use client";

import { useCallback, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playPickUpSound, playThudSound } from "@shared/audio/sfx";
import { centreIn } from "@games/number-groups/components/NgKit";

/** How long a part takes to settle onto the car, or to glide home. */
const SNAP_MS = 240;
const BACK_MS = 260;

interface Flight<P> {
  id: number;
  piece: P;
  /** Start point and travel, stage pixels. */
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** The part grows (or shrinks) into its place on the car. */
  scale: number;
  /** The part's size in the tray, px. */
  w: number;
  h: number;
  home: boolean;
}

/** What the round says about a part let go over one of its targets. */
export type Verdict = { ok: true; seat: HTMLElement | null | undefined } | { ok: false };

/**
 * ONE FINGER, ONE CAR PART — the garage's drag, on the portal's `useDragDrop`
 * (no render per finger move; the carried part is moved by custom properties).
 * Unlike Count & Match's `useMatchDrag`, a target here takes a KIND of part
 * (any wheel fits any axle), so the round judges each drop itself:
 *
 *   • `judge(piece, target)` over a target: `{ ok: true, seat }` — the part
 *     settles into `seat` with a short ease-out (and is drawn ON the car once
 *     it lands: `flying(piece)` is true until then); `{ ok: false }` — a soft
 *     thud and it glides home (the round makes the miss);
 *   • let go over open ground → it glides home, silently.
 *
 * A tap is never a drop. A tap on a part may still place it — the round calls
 * `send(piece, seat)` — so a child who cannot drag yet is never stuck.
 */
export function useCarDrag<P extends string, T extends string>({
  stageRef,
  locked,
  isEligible,
  judge,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  locked: boolean;
  /** A target that can take a part right now (the step being built). */
  isEligible: (target: T) => boolean;
  judge: (piece: P, target: T) => Verdict;
}) {
  const targets = useRef(new Map<T, HTMLElement>());
  const homes = useRef(new Map<P, HTMLElement>());
  const [flights, setFlights] = useState<readonly Flight<P>[]>([]);
  const [held, setHeld] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [slop, setSlop] = useState(20);
  const flightId = useRef(0);
  const schedule = useScheduler();

  /** Glide a part from `from` (stage px) into `to`, or home. */
  const fly = useCallback(
    (
      piece: P,
      from: { x: number; y: number },
      to: HTMLElement | null | undefined,
      home: boolean
    ) => {
      const start = homes.current.get(piece);
      const r = start?.getBoundingClientRect();
      const end = centreIn(stageRef.current, to ?? start);
      const w = r?.width ?? 0;
      const h = r?.height ?? 0;
      const scale =
        !home && to && w > 0
          ? Math.min(2.6, Math.max(0.4, to.getBoundingClientRect().width / w))
          : 1;
      const f: Flight<P> = {
        id: ++flightId.current,
        piece,
        x: from.x,
        y: from.y,
        dx: end.x - from.x,
        dy: end.y - from.y,
        scale,
        w,
        h,
        home,
      };
      setFlights((all) => [...all, f]);
      // landing is on the CLOCK, never on the animation's own callback
      schedule(
        () => setFlights((all) => all.filter((x) => x.id !== f.id)),
        home ? BACK_MS : SNAP_MS
      );
    },
    [schedule, stageRef]
  );

  const { dragging, over, start, ghostRef, tookClick } = useDragDrop<P, T>({
    root: stageRef,
    targets,
    slopPx: slop,
    isEligible,
    onDrop: (piece, target, info) => {
      if (!info.moved) return;
      if (target !== null) {
        const v = judge(piece, target);
        if (v.ok) {
          fly(piece, info, v.seat ?? targets.current.get(target), false);
          return;
        }
        playThudSound();
      }
      fly(piece, info, homes.current.get(piece), true);
    },
  });

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, piece: P) => {
      if (locked) return;
      const home = homes.current.get(piece)?.getBoundingClientRect();
      if (home) {
        setHeld({ w: home.width, h: home.height });
        setSlop(Math.round(Math.max(14, Math.min(home.width, home.height) * 0.2)));
      }
      if (start(e, piece)) playPickUpSound();
    },
    [locked, start]
  );

  /** A tapped part flies from the tray to `seat` by itself. */
  const send = useCallback(
    (piece: P, seat: HTMLElement | null | undefined) => {
      const from = centreIn(stageRef.current, homes.current.get(piece));
      fly(piece, from, seat, false);
    },
    [fly, stageRef]
  );

  const registerTarget = useCallback((t: T, el: HTMLElement | null) => {
    if (el) targets.current.set(t, el);
    else targets.current.delete(t);
  }, []);
  const registerHome = useCallback((p: P, el: HTMLElement | null) => {
    if (el) homes.current.set(p, el);
    else homes.current.delete(p);
  }, []);
  const homeOf = useCallback((p: P) => homes.current.get(p) ?? null, []);
  const targetOf = useCallback((t: T) => targets.current.get(t) ?? null, []);

  /** On its way to the car (not drawn on the car yet). */
  const flying = (p: P) => flights.some((f) => f.piece === p && !f.home);
  /** Out of the tray: carried, or flying either way. */
  const away = (p: P) => dragging === p || flights.some((f) => f.piece === p);

  /** The carried part and the flying parts, in the stage's overlay. */
  const layer = (render: (piece: P) => ReactNode) => (
    <>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="bcg-flight pl-at"
          style={cssVars({ "--pl-x": `${f.x}px`, "--pl-y": `${f.y}px` })}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: f.dx, y: f.dy, scale: f.scale }}
          transition={{ duration: (f.home ? BACK_MS : SNAP_MS) / 1000, ease: "easeOut" }}
          aria-hidden="true"
        >
          <span
            className="bcg-carried"
            style={cssVars({ "--bcg-pw": `${f.w}px`, "--bcg-ph": `${f.h}px` })}
          >
            {render(f.piece)}
          </span>
        </motion.div>
      ))}
      {dragging !== null && (
        <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
          <span
            className="bcg-carried bcg-carried--lifted"
            style={cssVars({ "--bcg-pw": `${held.w}px`, "--bcg-ph": `${held.h}px` })}
          >
            {render(dragging)}
          </span>
        </div>
      )}
    </>
  );

  return {
    dragging,
    over,
    pickUp,
    send,
    tookClick,
    registerTarget,
    registerHome,
    homeOf,
    targetOf,
    flying,
    away,
    busy: dragging !== null || flights.length > 0,
    layer,
  };
}
