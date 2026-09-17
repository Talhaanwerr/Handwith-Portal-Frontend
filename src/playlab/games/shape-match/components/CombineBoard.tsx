"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { Confetti } from "@shared/components/game/Confetti";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { playCorrectSound, playSnapSound } from "@shared/audio/sfx";
import { registerTarget } from "@shared/utils/pointer";
import { CARD_COUNT, answerCards, type PieceSet } from "@games/shape-match/constants/sets";
import type { Piece } from "@games/shape-match/constants/shapes";
import { ShapeGlyph, Twinkle } from "@games/shape-match/components/ShapeArt";
import { Banner } from "@games/shape-match/components/Banner";
import { SHAKE_MS, useCarry, type CarryPoint } from "@games/shape-match/hooks/useCarry";
import { useDemoHand } from "@games/shape-match/hooks/useDemoHand";

/**
 * THE THREE-PIECE PUZZLE — the main event.
 *
 *   [yellow rectangle] + [purple circle] + [green triangle] = [ ? ]
 *
 * Four answer cards sit underneath. One holds THE SAME THREE PIECES; the
 * others are near-misses — one has a piece recoloured, one is missing a piece,
 * one has a piece swapped for a different shape. The child has to match all
 * three at once, which is the whole puzzle: two out of three is not enough.
 *
 * AND THE PIECES TRAVEL SEPARATELY. Choosing the right card does not swap the
 * question mark for a picture — the three pieces lift off the card one after
 * another, fly to the empty slot, and lock into place with a bounce. That is
 * the difference between a screen that changed and a thing that happened:
 * a child watches their three pieces go up there and make the answer.
 *
 * Tap a card or drag it — both go through the same door, so a hand that
 * cannot hold a drag steady plays exactly the same game.
 */

/** The three pieces leave one after another, not in a bunch. */
const STAGGER_MS = 110;
const FIRST_MS = 150;
/** How long one piece takes to get there. */
const TRAVEL_MS = 480;

/** One slot on this board, and it is slot zero. */
const SLOT = 0;

/* after the banner has been read out, never over it */
/* this board's banner is a question, so its hand waits a beat longer */
const HAND_AFTER_MS = 3200;
const SPARK_REACH = [8, 24] as const;
const SPARK_ARC = [-170, -10] as const;

/** A piece on its way from a card to the slot. */
interface Landing {
  piece: Piece;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  delay: number;
}

interface CombineBoardProps {
  set: PieceSet;
  /** Fixes which cards are offered and where the right one sits. */
  seed: number;
  locked: boolean;
  /** Show the child how it is played, unasked. */
  teach: boolean;
  /** A card was carried somewhere it does not belong. */
  onWrong: () => void;
  /** The three pieces are in. Must be stable. */
  onSolved: () => void;
}

