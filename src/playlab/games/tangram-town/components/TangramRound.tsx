"use client";

import { useCallback, useMemo } from "react";
import { cheerFor } from "@shared/audio/cheers";
import { clipText } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { cssVars } from "@shared/styles/cssVars";
import { cheerSeed } from "@games/jigsaw-fun/constants/levels";
import type { PuzzleRoundProps } from "@games/jigsaw-fun/components/PuzzleShell";
import { PuzzleStage, TrayPiece } from "@games/jigsaw-fun/components/PuzzleStage";
import { usePuzzleBoard } from "@games/jigsaw-fun/hooks/usePuzzleBoard";
import { Studio } from "@games/tangram-town/components/Studio";
import { FigureSvg, TanPiece } from "@games/tangram-town/components/TangramArt";
import {
  GUIDES,
  MODULE_IDS,
  PIECE_COLORS,
  boxOf,
  figureBox,
  figureOf,
  judgeDrop,
  placeFor,
  slotCentre,
  trayOrder,
  type ModuleId,
} from "@games/tangram-town/constants/tangram";

const WORLD = <Studio />;
/** Room round a piece's own box, in tangram units, for its outline. */
const PIECE_PAD = 0.16;
/** A figure's name in its clip ids ("tangram-build-big-square"). */
const clipName = (module: ModuleId) => (module === "square" ? "big-square" : module);

/**
 * ONE TANGRAM — a figure built from the seven pieces, with the level's guide
 * on the board (coloured outlines, plain outlines, or the silhouette alone),
 * on the shared puzzle board (`usePuzzleBoard`): a piece dropped inside — or
 * near the middle of — a free outline of its own shape and turn glides in; on
 * a different free outline it is a miss. The last piece in and the figure's
 * own pieces rain down with the confetti.
 */
export function TangramRound({
  module,
  level,
  onMiss,
  onSolved,
  onHome,
  onExitPortal,
}: PuzzleRoundProps<ModuleId>) {
  const fig = figureOf(module);
  const guide = GUIDES[level];
  const vb = useMemo(() => figureBox(fig), [fig]);
  const order = useMemo(() => trayOrder(fig, level), [fig, level]);
  const cast = useMemo(
    () =>
      fig.slots.map((s, i) => (
        <span key={i} className="jf-cast">
          <TanPiece slot={s} color={PIECE_COLORS[i]} />
        </span>
      )),
    [fig]
  );
  const tray = useMemo(
    () =>
      fig.slots.map((s, i) => {
        const b = boxOf(s.pts);
        return {
          art: <TanPiece slot={s} color={PIECE_COLORS[i]} />,
          style: cssVars({ "--w": `${b.w + PIECE_PAD}`, "--h": `${b.h + PIECE_PAD}` }),
        };
      }),
    [fig]
  );
  const judge = useCallback(
    (taken: readonly (number | null)[], piece: number, x: number, y: number) =>
      judgeDrop(fig, taken, piece, x, y),
    [fig]
  );
  const homeOf = useCallback(
    (taken: readonly (number | null)[], piece: number) => placeFor(fig, taken, piece),
    [fig]
  );
  const centreOf = useCallback((place: number) => slotCentre(fig.slots[place]), [fig]);
  const pieceArt = useCallback(
    (piece: number) => <TanPiece slot={fig.slots[piece]} color={PIECE_COLORS[piece]} />,
    [fig]
  );
  const pieceBox = useCallback(
    (piece: number) => {
      const b = boxOf(fig.slots[piece].pts);
      return { w: b.w + PIECE_PAD, h: b.h + PIECE_PAD };
    },
    [fig]
  );

  // no lines on the board: "Now build it with no lines!"; else "Build the house!"
  const sayId = guide === "none" ? "tangram-no-lines" : `tangram-build-${clipName(module)}`;
  const madeId = `tangram-made-${clipName(module)}`;
  const say = clipText(sayId);
  const doneSay = clipText(madeId);
  useSayOnEnter([sayId]);
  const board = usePuzzleBoard({
    prefix: "tt",
    vb,
    count: fig.slots.length,
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
    missId: "tangram-wrong",
    idleId: "tangram-idle",
    onMiss,
    onSolved,
  });

  return (
    <PuzzleStage
      prefix="tt"
      stageRef={board.stageRef}
      accent={fig.accent}
      world={WORLD}
      say={board.solved ? doneSay : say}
      solved={board.solved}
      pieces={fig.slots.length}
      placed={board.done}
      boxLabel={fig.name}
      tone="ocean"
      backAria="Back to the Tangram Town pictures"
      board={<FigureSvg fig={fig} filled={board.placed} guide={guide} svgRef={board.svgRef} />}
      tray={
        <div className="tt-tray">
          {order.map((i) => (
            <TrayPiece
              key={i}
              prefix="tt"
              index={i}
              label={`Tangram piece ${i + 1}`}
              art={tray[i].art}
              style={tray[i].style}
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
