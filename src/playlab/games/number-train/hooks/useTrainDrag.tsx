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
import { centreIn } from "@games/number-groups/components/NgKit";

const SNAP_MS = 240;
const BACK_MS = 260;

interface Flight {
  id: number;
  value: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** A place on the train, or null for "back to the yard". */
  slot: number | null;
}

/** The one right move just now: this carriage into that place. */
export interface TrainWant {
  value: number;
  slot: number;
}

/**
 * ONE FINGER, ONE CARRIAGE: Number Train's drag, built like Count & Match's
 * `useMatchDrag` on the portal's `useDragDrop`, except that the round names
 * the ONE right move (`want`).
 *
 *   - dropped on `want.slot` carrying `want.value`: it clicks on;
 *   - dropped on another place, or the wrong carriage on the place: it glides
 *     home with a soft thud and `onMiss(value)`;
 *   - a TAP on `want.value`: it rolls on by itself (motor-friendly); a tap on
 *     another carriage calls `onWrongTap(value)`;
 *   - let go on open ground: it glides home, silently.
 *
 * After 7 s without a touch the teaching hand drags `want` to its place.
 */
export function useTrainDrag({
  stageRef,
  want,
  locked,
  onMiss,
  onWrongTap,
  onPlaced,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  want: TrainWant | null;
  locked: boolean;
  onMiss: (value: number) => void;
  onWrongTap: (value: number) => void;
  /** Judged right (before it lands): the place's element, for confetti. */
  onPlaced: (value: number, slot: number, el: HTMLElement | undefined) => void;
}) {
  const targets = useRef(new Map<number, HTMLElement>());
  const homes = useRef(new Map<number, HTMLElement>());
  const [placed, setPlaced] = useState<Readonly<Record<number, number>>>({});
  const [flights, setFlights] = useState<readonly Flight[]>([]);
  const [slop, setSlop] = useState(16);
  const flightId = useRef(0);
  const taken = useRef(new Set<number>());
  const schedule = useScheduler();

  const fly = useCallback(
    (
      value: number,
      from: { x: number; y: number },
      to: HTMLElement | undefined,
      slot: number | null
    ) => {
      const end = centreIn(stageRef.current, to);
      const f: Flight = {
        id: ++flightId.current,
        value,
        x: from.x,
        y: from.y,
        dx: end.x - from.x,
        dy: end.y - from.y,
        slot,
      };
      setFlights((all) => [...all, f]);
      // landing is on the clock, never on the animation's own callback
      schedule(
        () => {
          setFlights((all) => all.filter((x) => x.id !== f.id));
          if (slot !== null) setPlaced((p) => ({ ...p, [slot]: value }));
        },
        slot === null ? BACK_MS : SNAP_MS
      );
    },
    [schedule, stageRef]
  );

  const take = useCallback(
    (value: number, slot: number, from: { x: number; y: number }) => {
      taken.current.add(value);
      const place = targets.current.get(slot);
      fly(value, from, place, slot);
      playSnapSound();
      onPlaced(value, slot, place);
    },
    [fly, onPlaced]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: stageRef,
    targets,
    slopPx: slop,
    onDrop: (value, slot, info) => {
      if (locked) return;
      if (!info.moved) {
        if (want && value === want.value) {
          take(value, want.slot, centreIn(stageRef.current, homes.current.get(value)));
        } else onWrongTap(value);
        return;
      }
      if (want && slot === want.slot && value === want.value) {
        take(value, slot, info);
        return;
      }
      if (slot !== null) {
        playThudSound();
        onMiss(value);
      }
      fly(value, info, homes.current.get(value), null);
    },
  });

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, value: number) => {
      if (locked || taken.current.has(value)) return;
      const first = targets.current.values().next().value;
      if (first) {
        const r = first.getBoundingClientRect();
        setSlop(Math.round(Math.min(r.width, r.height) * 0.15));
      }
      if (start(e, value)) playPickUpSound();
    },
    [locked, start]
  );

  // the idle teaching hand
  const waiting = !locked && dragging === null && flights.length === 0 && want !== null;
  const idle = useIdleHand(waiting, Object.keys(placed).length);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const wantValue = want?.value;
  const wantSlot = want?.slot;
  useEffect(() => {
    if (!idle || wantValue === undefined || wantSlot === undefined) return;
    const measure = () => {
      const from = homes.current.get(wantValue);
      const to = targets.current.get(wantSlot);
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
  }, [idle, wantValue, wantSlot, stageRef]);

  const registerTarget = useCallback((k: number, el: HTMLElement | null) => {
    if (el) targets.current.set(k, el);
    else targets.current.delete(k);
  }, []);
  const registerHome = useCallback((v: number, el: HTMLElement | null) => {
    if (el) homes.current.set(v, el);
    else homes.current.delete(v);
  }, []);

  /** Out of the yard while it is carried, flying, or on the train. */
  const away = (value: number) =>
    dragging === value ||
    flights.some((f) => f.value === value) ||
    Object.values(placed).includes(value);

  /** The carried carriage, the flying ones and the hand, in stage coordinates. */
  const layer = (render: (value: number) => ReactNode) => (
    <>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="ng-flight pl-at"
          style={cssVars({ "--pl-x": `${f.x}px`, "--pl-y": `${f.y}px` })}
          initial={{ x: 0, y: 0 }}
          animate={{ x: f.dx, y: f.dy }}
          transition={{ duration: (f.slot === null ? BACK_MS : SNAP_MS) / 1000, ease: "easeOut" }}
          aria-hidden="true"
        >
          <span className="ng-carried ntr-piece">{render(f.value)}</span>
        </motion.div>
      ))}
      {dragging !== null && (
        <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
          <span className="ng-carried ng-carried--lifted ntr-piece">{render(dragging)}</span>
        </div>
      )}
      {idle && hand && want && (
        <TeachingHand key={want.value} fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
      )}
    </>
  );

  return { placed, over, pickUp, registerTarget, registerHome, away, layer };
}