export function CombineBoard({ set, seed, locked, teach, onWrong, onSolved }: CombineBoardProps) {
  const cards = useMemo(() => answerCards(set, seed), [set, seed]);
  const right = cards.findIndex((card) => card.right);

  /** The pieces in the air, and then the answer sitting in the slot. */
  const [flying, setFlying] = useState<readonly Landing[] | null>(null);
  /** The card the child chose. It swells for a moment before its pieces leave
   *  it — the answer to "did it hear me?", given in the tenth of a second
   *  before anything else happens, and the only such answer a tap gets. */
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  /** Where every piece of every card is, and where each one is going. */
  const cardPieces = useRef<Map<string, HTMLElement>>(new Map());
  const slotPieces = useRef<Map<number, HTMLElement>>(new Map());

  const isOpen = useCallback(() => !flying && !done, [flying, done]);
  const fits = useCallback((id: number) => id === right, [right]);

  /** The board measures with the carry engine's ruler, which is created just
   *  below — so `onPlaced`, which runs long afterwards, reaches it through a
   *  ref rather than closing over a value that does not exist yet. */
  const measure = useRef<(el: HTMLElement | undefined) => CarryPoint>(() => ({ x: 0, y: 0 }));

  /**
   * THE RIGHT CARD WAS CHOSEN — by a tap or by a drag, it makes no difference
   * here. Each piece leaves the card from where it actually sits, a beat after
   * the one before it, and lands where it actually belongs in the slot.
   */
  const onPlaced = useCallback(
    (id: number, _hole: number, from: CarryPoint) => {
      const card = cards[id];
      if (!card) return;
      setChosen(id);
      const cardCentre = measure.current(cardPieces.current.get(id + "-centre"));
      // dropped by hand: the pieces set off from the hand, not from the card
      const dx = from.x - cardCentre.x;
      const dy = from.y - cardCentre.y;

      setFlying(
        card.parts.map((piece, i) => {
          const start = measure.current(cardPieces.current.get(id + "-" + i));
          const end = measure.current(slotPieces.current.get(i));
          return {
            piece,
            fx: start.x + dx,
            fy: start.y + dy,
            tx: end.x,
            ty: end.y,
            delay: (FIRST_MS + i * STAGGER_MS) / 1000,
          };
        })
      );
    },
    [cards]
  );

  /** They have all arrived: they lock together, and the round is won. ON A
   *  TIMER, never on an animation's completion callback. */
  useEffect(() => {
    if (!flying) return;
    const total = FIRST_MS + (flying.length - 1) * STAGGER_MS + TRAVEL_MS;
    const timer = setTimeout(() => {
      setFlying(null);
      setDone(true);
      playSnapSound();
    }, total);
    return () => clearTimeout(timer);
  }, [flying]);

  useEffect(() => {
    if (!done) return;
    playCorrectSound();
    onSolved();
  }, [done, onSolved]);

  const {
    rootRef,
    registerPiece,
    centreOf,
    drag,
    near,
    wrong,
    bump,
    touches,
    touchCount,
    startDrag,
    offer,
    registerHole,
    centreOfPiece,
    centreOfHole,
  } = useCarry({
    locked: locked || done,
    isOpen,
    fits,
    onPlaced,
    instant: true,
    onRefused: onWrong,
  });

  useEffect(() => {
    measure.current = centreOf;
  }, [centreOf]);

  /** The first puzzle of the game shows how it is played: the hand takes the
   *  right card up to the slot. */
  const route = useCallback(
    () => ({ from: centreOfPiece(right), to: centreOfHole(SLOT) }),
    [right, centreOfPiece, centreOfHole]
  );

  const hand = useDemoHand({ teach, touches, touchCount, route, afterMs: HAND_AFTER_MS });

  const sparks = useMemo(() => [<Twinkle key="a" />, <Twinkle key="b" fill="#FF7EB6" />], []);
  const carried = drag?.id ?? null;

  return (
    <div ref={rootRef} className="sm-board" data-kind="combine">
      <Banner text="Which one has all three?" />

      {/* the question: these three pieces make what? */}
      <div className="sm-panel sm-panel--sum">
        {set.parts.map((piece, i) => (
          <span className="sm-sum-step" key={i}>
            {i > 0 && (
              <span className="sm-sign font-rounded font-black" aria-hidden="true">
                +
              </span>
            )}
            <span className="sm-part">
              <ShapeGlyph piece={piece} />
            </span>
          </span>
        ))}

        <span className="sm-sign font-rounded font-black" aria-hidden="true">
          =
        </span>

        <motion.button
          type="button"
          className="sm-slot"
          ref={(el) => registerHole(SLOT, el)}
          onClick={() => offer(right, SLOT, centreOfPiece(right))}
          disabled={done || locked || flying !== null}
          data-near={near === SLOT && !done ? "yes" : undefined}
          data-bump={bump === SLOT ? "yes" : undefined}
          data-filled={done ? "yes" : undefined}
          aria-label={done ? "All three are in place" : "The empty place for the answer"}
          animate={done ? { scale: [1, 1.12, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="sm-slot-row">
            {set.parts.map((piece, i) => (
              <span
                className="sm-slot-part"
                key={i}
                ref={(el) => registerTarget(slotPieces.current, i, el)}
                data-here={done ? "yes" : undefined}
              >
                {done ? <ShapeGlyph piece={piece} /> : <span className="sm-slot-ghost" />}
              </span>
            ))}
          </span>

          {!done && (
            <span className="sm-slot-ask font-rounded font-black" aria-hidden="true">
              ?
            </span>
          )}

          {done && (
            <Burst
              pieces={sparks}
              count={12}
              arc={SPARK_ARC}
              reach={SPARK_REACH}
              size="10%"
              gravity
            />
          )}
        </motion.button>
      </div>

      {/* four answers, in two rows of two */}
      <div className="sm-cards" data-count={CARD_COUNT}>
        {cards.map((card, id) => (
          <motion.button
            key={id}
            type="button"
            className="sm-card-answer touch-none"
            ref={(el) => {
              registerPiece(id, el);
              registerTarget(cardPieces.current, id + "-centre", el);
            }}
            data-carried={carried === id ? "yes" : undefined}
            data-used={done && card.right ? "yes" : undefined}
            disabled={done || locked || flying !== null}
            onPointerDown={(event) => startDrag(event, id)}
            onClick={() => offer(id, SLOT, measure.current(cardPieces.current.get(id + "-centre")))}
            aria-label={"An answer with " + card.parts.length + " pieces"}
            animate={
              wrong === id
                ? { rotate: [0, -6, 6, -4, 4, 0] }
                : chosen === id
                  ? { rotate: 0, scale: [1, 1.14, 1.06] }
                  : { rotate: 0, scale: carried === id ? 1.04 : 1 }
            }
            transition={
              wrong === id
                ? { duration: SHAKE_MS / 1000 }
                : chosen === id
                  ? { duration: FIRST_MS / 1000, ease: "easeOut" }
                  : { type: "spring", stiffness: 340, damping: 20 }
            }
          >
            {card.parts.map((piece, i) => (
              <span
                className="sm-card-part"
                key={i}
                ref={(el) => registerTarget(cardPieces.current, id + "-" + i, el)}
                /* it leaves the card at the moment its flying copy sets off,
                   so the piece is never in two places at once */
                style={cssVars({ "--sm-delay": (FIRST_MS + i * STAGGER_MS) / 1000 + "s" })}
                data-gone={(flying || done) && card.right ? "yes" : undefined}
              >
                <ShapeGlyph piece={piece} />
              </span>
            ))}
          </motion.button>
        ))}
      </div>

      {/* the card under the finger, leaning the way it is moved */}
      {drag && cards[drag.id] && (
        <motion.span
          className="sm-ghost"
          data-card="yes"
          style={cssVars({ "--sm-x": drag.x + "px", "--sm-y": drag.y + "px" })}
          animate={{ rotate: drag.tilt }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          aria-hidden="true"
        >
          {cards[drag.id].parts.map((piece, i) => (
            <span className="sm-card-part" key={i}>
              <ShapeGlyph piece={piece} />
            </span>
          ))}
        </motion.span>
      )}

      {/* THE THREE PIECES ON THEIR WAY: one after another, each to its own
          place in the slot */}
      {flying?.map((landing, i) => (
        <motion.span
          key={i}
          className="sm-flight"
          data-part="yes"
          style={cssVars({ "--sm-x": landing.fx + "px", "--sm-y": landing.fy + "px" })}
          initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{
            x: landing.tx - landing.fx,
            y: landing.ty - landing.fy,
            scale: [1, 1.14, 1],
            rotate: [0, i % 2 ? 10 : -10, 0],
          }}
          transition={{
            duration: TRAVEL_MS / 1000,
            delay: landing.delay,
            ease: [0.3, 0.9, 0.3, 1],
          }}
          aria-hidden="true"
        >
          <ShapeGlyph piece={landing.piece} />
        </motion.span>
      ))}

      {hand && hand.at === touches && !done && (
        <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
      )}
      {done && <Confetti count={34} />}
    </div>
  );
}
