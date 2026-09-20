"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { Confetti } from "@shared/components/game/Confetti";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { playCorrectSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { unit } from "@shared/utils/hash";
import type { Piece } from "@games/shape-match/constants/shapes";
import { ShapeGlyph, ShapeHole, Tick, Twinkle } from "@games/shape-match/components/ShapeArt";
import { Banner } from "@games/shape-match/components/Banner";
import { FLIGHT_MS, SHAKE_MS, useCarry } from "@games/shape-match/hooks/useCarry";
import { useDemoHand } from "@games/shape-match/hooks/useDemoHand";

/**
 * THE WARM-UP — TRIANGLE ON TRIANGLE, SQUARE ON SQUARE.
 *
 * The simplest thing this game asks: a row of shapes waiting as outlines, the
 * same shapes loose underneath, put each one on the one that is the same.
 * There is no trick in it — it is where a child meets the three shapes this
 * module is about, and where they learn that things in this game are picked
 * up and carried.
 *
 * It uses the same hands as everything else (see `useCarry`): lift, lean,
 * light up the place, snap in. A shape carried to the wrong outline wobbles
 * and walks itself back.
 */

/** The shapes the narrator has a recording for; a diamond or a pentagon is
 *  picked up in silence rather than with a missing-clip warning. */
const SPOKEN_SHAPES = new Set([
  "rectangle",
  "circle",
  "triangle",
  "square",
  "star",
  "oval",
  "heart",
]);
const SPARK_REACH = [8, 20] as const;
const SPARK_ARC = [-170, -10] as const;

interface MatchBoardProps {
  /** The shapes to pair up. */
  pieces: readonly Piece[];
  /** Fixes the order of the tray. */
  seed: number;
  locked: boolean;
  teach: boolean;
  /** One pair made: the character reacts. */
  onGreet: () => void;
  /** A shape was carried to the wrong outline. */
  onWrong: () => void;
  /** Every shape is home. Must be stable. */
  onSolved: () => void;
}

