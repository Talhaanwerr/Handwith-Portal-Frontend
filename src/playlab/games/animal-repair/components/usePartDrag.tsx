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
import type { PartId } from "@games/animal-repair/constants/rounds";

/** How long a part takes to settle into its place, or to glide home. */
const SNAP_MS = 220;
const BACK_MS = 240;

interface Flight {
  id: number;
  part: PartId;
  x: number;
  y: number;
  dx: number;
  dy: number;
  scale: number;
  home: boolean;
}

/**
 * ONE FINGER, ONE PART, ONE GAP — the drag of both modules: carry a part
 * from the kit to the place on the toy it came off.
 *
 * Number Hunt's drag (`useMatchDrag`) is the model — the portal's
 * `useDragDrop` underneath (no render per finger move), judged in `onDrop` —
 * but it says a NUMBER for every piece it places, and these pieces are ears
 * and tails, so the toy shop has its own small copy:
 *   • the RIGHT part over the gap → it counts at once (snap), settling in
 *     with a short ease-out;
 *   • a WRONG part over the gap → a soft thud, `onWrong`, and it glides home;
 *   • open ground → it glides home, silently. A tap is never a drop.
 * After 7 s without a touch while the toy waits, the teaching hand carries
 * the right part to the gap.
 */
export function usePartDrag({
  stageRef,
  answer,
  locked,
  onWrong,
  onRight,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  answer: PartId;
  /** No drag at all (celebrating, or the kit is not out yet). */
  locked: boolean;
  onWrong: (part: PartId) => void;
  /** The right part is in: the gap element, for its confetti. */
  onRight: (gap: HTMLElement | undefined) => void;
}) {
  const targets = useRef(new Map<number, HTMLElement>());
  const homes = useRef(new Map<PartId, HTMLElement>());
  const [flights, setFlights] = useState<readonly Flight[]>([]);
  const [landed, setLanded] = useState(false);
  const [slop, setSlop] = useState(20);
  const flightId = useRef(0);
  /** Judged right at once — later drops and taps read it without waiting. */
  const takenRef = useRef(false);
  const schedule = useScheduler();

  const fly = useCallback(
    (part: PartId, from: { x: number; y: number }, to: HTMLElement | undefined, home: boolean) => {
      const end = centreIn(stageRef.current, to);
      const start = homes.current.get(part);
      const scale =
        !home && to && start
          ? Math.min(
              1.6,
              Math.max(0.5, to.getBoundingClientRect().width / start.getBoundingClientRect().width)
            )
          : 1;
      const f: Flight = {
        id: ++flightId.current,
        part,
        x: from.x,
        y: from.y,
        dx: end.x - from.x,
        dy: end.y - from.y,
        scale,
        home,
      };
      setFlights((all) => [...all, f]);
      // landing is on the CLOCK, never on the animation's own callback
      schedule(
        () => {
          setFlights((all) => all.filter((x) => x.id !== f.id));
          if (!home) setLanded(true);
        },
        home ? BACK_MS : SNAP_MS
      );
    },
    [schedule, stageRef]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<PartId, number>({
    root: stageRef,
    targets,
    slopPx: slop,
    isEligible: () => !takenRef.current,
    onDrop: (part, target, info) => {
      if (!info.moved) return;
      const gap = targets.current.get(0);
      if (target === 0 && part === answer && !takenRef.current) {
        takenRef.current = true;
        playSnapSound();
        fly(part, info, gap, false);
        onRight(gap);
        return;
      }
      if (target === 0) {
        playThudSound();
        onWrong(part);
      }
      fly(part, info, homes.current.get(part), true);
    },
  });

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, part: PartId) => {
      if (locked || takenRef.current) return;
      const gap = targets.current.get(0);
      if (gap) {
        const r = gap.getBoundingClientRect();
        setSlop(Math.round(Math.min(r.width, r.height) * 0.15));
      }
      if (start(e, part)) playPickUpSound();
    },
    [locked, start]
  );

  /** A tap fixed the toy: no drag may follow. */
  const take = useCallback(() => {
    takenRef.current = true;
  }, []);
  const isTaken = useCallback(() => takenRef.current, []);

  // ── the idle teaching hand: the right part, carried to the gap ──
  const waiting = !locked && !landed && dragging === null && flights.length === 0;
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

  const registerGap = useCallback((el: HTMLElement | null) => {
    if (el) targets.current.set(0, el);
    else targets.current.delete(0);
  }, []);
  const registerHome = useCallback((part: PartId, el: HTMLElement | null) => {
    if (el) homes.current.set(part, el);
    else homes.current.delete(part);
  }, []);

  /** A part is out of the kit while it is carried, flying, or fixed on. */
  const away = (part: PartId) =>
    dragging === part || flights.some((f) => f.part === part) || (landed && part === answer);

  /** The carried part, the flying parts and the hand, in the stage overlay. */
  const layer = (render: (part: PartId) => ReactNode) => (
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
          <span className="ng-carried arp-piece">{render(f.part)}</span>
        </motion.div>
      ))}
      {dragging !== null && (
        <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
          <span className="ng-carried arp-piece arp-piece--lifted">{render(dragging)}</span>
        </div>
      )}
      {idle && hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
    </>
  );

  return {
    landed,
    over: over === 0,
    dragging,
    pickUp,
    take,
    isTaken,
    registerGap,
    registerHome,
    away,
    layer,
  };
}
