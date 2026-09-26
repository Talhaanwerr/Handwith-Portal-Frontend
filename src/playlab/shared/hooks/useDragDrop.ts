"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { findDropTarget, toRootPoint } from "@shared/utils/pointer";

/** Past this many pixels a press is a DRAG, and the click that follows it is
 *  not a tap (see `tookClick`). */
const DRAG_THRESHOLD_PX = 8;

/** Where and how a drag ended. */
export interface DropInfo {
  /** The release point, relative to the board root. */
  x: number;
  y: number;
  /** False for a press that never moved: that is a TAP, and a tap is never a
   *  drop — a finger resting on a tile that happens to sit under a picture
   *  must not count as putting the tile there. */
  moved: boolean;
}

interface DragDropOptions<T, K> {
  /** The board the ghost is positioned in (root-relative, never fixed). */
  root: RefObject<HTMLElement | null>;
  /** Everything that can be dropped on, keyed. */
  targets: RefObject<Map<K, HTMLElement>>;
  /** How far past a target's edge still counts — small fingers miss. */
  slopPx: number;
  /** Optional filter, e.g. to ignore a slot that is already full. */
  isEligible?: (key: K) => boolean;
  /** The finger let go. `target` is null over open ground (and on a cancel),
   *  which callers treat as "changed their mind", never as a wrong answer. */
  onDrop: (item: T, target: K | null, info: DropInfo) => void;
}

interface Live<T> {
  item: T;
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  detach: () => void;
}

/**
 * ONE FINGER CARRYING ONE THING — the drag every sorting and matching board
 * shares (Word Site, Sort It, Number Safari's missing number).
 *
 * The point of it is what does NOT happen on a pointermove: no React state
 * changes, so nothing re-renders. The ghost under the finger is moved by
 * writing two CSS custom properties straight onto its element (`.pl-drag-ghost`
 * turns them into a transform), and the lit target is state only when it
 * CHANGES. Each game used to `setState` the finger position on every move,
 * which re-rendered the whole board — scenery, cards, confetti and all — up
 * to 120 times a second, and that is what made dragging stutter on a phone.
 *
 * The rules the portal learned the hard way are built in: the finger is
 * followed on the WINDOW (a drag can never strand because the finger left the
 * board), `setPointerCapture` failing is survivable, and an unmount mid-drag
 * removes every listener.
 */
export function useDragDrop<T, K>({
  root,
  targets,
  slopPx,
  isEligible,
  onDrop,
}: DragDropOptions<T, K>) {
  const [dragging, setDragging] = useState<T | null>(null);
  const [over, setOver] = useState<K | null>(null);

  const ghost = useRef<HTMLElement | null>(null);
  const point = useRef({ x: 0, y: 0 });
  const live = useRef<Live<T> | null>(null);
  /** The last press moved far enough to be a drag — its click is not a tap. */
  const dragged = useRef(false);

  // The window listeners read the newest callbacks through this, so they never
  // have to be re-bound while a finger is down.
  const latest = useRef({ onDrop, isEligible, slopPx });
  useEffect(() => {
    latest.current = { onDrop, isEligible, slopPx };
  });

  const paint = useCallback(() => {
    const node = ghost.current;
    if (!node) return;
    node.style.setProperty("--pl-x", `${point.current.x}px`);
    node.style.setProperty("--pl-y", `${point.current.y}px`);
  }, []);

  const place = useCallback(
    (clientX: number, clientY: number) => {
      point.current = toRootPoint(root.current, clientX, clientY);
      paint();
    },
    [root, paint]
  );

  /** Give this to the ghost element: it is placed the moment it mounts. */
  const ghostRef = useCallback(
    (node: HTMLElement | null) => {
      ghost.current = node;
      paint();
    },
    [paint]
  );

  const finish = useCallback(
    (e: PointerEvent | null) => {
      const current = live.current;
      if (!current) return;
      live.current = null;
      current.detach();
      dragged.current = current.moved;
      setDragging(null);
      setOver(null);
      const { onDrop: drop, isEligible: eligible, slopPx: slop } = latest.current;
      const released = e && e.type === "pointerup";
      if (released) point.current = toRootPoint(root.current, e.clientX, e.clientY);
      const target =
        released && current.moved
          ? findDropTarget(targets.current, e.clientX, e.clientY, slop, eligible)
          : null;
      drop(current.item, target, { ...point.current, moved: current.moved });
    },
    [root, targets]
  );

  /** Call from the thing's onPointerDown. Returns false if a drag is already
   *  under way (a second finger), which callers simply ignore. */
  const start = useCallback(
    (e: React.PointerEvent<HTMLElement>, item: T): boolean => {
      if (live.current) return false;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // some browsers refuse capture for a synthetic or already-ended
        // pointer; the window listeners below still see the finger
      }
      const move = (ev: PointerEvent) => {
        const current = live.current;
        if (!current || ev.pointerId !== current.pointerId) return;
        if (
          !current.moved &&
          Math.hypot(ev.clientX - current.startX, ev.clientY - current.startY) > DRAG_THRESHOLD_PX
        )
          current.moved = true;
        place(ev.clientX, ev.clientY);
        const { isEligible: eligible, slopPx: slop } = latest.current;
        // a state change only when the lit target CHANGES — React skips the
        // render when the value is the same as last time
        setOver(findDropTarget(targets.current, ev.clientX, ev.clientY, slop, eligible));
      };
      const end = (ev: PointerEvent) => {
        if (live.current && ev.pointerId === live.current.pointerId) finish(ev);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      live.current = {
        item,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        detach: () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", end);
          window.removeEventListener("pointercancel", end);
        },
      };
      dragged.current = false;
      place(e.clientX, e.clientY);
      setDragging(item);
      return true;
    },
    [place, targets, finish]
  );

  /** For a thing that is ALSO tappable: true when the click now arriving is
   *  the tail of a drag rather than a tap, so it must not count twice. */
  const tookClick = useCallback(() => {
    const was = dragged.current;
    dragged.current = false;
    return was;
  }, []);

  // leaving the screen mid-drag: drop nothing, keep no listener
  useEffect(
    () => () => {
      live.current?.detach();
      live.current = null;
    },
    []
  );

  return { dragging, over, start, ghostRef, tookClick };
}
