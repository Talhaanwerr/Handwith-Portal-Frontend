"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { cssVars } from "@shared/styles/cssVars";
import { playPickUpSound, playSnapSound, playStarPop, playThudSound } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { TrayPiece } from "@games/jigsaw-fun/components/PuzzleStage";
import { BURST_MS, PieceBurst } from "@games/jigsaw-fun/components/Cheer";
import { GLIDE_MS, GlideIn, IdleHand } from "@games/jigsaw-fun/components/PieceMotion";
import { centreIn, fromMat, measureMat, toMat, type MatFit } from "@games/jigsaw-fun/utils/mat";
import { FrpWorld } from "@games/fruit-puzzles/components/FrpWorld";
import { FruitBoard, FruitPieceSvg } from "@games/fruit-puzzles/components/FruitArt";
import {
  PUT_CLIP,
  ROUNDS,
  VB,
  layoutOf,
  nameClip,
  piecesOf,
  seedOf,
  snapsIn,
  type ModuleId,
} from "@games/fruit-puzzles/constants/rounds";

const WORLD = <FrpWorld />;
/** Nothing in the drag engine's target map: where a piece goes is worked out
 *  from the plate's own units (`snapsIn`), not from elements. */
const NO_TARGETS = new Map<string, HTMLElement>();

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** An element's middle and size, in the stage's own pixels. */
function stageRect(root: HTMLElement | null, el: Element | null): Rect | null {
  if (!root || !el) return null;
  const a = root.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  return {
    x: b.left - a.left + b.width / 2,
    y: b.top - a.top + b.height / 2,
    w: b.width,
    h: b.height,
  };
}

/** A piece gliding — into its place on the plate, or back to where it lay. */
interface Move {
  piece: number;
  into: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
}

/**
 * ONE FRUIT PUZZLE — the fruit's shape on the plate, its pieces on the table
 * either side (above and below on a phone held upright).
 *
 * Press a piece and it lifts to the plate's own size under the finger, held
 * where it was grabbed. Let go with it near its place and it glides in, with
 * a snap and a burst of confetti; anywhere else it slides back to where it
 * lay — no sound of being wrong, no miss. The last piece in: the fruit's name
 * is said, the fruit bounces, and the kit's celebration (a cheer, a star on
 * the plate) takes the round on. Untouched for a while, the teaching hand
 * drags the next piece to its place (on round one almost at once).
 */
