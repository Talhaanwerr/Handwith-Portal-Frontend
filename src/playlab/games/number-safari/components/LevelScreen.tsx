"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import type { CountLevel, Level, SequenceLevel } from "@games/number-safari/constants/levels";
import { SCATTER_MAX, numbersFor } from "@games/number-safari/constants/levels";
import { NumberBubble } from "@games/number-safari/components/NumberBubble";
import { Spark, Thing } from "@games/number-safari/components/SceneArt";
import { Teacher } from "@games/door-count/components/Teacher";
import { Burst } from "@shared/components/game/Burst";
import { Confetti } from "@shared/components/game/Confetti";
import { Ripple } from "@shared/components/game/Ripple";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { cssVars } from "@shared/styles/cssVars";
import { cheerFor } from "@shared/audio/cheers";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useDragDrop, type DropInfo } from "@shared/hooks/useDragDrop";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import {
  playCorrectSound,
  playFanfare,
  playIncorrectSound,
  playPlaceSound,
} from "@shared/audio/sfx";

/** The numbers with a real recording: one to ten, and the fives and tens the
 *  tricky run counts in. Anything else stays SILENT rather than being read by
 *  a synthesiser — this portal speaks with real recordings or not at all. */
const SPOKEN_NUMBERS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 25, 30, 35, 40, 45, 50]);

function numberClip(value: number): string | null {
  return SPOKEN_NUMBERS.has(value) ? `number-${value}` : null;
}

/** How far past a target's edge a drop still counts — small fingers miss. */
const DROP_SLOP_PX = 40;
/** The celebration holds this long before the next level slides in. */
const HOLD_MS = 2400;
/** How long a number takes to fly into the gap. The landing is a TIMER on
 *  this, never the animation's own completion callback: Motion does not
 *  report completion reliably, and a missed callback left a board waiting
 *  forever (the freeze Leo's Puzzles and Number Pals both had). */
const FLIGHT_MS = 500;

/** The confetti this game throws — squares in the six colours of the world. */
const CONFETTI_COLORS = ["#E0413F", "#3F6FBF", "#F6C544", "#5FAF3A", "#F28AB2", "#F28A2E"] as const;

interface LevelScreenProps {
  level: Level;
  /** 0-based, for the bar along the top. */
  index: number;
  total: number;
  /** A wrong answer — the run's star count depends on these. */
  onMiss: () => void;
  onComplete: () => void;
}

interface Flight {
  value: number;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * ONE LEVEL, either kind. The interaction is deliberately the same shape for
 * both, which is what lets a child who has understood screen one play screen
 * eighteen without being taught anything new:
 *
 *   SHOW THINGS → SHOW THE NUMBERS → THE CHILD PICKS ONE →
 *   IT GOES WHERE IT BELONGS → STARS AND CONFETTI → NEXT
 *
 * On a sequence level a number can be DRAGGED into the gap or simply TAPPED,
 * and it flies there itself. On a count level the tap IS the answer. Wrong is
 * never a failure anywhere: the number shakes its head and stays where it is,
 * and the only thing that remembers is the star count at the end of the run.
 */
export function LevelScreen({ level, index, total, onMiss, onComplete }: LevelScreenProps) {
  /** Where the missing number goes — count levels have nowhere. */
  const hasGap = level.kind === "sequence";

  useSayOnEnter(
    hasGap
      ? // how to answer is said on the first two levels only; after that the ask is enough
        index < 2
        ? ["instr-safari-missing", "instr-safari-drag"]
        : ["instr-safari-missing"]
      : ["instr-safari-count"]
  );

  const [placed, setPlaced] = useState<number | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [lit, setLit] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<Map<number, HTMLElement>>(new Map());
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();

  const toRoot = useCallback((x: number, y: number) => toRootPoint(rootRef.current, x, y), []);

  const centreOf = useCallback(
    (el: HTMLElement | undefined) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return toRoot(r.left + r.width / 2, r.top + r.height / 2);
    },
    [toRoot]
  );

