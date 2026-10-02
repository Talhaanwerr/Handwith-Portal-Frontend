"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import {
  playCorrectSound,
  playPickUpSound,
  playSnapSound,
  playStarPop,
  playThudSound,
} from "@shared/audio/sfx";
import { playClip, sayAfter, stopVoice } from "@shared/audio/voice";
import { shake } from "@games/find-the-mouse/utils/shake";
import type { Verdict } from "@games/jigsaw-fun/constants/levels";
import { BURST_MS, PieceBurst, RoundCheer, STAMP_AT } from "@games/jigsaw-fun/components/Cheer";
import { GLIDE_MS, GlideIn, IdleHand } from "@games/jigsaw-fun/components/PieceMotion";
import {
  centreIn,
  fromMat,
  measureMat,
  toMat,
  type MatFit,
  type ViewBox,
} from "@games/jigsaw-fun/utils/mat";

/** From the last piece in to the star card. */
const SOLVED_MS = 3300;

interface Point {
  x: number;
  y: number;
}

interface Glide {
  piece: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface PuzzleBoardOptions {
  /** The game's class prefix ("jf", "tt") — names the ghost's classes. */
  prefix: string;
  /** The board's viewBox, in its own units. */
  vb: ViewBox;
  /** How many pieces there are — one place each. */
  count: number;
  /** The box's order of pieces (the teaching hand takes them in this order). */
  order: readonly number[];
  /** Where a drop lands, given which places are taken (place → piece). */
  judge: (taken: readonly (number | null)[], piece: number, x: number, y: number) => Verdict;
  /** The free place the teaching hand takes `piece` to. */
  homeOf: (taken: readonly (number | null)[], piece: number) => number;
  /** The middle of a place, in board units — where a piece glides to. */
  centreOf: (place: number) => Point;
  /** A piece's drawing (`role` keeps SVG ids apart) and its box in board units. */
  pieceArt: (piece: number, role: "ghost" | "glide") => ReactNode;
  pieceBox: (piece: number) => { w: number; h: number };
  /** What rains down when the puzzle is done, and what the cheer is called. */
  cast: readonly ReactNode[];
  cheerId: string;
  cheerLabel: string;
  /** Said after the cheer when the puzzle is done ("You made the lion!"). */
  madeId?: string;
  /** Said on a miss ("Hmm, that piece goes somewhere else."). */
  missId?: string;
  /** Said once, the first time the board has waited untouched long enough
   *  for the teaching hand ("Drag a piece onto the picture."). */
  idleId?: string;
  onMiss: () => void;
  onSolved: () => void;
}

/**
 * ONE PUZZLE BOARD — the drag, the celebrations and the teaching hand both
 * puzzle games share; each game only says what its pieces and places are.
 *
 * Drag a piece from the box onto the board and the game's `judge` decides:
 * into a place, it glides in (GLIDE_MS) and confetti flies out of the place
 * at once; onto another piece's empty place, it goes back with a nudge (a
 * miss); anywhere else it just goes back. The last piece in: the cheer sound
 * and clip, a star stamped on the board's corner, the cast raining down, and
 * `onSolved` after SOLVED_MS. Seven seconds without a touch while the board
 * waits and the teaching hand takes the next piece in the box to its place.
 *
 * Kept cheap on the drop frame: the board's place on the stage is measured
 * when a piece is picked up, never in the drop handler.
 */
export function usePuzzleBoard({
  prefix,
  vb,
  count,
  order,
  judge,
  homeOf,
  centreOf,
  pieceArt,
  pieceBox,
  cast,
  cheerId,
  cheerLabel,
  madeId,
  missId,
  idleId,
  onMiss,
  onSolved,
}: PuzzleBoardOptions) {
  /** placed[place] — the piece that has glided into it, or null. */
  const [placed, setPlaced] = useState<readonly (number | null)[]>(() =>
    Array<number | null>(count).fill(null)
  );
  const [glides, setGlides] = useState<readonly Glide[]>([]);
  const [bursts, setBursts] = useState<readonly ({ id: number } & Point)[]>([]);
  const [stamp, setStamp] = useState<Point | null>(null);
  const [scale, setScale] = useState(1);
  const done = placed.filter((v) => v !== null).length;
  const solved = done === count;

  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trayRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const targets = useRef(new Map<string, HTMLElement>());
  /** The board's place on the stage, measured when a piece is picked up. */
  const fit = useRef<MatFit | null>(null);
  /** Places taken (placed, or a piece gliding in) — read by the drop ahead of
   *  the render. */
  const taken = useRef<(number | null)[]>(Array<number | null>(count).fill(null));
  const burstId = useRef(0);
  const schedule = useScheduler();

  useEffect(() => () => stopVoice(), []);

  const land = useCallback(
    (piece: number, place: number, last: boolean) => {
      setPlaced((p) => p.map((v, i) => (i === place ? piece : v)));
      setGlides((g) => g.filter((x) => x.piece !== piece));
      if (!last || !fit.current) return;
      setStamp(fromMat(fit.current, vb.x + vb.w * STAMP_AT.x, vb.y + vb.h * STAMP_AT.y));
      schedule(() => {
        playCorrectSound();
        void playClip(cheerId);
        if (madeId) void sayAfter(madeId);
      }, 300);
      schedule(onSolved, SOLVED_MS);
    },
    [vb, cheerId, madeId, schedule, onSolved]
  );

  const { dragging, start, ghostRef } = useDragDrop<number, string>({
    root: stageRef,
    targets,
    slopPx: 0,
    onDrop: (piece, _target, info) => {
      const m = fit.current;
      if (!info.moved || !m) return;
      const pt = toMat(m, info.x, info.y);
      const verdict = judge(taken.current, piece, pt.x, pt.y);
      if (verdict === "miss") {
        playThudSound();
        if (missId) void playClip(missId);
        onMiss();
        shake(trayRefs.current[piece]);
        return;
      }
      if (verdict === null) return;
      taken.current[verdict] = piece;
      const last = taken.current.every((v) => v !== null);
      const c = centreOf(verdict);
      const at = fromMat(m, c.x, c.y);
      const id = ++burstId.current;
      setGlides((g) => [...g, { piece, x: at.x, y: at.y, dx: info.x - at.x, dy: info.y - at.y }]);
      setBursts((b) => [...b, { id, ...at }]);
      playSnapSound();
      schedule(() => setBursts((b) => b.filter((x) => x.id !== id)), BURST_MS);
      schedule(playStarPop, 90);
      schedule(() => land(piece, verdict, last), GLIDE_MS);
    },
  });

  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    trayRefs.current[i] = el;
  }, []);

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, piece: number) => {
      if (solved) return;
      fit.current = measureMat(stageRef.current, svgRef.current, vb);
      if (fit.current) setScale(fit.current.s);
      if (start(e, piece)) playPickUpSound();
    },
    [solved, start, vb]
  );

  /** Pieces out of the box: placed, or gliding in. */
  const outOfBox = useMemo(() => {
    const out = new Set<number>(glides.map((g) => g.piece));
    for (const p of placed) if (p !== null) out.add(p);
    return out;
  }, [placed, glides]);

  // Seven seconds with nothing dragged: the hand takes the next piece in the
  // box (in the box's own order) to the free place it belongs in.
  const idle = useIdleHand(!solved && dragging === null && glides.length === 0, done);
  // ...and the first time it does, the board says what to do — once a puzzle.
  const nudged = useRef(false);
  useEffect(() => {
    if (!idle || !idleId || nudged.current) return;
    nudged.current = true;
    void sayAfter(idleId);
  }, [idle, idleId]);
  const next = order.find((i) => !outOfBox.has(i));
  const measureHand = useCallback(() => {
    if (next === undefined) return null;
    const m = measureMat(stageRef.current, svgRef.current, vb);
    const from = centreIn(stageRef.current, trayRefs.current[next]);
    if (!m || !from) return null;
    const c = centreOf(homeOf(placed, next));
    const to = fromMat(m, c.x, c.y);
    return { fx: from.x, fy: from.y, tx: to.x, ty: to.y };
  }, [next, vb, placed, homeOf, centreOf]);

  const sized = (piece: number) => {
    const b = pieceBox(piece);
    return { w: b.w * scale, h: b.h * scale };
  };
  const ghost = dragging !== null ? sized(dragging) : null;

  const layers = (
    <>
      {glides.map((g) => {
        const { w, h } = sized(g.piece);
        return (
          <GlideIn key={g.piece} x={g.x} y={g.y} dx={g.dx} dy={g.dy} w={w} h={h}>
            {pieceArt(g.piece, "glide")}
          </GlideIn>
        );
      })}

      {bursts.map((b) => (
        <PieceBurst key={b.id} x={b.x} y={b.y} />
      ))}

      {solved && stamp && (
        <RoundCheer cast={cast} stampX={stamp.x} stampY={stamp.y} label={cheerLabel} />
      )}

      {idle && <IdleHand measure={measureHand} />}

      {dragging !== null && ghost && (
        <div ref={ghostRef} className={`${prefix}-ghost pl-drag-ghost`} aria-hidden="true">
          <span
            className={`${prefix}-ghost-art`}
            style={{
              width: ghost.w,
              height: ghost.h,
              marginLeft: -ghost.w / 2,
              marginTop: -ghost.h / 2,
            }}
          >
            {pieceArt(dragging, "ghost")}
          </span>
        </div>
      )}
    </>
  );

  return { stageRef, svgRef, register, pickUp, dragging, placed, outOfBox, done, solved, layers };
}
