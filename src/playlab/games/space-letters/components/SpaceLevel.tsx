"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSpaceStore, displayLetter } from "@games/space-letters/store/spaceStore";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useElementSize } from "@shared/hooks/useElementSize";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import { SpaceBackdrop } from "@games/space-letters/components/SpaceScreens";
import {
  LetterAssembly,
  LetterPiece,
  useGlyphFit,
  PIECE_ORDER,
  type PieceKey,
} from "@shared/components/game/LetterPuzzle";
import { pieceGeometry, type JigsawLayout } from "@shared/utils/letterJigsaw";
import { vocabClipId } from "@games/space-letters/constants/vocab";
import { VocabObject } from "@games/space-letters/components/VocabObject";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playFanfare,
} from "@shared/audio/sfx";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";

/**
 * HOW CLOSE COUNTS AS "IN PLACE".
 *
 * A real puzzle piece goes in when you set it roughly where it belongs, and
 * stays in your hand when you do not — it is never pulled across the board
 * for you. So the test is the distance between the piece and ITS OWN spot,
 * as a share of the letter, floored at a comfortable touch radius.
 *
 * The previous test asked "which empty slot is nearest?", which is a
 * different question and had a bad failure mode: as pieces went in, the pool
 * of empty slots shrank, until the last piece counted as correct anywhere
 * near the container. That is what made it feel like the game was placing
 * pieces by itself.
 */
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

/**
 * THREE-PIECE LETTER ASSEMBLY.
 *
 * One letter per mount (the parent keys this screen by letter + case, so
 * every round starts clean — the same remount-per-round pattern as
 * dino-dig's StonesLevel, rather than hand-rolled reset logic).
 *
 * The central white container holds the letter placeholder, with the object
 * docked at its side. The three jigsaw pieces sit in a row directly below
 * it, each at exactly the size of the space it fills, so the direction of
 * play is obvious: these go up there.
 */