  /* ── Winning ──────────────────────────────────────────────────────────── */

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    playCorrectSound();
    schedule(playFanfare, 320);
    void sayAfter(cheerFor(level.id));
    schedule(onComplete, HOLD_MS);
  }, [schedule, onComplete, level.id]);

  const shakeHead = useCallback(
    (value: number) => {
      playIncorrectSound();
      void playClip("instr-try-again");
      onMiss();
      setWrong(value);
      schedule(() => setWrong(null), 450);
    },
    [schedule, onMiss]
  );

  /** The number in flight has arrived: it is in place, and that is the level. */
  const land = useCallback(
    (value: number) => {
      setFlight(null);
      playPlaceSound();
      const said = numberClip(value);
      if (said) void playClip(said);
      setPlaced(value);
      finish();
    },
    [finish]
  );

  /** A number offered to the gap: right, and it flies there; wrong, and it
   *  shakes its head where it stands. */
  const offer = useCallback(
    (value: number, from: { x: number; y: number }) => {
      if (!hasGap || flight || doneRef.current || placed !== null) return;
      if ((level as SequenceLevel).missing !== value) {
        shakeHead(value);
        return;
      }
      const to = centreOf(targetRefs.current.get("gap"));
      setFlight({ value, fx: from.x, fy: from.y, tx: to.x, ty: to.y });
      schedule(() => land(value), FLIGHT_MS);
    },
    [hasGap, flight, placed, level, shakeHead, centreOf, schedule, land]
  );

  /** The count puzzle: is this how many there are? */
  const answerCount = useCallback(
    (value: number) => {
      if (level.kind !== "count" || doneRef.current) return;
      if (value !== level.count) {
        shakeHead(value);
        return;
      }
      setLit(value);
      playPlaceSound();
      const said = numberClip(value);
      if (said) void playClip(said);
      finish();
    },
    [level, shakeHead, finish]
  );

  /* ── Tapping and dragging ─────────────────────────────────────────────── */

  /** A number let go: over the gap it is offered there; over open ground it
   *  is simply home again — never a failure, never a sound. */
  const drop = useCallback(
    (value: number, target: string | null, from: DropInfo) => {
      if (target) offer(value, from);
    },
    [offer]
  );

  const { dragging, start, ghostRef, tookClick } = useDragDrop<number, string>({
    root: rootRef,
    targets: targetRefs,
    slopPx: DROP_SLOP_PX,
    onDrop: drop,
  });

  const tapBubble = useCallback(
    (value: number) => {
      // the click that ends a DRAG is not a tap: without this a wrong number
      // dragged to the gap was counted twice, and one dropped on open ground
      // was counted as a miss at all
      if (tookClick()) return;
      if (level.kind === "count") return answerCount(value);
      offer(value, centreOf(bubbleRefs.current.get(value)));
    },
    [tookClick, level.kind, answerCount, offer, centreOf]
  );

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, value: number) => {
      if (level.kind === "count" || flight || doneRef.current) return;
      start(e, value);
    },
    [level.kind, flight, start]
  );

  /* ── Render ───────────────────────────────────────────────────────────── */

  const confettiPieces = useMemo<readonly ReactNode[]>(
    () =>
      CONFETTI_COLORS.map((c) => (
        <span key={c} className="ns-confetti" style={cssVars({ "--pl-color": c })} />
      )),
    []
  );

  const bubbles = level.choices.map((value, i) => (
    <NumberBubble
      key={`${value}-${i}`}
      ref={(el) => registerTarget(bubbleRefs.current, value, el)}
      value={value}
      tone={level.tone}
      wrong={wrong === value}
      lit={lit === value}
      used={placed === value || flight?.value === value}
      dragging={dragging === value}
      onPointerDown={(e) => startDrag(e, value)}
      onClick={() => tapBubble(value)}
      ariaLabel={
        level.kind === "count"
          ? `${value} — is that how many?`
          : `Number ${value} — put it where it belongs`
      }
    />
  ));

  return (
    <div ref={rootRef} className={`ns-level ns-scene--${level.scene}`}>
      <div className="ns-progress" role="status" aria-label={`Level ${index + 1} of ${total}`}>
        <ProgressBar
          value={(index + (done ? 1 : 0)) / total}
          trackClassName="ns-progress-bar"
          fillClassName="ns-progress-fill"
        />
      </div>

      {level.kind === "sequence" ? (
        <SequenceScene level={level} placed={placed} targetRefs={targetRefs} bubbles={bubbles} />
      ) : (
        <CountScene level={level} bubbles={bubbles} />
      )}

      {level.teacher && (
        <div className="ns-teacher-slot">
          <Teacher cheer={done} say={done ? clipText(cheerFor(level.id)) : undefined} />
        </div>
      )}

      {/* the number on its way into the gap: parked AT the gap, and flown in
          from where it started by a transform — root-relative, never fixed */}
      {flight && (
        <motion.div
          className="ns-flight pl-at pointer-events-none absolute z-40"
          style={cssVars({ "--pl-x": `${flight.tx}px`, "--pl-y": `${flight.ty}px` })}
          initial={{ x: flight.fx - flight.tx, y: flight.fy - flight.ty, scale: 1.05 }}
          animate={{ x: 0, y: 0, scale: 1 }}
          transition={{ duration: FLIGHT_MS / 1000, ease: [0.3, 0.7, 0.2, 1] }}
          aria-hidden="true"
        >
          <span
            className={`ns-bubble ns-bubble--${level.tone} ns-bubble--flying ${
              flight.value >= 10 ? "ns-bubble--wide" : ""
            }`}
          >
            <span className="ns-bubble-glyph font-rounded font-black">{flight.value}</span>
          </span>
        </motion.div>
      )}

      {/* the number under the finger */}
      {dragging !== null && (
        <div ref={ghostRef} className="ns-flight pl-drag-ghost" aria-hidden="true">
          <span
            className={`ns-bubble ns-bubble--${level.tone} ns-bubble--flying ${
              dragging >= 10 ? "ns-bubble--wide" : ""
            }`}
          >
            <span className="ns-bubble-glyph font-rounded font-black">{dragging}</span>
          </span>
        </div>
      )}

      {/* the level is solved: rings out of the middle, a shower of stars, and
          confetti down the whole screen */}
      {done && (
        <>
          <div className="ns-centre" aria-hidden="true">
            <Ripple count={3} size="clamp(40px, 22cqh, 200px)" />
            <Burst
              pieces={[<Spark key="spark" />]}
              count={26}
              delay={0.1}
              reach={[16, 48]}
              size="clamp(14px, 5cqh, 40px)"
            />
            <Burst
              pieces={confettiPieces}
              count={30}
              delay={0.05}
              reach={[10, 40]}
              gravity
              size="clamp(6px, 2.4cqh, 14px)"
            />
          </div>
          <Confetti count={44} />
        </>
      )}
    </div>
  );
}

