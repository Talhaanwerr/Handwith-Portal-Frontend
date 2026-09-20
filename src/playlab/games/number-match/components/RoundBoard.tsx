"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  THING_NAMES,
  answerFor,
  paintFor,
  thingName,
  trayFor,
  type Round,
} from "@games/number-match/constants/rounds";
import { Card, Chip, Socket, ThingArt } from "@games/number-match/components/MatchArt";
import { Burst } from "@shared/components/game/Burst";
import { Confetti } from "@shared/components/game/Confetti";
import { Ripple } from "@shared/components/game/Ripple";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { findDropTarget, registerTarget, toRootPoint, type RootPoint } from "@shared/utils/pointer";
import { cssVars } from "@shared/styles/cssVars";
import { playCorrectSound, playPickUpSound, playSnapSound, playThudSound } from "@shared/audio/sfx";
import { playClip, sayAfter } from "@shared/audio/voice";

/** Two lines the portal already has recorded, so this game needs no new
 *  audio made for it: one when the hand starts showing, one when a number
 *  will not go where it was offered. */
const WATCH_CLIP = "instr-watch-carefully";
const RETRY_CLIP = "instr-try-again";

/** How long a wrong number shakes its head before it can be tried again. */
const SHAKE_MS = 440;
/** How long a number takes to fly into its socket. The landing happens on a
 *  TIMER of this length — never on the animation's own completion callback,
 *  which Motion does not reliably fire and which used to leave the board
 *  frozen with a number stuck in the air. */
const FLIGHT_MS = 420;
/** How far a carried number is allowed to lean, in degrees. */
const MAX_TILT = 14;
/** How near a socket a dropped number counts as being over it. */
const DROP_SLOP_PX = 44;
/** The cards arrive, the things pop in, the question is asked, and THEN the
 *  hand shows how it is played — it must never talk over the reveal it is
 *  explaining, nor over the question. */
const HAND_AFTER_MS = 2800;
/** How long the question waits for the cards to slide in. */
const ASK_AFTER_MS = 350;

interface BoardProps {
  round: Round;
  /** 0-based: picks the paint, and the first round teaches itself. */
  index: number;
  /** Input is ignored while a celebration plays over the top. */
  locked: boolean;
  /** Every socket is filled — the round is won. */
  onSolved: () => void;
}

interface DragState {
  value: number;
  x: number;
  y: number;
  /** Degrees. A carried thing leans the way it is moving and rights itself
   *  when it stops, which is most of what makes it feel held rather than
   *  dragged across glass. */
  tilt: number;
}

interface Flight {
  value: number;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  card: number;
}

/**
 * ONE ROUND.
 *
 *   THE CARDS ARRIVE → THE CHILD COUNTS → A NUMBER GOES UNDER ITS CARD
 *
 * A number can be DRAGGED onto a socket or TAPPED: tap a number to pick it
 * up, tap a socket to set it down. Wrong is never a failure — the number
 * shakes its head, the socket it was offered bumps, and nothing is taken
 * away. When every socket is full the round is won.
 */
