"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LetterAssembly,
  LetterPiece,
  useGlyphFit,
  piecesFor,
  type PieceKey,
} from "@shared/components/game/LetterPuzzle";
import { pieceGeometry, layoutForGlyph, type JigsawLayout } from "@shared/utils/letterJigsaw";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import { StarRow } from "@shared/components/ui/StarRow";
import { playCorrectSound, playIncorrectSound, playClickSound } from "@shared/audio/sfx";

/** How close counts as "in place": a share of the letter, floored at a
 *  comfortable touch radius. The test is against the piece's OWN place only,
 *  never "which empty slot is nearest" — that question lets the last piece
 *  seat from anywhere and makes the game feel like it places pieces itself. */
const SNAP_RATIO = 0.18;
const SNAP_MIN_PX = 44;

interface DragState {
  piece: PieceKey;
  x: number;
  y: number;
}
interface FlyState {
  piece: PieceKey;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

interface BuildStageProps {
  /** The letter as the child sees it — "A" or "a". */
  shown: string;
  /** Root element the drag coordinates are measured against. */
  rootRef: React.RefObject<HTMLDivElement | null>;
  onComplete: () => void;
}

/**
 * STAGE 1 — BUILD.
 *
 * The letter's silhouette waits in the water; its three pieces drift past
 * along the seabed, each inside a bubble. Dragging a piece up to where it
 * belongs seats it, and the silhouette fills in until the letter is whole.
 *
 * Everything structural is shared: the pieces and their geometry come from
 * shared/components/game/LetterPuzzle, the drag is the portal's pointer
 * pattern (capture, root-relative ghost, never position:fixed), and the
 * demonstration is the one TeachingHand every game uses.
 */
export function BuildStage({ shown, rootRef, onComplete }: BuildStageProps) {
  /** Each glyph brings its own partition — capitals default to three vertical
   *  pieces, small letters to two diagonal halves, and per-letter exceptions
   *  (I, L, i, …) live in LETTER_LAYOUTS inside letterJigsaw. Bubbles, hints
   *  and completion all follow `pieces`, whatever the count. */
  const layout: JigsawLayout = layoutForGlyph(shown);
  const pieces = piecesFor(layout);
  const { fit, glyphBox, cuts, measure } = useGlyphFit(shown, layout);
  const boxes = useMemo(() => pieceGeometry(glyphBox, layout, cuts), [glyphBox, layout, cuts]);

  const [placed, setPlaced] = useState<PieceKey[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flying, setFlying] = useState<FlyState | null>(null);
  const [snapReady, setSnapReady] = useState(false);
  const [hint, setHint] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const hintDismissedRef = useRef(false);
  const hintCycleRef = useRef(0);
  const doneRef = useRef(false);

  const assemblyRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<PieceKey, HTMLElement>>(new Map());
  const carrierRefs = useRef<Map<PieceKey, HTMLElement>>(new Map());
  const schedule = useScheduler();

  const toRoot = useCallback(
    (x: number, y: number) => toRootPoint(rootRef.current, x, y),
    [rootRef]
  );

  /** Distance from the pointer to where `piece` actually belongs, against the
   *  snap radius. One uniform radius for every piece, scaled to the letter. */
  const isNearOwnPlace = useCallback((piece: PieceKey, clientX: number, clientY: number) => {
    const slot = targetRefs.current.get(piece);
    const board = assemblyRef.current?.getBoundingClientRect();
    if (!slot || !board) return false;
    const r = slot.getBoundingClientRect();
    const dist = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2));
    return dist <= Math.max(SNAP_MIN_PX, board.width * SNAP_RATIO);
  }, []);

  // Ghost hand, cycling the pieces still to place. Dismissed for good the
  // moment the child drags anything for real.
  useEffect(() => {
    if (hintDismissedRef.current) return;
    const remaining = pieces.filter((p) => !placed.includes(p));
    // Nothing to hint once every piece is placed. Deliberately NO setHint(null)
    // here: the hint's render is already gated on completion, and clearing
    // state synchronously in an effect body is what react-hooks/set-state-in-
    // effect rejects (it forces an immediate re-render).
    if (remaining.length === 0) return;
    const piece = remaining[hintCycleRef.current % remaining.length];
    const t = setTimeout(
      () => {
        if (hintDismissedRef.current) return;
        const from = carrierRefs.current.get(piece);
        const to = targetRefs.current.get(piece);
        if (!from || !to) return;
        const f = from.getBoundingClientRect();
        const g = to.getBoundingClientRect();
        const a = toRoot(f.left + f.width / 2, f.top + f.height / 2);
        const b = toRoot(g.left + g.width / 2, g.top + g.height / 2);
        setHint({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
        hintCycleRef.current += 1;
      },
      hintCycleRef.current === 0 ? 1800 : 3200
    );
    return () => clearTimeout(t);
  }, [placed, pieces, toRoot]);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, piece: PieceKey) => {
      if (drag || flying || placed.includes(piece)) return;
      hintDismissedRef.current = true;
      setHint(null);
      e.currentTarget.setPointerCapture(e.pointerId);
      playClickSound();
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ piece, x: p.x, y: p.y });
    },
    [drag, flying, placed, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
      setSnapReady(isNearOwnPlace(drag.piece, e.clientX, e.clientY));
    },
    [drag, toRoot, isNearOwnPlace]
  );

  /** The piece has settled — the click, the state flip, and (on the last one)
   *  handing the letter on to the next stage. */
  const land = useCallback(
    (piece: PieceKey) => {
      setFlying(null);
      playCorrectSound();
      const now = [...placed, piece];
      setPlaced(now);
      if (now.length >= pieces.length && !doneRef.current) {
        doneRef.current = true;
        // a beat to see the whole letter before the stage changes
        schedule(onComplete, 1100);
      }
    },
    [placed, pieces, onComplete, schedule]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const piece = drag.piece;
      setDrag(null);
      setSnapReady(false);

      if (isNearOwnPlace(piece, e.clientX, e.clientY)) {
        const el = targetRefs.current.get(piece);
        const rootRect = rootRef.current?.getBoundingClientRect();
        if (el && rootRect) {
          const r = el.getBoundingClientRect();
          const p = toRoot(e.clientX, e.clientY);
          setFlying({
            piece,
            fx: p.x,
            fy: p.y,
            tx: r.left + r.width / 2 - rootRect.left,
            ty: r.top + r.height / 2 - rootRect.top,
          });
        } else {
          land(piece);
        }
        return;
      }

      // Not there yet — the piece goes back to its bubble and can be tried
      // again. Never a failure. The soft note plays only when the child was
      // aiming AT the letter; open water is not a mistake.
      const board = assemblyRef.current?.getBoundingClientRect();
      const aimed =
        board &&
        e.clientX >= board.left - SNAP_MIN_PX &&
        e.clientX <= board.right + SNAP_MIN_PX &&
        e.clientY >= board.top - SNAP_MIN_PX &&
        e.clientY <= board.bottom + SNAP_MIN_PX;
      if (aimed) playIncorrectSound();
    },
    [drag, land, rootRef, toRoot, isNearOwnPlace]
  );

  const complete = placed.length >= pieces.length;

  return (
    <div
      className="oab-stage relative z-10 flex h-full w-full flex-col items-center"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {measure}

      {/* A star per PIECE — the same running tally Bubble Pop shows, in this
          stage's own terms. Three stars for a capital, two for the small
          letters that are cut in half; it counts `pieces`, so a letter with
          its own partition gets the right row without this screen knowing
          which. It fills as pieces land, so progress is visible while the
          letter is still coming together rather than only once it is done. */}
      <div className="oab-build-stars" role="status" aria-live="polite">
        <StarRow earned={placed.length} total={pieces.length} size={20} />
      </div>

      {/* The letter, taking shape in open water.
          The ZONE centres it with flexbox and the motion element only scales.
          They must stay separate: Framer writes an inline `transform`, which
          silently overwrites a CSS translate(-50%) — that is what threw the
          letter off-centre and the bubbles off-screen. */}
      <div className="oab-letter-zone">
        <motion.div
          animate={complete ? { scale: [1, 1.12, 1.06] } : { scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="oab-assembly" ref={assemblyRef}>
            <LetterAssembly
              letter={shown}
              fit={fit}
              placed={placed}
              boxes={boxes}
              layout={layout}
              preview={snapReady && drag ? drag.piece : null}
            />
            {pieces
              .filter((p) => !placed.includes(p))
              .map((p) => {
                const { hit } = boxes[p];
                return (
                  <div
                    key={p}
                    ref={(el) => registerTarget(targetRefs.current, p, el)}
                    className="oab-slot pl-at"
                    style={cssVars({
                      "--pl-x": `${hit.x.toFixed(2)}%`,
                      "--pl-y": `${hit.y.toFixed(2)}%`,
                      "--pl-w": `${hit.w.toFixed(2)}%`,
                      "--pl-h": `${hit.h.toFixed(2)}%`,
                    })}
                    role="img"
                    aria-label={`Empty space in the letter ${shown}`}
                  />
                );
              })}
          </div>
        </motion.div>
      </div>

      {/* the carrier bubbles along the seabed */}
      <div className="oab-carriers">
        <AnimatePresence>
          {pieces
            .filter((p) => !placed.includes(p))
            .map((p) => {
              const { box } = boxes[p];
              const beingDragged = drag?.piece === p;
              return (
                <motion.div
                  key={p}
                  ref={(el) => registerTarget(carrierRefs.current, p, el)}
                  className={`oab-carrier touch-none ${
                    beingDragged ? "cursor-grabbing opacity-25" : "cursor-grab"
                  }`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, y: [0, -7, 0] }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{
                    scale: { type: "spring", stiffness: 260, damping: 18 },
                    opacity: { duration: 0.25 },
                    y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
                  }}
                  onPointerDown={(e) => startDrag(e, p)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Piece of the letter ${shown} — drag it into place`}
                >
                  <span className="oab-carrier-skin" aria-hidden="true" />
                  <span
                    className="oab-carrier-piece pl-center-self"
                    style={cssVars({
                      /* the piece FITS ITS BUBBLE: scaled by its own longer
                       side to 86% of the carrier, so a wide crossbar and a
                       tall leg are both fully visible — sizing by the
                       letter made big pieces overflow the bubble and thin
                       pieces vanish into it ("empty bubbles"). */
                      "--pl-w": `calc(var(--oab-carrier) * ${((0.86 * box.w) / Math.max(box.w, box.h)).toFixed(3)})`,
                      "--pl-h": `calc(var(--oab-carrier) * ${((0.86 * box.h) / Math.max(box.w, box.h)).toFixed(3)})`,
                    })}
                  >
                    <LetterPiece
                      letter={shown}
                      piece={p}
                      fit={fit}
                      box={box}
                      layout={layout}
                      outline={boxes[p].outline}
                    />
                  </span>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {hint && !drag && !flying && !complete && (
        <TeachingHand fx={hint.fx} fy={hint.fy} tx={hint.tx} ty={hint.ty} />
      )}

      {/* the seat: a short settle from where it was let go into its place */}
      {flying && (
        <motion.div
          className="pointer-events-none absolute z-40"
          initial={{ left: flying.fx, top: flying.fy }}
          animate={{ left: flying.tx, top: flying.ty }}
          transition={{ duration: 0.16, ease: [0.3, 0.7, 0.2, 1] }}
          onAnimationComplete={() => land(flying.piece)}
          aria-hidden="true"
        >
          <div
            className="pl-lp-loose pl-center-self"
            style={cssVars({
              "--pl-w": `calc(var(--oab-letter) * ${(boxes[flying.piece].box.w / 100).toFixed(3)})`,
              "--pl-h": `calc(var(--oab-letter) * ${(boxes[flying.piece].box.h / 100).toFixed(3)})`,
            })}
          >
            <LetterPiece
              letter={shown}
              piece={flying.piece}
              fit={fit}
              box={boxes[flying.piece].box}
              layout={layout}
              outline={boxes[flying.piece].outline}
            />
          </div>
        </motion.div>
      )}

      {/* drag ghost — root-relative absolute, never position:fixed */}
      {drag && (
        <div
          className="pl-lp-loose pl-at pl-center-self oab-lifted pointer-events-none absolute z-40"
          style={cssVars({
            "--pl-x": `${drag.x}px`,
            "--pl-y": `${drag.y}px`,
            "--pl-w": `calc(var(--oab-letter) * ${(boxes[drag.piece].box.w / 100).toFixed(3)})`,
            "--pl-h": `calc(var(--oab-letter) * ${(boxes[drag.piece].box.h / 100).toFixed(3)})`,
          })}
          aria-hidden="true"
        >
          <LetterPiece
            letter={shown}
            piece={drag.piece}
            fit={fit}
            box={boxes[drag.piece].box}
            layout={layout}
            outline={boxes[drag.piece].outline}
          />
        </div>
      )}
    </div>
  );
}