export function PuzzleRoundOf({
  module,
  round,
  title,
  onDone,
  onHome,
  onExitPortal,
}: RoundProps & { module: ModuleId }) {
  const r = ROUNDS[module][round];
  const pieces = useMemo(() => piecesOf(r.rays), [r.rays]);
  const lay = useMemo(() => layoutOf(pieces, seedOf(module, round)), [pieces, module, round]);
  const n = pieces.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const looseRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const targets = useRef(NO_TARGETS);
  /** The plate's place on the stage, measured when a piece is picked up. */
  const fit = useRef<MatFit | null>(null);
  /** The picked-up piece: where it lay, and where on it the finger pressed. */
  const grab = useRef<{ home: Rect; ox: number; oy: number } | null>(null);
  /** Places filled (in, or gliding in) — read by a drop ahead of the render. */
  const taken = useRef<boolean[]>(Array<boolean>(n).fill(false));
  const burstId = useRef(0);
  const schedule = useScheduler();

  const [placed, setPlaced] = useState<readonly boolean[]>(() => Array<boolean>(n).fill(false));
  const [moves, setMoves] = useState<readonly Move[]>([]);
  const [bursts, setBursts] = useState<readonly { id: number; x: number; y: number }[]>([]);
  /** The lifted piece under the finger: the plate's own size, held where it
   *  was pressed (pixels from its middle). */
  const [lift, setLift] = useState<{ w: number; h: number; ox: number; oy: number } | null>(null);

  const cast = useMemo(
    () =>
      [0, 1, 2].map((i) => (
        <span key={i} className="ng-cast">
          <Thing id={r.fruit} />
        </span>
      )),
    [r.fruit]
  );
  const { solved, isSolved, finish, say, overlay } = useRoundCelebration({
    cheerSeed: MODULE_SEED[module] + round,
    stageRef,
    cast,
    onDone,
  });

  useEffect(() => {
    const t = setTimeout(() => void playSequence([PUT_CLIP]), 400);
    return () => clearTimeout(t);
  }, []);

  const { dragging, start, ghostRef } = useDragDrop<number, string>({
    root: stageRef,
    targets,
    slopPx: 0,
    onDrop: (piece, _target, info) => {
      const m = fit.current;
      const g = grab.current;
      if (!info.moved || !m || !g || isSolved()) return;
      const p = pieces[piece];
      // where the piece's middle was let go (the finger held it off-centre)
      const up = m.s / (g.home.w / p.box.w);
      const cx = info.x - g.ox * up;
      const cy = info.y - g.oy * up;
      if (snapsIn(p, toMat(m, cx, cy))) {
        taken.current[piece] = true;
        const last = taken.current.every(Boolean);
        const at = fromMat(m, p.centre.x, p.centre.y);
        const id = ++burstId.current;
        const w = p.box.w * m.s;
        const h = p.box.h * m.s;
        setMoves((v) => [...v, { piece, into: true, ...at, w, h, dx: cx - at.x, dy: cy - at.y }]);
        setBursts((b) => [...b, { id, ...at }]);
        playSnapSound();
        schedule(() => setBursts((b) => b.filter((x) => x.id !== id)), BURST_MS);
        schedule(playStarPop, 90);
        schedule(() => {
          setPlaced((v) => v.map((x, i) => (i === piece ? true : x)));
          setMoves((v) => v.filter((x) => x.piece !== piece));
          if (last) {
            // whole again: its name now, the kit's cheer after it
            void playClip(nameClip(r.fruit));
            finish(plateRef.current);
          }
        }, GLIDE_MS);
        return;
      }
      // not near its place: back to where it lay, quietly
      const { home } = g;
      playThudSound();
      setMoves((v) => [
        ...v,
        {
          piece,
          into: false,
          x: home.x,
          y: home.y,
          w: home.w,
          h: home.h,
          dx: cx - home.x,
          dy: cy - home.y,
        },
      ]);
      schedule(() => setMoves((v) => v.filter((x) => x.piece !== piece)), GLIDE_MS);
    },
  });

  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    looseRefs.current[i] = el;
  }, []);

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, piece: number) => {
      if (isSolved()) return;
      const root = stageRef.current;
      fit.current = measureMat(root, svgRef.current, VB);
      const home = stageRect(root, looseRefs.current[piece]);
      if (!fit.current || !home || !root) return;
      const a = root.getBoundingClientRect();
      const ox = e.clientX - a.left - home.x;
      const oy = e.clientY - a.top - home.y;
      // the plate's pixels per unit over the table's: how much the piece grows
      const p = pieces[piece];
      const up = fit.current.s / (home.w / p.box.w);
      grab.current = { home, ox, oy };
      setLift({ w: p.box.w * fit.current.s, h: p.box.h * fit.current.s, ox: ox * up, oy: oy * up });
      if (start(e, piece)) playPickUpSound();
    },
    [isSolved, start, pieces]
  );

  /** Pieces off the table: in, or gliding in or back. */
  const gone = (i: number) => placed[i] || moves.some((m) => m.piece === i);

  // the teaching hand: the next piece on the table, dragged to its place
  const busy = dragging !== null || moves.length > 0;
  const done = placed.filter(Boolean).length;
  const idle = useIdleHand(!solved && !busy, done);
  const next = lay.order.find((i) => !placed[i]);
  const measureHand = useCallback(() => {
    if (next === undefined) return null;
    const m = measureMat(stageRef.current, svgRef.current, VB);
    const from = centreIn(stageRef.current, looseRefs.current[next]);
    if (!m || !from) return null;
    const to = fromMat(m, pieces[next].centre.x, pieces[next].centre.y);
    return { fx: from.x, fy: from.y, tx: to.x, ty: to.y };
  }, [next, pieces]);

  const looseArt = useMemo(
    () => pieces.map((p, i) => <FruitPieceSvg key={i} fruit={r.fruit} piece={p} />),
    [pieces, r.fruit]
  );

  const ghost = dragging !== null ? lift : null;

  const side = (s: readonly number[], which: string) => (
    <div className={`frp-side frp-side--${which}`}>
      {s.map((i) => (
        <TrayPiece
          key={i}
          prefix="frp"
          index={i}
          label={`Fruit piece ${i + 1}`}
          art={looseArt[i]}
          style={cssVars({
            "--frp-w": String(pieces[i].box.w),
            "--frp-h": String(pieces[i].box.h),
          })}
          hidden={gone(i)}
          lifted={dragging === i}
          onPick={pickUp}
          register={register}
        />
      ))}
    </div>
  );

  return (
    <NgStage
      stageRef={stageRef}
      playClass="frp-play"
      world={WORLD}
      round={round}
      solved={solved}
      say={say(clipText(PUT_CLIP))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {moves.map((m) => (
            <GlideIn key={m.piece} x={m.x} y={m.y} dx={m.dx} dy={m.dy} w={m.w} h={m.h}>
              <FruitPieceSvg fruit={r.fruit} piece={pieces[m.piece]} />
            </GlideIn>
          ))}
          {bursts.map((b) => (
            <PieceBurst key={b.id} x={b.x} y={b.y} />
          ))}
          {overlay}
          {idle && <IdleHand measure={measureHand} />}
          {ghost && dragging !== null && (
            <div ref={ghostRef} className="frp-ghost pl-drag-ghost" aria-hidden="true">
              <span
                className="frp-ghost-art"
                style={{
                  width: ghost.w,
                  height: ghost.h,
                  marginLeft: -ghost.w / 2 - ghost.ox,
                  marginTop: -ghost.h / 2 - ghost.oy,
                }}
              >
                {looseArt[dragging]}
              </span>
            </div>
          )}
        </>
      }
    >
      <div
        className={`frp-board frp-board--${n}`}
        style={cssVars({
          "--frp-k": lay.k.toFixed(3),
          "--frp-kp": lay.kp.toFixed(3),
          "--frp-wide": lay.wide.toFixed(3),
          "--frp-tall": lay.tall.toFixed(3),
          "--frp-sw": lay.sw.toFixed(2),
          "--frp-sh": lay.sh.toFixed(2),
        })}
      >
        {side(lay.sides[0], "a")}
        <div ref={plateRef} className={`frp-plate ${solved ? "frp-plate--done" : ""}`}>
          <FruitBoard
            fruit={r.fruit}
            pieces={pieces}
            placed={placed}
            solved={solved}
            svgRef={svgRef}
          />
        </div>
        {side(lay.sides[1], "b")}
      </div>
    </NgStage>
  );
}

/** Each module's cheers start at a different place in the list. */
const MODULE_SEED: Record<ModuleId, number> = { easy: 31, tricky: 47 };

export function EasyRound(props: RoundProps) {
  return <PuzzleRoundOf {...props} module="easy" />;
}
export function TrickyRound(props: RoundProps) {
  return <PuzzleRoundOf {...props} module="tricky" />;
}
