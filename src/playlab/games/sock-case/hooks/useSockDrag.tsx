"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { playPickUpSound, playSnapSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import type { RootPoint } from "@shared/utils/pointer";
import { centreIn } from "@games/number-groups/components/NgKit";

/** How long a sock takes to settle onto its peg, or to glide home. */
const SNAP_MS = 240;
const BACK_MS = 260;

interface Flight {
  id: number;
  value: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  scale: number;
  /** Onto the peg (true), or back to the basket. */
  home: boolean;
}

/**
 * ONE SOCK ONTO ONE PEG — Find the Pair's drag (and its tap).
 *
 * Count & Match's `useMatchDrag`, cut down to one place and with the voice
 * left to the round (that hook says a number on every right drop, and a sock
 * has none). Built on the portal's `useDragDrop`, so nothing re-renders per
 * finger move:
 *   • the MATCHING sock dropped on the empty peg → it settles on the peg with
 *     a snap, at once;
 *   • another sock dropped on the peg → `onWrong`, and it glides back to the
 *     basket;
 *   • dropped on open ground → it glides back, silently. A tap is never a drop.
 * A TAP on a sock (`tap`) does the same as dropping it on the peg.
 *
 * After 7 s without a touch while the peg waits, the teaching hand
 * (`useIdleHand`) drags the matching sock to the peg.
 */
export function useSockDrag({
  stageRef,
  answer,
  locked,
  onRight,
  onWrong,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  /** The basket sock that belongs on the peg. */
  answer: number;
  locked: boolean;
  /** The match is on its way to the peg — the peg's element, for confetti. */
  onRight: (peg: HTMLElement | undefined) => void;
  /** A sock that does not match was put on the peg. */
  onWrong: (value: number) => void;
}) {
  const targets = useRef(new Map<number, HTMLElement>());
  const homes = useRef(new Map<number, HTMLElement>());
  const seat = useRef<HTMLElement | null>(null);
  const [placed, setPlaced] = useState(false);
  const [flights, setFlights] = useState<readonly Flight[]>([]);
  const [slop, setSlop] = useState(20);
  const flightId = useRef(0);
  /** The match was judged right — read at once by the drop and the tap. */
  const taken = useRef(false);
  const schedule = useScheduler();

  const fly = useCallback(
    (value: number, from: RootPoint, to: HTMLElement | null | undefined, onto: boolean) => {
      const end = centreIn(stageRef.current, to);
      const home = homes.current.get(value);
      const scale =
        onto && to && home
          ? Math.min(
              1.6,
              Math.max(0.6, to.getBoundingClientRect().width / home.getBoundingClientRect().width)
            )
          : 1;
      const f: Flight = {
        id: ++flightId.current,
        value,
        x: from.x,
        y: from.y,
        dx: end.x - from.x,
        dy: end.y - from.y,
        scale,
        home: !onto,
      };
      setFlights((all) => [...all, f]);
      // landing is on the CLOCK, never on the animation's own callback
      schedule(
        () => {
          setFlights((all) => all.filter((x) => x.id !== f.id));
          if (onto) setPlaced(true);
        },
        onto ? SNAP_MS : BACK_MS
      );
    },
    [schedule, stageRef]
  );

  /** The match goes onto the peg, from wherever it is now. */
  const take = useCallback(
    (value: number, from: RootPoint) => {
      taken.current = true;
      const peg = targets.current.get(0);
      fly(value, from, seat.current ?? peg, true);
      playSnapSound();
      onRight(peg);
    },
    [fly, onRight]
  );

  const { dragging, over, start, ghostRef, tookClick } = useDragDrop<number, number>({
    root: stageRef,
    targets,
    slopPx: slop,
    isEligible: () => !taken.current,
    onDrop: (value, target, info) => {
      if (!info.moved) return;
      if (target !== null && value === answer) {
        take(value, info);
        return;
      }
      if (target !== null) onWrong(value);
      fly(value, info, homes.current.get(value), false);
    },
  });

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, value: number) => {
      if (locked || taken.current) return;
      const peg = targets.current.get(0);
      if (peg) {
        const r = peg.getBoundingClientRect();
        setSlop(Math.round(Math.min(r.width, r.height) * 0.2));
      }
      if (start(e, value)) playPickUpSound();
    },
    [locked, start]
  );

  /** A tap on a sock (not the tail of a drag): the match flies to the peg,
   *  another sock is wrong. */
  const tap = useCallback(
    (value: number) => {
      if (tookClick() || locked || taken.current) return;
      if (value !== answer) {
        onWrong(value);
        return;
      }
      take(value, centreIn(stageRef.current, homes.current.get(value)));
    },
    [answer, locked, onWrong, stageRef, take, tookClick]
  );

  // ── the idle teaching hand: the match, dragged to the peg ──
  const waiting = !locked && !placed && dragging === null && flights.length === 0;
  const idle = useIdleHand(waiting, answer);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => {
      const from = homes.current.get(answer);
      const to = targets.current.get(0);
      if (!from || !to) return;
      const a = centreIn(stageRef.current, from);
      const b = centreIn(stageRef.current, to);
      setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    };
    void playClip("instr-watch-carefully");
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, answer, stageRef]);

  const registerPeg = useCallback((el: HTMLElement | null) => {
    if (el) targets.current.set(0, el);
    else targets.current.delete(0);
  }, []);
  const registerSeat = useCallback((el: HTMLElement | null) => {
    seat.current = el;
  }, []);
  const registerHome = useCallback((v: number, el: HTMLElement | null) => {
    if (el) homes.current.set(v, el);
    else homes.current.delete(v);
  }, []);

  /** A sock is out of the basket while it is carried, flying, or pegged. */
  const away = (value: number) =>
    dragging === value || flights.some((f) => f.value === value) || (placed && value === answer);

  /** The carried sock, the flying socks and the hand, in stage coordinates. */
  const layer = (render: (value: number) => ReactNode, pieceClass: string) => (
    <>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="ng-flight pl-at"
          style={cssVars({ "--pl-x": `${f.x}px`, "--pl-y": `${f.y}px` })}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: f.dx, y: f.dy, scale: f.scale }}
          transition={{ duration: (f.home ? BACK_MS : SNAP_MS) / 1000, ease: "easeOut" }}
          aria-hidden="true"
        >
          <span className={`ng-carried ${pieceClass}`}>{render(f.value)}</span>
        </motion.div>
      ))}
      {dragging !== null && (
        <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
          <span className={`ng-carried ng-carried--lifted ${pieceClass}`}>{render(dragging)}</span>
        </div>
      )}
      {idle && hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
    </>
  );

  return {
    placed,
    lit: over === 0,
    pickUp,
    tap,
    registerPeg,
    registerSeat,
    registerHome,
    away,
    layer,
  };
}
