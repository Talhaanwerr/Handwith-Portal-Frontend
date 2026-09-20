"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { findDropTarget, registerTarget, toRootPoint } from "@shared/utils/pointer";
import { useScheduler } from "@shared/hooks/useScheduler";
import { playPickUpSound, playSnapSound, playThudSound } from "@shared/audio/sfx";

/**
 * PICKING A THING UP AND PUTTING IT DOWN — the one mechanic every activity in
 * this game is made of.
 *
 * It is written to feel like HANDLING AN OBJECT rather than operating a
 * screen, because that is the whole lesson at three: I moved it, so it moved.
 *
 *   LIFT     a pressed piece rises out of the tray, grows, and casts a shadow
 *   CARRY    it follows the finger, leaning into the direction it travels
 *   AIM      the place it belongs lights up as soon as it is near enough
 *   SNAP     let go anywhere close and it is pulled in, settling with a bounce
 *   REFUSE   a piece that does not belong wiggles and walks itself home again
 *
 * Nothing here is a failure state: the wrong piece is never taken away, never
 * flashes red, never buzzes. It shrugs and goes back to where it was.
 *
 * Two ways to play, because small hands differ: DRAG, or TAP the piece and
 * then TAP the place. Both run through `offer`.
 *
 * Everything is measured against the BOARD, never the viewport — game screens
 * live inside a transformed Framer ancestor, where viewport coordinates lie.
 */

/** How long a refused piece takes to wiggle its way home. */
export const SHAKE_MS = 560;

/**
 * How long a thing takes to fly into its place. The boards animate for
 * exactly this long, but the LANDING IS A TIMER, not the animation's
 * completion callback: a tablet that sleeps mid-flight, a dropped frame or a
 * browser that stops running animations in a background tab must never leave
 * a piece hanging in the air with the whole board frozen behind it.
 */
export const FLIGHT_MS = 380;

/** How near a place a dropped thing counts as being over it. Generous: small
 *  fingers miss, and nearest-centre decides when two boxes overlap. */
const DROP_SLOP_PX = 56;

/** How far a piece leans, in degrees, at full tilt. */
const MAX_TILT = 15;

export interface CarryPoint {
  x: number;
  y: number;
}

export interface CarryDrag {
  id: number;
  /** The finger, in the board's own coordinates. */
  x: number;
  y: number;
  /** How far the piece is leaning, from how fast it is being moved. */
  tilt: number;
}

export interface CarryFlight {
  id: number;
  /** Where it is going: a place on the board, or -1 when it is going home. */
  hole: number;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  /** It did not fit: this is the walk of shame back to the tray. */
  home: boolean;
}

interface CarryOptions {
  /** Input is ignored while a celebration plays over the top. */
  locked: boolean;
  /** Is that place still empty? */
  isOpen: (hole: number) => boolean;
  /** Does the thing being carried belong in that place? */
  fits: (id: number, hole: number) => boolean;
  /**
   * It landed: the board writes it in and decides whether the round is won.
   * `from` is where the child let go, for a board that wants to animate the
   * landing itself.
   */
  onPlaced: (id: number, hole: number, from: CarryPoint) => void;
  /**
   * The board animates the landing itself — no flight here, and no snap sound
   * either, because the board will make its own when its pieces arrive. The
   * three-piece puzzle uses this: its answer does not fly as one lump, it
   * comes apart and each piece travels.
   */
  instant?: boolean;
  /** A piece was carried somewhere it does not belong — so the character can
   *  shake its head about it. */
  onRefused?: (id: number) => void;
}

