"use client";

import { useCallback, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  CharacterId,
  CountLevel,
  Level,
  MatchLevel,
  SequenceLevel,
} from "@games/counting-numbers/constants/levels";
import { TOTAL_LEVELS } from "@games/counting-numbers/constants/levels";
import { NumberBubble } from "@games/counting-numbers/components/NumberBubble";
import {
  ConfettiPuff,
  FlyingNumber,
  ProgressStrip,
  StarBurst,
  type Flight,
} from "@games/counting-numbers/components/Placement";
import {
  ANT_COLORS,
  Door,
  Plate,
  TableAndChair,
  Thing,
} from "@games/counting-numbers/components/CountingArt";
import { Character, type Pose } from "@games/counting-numbers/components/Characters";
import { Confetti } from "@shared/components/game/Confetti";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { findDropTarget, registerTarget, toRootPoint } from "@shared/utils/pointer";
import {
  playCorrectSound,
  playFanfare,
  playIncorrectSound,
  playPlaceSound,
} from "@shared/audio/sfx";

/** How far past a target's edge a drop still counts — generous for small
 *  fingers, the portal's usual. */
const DROP_SLOP_PX = 40;
/** After the last right answer: a beat with the confetti, then the progress
 *  strip rises, holds, and the next level slides in. */
const STRIP_AFTER_MS = 900;
const STRIP_HOLD_MS = 2600;

interface LevelScreenProps {
  level: Level;
  /** 0-based, for the progress strip. */
  index: number;
  /** Input is ignored while the game is paused. */
  paused: boolean;
  onComplete: () => void;
}

interface DragState {
  value: number;
  x: number;
  y: number;
}

/** A place a number can go, and the number that belongs there. */
interface Target {
  id: string;
  expected: number;
}

function targetsFor(level: Level): Target[] {
  if (level.kind === "match") return level.cards.map((n, i) => ({ id: `card-${i}`, expected: n }));
  if (level.kind === "sequence") return [{ id: "gap", expected: level.missing }];
  return [];
}

/**
 * ONE LEVEL, whichever kind — the interaction is the same shape for all of
 * them, which is what makes the game feel like one thing:
 *
 *   SHOW THINGS → SHOW THE CHOICES → THE CHILD PICKS A NUMBER →
 *   IT ANIMATES INTO PLACE → CONFETTI → PROGRESS → NEXT
 *
 * Numbers can be DRAGGED onto a place, or TAPPED: a tap on a sequence level
 * sends the number straight to the gap; on a match level a tap picks the
 * number up and a tap on a circle sets it down; on a count level a tap is the
 * answer and the right one lights up green. Wrong is never a failure — the
 * number shakes its head and stays.
 */
