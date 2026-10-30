"use client";

import { useCallback, useMemo } from "react";
import { cheerFor } from "@shared/audio/cheers";
import { clipText } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Picture } from "@games/blend-read/components/PictureArt";
import { cheerSeed } from "@games/jigsaw-fun/constants/levels";
import type { PuzzleRoundProps } from "@games/jigsaw-fun/components/PuzzleShell";
import { Playroom } from "@games/jigsaw-fun/components/JfStage";
import { PuzzleStage, TrayPiece } from "@games/jigsaw-fun/components/PuzzleStage";
import { JigsawBoard, JigsawPieceSvg } from "@games/jigsaw-fun/components/JigsawArt";
import { usePuzzleBoard } from "@games/jigsaw-fun/hooks/usePuzzleBoard";
import {
  CELL,
  MODULE_IDS,
  PIECE_PAD,
  cellCentre,
  cutOf,
  gridOf,
  judgeDrop,
  sceneOf,
  seedOf,
  trayOrder,
  type ModuleId,
} from "@games/jigsaw-fun/constants/jigsaw";

const WORLD = <Playroom />;
/** A piece's drawing box: its cell and room for its knobs, in picture units. */
const PIECE_BOX = { w: CELL + PIECE_PAD * 2, h: CELL + PIECE_PAD * 2 };
const pieceBox = () => PIECE_BOX;
/** In a jigsaw every piece has exactly one place: its own cell. */
const homeOf = (_taken: readonly (number | null)[], piece: number) => piece;
/** The pictures with a recorded "You made the …!" line; the rest show the
 *  line silently and let the cheer speak. */
const MADE: Partial<Record<ModuleId, string>> = {
  lion: "jigsaw-made-lion",
  whale: "jigsaw-made-whale",
  train: "jigsaw-made-train",
};

/**
 * ONE JIGSAW — a picture cut into its level's pieces, on the shared puzzle
 * board (`usePuzzleBoard`): a piece dropped anywhere in its own cell glides in;
 * in another empty cell it is a miss. The last piece in and the seams melt
 * away, and the picture's own animal rains down with the confetti.
 */
export function JigsawRound({
  module,
  level,
  onMiss,
  onSolved,
  onHome,
  onExitPortal,
}: PuzzleRoundProps<ModuleId>) {
  const { cols, rows } = gridOf(level);
  const n = cols * rows;
  const scene = sceneOf(module);
  const vb = useMemo(() => ({ x: 0, y: 0, w: cols * CELL, h: rows * CELL }), [cols, rows]);
  const order = useMemo(() => trayOrder(seedOf(module, cutOf(level)), n), [module, level, n]);
  const cast = useMemo(
    () =>
      [0, 1, 2].map((i) => (
        <span key={i} className="jf-cast">
          <Picture id={scene.picture} />
        </span>
      )),
    [scene.picture]
  );
  const trayArt = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => (
        <JigsawPieceSvg key={i} module={module} level={level} index={i} idPrefix="jf-t" />
      )),
    [module, level, n]
  );
  const judge = useCallback(
    (taken: readonly (number | null)[], piece: number, x: number, y: number) =>
      judgeDrop(level, taken, piece, x, y),
    [level]
  );
  const centreOf = useCallback((place: number) => cellCentre(level, place), [level]);
  const pieceArt = useCallback(
    (piece: number, role: "ghost" | "glide") => (
      <JigsawPieceSvg module={module} level={level} index={piece} idPrefix={`jf-${role}`} />
    ),
    [module, level]
  );

  const sayId = `jigsaw-pieces-${n}`;
  const madeId = MADE[module];
  const say = clipText(sayId);
  const doneSay = madeId ? clipText(madeId) : `You made the ${scene.name}!`;
  useSayOnEnter([sayId]);
  const board = usePuzzleBoard({
    prefix: "jf",
    vb,
    count: n,
    order,
    judge,
    homeOf,
    centreOf,
    pieceArt,
    pieceBox,
    cast,
    cheerId: cheerFor(cheerSeed(MODULE_IDS.indexOf(module), level)),
    cheerLabel: doneSay,
    madeId,
    missId: "jigsaw-wrong",
    idleId: "jigsaw-idle",
    onMiss,
    onSolved,
  });
  const placed = useMemo(() => board.placed.map((p) => p !== null), [board.placed]);

  return (
    <PuzzleStage
      prefix="jf"
      stageRef={board.stageRef}
      accent={scene.accent}
      world={WORLD}
      say={board.solved ? doneSay : say}
      solved={board.solved}
      pieces={n}
      placed={board.done}
      boxLabel={
        <>
          <span className="jf-box-label-pic" aria-hidden="true">
            <Picture id={scene.picture} />
          </span>
          {scene.name}
        </>
      }
      tone="kitchen"
      backAria="Back to the Jigsaw Fun pictures"
      board={
        <JigsawBoard
          module={module}
          level={level}
          placed={placed}
          solved={board.solved}
          svgRef={board.svgRef}
        />
      }
      tray={
        <div className={`jf-tray jf-tray--${n}`}>
          {order.map((i) => (
            <TrayPiece
              key={i}
              prefix="jf"
              index={i}
              label={`Jigsaw piece ${i + 1}`}
              art={trayArt[i]}
              hidden={board.outOfBox.has(i)}
              lifted={board.dragging === i}
              onPick={board.pickUp}
              register={board.register}
            />
          ))}
        </div>
      }
      onHome={onHome}
      onExitPortal={onExitPortal}
    >
      {board.layers}
    </PuzzleStage>
  );
}
