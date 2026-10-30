"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { playPickUpSound, playSnapSound, playThudSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { centreIn, sayNumber } from "@games/number-groups/components/NgKit";

/** How long a piece takes to settle into its place, or to glide home. */
const SNAP_MS = 220;
const BACK_MS = 240;

interface Flight {
  id: number;
  value: number;
  /** Start point and travel, stage pixels. */
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** Size change on the way (a numeral grows into a bigger slot). */
  scale: number;
  /** Where it lands: a target index, or null for "back to the tray". */
  target: number | null;
}

interface HandPath {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * ONE FINGER, ONE PIECE, A ROW OF PLACES — the drag both drag modules play
 * (Number Cards: a numeral onto a group; Number Hunt's Group Boxes: a group
 * into a numbered box).
 *
 * Built on the portal's `useDragDrop` (no render per finger move) and judged
 * in `onDrop`:
 *   • over the RIGHT place → it counts at once: snap, the number said,
 *     confetti out of the place — while the piece settles in with a short
 *     ease-out;
 *   • over a WRONG place → it glides back to where it came from with a soft
 *     thud — nothing else (a miss for the stars, never a red X);
 *   • on open ground → it glides back, silently. A tap is never a drop.
 * Targets are 1.3× their drawn size (a slop of 15% a side).
 *
 * After 7 s without a touch while the board waits for a move, the teaching
 * hand (`useIdleHand`) drags the next unplaced piece to its place.
 */
export function useMatchDrag({
  stageRef,
  answers,
  locked,
  onMiss,
  onPlaced,
  onAllPlaced,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  /** What each place wants, by index. */
  answers: readonly number[];
  locked: boolean;
  onMiss: () => void;
  /** A piece is in: the place's element, for its confetti. */
  onPlaced: (target: number, el: HTMLElement | undefined) => void;
  onAllPlaced: () => void;
}) {
  const targets = useRef(new Map<number, HTMLElement>());
  const homes = useRef(new Map<number, HTMLElement>());
  /** Where a piece settles inside a place, when that is not the whole place. */
  const seats = useRef(new Map<number, HTMLElement>());
  const [placed, setPlaced] = useState<Readonly<Record<number, number>>>({});
  const [flights, setFlights] = useState<readonly Flight[]>([]);
  const [slop, setSlop] = useState(20);
  const flightId = useRef(0);
  /** Pieces judged right, at once — the drop callback reads it without
   *  waiting for the piece to land. */
  const takenRef = useRef<Record<number, number>>({});
  const schedule = useScheduler();

  const land = useCallback((f: Flight) => {
    setFlights((all) => all.filter((x) => x.id !== f.id));
    if (f.target !== null) setPlaced((p) => ({ ...p, [f.target as number]: f.value }));
  }, []);

  const fly = useCallback(
    (
      value: number,
      from: { x: number; y: number },
      to: HTMLElement | undefined,
      target: number | null
    ) => {
      const end = centreIn(stageRef.current, to);
      const home = homes.current.get(value);
      const scale =
        target !== null && to && home
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
        target,
      };
      setFlights((all) => [...all, f]);
      // landing is on the CLOCK, never on the animation's own callback
      schedule(() => land(f), target === null ? BACK_MS : SNAP_MS);
    },
    [land, schedule, stageRef]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: stageRef,
    targets,
    slopPx: slop,
    isEligible: (k) => takenRef.current[k] === undefined,
    onDrop: (value, target, info) => {
      if (!info.moved) return;
      if (target !== null && answers[target] === value) {
        takenRef.current = { ...takenRef.current, [target]: value };
        const place = targets.current.get(target);
        fly(value, info, seats.current.get(target) ?? place, target);
        playSnapSound();
        sayNumber(value);
        onPlaced(target, place);
        if (Object.keys(takenRef.current).length >= answers.length) onAllPlaced();
        return;
      }
      if (target !== null) {
        playThudSound();
        onMiss();
      }
      fly(value, info, homes.current.get(value), null);
    },
  });

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, value: number) => {
      if (locked) return;
      const first = targets.current.values().next().value;
      if (first) {
        const r = first.getBoundingClientRect();
        setSlop(Math.round(Math.min(r.width, r.height) * 0.15));
      }
      if (start(e, value)) playPickUpSound();
    },
    [locked, start]
  );

  // ── the idle teaching hand ──
  const placedCount = Object.keys(placed).length;
  const next = answers.findIndex((_, k) => placed[k] === undefined);
  const waiting = !locked && dragging === null && flights.length === 0 && next >= 0;
  const idle = useIdleHand(waiting, placedCount);
  const [hand, setHand] = useState<(HandPath & { k: number }) | null>(null);

  // measured against the drag's own root when the hand appears, and again
  // whenever the screen changes size
  useEffect(() => {
    if (!idle) return;
    const measure = () => {
      const from = homes.current.get(answers[next]);
      const to = targets.current.get(next);
      if (!from || !to) return;
      const a = centreIn(stageRef.current, from);
      const b = centreIn(stageRef.current, to);
      setHand({ k: next, fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    };
    void playClip("instr-watch-carefully");
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, next, answers, stageRef]);

  const registerTarget = useCallback((k: number, el: HTMLElement | null) => {
    if (el) targets.current.set(k, el);
    else targets.current.delete(k);
  }, []);
  const registerSeat = useCallback((k: number, el: HTMLElement | null) => {
    if (el) seats.current.set(k, el);
    else seats.current.delete(k);
  }, []);
  const registerHome = useCallback((v: number, el: HTMLElement | null) => {
    if (el) homes.current.set(v, el);
    else homes.current.delete(v);
  }, []);

  /** A piece is out of the tray while it is carried, flying, or placed. */
  const away = (value: number) =>
    dragging === value ||
    flights.some((f) => f.value === value) ||
    Object.values(placed).includes(value);

  /** The carried piece, the flying pieces and the hand — drawn in the
   *  stage's overlay. `render` draws a piece by its value. */
  const layer = (render: (value: number) => ReactNode, pieceClass: string) => (
    <>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="ng-flight pl-at"
          style={cssVars({ "--pl-x": `${f.x}px`, "--pl-y": `${f.y}px` })}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: f.dx, y: f.dy, scale: f.scale }}
          transition={{
            duration: (f.target === null ? BACK_MS : SNAP_MS) / 1000,
            ease: "easeOut",
          }}
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
      {idle && hand?.k === next && (
        <TeachingHand key={next} fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
      )}
    </>
  );

  return {
    placed,
    over,
    dragging,
    pickUp,
    registerTarget,
    registerSeat,
    registerHome,
    away,
    layer,
  };
}