export function LevelScreen({ level, index, paused, onComplete }: LevelScreenProps) {
  const targets = useMemo(() => targetsFor(level), [level]);
  const choices = level.choices;

  /** Which number sits in which place. */
  const [placed, setPlaced] = useState<Record<string, number>>({});
  /** The number picked up by a tap (match levels), waiting for a circle. */
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  /** The count puzzle's answer, once lit. */
  const [lit, setLit] = useState<number | null>(null);
  const [showStrip, setShowStrip] = useState(false);
  /** Every answer is in — the level's own celebration is playing. */
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  /** Where the number in flight is going. */
  const flightTargetRef = useRef<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<Map<number, HTMLElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();

  const toRoot = useCallback((x: number, y: number) => toRootPoint(rootRef.current, x, y), []);

  /** The centre of an element, root-relative. */
  const centreOf = useCallback(
    (el: HTMLElement | undefined) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return toRoot(r.left + r.width / 2, r.top + r.height / 2);
    },
    [toRoot]
  );

  /* ── Winning ──────────────────────────────────────────────────────────── */

  /** Every answer is in: stars from the centre, confetti raining, the friend
   *  jumping for joy, the fanfare — then the progress strip, then the next
   *  level slides in. */
  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    playCorrectSound();
    schedule(playFanfare, 350);
    schedule(() => setShowStrip(true), STRIP_AFTER_MS);
    schedule(onComplete, STRIP_AFTER_MS + STRIP_HOLD_MS);
  }, [schedule, onComplete]);

  /** The flying number has arrived: it is in place. */
  const land = useCallback(() => {
    if (!flight) return;
    const targetId = flightTargetRef.current;
    setFlight(null);
    if (!targetId) return;
    playPlaceSound();
    setPlaced((p) => {
      const next = { ...p, [targetId]: flight.value };
      if (Object.keys(next).length >= targets.length) finish();
      return next;
    });
  }, [flight, targets.length, finish]);

  const shakeHead = useCallback(
    (value: number) => {
      playIncorrectSound();
      setWrong(value);
      schedule(() => setWrong(null), 450);
    },
    [schedule]
  );

  /** A number offered to a place: right, and it flies there; wrong, and it
   *  shakes its head where it is. */
  const offer = useCallback(
    (value: number, targetId: string, from: { x: number; y: number }) => {
      if (flight || paused || doneRef.current) return;
      const target = targets.find((t) => t.id === targetId);
      if (!target || placed[targetId] !== undefined) return;
      if (target.expected !== value) {
        shakeHead(value);
        return;
      }
      const to = centreOf(targetRefs.current.get(targetId));
      flightTargetRef.current = targetId;
      setSelected(null);
      setFlight({ value, fx: from.x, fy: from.y, tx: to.x, ty: to.y });
    },
    [flight, paused, targets, placed, shakeHead, centreOf]
  );

  /** The count puzzle: is this how many there are? */
  const answerCount = useCallback(
    (value: number) => {
      if (level.kind !== "count" || paused || doneRef.current) return;
      if (value !== level.count) {
        shakeHead(value);
        return;
      }
      setLit(value);
      playPlaceSound();
      finish();
    },
    [level, paused, shakeHead, finish]
  );

  /* ── Tapping ──────────────────────────────────────────────────────────── */

  const tapBubble = useCallback(
    (value: number) => {
      if (drag || paused) return;
      if (level.kind === "count") return answerCount(value);
      if (level.kind === "sequence") {
        return offer(value, "gap", centreOf(bubbleRefs.current.get(value)));
      }
      // match: pick it up, or put it back down
      setSelected((s) => (s === value ? null : value));
    },
    [drag, paused, level.kind, answerCount, offer, centreOf]
  );

  const tapTarget = useCallback(
    (targetId: string) => {
      if (selected === null || paused) return;
      offer(selected, targetId, centreOf(bubbleRefs.current.get(selected)));
    },
    [selected, paused, offer, centreOf]
  );

  /* ── Dragging ─────────────────────────────────────────────────────────── */

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, value: number) => {
      if (level.kind === "count" || paused || flight || drag) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ value, x: p.x, y: p.y });
      setSelected(null);
    },
    [level.kind, paused, flight, drag, toRoot]
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
        targetRefs.current,
        e.clientX,
        e.clientY,
        DROP_SLOP_PX,
        (id) => placed[id] === undefined
      );
      // let go over open ground: the number is simply home again
      if (over) offer(value, over, toRoot(e.clientX, e.clientY));
    },
    [drag, placed, offer, toRoot]
  );

  /* ── Render ───────────────────────────────────────────────────────────── */

  const placedValues = useMemo(() => new Set(Object.values(placed)), [placed]);

  const bubble = (value: number, i: number) => (
    <NumberBubble
      key={`${value}-${i}`}
      ref={(el) => registerTarget(bubbleRefs.current, value, el)}
      value={value}
      tone={level.tone}
      selected={selected === value}
      wrong={wrong === value}
      lit={lit === value}
      used={placedValues.has(value) || flight?.value === value}
      dragging={drag?.value === value}
      onPointerDown={(e) => startDrag(e, value)}
      onClick={() => tapBubble(value)}
      ariaLabel={
        level.kind === "count"
          ? `${value} — is that how many?`
          : `Number ${value} — put it where it belongs`
      }
    />
  );

  return (
    <div
      ref={rootRef}
      className={`cn-level cn-scene--${level.scene} ${paused ? "cn-level--paused" : ""}`}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {level.kind === "match" && (
        <MatchBoard
          level={level}
          placed={placed}
          done={done}
          targetRefs={targetRefs}
          onTapTarget={tapTarget}
          bubbles={choices.map(bubble)}
        />
      )}
      {level.kind === "sequence" && (
        <SequenceScene
          level={level}
          placed={placed}
          done={done}
          targetRefs={targetRefs}
          onTapTarget={tapTarget}
          bubbles={choices.map(bubble)}
        />
      )}
      {level.kind === "count" && (
        <CountScene level={level} lit={lit} done={done} bubbles={choices.map(bubble)} />
      )}

      {/* the number on its way into place */}
      {flight && <FlyingNumber flight={flight} tone={level.tone} onArrive={land} />}

      {/* the level's own celebration: stars from the middle, confetti down
          the whole screen */}
      {done && (
        <>
          <StarBurst delay={0.1} />
          <Confetti count={44} />
        </>
      )}

      {/* the number under the finger (a pause hides it; the pointer-up that
          follows, captured by the bubble, clears it) */}
      {drag && !paused && (
        <div
          className="cn-flight pl-at pointer-events-none absolute z-40"
          style={cssVars({ "--pl-x": `${drag.x}px`, "--pl-y": `${drag.y}px` })}
          aria-hidden="true"
        >
          <span className={`cn-bubble cn-bubble--${level.tone} cn-bubble--flying`}>
            <span className="cn-bubble-glyph font-rounded font-black">{drag.value}</span>
          </span>
        </div>
      )}

      <AnimatePresence>
        {showStrip && <ProgressStrip key="strip" value={(index + 1) / TOTAL_LEVELS} />}
      </AnimatePresence>
    </div>
  );
}

