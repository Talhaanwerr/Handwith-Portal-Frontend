"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  isNeighbour,
  pathFor,
  prizeOf,
  sizeOf,
  startOf,
  type Maze,
  type Pos,
} from "@games/math-maze/constants/mazes";
import { MazeTitle } from "@games/math-maze/components/MazeTitle";
import { MazeWorker, type WorkerMood } from "@games/math-maze/components/MazeWorker";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { ConfettiPuff } from "@games/counting-numbers/components/Placement";
import { Picture } from "@games/blend-read/components/PictureArt";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { FigureBreak } from "@shared/components/game/FigureBreak";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { toRootPoint } from "@shared/utils/pointer";
import { cheerFor } from "@shared/audio/cheers";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import {
  playCelebrationSound,
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
  playPlaceSound,
} from "@shared/audio/sfx";

/** Nothing tapped for this long and the hand shows the next number. */
const IDLE_HINT_MS = 6000;
/** Two wrong taps in a row and the hand shows it straight away. */
const WRONGS_BEFORE_HINT = 2;
/** How long the big celebration holds the board (FigureBreak is 2.3s). */
const BREAK_MS = 2400;
/** The builder's thumbs-up after every right number. */
const JUMP_MS = 1100;
/** His head-shake after a wrong one. */
const OOPS_MS = 600;

/** Only 1 to 10 are recorded: past ten (the twos run's 12 – 20) a number
 *  stays silent rather than being read by a synthesiser. */
function numberClip(value: number): string | null {
  return value >= 1 && value <= 10 ? `number-${value}` : null;
}

const key = (p: Pos) => `${p.r},${p.c}`;

/** A head-shake, run by the browser on the tile itself: no React state, no
 *  re-render, and it restarts cleanly on a second wrong tap. */
const SHAKE: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-6px)" },
  { transform: "translateX(6px)" },
  { transform: "translateX(-4px)" },
  { transform: "translateX(4px)" },
  { transform: "translateX(0)" },
];

interface CellProps {
  r: number;
  c: number;
  value: number;
  /** On the trail already. */
  on: boolean;
  /** A decoy already tried: crossed out, and it no longer takes a tap. */
  crossed: boolean;
  /** The step just taken — it throws the confetti. */
  pop: boolean;
  onTap: (r: number, c: number, value: number) => void;
  register: (k: string, el: HTMLElement | null) => void;
}

/**
 * One number tile. MEMOISED, and a plain button: a tap changes one or two
 * tiles, so only those re-render. (Every tile used to be a Framer component
 * that re-rendered on every tap — 36 of them for one shake nobody needed,
 * and at phone speed that was most of a second per tap.)
 */
const MazeCell = memo(function MazeCell({
  r,
  c,
  value,
  on,
  crossed,
  pop,
  onTap,
  register,
}: CellProps) {
  const k = `${r},${c}`;
  return (
    <button
      type="button"
      ref={(el) => register(k, el)}
      className={`mz-cell mz-number font-rounded font-black ${on ? "mz-number--on" : ""} ${
        crossed ? "mz-number--crossed" : ""
      }`}
      style={cssVars({ "--mz-r": r + 1, "--mz-c": c + 1 })}
      onClick={() => onTap(r, c, value)}
      disabled={crossed}
      aria-label={on ? `${value}, on your path` : crossed ? `${value}, not this one` : `${value}`}
      aria-pressed={on}
    >
      <span className="mz-number-glyph">{value}</span>
      {crossed && (
        // the same red cross Blend & Seek puts on a wrong picture
        <motion.span
          className="mz-cross"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          aria-hidden="true"
        >
          <CrossMark />
        </motion.span>
      )}
      {pop && (
        <span className="mz-puff" aria-hidden="true">
          <ConfettiPuff count={12} />
        </span>
      )}
    </button>
  );
});