/* ── The two compositions ────────────────────────────────────────────────── */

/** The black circle the missing number belongs in, or that number once it has
 *  landed — arriving with a bounce. */
function Gap({
  placed,
  targetRefs,
  tone,
}: {
  placed: number | null;
  targetRefs: RefObject<Map<string, HTMLElement>>;
  tone: string;
}) {
  return (
    <span
      ref={(el) => registerTarget(targetRefs.current, "gap", el)}
      className={`ns-slot ${placed !== null ? `ns-slot--filled ns-bubble ns-bubble--${tone}` : ""}`}
      // a label on a bare span is ignored by some screen readers; the gap is
      // never tapped (a tap on the number sends it here), so it is a picture
      // with a name rather than a control
      role="img"
      aria-label={placed !== null ? `${placed}` : "The missing number goes here"}
    >
      {placed !== null && (
        <motion.span
          className="ns-bubble-glyph font-rounded font-black"
          initial={{ scale: 0.4 }}
          animate={{ scale: [0.4, 1.3, 1] }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {placed}
        </motion.span>
      )}
    </span>
  );
}

/** Things in a line, each carrying its number, one of them carrying a hole. */
function SequenceScene({
  level,
  placed,
  targetRefs,
  bubbles,
}: {
  level: SequenceLevel;
  placed: number | null;
  targetRefs: RefObject<Map<string, HTMLElement>>;
  bubbles: ReactNode[];
}) {
  const numbers = numbersFor(level);

  return (
    <>
      <div className={`ns-line ns-line--${level.length}`}>
        {numbers.map((n, i) => (
          <div className="ns-station" key={n}>
            {n === level.missing ? (
              <Gap placed={placed} targetRefs={targetRefs} tone={level.tone} />
            ) : (
              <span
                className={`ns-station-number ns-station-number--${level.tone} ${
                  n >= 10 ? "ns-station-number--wide" : ""
                } font-rounded font-black`}
                aria-label={`${n}`}
              >
                {n}
              </span>
            )}
            <span className="ns-station-thing">
              <Thing theme={level.theme} index={i} />
            </span>
          </div>
        ))}
      </div>

      <div className={`ns-choices ns-choices--${level.choicesAt}`}>{bubbles}</div>
    </>
  );
}

/** A picture with things in it, and the numbers to choose from in a panel
 *  curving in from one side. */
function CountScene({ level, bubbles }: { level: CountLevel; bubbles: ReactNode[] }) {
  // up to five things are SCATTERED in the arrangement the reference uses;
  // past that they line up in rows, which is both the only way twenty fit and
  // the way a child is taught to count a big group
  const scattered = level.count <= SCATTER_MAX;
  const things = Array.from({ length: level.count }, (_, k) => (
    <span
      key={k}
      className={`ns-count-thing ${scattered ? `ns-cluster-${k + 1}-of-${level.count}` : ""}`}
    >
      <Thing theme={level.theme} index={k} />
    </span>
  ));

  const decoys = level.decoy
    ? Array.from({ length: level.decoy.count }, (_, k) => (
        <span key={`d${k}`} className={`ns-count-thing ns-decoy-${k + 1}`}>
          <Thing theme={level.decoy!.theme} index={k} />
        </span>
      ))
    : null;

  return (
    <>
      <div
        className={`ns-count-things ${scattered ? "" : "ns-count-things--rows"}`}
        aria-label="Some things to count"
      >
        {things}
        {decoys}
      </div>
      <div className={`ns-panel ns-panel--${level.panel}`}>
        <div className="ns-panel-choices">{bubbles}</div>
      </div>
    </>
  );
}