/* ── The three compositions ──────────────────────────────────────────────── */

interface BoardProps<L> {
  level: L;
  placed: Record<string, number>;
  /** The level is finished — the friend cheers. */
  done: boolean;
  targetRefs: RefObject<Map<string, HTMLElement>>;
  onTapTarget: (id: string) => void;
  bubbles: React.ReactNode[];
}

/** The friend on a level: bobs gently while the child works, and once the
 *  level is done throws both arms up and jumps for joy — twice, the second
 *  a little smaller. Percent moves so the jump scales with the friend. */
const JUMP = { y: ["0%", "-25%", "0%", "-14%", "0%"], rotate: [0, -6, 6, -3, 0] };
const BOB = { y: ["0%", "-3%", "0%"] };

function Friend({
  id,
  className,
  done,
  idle = "wave",
}: {
  id: CharacterId;
  className: string;
  done: boolean;
  idle?: Pose;
}) {
  return (
    <motion.div
      className={`cn-friend ${className}`}
      aria-hidden="true"
      animate={done ? JUMP : BOB}
      transition={
        done
          ? { duration: 1.1, ease: "easeOut" }
          : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <Character id={id} pose={done ? "cheer" : idle} />
    </motion.div>
  );
}

/** A black circle waiting for its number, or the number once it is there —
 *  landing with a bounce and a puff of confetti. */
function Slot({
  id,
  placed,
  targetRefs,
  onTap,
  tone,
  label,
}: {
  id: string;
  placed?: number;
  targetRefs: RefObject<Map<string, HTMLElement>>;
  onTap: (id: string) => void;
  tone: string;
  label: string;
}) {
  return (
    <button
      type="button"
      ref={(el) => registerTarget(targetRefs.current, id, el)}
      className={`cn-slot ${placed !== undefined ? `cn-slot--filled cn-bubble cn-bubble--${tone}` : ""}`}
      onClick={() => onTap(id)}
      aria-label={placed !== undefined ? `${placed}` : label}
    >
      {placed !== undefined && (
        <>
          <motion.span
            className="cn-bubble-glyph font-rounded font-black"
            initial={{ scale: 0.4 }}
            animate={{ scale: [0.4, 1.3, 1] }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {placed}
          </motion.span>
          <ConfettiPuff />
        </>
      )}
    </button>
  );
}

/** The white board: cards of things, a black circle under each, and the
 *  numbers in a lavender strip below. */
function MatchBoard({
  level,
  placed,
  done,
  targetRefs,
  onTapTarget,
  bubbles,
}: BoardProps<MatchLevel>) {
  return (
    <>
      {level.character && <Friend id={level.character} className="cn-friend--board" done={done} />}
      <div className="cn-board">
        <div className="cn-board-cards">
          {level.cards.map((n, i) => (
            <div
              key={i}
              className={`cn-card ${placed[`card-${i}`] !== undefined ? "cn-card--done" : ""}`}
              aria-label={`${n} ${level.theme}s`}
            >
              {Array.from({ length: n }, (_, k) => (
                <span key={k} className={`cn-card-thing cn-cluster-${k + 1}-of-${n}`}>
                  <Thing theme={level.theme} index={k} />
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="cn-board-slots">
          {level.cards.map((_, i) => (
            <Slot
              key={i}
              id={`card-${i}`}
              placed={placed[`card-${i}`]}
              targetRefs={targetRefs}
              onTap={onTapTarget}
              tone={level.tone}
              label={`Empty circle under card ${i + 1}`}
            />
          ))}
        </div>
        <div className="cn-board-strip">{bubbles}</div>
      </div>
    </>
  );
}

/** Things in a row, each wearing its number, one of them a black circle. */
function SequenceScene({
  level,
  placed,
  done,
  targetRefs,
  onTapTarget,
  bubbles,
}: BoardProps<SequenceLevel>) {
  const numbers = Array.from({ length: level.length }, (_, i) => level.start + i);
  return (
    <>
      {level.character && (
        <Friend id={level.character} className={`cn-friend--${level.theme}`} done={done} />
      )}
      <div className={`cn-sequence cn-sequence--${level.theme}`}>
        {numbers.map((n, i) => {
          const isGap = n === level.missing;
          // a missing balloon is a black circle where the balloon would be;
          // the ants and the doors stay, with the circle beside them
          const hideThing = isGap && level.theme === "balloon";
          return (
            <div
              key={n}
              className={`cn-station cn-station--${level.theme} cn-station-${i + 1}-of-${level.length}`}
              style={cssVars({ "--pl-color": ANT_COLORS[(n - 1) % ANT_COLORS.length] })}
            >
              {level.theme === "door" ? (
                <Door index={i} />
              ) : (
                !hideThing && (
                  <span className="cn-station-thing">
                    <Thing theme={level.theme} index={i} />
                  </span>
                )
              )}
              {isGap ? (
                <Slot
                  id="gap"
                  placed={placed.gap}
                  targetRefs={targetRefs}
                  onTap={onTapTarget}
                  tone={level.tone}
                  label="The missing number goes here"
                />
              ) : (
                <span className="cn-station-number font-rounded font-black" aria-label={`${n}`}>
                  {n}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className={`cn-choices cn-choices--${level.choicesAt}`}>{bubbles}</div>
    </>
  );
}

/** A picture with some things in it, and the numbers to choose from in a
 *  curved panel on one side. */
function CountScene({
  level,
  lit,
  done,
  bubbles,
}: {
  level: CountLevel;
  lit: number | null;
  done: boolean;
  bubbles: React.ReactNode[];
}) {
  const things = Array.from({ length: level.count }, (_, k) => (
    <span key={k} className={`cn-count-thing cn-cluster-${k + 1}-of-${level.count}`}>
      <Thing theme={level.theme} index={k} />
    </span>
  ));
  return (
    <>
      {level.scene === "classroom" && (
        <div className="cn-classroom" aria-hidden="true">
          <TableAndChair />
          <div className="cn-plate">
            <Plate />
          </div>
        </div>
      )}
      <div className={`cn-count cn-count--${level.theme} cn-count--${level.scene}`}>
        {level.character && (
          <Friend
            id={level.character}
            className="cn-friend--count"
            done={done}
            idle={level.theme === "bird" ? "idle" : "wave"}
          />
        )}
        <div className="cn-count-things" aria-label={`${level.count} ${level.theme}s`}>
          {things}
        </div>
      </div>
      <div className={`cn-panel cn-panel--${level.panel}`}>
        <div className="cn-panel-choices">{bubbles}</div>
        {lit !== null && (
          <div className="cn-panel-confetti" aria-hidden="true">
            <ConfettiPuff count={28} />
          </div>
        )}
      </div>
    </>
  );
}