interface MazeBoardProps {
  /** The maze being walked — one of its run's pool. */
  maze: Maze;
  onMiss: () => void;
  /** The prize is reached and the big celebration is over. */
  onWon: () => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/**
 * ONE MAZE — the grid, the progress bar, the builder, and the walk.
 *
 *   tap the next number, next to the last step  → it stays, lit green, with a
 *                                                   puff of confetti; the
 *                                                   builder gives a thumbs-up
 *   tap a DECOY                                  → a red cross on it for the
 *                                                   rest of the walk, so it is
 *                                                   never tried twice
 *   tap a path number too early                  → it only shakes: it will be
 *                                                   right in a moment, so it
 *                                                   must never be crossed out
 *   halfway, and at the prize                    → the board dims and the
 *                                                   builder comes up to cheer
 *
 * A picked number never disappears: the lit trail IS the route so far, so a
 * child can always see where they have been and where they must go next.
 *
 * THE HAND guides without being asked: it taps the first number until the
 * child starts, and comes back to tap the next one after a pause or two
 * wrong taps in a row. It never shows a number the child has not reached.
 */
export function MazeBoard({ maze, onMiss, onWon, onBack, onExitPortal }: MazeBoardProps) {
  const path = pathFor(maze);
  const size = sizeOf(maze);
  const start = startOf(maze);
  const prize = prizeOf(maze);
  const half = Math.ceil(path.length / 2);
  const onPath = useMemo(() => new Set(path.map(key)), [path]);

  /** How many steps are walked. */
  const [done, setDone] = useState(0);
  const [wrongRun, setWrongRun] = useState(0);
  /** Decoys already tried. */
  const [crossed, setCrossed] = useState<ReadonlySet<string>>(new Set());
  /** The cell that just lit — it throws the confetti. */
  const [popAt, setPopAt] = useState<string | null>(null);
  const [jumping, setJumping] = useState(false);
  const [oops, setOops] = useState(false);
  const [breakOn, setBreakOn] = useState(false);
  const [won, setWon] = useState(false);
  /** Where the hand is showing, root-relative; null when it is away. */
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();

  const next = path[done];
  const last: Pos = done > 0 ? path[done - 1] : start;
  const walked = useMemo(() => new Set(path.slice(0, done).map(key)), [path, done]);
  const locked = breakOn || won;

  /** Show the hand on the next number (measured now, so it is always where
   *  the cell really is on this screen). */
  const pointAtNext = useCallback(() => {
    if (!next) return;
    const el = cellRefs.current.get(key(next));
    if (!el) return;
    const r = el.getBoundingClientRect();
    setHand(toRootPoint(rootRef.current, r.left + r.width / 2, r.top + r.height / 2));
  }, [next]);

  // the hand comes on its own: at once on the very first number, after a
  // quiet spell otherwise. The timer is re-armed by every step (done) and
  // stands down while the board is celebrating.
  useEffect(() => {
    if (locked || !next) return;
    const t = setTimeout(
      () => {
        pointAtNext();
        // the first time only, the hand comes with the portal's own recorded line
        if (done === 0) void playClip("instr-watch-carefully");
      },
      done === 0 ? 700 : IDLE_HINT_MS
    );
    return () => clearTimeout(t);
  }, [done, locked, next, pointAtNext]);

  // a rotated or resized screen moves the cells; the hand follows them
  useEffect(() => {
    if (!hand) return;
    const onResize = () => pointAtNext();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hand, pointAtNext]);

  const tap = useCallback(
    (p: Pos, value: number) => {
      if (locked || !next) return;
      const k = key(p);
      if (walked.has(k) || crossed.has(k)) return; // nothing to do

      if (value !== next.value || !isNeighbour(p, last)) {
        playIncorrectSound();
        void playClip("instr-try-again");
        onMiss();
        // a decoy is crossed out for good; a path number tapped too early is
        // only shaken, because it is about to be the right one
        if (onPath.has(k)) {
          cellRefs.current.get(k)?.animate(SHAKE, { duration: 400, easing: "ease-in-out" });
        } else {
          setCrossed((prev) => new Set(prev).add(k));
        }
        setOops(true);
        schedule(() => setOops(false), OOPS_MS);
        const run = wrongRun + 1;
        setWrongRun(run);
        if (run >= WRONGS_BEFORE_HINT) pointAtNext();
        return;
      }

      const step = done + 1;
      setDone(step);
      setWrongRun(0);
      setHand(null);
      setPopAt(k);
      setOops(false);
      setJumping(true);
      schedule(() => setJumping(false), JUMP_MS);
      playPlaceSound();
      const said = numberClip(value);
      if (said) void playClip(said);

      if (step === path.length) {
        // the prize: the last step lights, then the big cheer, then the end
        setWon(true);
        schedule(() => {
          playCelebrationSound();
          void sayAfter(cheerFor(maze.id));
          setBreakOn(true);
        }, 450);
        schedule(onWon, 450 + BREAK_MS);
      } else if (step === half) {
        playCorrectSound();
        schedule(() => {
          playCelebrationSound();
          void sayAfter(cheerFor(half));
          setBreakOn(true);
        }, 350);
        schedule(() => setBreakOn(false), 350 + BREAK_MS);
      } else {
        playCorrectSound();
      }
    },
    [
      locked,
      next,
      walked,
      crossed,
      onPath,
      last,
      done,
      wrongRun,
      path.length,
      half,
      maze.id,
      onMiss,
      onWon,
      schedule,
      pointAtNext,
    ]
  );

  // the tiles get STABLE callbacks, so a tap re-renders only the tiles whose
  // own props changed; the handler they call is always the newest one
  const tapRef = useRef(tap);
  useEffect(() => {
    tapRef.current = tap;
  });
  const onTap = useCallback((r: number, c: number, value: number) => {
    tapRef.current({ r, c }, value);
  }, []);
  const register = useCallback((k: string, el: HTMLElement | null) => {
    if (el) cellRefs.current.set(k, el);
    else cellRefs.current.delete(k);
  }, []);

  // what the builder says is the recorded cheer being played, never typed twice
  const cheer = clipText(won ? cheerFor(maze.id) : cheerFor(half));
  const mood: WorkerMood = jumping ? "cheer" : oops ? "oops" : "plan";

  return (
    <div ref={rootRef} className="mz-play">
      <NavPillButton
        label="Back"
        ariaLabel="Back to choosing a maze"
        tone="builder"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />
      <button
        type="button"
        className="mz-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>

      {/* the title, the bar and the builder: above the board on a tall
          screen, in a column beside it on a wide one */}
      <div className="mz-side">
        <MazeTitle from={maze.from} to={maze.to} />
        <div className="mz-progress" role="status" aria-label={`${done} of ${path.length}`}>
          <ProgressBar
            value={done / path.length}
            trackClassName="mz-progress-bar"
            fillClassName="mz-progress-fill"
          />
        </div>
        <div className="mz-worker-slot" aria-hidden="true">
          <MazeWorker mood={mood} />
        </div>
      </div>

      <div className="mz-board-wrap">
        <div
          className="mz-board"
          style={cssVars({ "--mz-n": size })}
          role="group"
          aria-label={`Maze from ${maze.from} to ${maze.to}`}
        >
          {maze.grid.map((row, r) =>
            row.map((cell, c) => {
              const k = key({ r, c });
              if (cell === "P") {
                // one prize tile spans its whole square; the rest of it is empty
                if (r !== prize.r || c !== prize.c) return null;
                return (
                  <div
                    key={k}
                    className={`mz-prize ${won ? "mz-prize--won" : ""}`}
                    style={cssVars({
                      "--mz-r": r + 1,
                      "--mz-c": c + 1,
                      "--mz-span": prize.span,
                    })}
                    aria-label="The prize"
                  >
                    <motion.span
                      className="mz-prize-art"
                      animate={won ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { scale: 1 }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
                    >
                      <Picture id="trophy" />
                    </motion.span>
                  </div>
                );
              }
              if (cell === "S") {
                return (
                  <div
                    key={k}
                    className="mz-cell mz-start"
                    style={cssVars({ "--mz-r": r + 1, "--mz-c": c + 1 })}
                    aria-label="Start"
                  >
                    <span className="mz-start-art">
                      <Picture id="flag" />
                    </span>
                  </div>
                );
              }
              return (
                <MazeCell
                  key={k}
                  r={r}
                  c={c}
                  value={cell}
                  on={walked.has(k)}
                  crossed={crossed.has(k)}
                  pop={popAt === k}
                  onTap={onTap}
                  register={register}
                />
              );
            })
          )}
        </div>
      </div>

      {hand && !locked && <TeachingHand fx={hand.x} fy={hand.y} tx={hand.x} ty={hand.y} />}

      <AnimatePresence>
        {breakOn && (
          <FigureBreak key="break" label="The builder is cheering!">
            <div className="mz-worker-big">
              <MazeWorker mood="cheer" say={cheer} />
            </div>
          </FigureBreak>
        )}
      </AnimatePresence>
    </div>
  );
}