export function useCarry({
  locked,
  isOpen,
  fits,
  onPlaced,
  instant = false,
  onRefused,
}: CarryOptions) {
  /** The thing picked up by a tap, waiting for a place. */
  const [picked, setPicked] = useState<number | null>(null);
  const [drag, setDrag] = useState<CarryDrag | null>(null);
  /** The same drag, readable from a window listener, where state would be
   *  whatever it was when the listener was attached. */
  const dragRef = useRef<CarryDrag | null>(null);
  const [flight, setFlight] = useState<CarryFlight | null>(null);
  /** The place the finger is over right now — it lights up. */
  const [near, setNear] = useState<number | null>(null);
  /** The thing that was just refused, and the place that refused it. */
  const [wrong, setWrong] = useState<number | null>(null);
  const [bump, setBump] = useState<number | null>(null);
  /**
   * How many times the child has touched something. A COUNT, not a flag: the
   * teaching hand remembers the count it was shown at, so any new touch hides
   * it without anybody having to reach in and clear it.
   */
  const [touches, setTouches] = useState(0);
  const touchesRef = useRef(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<Map<number, HTMLElement>>(new Map());
  const holeRefs = useRef<Map<number, HTMLElement>>(new Map());
  const schedule = useScheduler();

  const toRoot = useCallback((x: number, y: number) => toRootPoint(rootRef.current, x, y), []);

  /** The child touched something. */
  const countTouch = useCallback(() => {
    touchesRef.current += 1;
    setTouches(touchesRef.current);
  }, []);

  /** How many touches so far, for code running outside render. */
  const touchCount = useCallback(() => touchesRef.current, []);

  /** The centre of an element, in the board's own coordinates. */
  const centreOf = useCallback(
    (el: HTMLElement | undefined) => {
      if (!el) return { x: 0, y: 0 };
      const box = el.getBoundingClientRect();
      return toRoot(box.left + box.width / 2, box.top + box.height / 2);
    },
    [toRoot]
  );

  const centreOfPiece = useCallback(
    (id: number) => centreOf(pieceRefs.current.get(id)),
    [centreOf]
  );
  const centreOfHole = useCallback(
    (hole: number) => centreOf(holeRefs.current.get(hole)),
    [centreOf]
  );

  /**
   * A piece that does not belong here. It wiggles where the child let go and
   * walks itself back to its own spot in the tray — nothing is taken away and
   * nothing goes red.
   */
  const refuse = useCallback(
    (id: number, hole: number, from?: CarryPoint) => {
      playThudSound();
      onRefused?.(id);
      setWrong(id);
      setBump(hole);
      if (from) {
        const back = centreOfPiece(id);
        setFlight({ id, hole: -1, fx: from.x, fy: from.y, tx: back.x, ty: back.y, home: true });
      }
      schedule(() => {
        setWrong(null);
        setBump(null);
      }, SHAKE_MS);
    },
    [schedule, centreOfPiece, onRefused]
  );

  /**
   * Something offered to a place: right, and it is pulled in; wrong, and it
   * goes home.
   */
  const offer = useCallback(
    (id: number, hole: number, from: CarryPoint) => {
      if (flight || locked) return;
      countTouch();
      if (!isOpen(hole)) return;
      if (!fits(id, hole)) {
        refuse(id, hole, from);
        return;
      }
      setPicked(null);
      if (instant) {
        onPlaced(id, hole, from);
        return;
      }
      const to = centreOfHole(hole);
      setFlight({ id, hole, fx: from.x, fy: from.y, tx: to.x, ty: to.y, home: false });
    },
    [flight, locked, isOpen, fits, refuse, centreOfHole, countTouch, instant, onPlaced]
  );

  /** The flying thing arrives — in its place, or back where it started. On
   *  the clock, so nothing the browser does to animations can strand it. */
  useEffect(() => {
    if (!flight) return;
    const { id, hole, home } = flight;
    const timer = setTimeout(
      () => {
        setFlight(null);
        if (home) return;
        playSnapSound();
        onPlaced(id, hole, { x: flight.tx, y: flight.ty });
      },
      home ? SHAKE_MS : FLIGHT_MS
    );
    return () => clearTimeout(timer);
  }, [flight, onPlaced]);

  /* ── Tapping ──────────────────────────────────────────────────────────── */

  const tapPiece = useCallback(
    (id: number) => {
      if (drag || locked || flight) return;
      countTouch();
      playPickUpSound();
      setPicked((current) => (current === id ? null : id));
    },
    [drag, locked, flight, countTouch]
  );

  const tapHole = useCallback(
    (hole: number) => {
      if (picked === null || locked) return;
      offer(picked, hole, centreOfPiece(picked));
    },
    [picked, locked, offer, centreOfPiece]
  );

  /* ── Dragging ─────────────────────────────────────────────────────────── */

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, id: number) => {
      if (locked || flight || dragRef.current) return;
      // best-effort: a stale or synthetic pointer id throws here, and a throw
      // would abandon the drag before it started
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // the window listeners below carry the drag either way
      }
      countTouch();
      playPickUpSound();
      const point = toRoot(event.clientX, event.clientY);
      dragRef.current = { id, x: point.x, y: point.y, tilt: 0 };
      setDrag(dragRef.current);
      setPicked(null);
      setNear(null);
    },
    [locked, flight, toRoot, countTouch]
  );

  /**
   * The thing follows the finger, and LEANS INTO THE MOVE: the lean is the
   * last lean faded out plus a share of how far the finger just travelled, so
   * a piece flicked across the board tips over and rights itself as it slows.
   * Meanwhile the place under the finger lights up, so a child can see where
   * it is going before letting go.
   */
  const carry = useCallback(
    (clientX: number, clientY: number) => {
      const current = dragRef.current;
      if (!current) return;
      const point = toRoot(clientX, clientY);
      const travelled = point.x - current.x;
      const lean = Math.max(-MAX_TILT, Math.min(MAX_TILT, current.tilt * 0.6 + travelled * 0.7));
      dragRef.current = { ...current, x: point.x, y: point.y, tilt: Number(lean.toFixed(2)) };
      setDrag(dragRef.current);
      setNear(findDropTarget(holeRefs.current, clientX, clientY, DROP_SLOP_PX, isOpen));
    },
    [toRoot, isOpen]
  );

  /** The finger lets go. */
  const letGo = useCallback(
    (clientX: number, clientY: number) => {
      const current = dragRef.current;
      if (!current) return;
      dragRef.current = null;
      setDrag(null);
      setNear(null);
      const over = findDropTarget(holeRefs.current, clientX, clientY, DROP_SLOP_PX, isOpen);
      // let go over open ground: the thing is simply home again, no fuss
      if (over !== null) offer(current.id, over, toRoot(clientX, clientY));
    },
    [isOpen, offer, toRoot]
  );

  /**
   * CARRYING IS WATCHED ON THE WINDOW, not on the board.
   *
   * A finger that leaves the board, a pointer the browser takes away, a
   * release over the sky: every one of those has to end the drag. Listening on
   * the board alone means one missed `pointerup` glues the piece to the cursor
   * and nothing else on the board can be picked up again.
   */
  const carryRef = useRef(carry);
  const letGoRef = useRef(letGo);

  useEffect(() => {
    carryRef.current = carry;
    letGoRef.current = letGo;
  }, [carry, letGo]);

  const dragging = drag !== null;

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => carryRef.current(event.clientX, event.clientY);
    const up = (event: PointerEvent) => letGoRef.current(event.clientX, event.clientY);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging]);

  const registerPiece = useCallback(
    (id: number, el: HTMLElement | null) => registerTarget(pieceRefs.current, id, el),
    []
  );

  const registerHole = useCallback(
    (hole: number, el: HTMLElement | null) => registerTarget(holeRefs.current, hole, el),
    []
  );

  return {
    rootRef,
    /** ref={(el) => registerPiece(id, el)} on every pickable thing. */
    registerPiece,
    registerHole,
    /** The centre of any element, in the board's own coordinates — for a board
     *  that animates pieces between places of its own. */
    centreOf,
    picked,
    drag,
    flight,
    /** The place the finger is over: light it up. */
    near,
    wrong,
    bump,
    touches,
    touchCount,
    startDrag,
    tapPiece,
    tapHole,
    /** Hand a thing to a place without dragging it — a tap on an answer card
     *  goes through exactly the same door as a drag. */
    offer,
    centreOfPiece,
    centreOfHole,
  };
}