export function RoundBoard({ round, index, locked, onSolved }: BoardProps) {
  /** Card index → the number now sitting under it. */
  const [placed, setPlaced] = useState<Record<number, number>>({});
  /** The number picked up by a tap, waiting for a socket. */
  const [picked, setPicked] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  /** The socket that just refused a number. */
  const [bump, setBump] = useState<number | null>(null);
  /** The ghost hand showing the very first round how it is played. */
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  /** The same drag, readable from a window listener, where state would be
   *  whatever it was when the listener was attached. */
  const dragRef = useRef<DragState | null>(null);
  const chipRefs = useRef<Map<number, HTMLElement>>(new Map());
  const socketRefs = useRef<Map<number, HTMLElement>>(new Map());
  const solvedRef = useRef(false);
  const schedule = useScheduler();

  const tray = useMemo(() => trayFor(round, index), [round, index]);
  const cards = round.cards;
  const done = Object.keys(placed).length >= cards.length;

  const toRoot = useCallback((x: number, y: number) => toRootPoint(rootRef.current, x, y), []);

  /** The centre of an element, in the board's own coordinates. */
  const centreOf = useCallback(
    (el: HTMLElement | undefined) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return toRoot(r.left + r.width / 2, r.top + r.height / 2);
    },
    [toRoot]
  );

  /** THE QUESTION IS ASKED ALOUD, once the cards have slid in. */
  useEffect(() => {
    const t = setTimeout(() => void sayAfter("pals-ask-" + THING_NAMES[round.thing]), ASK_AFTER_MS);
    return () => clearTimeout(t);
  }, [round]);

  /**
   * THE FIRST ROUND TEACHES ITSELF.
   *
   * Nobody explains this game to a four-year-old, so on the very first round
   * the portal's ghost hand does it once: it picks up the number that
   * belongs to the first card and carries it down into the socket, and it
   * keeps doing that until the child touches anything.
   */
  useEffect(() => {
    if (index !== 0 || touched) return;
    const t = setTimeout(() => {
      const from = chipRefs.current.get(answerFor(round, 0));
      const to = socketRefs.current.get(0);
      if (!from || !to) return;
      const a = centreOf(from);
      const b = centreOf(to);
      setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
      void sayAfter(WATCH_CLIP);
    }, HAND_AFTER_MS);
    return () => clearTimeout(t);
  }, [index, touched, round, centreOf]);

  /** The whole round is won. */
  const finish = useCallback(() => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    playCorrectSound();
    onSolved();
  }, [onSolved]);

  /** The flying number has arrived: it is in its socket. */
  const land = useCallback(() => {
    if (!flight) return;
    const { card, value } = flight;
    setFlight(null);
    playSnapSound();
    // and the number is said as it lands — the count, confirmed out loud
    void playClip("number-" + value);
    // worked out HERE, never inside the state updater: React may run an
    // updater during the next render, and reporting "solved" from there is a
    // setState on the game component in the middle of rendering this one
    const next = { ...placed, [card]: value };
    setPlaced(next);
    if (Object.keys(next).length >= cards.length) finish();
  }, [flight, placed, cards.length, finish]);

  /** IT HAS ARRIVED. On the clock, so nothing the browser decides to do with
   *  an animation can strand a number in mid-air and freeze the board. */
  useEffect(() => {
    if (!flight) return;
    const timer = setTimeout(land, FLIGHT_MS);
    return () => clearTimeout(timer);
  }, [flight, land]);

  const shakeHead = useCallback(
    (value: number, card: number | null) => {
      // a dull thud, not a buzzer: the number bumped the wrong place
      playThudSound();
      void playClip(RETRY_CLIP);
      setWrong(value);
      setBump(card);
      schedule(() => {
        setWrong(null);
        setBump(null);
      }, SHAKE_MS);
    },
    [schedule]
  );

  /**
   * A number offered to a socket: right, and it flies there; wrong, and it
   * shakes its head where it stands.
   */
  const offer = useCallback(
    (value: number, card: number, from: RootPoint) => {
      if (flight || locked || solvedRef.current) return;
      setTouched(true);
      setHand(null);
      if (placed[card] !== undefined) return;
      if (answerFor(round, card) !== value) {
        shakeHead(value, card);
        return;
      }
      const to = centreOf(socketRefs.current.get(card));
      setPicked(null);
      setFlight({ value, card, fx: from.x, fy: from.y, tx: to.x, ty: to.y });
    },
    [flight, locked, placed, round, shakeHead, centreOf]
  );

  /* ── Tapping ──────────────────────────────────────────────────────────── */

  const tapChip = useCallback(
    (value: number) => {
      if (drag || locked || flight) return;
      setTouched(true);
      setHand(null);
      // no sound here: every tap begins with a pointerdown, and `startDrag`
      // has already played the lift for it
      setPicked((p) => (p === value ? null : value));
    },
    [drag, locked, flight]
  );

  const tapSocket = useCallback(
    (card: number) => {
      if (picked === null || locked) return;
      offer(picked, card, centreOf(chipRefs.current.get(picked)));
    },
    [picked, locked, offer, centreOf]
  );

  /* ── Dragging ─────────────────────────────────────────────────────────── */

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, value: number) => {
      if (locked || flight || drag) return;
      // a browser that refuses the capture must not take the drag with it
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* the window listeners below are the real safety net */
      }
      const p = toRoot(e.clientX, e.clientY);
      dragRef.current = { value, x: p.x, y: p.y, tilt: 0 };
      setDrag(dragRef.current);
      setPicked(null);
      playPickUpSound();
    },
    [locked, flight, drag, toRoot]
  );

  const letGo = useCallback(
    (clientX: number, clientY: number) => {
      const current = dragRef.current;
      if (!current) return;
      dragRef.current = null;
      setDrag(null);
      const over = findDropTarget(
        socketRefs.current,
        clientX,
        clientY,
        DROP_SLOP_PX,
        (card) => placed[card] === undefined
      );
      // let go over open ground: the number is simply home again
      if (over !== null && over !== undefined) {
        offer(current.value, over, toRoot(clientX, clientY));
      }
    },
    [placed, offer, toRoot]
  );

  /**
   * THE FINGER IS ON THE WINDOW, not on the board.
   *
   * A pointer that wanders off the board — or a browser that refused the
   * capture — must still be able to put the number down; listening here is
   * what stops a drag being left hanging with the board unable to accept
   * anything else.
   */
  const dragging = drag !== null;

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const held = dragRef.current;
      if (!held) return;
      const p = toRoot(event.clientX, event.clientY);
      const travelled = p.x - held.x;
      const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, held.tilt * 0.6 + travelled * 0.7));
      dragRef.current = { ...held, x: p.x, y: p.y, tilt };
      setDrag(dragRef.current);
    };
    const up = (event: PointerEvent) => letGo(event.clientX, event.clientY);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, toRoot, letGo]);

  /* ── Render ───────────────────────────────────────────────────────────── */

  const used = useMemo(() => new Set(Object.values(placed)), [placed]);
  /** What sprays out of a socket when its number lands: the round's own
   *  thing, so the reward is made of what was just counted. */
  const burstPieces = useMemo(() => [<ThingArt key="t" thing={round.thing} />], [round.thing]);

  return (
    <div ref={rootRef} className="nm-board" data-n={cards.length}>
      {/* The question, and only the question — how it is answered is shown
          by the hand on the first round, not re-read on every one. */}
      <p className="nm-ask font-rounded font-black">
        How many {thingName(round.thing, 2)} on each card?
      </p>

      <div className="nm-row">
        {cards.map((count, i) => (
          <div className="nm-slot" key={i}>
            <Card
              thing={round.thing}
              count={count}
              paint={paintFor(index, i)}
              solved={placed[i] !== undefined}
              delay={0.06 + i * 0.09}
            />

            <button
              type="button"
              className="nm-socket"
              data-filled={placed[i] !== undefined ? "yes" : undefined}
              data-bump={bump === i ? "yes" : undefined}
              ref={(el) => registerTarget(socketRefs.current, i, el)}
              onClick={() => tapSocket(i)}
              disabled={placed[i] !== undefined || locked}
              aria-label={
                placed[i] !== undefined
                  ? `${placed[i]} ${thingName(round.thing, placed[i])}`
                  : `Empty socket under the card with ${count} ${thingName(round.thing, count)}`
              }
            >
              {placed[i] === undefined ? (
                <Socket open={picked !== null} />
              ) : (
                <>
                  <motion.span
                    className="nm-socket-filled"
                    initial={{ scale: 0.4 }}
                    animate={{ scale: [0.4, 1.24, 1] }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                  >
                    <Chip value={placed[i]} big />
                  </motion.span>
                  {/* the number lands: rings go out, and the card's own
                      things spray up out of the socket */}
                  <Ripple count={2} />
                  <Burst pieces={burstPieces} count={10} reach={[10, 30]} size="16%" gravity />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="nm-tray">
        {tray.map((value) => (
          <motion.button
            key={value}
            type="button"
            className="nm-chip touch-none"
            ref={(el) => registerTarget(chipRefs.current, value, el)}
            data-picked={picked === value ? "yes" : undefined}
            data-used={used.has(value) || flight?.value === value ? "yes" : undefined}
            data-dragging={drag?.value === value ? "yes" : undefined}
            disabled={used.has(value) || locked}
            onPointerDown={(e) => startDrag(e, value)}
            onClick={() => tapChip(value)}
            aria-label={`Number ${value} — put it under its card`}
            aria-pressed={picked === value}
            animate={
              wrong === value
                ? { x: [0, -9, 9, -7, 7, 0] }
                : { x: 0, scale: picked === value ? 1.14 : 1 }
            }
            transition={
              wrong === value
                ? { duration: SHAKE_MS / 1000 }
                : { type: "spring", stiffness: 320, damping: 18 }
            }
          >
            <Chip value={value} />
          </motion.button>
        ))}
      </div>

      {/* the number under the finger */}
      {drag && (
        <motion.span
          className="nm-ghost pl-at"
          style={cssVars({ "--pl-x": drag.x + "px", "--pl-y": drag.y + "px" })}
          animate={{ rotate: drag.tilt }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          aria-hidden="true"
        >
          <Chip value={drag.value} big />
        </motion.span>
      )}

      {/* the number on its way into a socket */}
      {flight && (
        <motion.span
          className="nm-flight pl-at"
          style={cssVars({ "--pl-x": flight.fx + "px", "--pl-y": flight.fy + "px" })}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{ x: flight.tx - flight.fx, y: flight.ty - flight.fy, scale: [1, 1.16, 1] }}
          transition={{ duration: FLIGHT_MS / 1000, ease: [0.3, 0.7, 0.2, 1] }}
          aria-hidden="true"
        >
          <Chip value={flight.value} big />
        </motion.span>
      )}

      {/* the first round shows how it is played */}
      {hand && !done && <TeachingHand {...hand} />}

      {done && <Confetti count={40} />}
    </div>
  );
}
