"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
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
import { findDropTarget, registerTarget, toRootPoint } from "@shared/utils/pointer";
import {
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
  playPlaceSound,
} from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";

/** Two lines the portal already has recorded, so this game needs no new
 *  audio made for it: one when the hand starts showing, one when a number
 *  will not go where it was offered. */
const WATCH_CLIP = "instr-watch-carefully";
const RETRY_CLIP = "instr-try-again";

/** How long a wrong number shakes its head before it can be tried again. */
const SHAKE_MS = 440;
/** How near a socket a dropped number counts as being over it. */
const DROP_SLOP_PX = 44;
/** The cards arrive, the things pop in, and THEN the hand shows how it is
 *  played — it must never talk over the reveal it is explaining. */
const HAND_AFTER_MS = 1900;

interface Point {
  x: number;
  y: number;
}

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
      void playClip(WATCH_CLIP);
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
    playPlaceSound();
    setPlaced((p) => {
      const next = { ...p, [card]: value };
      if (Object.keys(next).length >= cards.length) finish();
      return next;
    });
  }, [flight, cards.length, finish]);

  const shakeHead = useCallback(
    (value: number, card: number | null) => {
      playIncorrectSound();
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
    (value: number, card: number, from: Point) => {
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
      playClickSound();
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
      playClickSound();
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
      e.currentTarget.setPointerCapture(e.pointerId);
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ value, x: p.x, y: p.y });
      setPicked(null);
    },
    [locked, flight, drag, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
    },
    [drag, toRoot]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const { value } = drag;
      setDrag(null);
      const over = findDropTarget(
        socketRefs.current,
        e.clientX,
        e.clientY,
        DROP_SLOP_PX,
        (card) => placed[card] === undefined
      );
      // let go over open ground: the number is simply home again
      if (over !== null && over !== undefined) {
        offer(value, over, toRoot(e.clientX, e.clientY));
      }
    },
    [drag, placed, offer, toRoot]
  );

  /* ── Render ───────────────────────────────────────────────────────────── */

  const used = useMemo(() => new Set(Object.values(placed)), [placed]);
  /** What sprays out of a socket when its number lands: the round's own
   *  thing, so the reward is made of what was just counted. */
  const burstPieces = useMemo(() => [<ThingArt key="t" thing={round.thing} />], [round.thing]);

  return (
    <div
      ref={rootRef}
      className="nm-board"
      data-n={cards.length}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
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
        <span className="nm-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <Chip value={drag.value} big />
        </span>
      )}

      {/* the number on its way into a socket */}
      {flight && (
        <motion.span
          className="nm-flight"
          initial={{ left: flight.fx, top: flight.fy, scale: 1 }}
          animate={{ left: flight.tx, top: flight.ty, scale: 1.1 }}
          transition={{ duration: 0.42, ease: [0.3, 0.7, 0.2, 1] }}
          onAnimationComplete={land}
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