export function MatchBoard({
  pieces,
  seed,
  locked,
  teach,
  onGreet,
  onWrong,
  onSolved,
}: MatchBoardProps) {
  /** Outline index → it has its shape. */
  const [placed, setPlaced] = useState<Record<number, boolean>>({});

  /** The loose shapes, never in the order of the outlines. */
  const tray = useMemo(() => {
    const order = pieces.map((_, i) => i).sort((a, b) => unit(seed * 17 + a) - unit(seed * 17 + b));
    const aligned = order.every((at, i) => at === i);
    return aligned && order.length > 1 ? [...order.slice(1), order[0]] : order;
  }, [pieces, seed]);

  const solved = pieces.every((_, i) => placed[i]);

  const isOpen = useCallback((hole: number) => !placed[hole], [placed]);
  /** A shape belongs on the outline of the same shape in the same colour. */
  const fits = useCallback(
    (id: number, hole: number) => {
      const piece = pieces[id];
      const target = pieces[hole];
      return piece !== undefined && target !== undefined && piece.shape === target.shape;
    },
    [pieces]
  );

  const onPlaced = useCallback(
    (id: number) => {
      setPlaced((current) => ({ ...current, [id]: true }));
      onGreet();
    },
    [onGreet]
  );

  const {
    rootRef,
    registerPiece,
    registerHole,
    picked,
    drag,
    flight,
    near,
    wrong,
    bump,
    touches,
    touchCount,
    startDrag,
    tapPiece,
    tapHole,
    centreOfPiece,
    centreOfHole,
  } = useCarry({ locked: locked || solved, isOpen, fits, onPlaced, onRefused: onWrong });

  useEffect(() => {
    if (!solved) return;
    playCorrectSound();
    onSolved();
  }, [solved, onSolved]);

  /** The first round of the game shows how it is played: the hand takes the
   *  first shape in the tray up to the hole that is the same shape. */
  const route = useCallback(() => {
    const first = tray[0];
    if (first === undefined) return null;
    return { from: centreOfPiece(first), to: centreOfHole(first) };
  }, [tray, centreOfPiece, centreOfHole]);

  const hand = useDemoHand({ teach, touches, touchCount, route });

  const sparks = useMemo(() => [<Twinkle key="a" />, <Twinkle key="b" fill="#7FE0FF" />], []);
  const carried = drag?.id ?? flight?.id ?? null;

  return (
    <div ref={rootRef} className="sm-board" data-kind="match" data-n={pieces.length}>
      <Banner text="Put each shape on the same shape!" />

      <div className="sm-panel sm-panel--sum">
        {pieces.map((piece, hole) => {
          const home = placed[hole];
          return (
            <button
              key={hole}
              type="button"
              className="sm-slot"
              ref={(el) => registerHole(hole, el)}
              onClick={() => tapHole(hole)}
              disabled={home || locked}
              data-near={near === hole && !home ? "yes" : undefined}
              data-open={picked !== null && !home ? "yes" : undefined}
              data-bump={bump === hole ? "yes" : undefined}
              data-filled={home ? "yes" : undefined}
              aria-label={home ? "This one is done" : "An empty " + piece.shape}
            >
              {home ? (
                <>
                  <motion.span
                    className="sm-slot-fill"
                    initial={{ scale: 0.86 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 520, damping: 16 }}
                  >
                    <ShapeGlyph piece={piece} />
                  </motion.span>
                  <span className="sm-slot-tick" aria-hidden="true">
                    <Tick />
                  </span>
                  <Burst
                    pieces={sparks}
                    count={8}
                    arc={SPARK_ARC}
                    reach={SPARK_REACH}
                    size="16%"
                    gravity
                  />
                </>
              ) : (
                <span className="sm-slot-fill">
                  <ShapeHole piece={piece} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="sm-panel sm-panel--tray">
        {tray.map((id) => {
          const gone = placed[id] || flight?.id === id;
          const piece = pieces[id];
          return (
            <motion.button
              key={id}
              type="button"
              className="sm-thing touch-none"
              ref={(el) => registerPiece(id, el)}
              data-picked={picked === id ? "yes" : undefined}
              data-used={gone ? "yes" : undefined}
              data-carried={carried === id ? "yes" : undefined}
              disabled={gone || locked}
              onPointerDown={(event) => {
                startDrag(event, id);
                // the shape is named as it is picked up — the ones with a recording
                if (SPOKEN_SHAPES.has(piece.shape)) void playClip("leo-shape-" + piece.shape);
              }}
              onClick={() => tapPiece(id)}
              aria-label={"A " + piece.shape + " — put it on the same shape"}
              aria-pressed={picked === id}
              animate={
                wrong === id
                  ? { rotate: [0, -7, 7, -5, 5, 0] }
                  : { rotate: 0, scale: picked === id ? 1.1 : 1 }
              }
              transition={
                wrong === id
                  ? { duration: SHAKE_MS / 1000 }
                  : { type: "spring", stiffness: 340, damping: 20 }
              }
            >
              <ShapeGlyph piece={piece} />
            </motion.button>
          );
        })}
      </div>

      {drag && (
        <motion.span
          className="sm-ghost"
          data-thing="yes"
          style={cssVars({ "--sm-x": drag.x + "px", "--sm-y": drag.y + "px" })}
          animate={{ rotate: drag.tilt }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          aria-hidden="true"
        >
          <ShapeGlyph piece={pieces[drag.id]} />
        </motion.span>
      )}

      {flight && (
        <motion.span
          className="sm-flight"
          data-thing="yes"
          data-home={flight.home ? "yes" : undefined}
          style={cssVars({ "--sm-x": flight.fx + "px", "--sm-y": flight.fy + "px" })}
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={
            flight.home
              ? { x: flight.tx - flight.fx, y: flight.ty - flight.fy, rotate: [0, -8, 8, -5, 0] }
              : { x: flight.tx - flight.fx, y: flight.ty - flight.fy, rotate: 0 }
          }
          transition={
            flight.home
              ? { duration: SHAKE_MS / 1000, ease: "easeInOut" }
              : { type: "spring", stiffness: 420, damping: 22, duration: FLIGHT_MS / 1000 }
          }
          aria-hidden="true"
        >
          <ShapeGlyph piece={pieces[flight.id]} />
        </motion.span>
      )}

      {hand && hand.at === touches && !solved && (
        <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
      )}
      {solved && <Confetti count={30} />}
    </div>
  );
}