export function SpaceLevel() {
  const router = useRouter();
  const store = useSpaceStore();
  const { currentLetter, letterCase, markBuilt, setScreen, advance } = store;
  const run = store.run;
  const runComplete = !run || run.index >= run.queue.length - 1;

  /** What the child actually sees — "A" or "a". The puzzle is cut from THIS
   *  glyph, so lowercase is a real lowercase puzzle, not a shrunken capital. */
  const shown = displayLetter(currentLetter, letterCase);
  /** Small letters are cut as three stacked bands; big letters keep the T —
   *  see JigsawLayout in shared/utils/letterJigsaw. */
  const layout: JigsawLayout = letterCase === "lower" ? "stack" : "split";
  const { fit, glyphBox, measure } = useGlyphFit(shown);
  /** Where each piece is drawn and dropped, given where the glyph landed.
   *  Recomputed only when the measured glyph changes. */
  const boxes = useMemo(() => pieceGeometry(glyphBox, layout), [glyphBox, layout]);

  const [placed, setPlaced] = useState<PieceKey[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flying, setFlying] = useState<FlyState | null>(null);
  /** True while the held piece is close enough that letting go will seat it —
   *  previewed as the piece itself, faint, in its real place. */
  const [snapReady, setSnapReady] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [hint, setHint] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const hintDismissedRef = useRef(false);
  const hintCycleRef = useRef(0);

  const [rootRef, dims] = useElementSize();
  const assemblyRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<PieceKey, HTMLElement>>(new Map());
  const looseRefs = useRef<Map<PieceKey, HTMLElement>>(new Map());
  const schedule = useScheduler();
  useEffect(() => () => stopVoice(), []);

  const letterKey = currentLetter.toLowerCase();

  // Letter name, then its word — one clean sequence, never overlapping.
  useEffect(() => {
    preloadClips([
      `letter-${letterKey}`,
      vocabClipId(currentLetter),
      "cheer-great-job",
      "instr-next",
      "instr-again",
    ]);
    const t = setTimeout(() => {
      void playSequence([`letter-${letterKey}`, vocabClipId(currentLetter)], 300);
    }, 350);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLetter]);

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

  // Ghost-hand demo: cycles through the still-unplaced pieces, dismissed for
  // good the moment the child drags anything for real (same contract as
  // magnet-match's hint).
  useEffect(() => {
    if (hintDismissedRef.current || celebrating) return;
    const remaining = PIECE_ORDER.filter((p) => !placed.includes(p));
    // Nothing to hint once every piece is placed. Deliberately NO setHint(null)
    // here: the hint's render is already gated on completion, and clearing
    // state synchronously in an effect body is what react-hooks/set-state-in-
    // effect rejects (it forces an immediate re-render).
    if (remaining.length === 0) return;
    const piece = remaining[hintCycleRef.current % remaining.length];
    const delay = hintCycleRef.current === 0 ? 1900 : 3200;
    const t = setTimeout(() => {
      if (hintDismissedRef.current) return;
      const from = looseRefs.current.get(piece);
      const to = targetRefs.current.get(piece);
      if (!from || !to) return;
      const f = from.getBoundingClientRect();
      const g = to.getBoundingClientRect();
      const a = toRoot(f.left + f.width / 2, f.top + f.height / 2);
      const b = toRoot(g.left + g.width / 2, g.top + g.height / 2);
      setHint({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
      hintCycleRef.current += 1;
    }, delay);
    return () => clearTimeout(t);
  }, [placed, celebrating, toRoot]);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, piece: PieceKey) => {
      if (celebrating || drag || flying || placed.includes(piece)) return;
      hintDismissedRef.current = true;
      setHint(null);
      e.currentTarget.setPointerCapture(e.pointerId);
      playClickSound();
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ piece, x: p.x, y: p.y });
    },
    [celebrating, drag, flying, placed, toRoot]
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

  /** The flight has landed — snap sound, state flip, and (on the last piece)
   *  the celebration all fire on arrival, not on release. */
  const land = useCallback(
    (piece: PieceKey) => {
      setFlying(null);
      playCorrectSound();
      const now = [...placed, piece];
      setPlaced(now);
      if (now.length >= PIECE_ORDER.length) {
        schedule(() => {
          setCelebrating(true);
          markBuilt(currentLetter);
          void playClip("cheer-great-job").then(() => playFanfare());
        }, 450);
      }
    },
    [placed, currentLetter, markBuilt, schedule]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const piece = drag.piece;
      setDrag(null);
      setSnapReady(false);

      // Does the piece belong where it was set down? Nothing else is asked —
      // no comparison against the other slots, so a piece is never pulled
      // into a place the child was not aiming for.
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
          land(piece); // refs unavailable — land instantly rather than stall
        }
        return;
      }

      // Not there yet. The piece simply goes back and can be tried again —
      // never a failure, nothing lost. The soft "not quite" note plays only
      // when the child was aiming AT the letter; setting a piece down in open
      // space is not a mistake and stays silent.
      const board = assemblyRef.current?.getBoundingClientRect();
      const aimedAtBoard =
        board &&
        e.clientX >= board.left - SNAP_MIN_PX &&
        e.clientX <= board.right + SNAP_MIN_PX &&
        e.clientY >= board.top - SNAP_MIN_PX &&
        e.clientY <= board.bottom + SNAP_MIN_PX;
      if (aimedAtBoard) playIncorrectSound();
    },
    [drag, land, rootRef, toRoot, isNearOwnPlace]
  );

  const goNext = useCallback(() => {
    stopVoice();
    void playClip("instr-next");
    if (!advance()) setScreen("complete");
  }, [advance, setScreen]);

  const playAgain = useCallback(() => {
    void playClip("instr-again");
    setPlaced([]);
    setCelebrating(false);
    hintDismissedRef.current = false;
    hintCycleRef.current = 0;
  }, []);

  return (
    <div
      ref={rootRef}
      className="spl-screen relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-3"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <SpaceBackdrop />
      {measure}

      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between gap-2">
        <NavPillButton
          label="Letters"
          ariaLabel="Back to the letter map"
          tone="space"
          surface="strong"
          onClick={() => {
            playClickSound();
            stopVoice();
            router.back();
          }}
        />
        <div className="spl-pill flex items-center gap-2 rounded-full px-4 py-2" role="status">
          <StarRow earned={placed.length} total={PIECE_ORDER.length} size={18} />
        </div>
        <div className="min-h-[44px] w-[84px]" aria-hidden="true" />
      </div>

      {/* ── The stage: white container + the object docked beside it ── */}
      <div className="sap-arena relative z-10 flex w-full flex-1 items-center justify-center">
        <div className="sap-stage">
          {/* THE central container — white, holding the letter placeholder. */}
          <div className="sap-card">
            <div className="sap-assembly-wrap" ref={assemblyRef}>
              <LetterAssembly
                letter={shown}
                fit={fit}
                placed={placed}
                boxes={boxes}
                layout={layout}
                preview={snapReady && drag ? drag.piece : null}
              />
              {PIECE_ORDER.filter((p) => !placed.includes(p)).map((p) => {
                const { hit } = boxes[p];
                return (
                  <div
                    key={p}
                    ref={(el) => registerTarget(targetRefs.current, p, el)}
                    className="sap-slot pl-at"
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
          </div>

          {/* The object, tilted on the side and overlapping the container's
              edge — the same docked treatment as letter tracing. */}
          <VocabObject letter={currentLetter} />
        </div>
      </div>

      {/* ── The pieces, in a row directly below the container ── */}
      <div className="sap-pieces relative z-10">
        <AnimatePresence>
          {PIECE_ORDER.filter((p) => !placed.includes(p)).map((p) => {
            const { box } = boxes[p];
            const beingDragged = drag?.piece === p;
            return (
              <motion.div
                key={p}
                ref={(el) => registerTarget(looseRefs.current, p, el)}
                className={`pl-lp-loose pl-lp-loose--flow touch-none ${
                  beingDragged ? "cursor-grabbing opacity-25" : "cursor-grab"
                }`}
                style={cssVars({
                  "--pl-w": `calc(var(--sap-piece) * ${(box.w / 100).toFixed(3)})`,
                  "--pl-h": `calc(var(--sap-piece) * ${(box.h / 100).toFixed(3)})`,
                })}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                onPointerDown={(e) => startDrag(e, p)}
                role="button"
                tabIndex={0}
                aria-label={`Puzzle piece of the letter ${shown} — drag it into place`}
              >
                <LetterPiece letter={shown} piece={p} fit={fit} box={box} layout={layout} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Ghost hand — visual instruction first, so a child who cannot read
          can still start unaided. */}
      {hint && !drag && !flying && !celebrating && (
        <TeachingHand fx={hint.fx} fy={hint.fy} tx={hint.tx} ty={hint.ty} />
      )}

      {/* The seat: the piece settles the short distance from where it was let
          go into its place, then land() fires on arrival. Short and small on
          purpose — it is a piece dropping into a recess, not a piece flying
          across the board under its own power. */}
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
              "--pl-w": `calc(var(--sap-piece) * ${(boxes[flying.piece].box.w / 100).toFixed(3)})`,
              "--pl-h": `calc(var(--sap-piece) * ${(boxes[flying.piece].box.h / 100).toFixed(3)})`,
            })}
          >
            <LetterPiece
              letter={shown}
              piece={flying.piece}
              fit={fit}
              box={boxes[flying.piece].box}
              layout={layout}
            />
          </div>
        </motion.div>
      )}

      {/* Drag ghost — root-relative absolute, never position:fixed. */}
      {drag && (
        <div
          className="pl-lp-loose pl-at pl-center-self pointer-events-none absolute z-40"
          style={cssVars({
            "--pl-x": `${drag.x}px`,
            "--pl-y": `${drag.y}px`,
            "--pl-w": `calc(var(--sap-piece) * ${(boxes[drag.piece].box.w / 100).toFixed(3)})`,
            "--pl-h": `calc(var(--sap-piece) * ${(boxes[drag.piece].box.h / 100).toFixed(3)})`,
          })}
          aria-hidden="true"
        >
          <LetterPiece
            letter={shown}
            piece={drag.piece}
            fit={fit}
            box={boxes[drag.piece].box}
            layout={layout}
            className="sap-lifted"
          />
        </div>
      )}

      {/* ── Letter complete: vocabulary reinforcement + celebration ── */}
      <AnimatePresence>
        {celebrating && (
          <CelebrationOverlay
            tintClassName="spl-win-tint"
            gapClassName="gap-4"
            blur="3px"
            size={dims}
          >
            <div className="sap-win-assembly">
              <LetterAssembly
                letter={shown}
                fit={fit}
                placed={PIECE_ORDER}
                boxes={boxes}
                layout={layout}
              />
            </div>
            <div className="sap-win-object">
              <VocabObject letter={currentLetter} />
            </div>
            <h2 className="spl-win-heading font-rounded font-black">
              {clipText("cheer-great-job")}
            </h2>
            <div className="flex gap-4">
              <button
                onClick={playAgain}
                className="font-rounded text-space-ink min-h-[52px] rounded-full bg-white px-6 text-base font-black shadow-lg"
                aria-label="Build this letter again"
              >
                Again
              </button>
              <button
                onClick={goNext}
                className="bg-space font-rounded min-h-[52px] rounded-full px-6 text-base font-black text-white shadow-lg"
                aria-label="Go to the next letter"
              >
                <span>{runComplete ? "Finish!" : "Next"}</span>
              </button>
            </div>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
