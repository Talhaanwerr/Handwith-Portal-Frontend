"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Picture } from "@games/blend-read/components/PictureArt";
import type {
  Activity,
  SortBoard as SortBoardData,
  SortObject,
} from "@games/sort-it/constants/activities";
import { BigSmallPal } from "@games/sort-it/components/BigSmallPal";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { Burst } from "@shared/components/game/Burst";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import {
  playClickSound,
  playIncorrectSound,
  playPickUpSound,
  playSnapSound,
} from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";
import { playClip, sayAfter } from "@shared/audio/voice";
import { wordClip } from "@shared/audio/wordClips";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";

/**
 * The word a board wears, said aloud when something lands in it — "BIG",
 * "WATER". Hearing the word while placing the thing is the only teaching this
 * game does out loud, and the labels are single words so they map straight to
 * the shared `word-*` clips.
 */
function labelClip(label: string): string | null {
  return wordClip(label);
}

/** The whole board is the drop zone, not a slot inside it — a preschooler
 *  aims at a box, never at a square inside a box. */
const DROP_SLOP_PX = 30;

/** The reference's confetti: little squares in six colours. */
const CONFETTI_COLORS = ["#E0413F", "#3F6FBF", "#F6C544", "#5FAF3A", "#F28AB2", "#F28A2E"] as const;

interface SortBoardProps {
  activity: Activity;
  index: number;
  total: number;
  onSolved: () => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/**
 * ONE SORTING ACTIVITY.
 *
 * Two boards, each opening with a worked example and a row of black
 * silhouettes; a pile of things underneath; drag each thing to the board it
 * belongs in. The example in the board shows the rule and the silhouettes say
 * how many more of that kind are coming; one spoken question as the board
 * opens ("Is it big or small?") names the rule for a child who cannot read.
 *
 * The silhouettes are not drawn: they are the SAME Twemoji picture with
 * `brightness(0)` over it, so a placeholder can never drift away from the
 * thing it is a placeholder for.
 *
 * A wrong drop is not an event. The thing goes home, nothing flashes, nothing
 * is counted — the activity is classification practice, not a quiz.
 */
export function SortBoard({
  activity,
  index,
  total,
  onSolved,
  onBack,
  onExitPortal,
}: SortBoardProps) {
  /** group id → the things dropped into it, in arrival order. */
  const [filled, setFilled] = useState<Record<string, SortObject[]>>({});
  /** Where the last correct drop landed — the confetti bursts there. */
  const [puff, setPuff] = useState<{ group: string; n: number } | null>(null);
  const [cheer, setCheer] = useState(false);

  /** The demo loop on the first activity, dropped the moment a child touches
   *  anything — a hand still waving while they play is clutter. */
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());
  const looseRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();
  useSayOnEnter([activity.rule === "size" ? "instr-sort-size" : "instr-sort-home"]);

  const placedIds = useMemo(
    () =>
      new Set(
        Object.values(filled)
          .flat()
          .map((o) => o.id)
      ),
    [filled]
  );
  const done = placedIds.size;

  const toRoot = useCallback((x: number, y: number) => toRootPoint(rootRef.current, x, y), []);

  const firstObject = activity.objects[0];

  /**
   * Measure the demo drag — the first loose thing to the board it belongs in —
   * once both ends have been laid out. Called from the ref callbacks below,
   * which is the earliest moment either end has a box to measure.
   */
  const measureHand = useCallback(() => {
    if (index !== 0 || touched || hand) return;
    const from = looseRefs.current.get(firstObject.id);
    const to = targetRefs.current.get(firstObject.group);
    if (!from || !to) return;
    const centre = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return toRoot(r.left + r.width / 2, r.top + r.height / 2);
    };
    const a = centre(from);
    const b = centre(to);
    setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
  }, [index, touched, hand, firstObject, toRoot]);

  /** Both boards register through one callback — filling the map of drop
   *  targets and measuring the hand are the same job. */
  const registerBoard = useCallback(
    (group: string, el: HTMLElement | null) => {
      registerTarget(targetRefs.current, group, el);
      measureHand();
    },
    [measureHand]
  );

  const confettiPieces = useMemo<readonly ReactNode[]>(
    () =>
      CONFETTI_COLORS.map((c) => (
        <span key={c} className="so-confetti" style={cssVars({ "--pl-color": c })} />
      )),
    []
  );

  /** A thing let go. Open ground is not an answer at all — it is a child
   *  changing their mind — and the WRONG board is a gentle nudge and nothing
   *  else: no buzzer, no red, nothing counted. */
  const drop = useCallback(
    (object: SortObject, target: string | null) => {
      if (!target) return;
      if (target !== object.group) {
        playIncorrectSound();
        void playClip("instr-try-again");
        return;
      }

      playSnapSound();
      const board = activity.boards.find((b) => b.group === target);
      const said = board ? labelClip(board.label) : null;
      if (said) void playClip(said);
      setCheer(true);
      schedule(() => setCheer(false), 1100);
      // worked out HERE rather than inside a state updater, which must be
      // pure — this one used to set the puff and schedule the win from inside
      const inBoard = filled[target] ?? [];
      const next = { ...filled, [target]: [...inBoard, object] };
      setFilled(next);
      setPuff({ group: target, n: inBoard.length + 1 });
      if (Object.values(next).flat().length >= activity.objects.length) {
        void sayAfter(cheerFor(activity.id));
        schedule(onSolved, 900);
      }
    },
    [filled, activity, onSolved, schedule]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<SortObject, string>({
    root: rootRef,
    targets: targetRefs,
    slopPx: DROP_SLOP_PX,
    onDrop: drop,
  });

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, object: SortObject) => {
      if (!start(e, object)) return;
      setTouched(true);
      setHand(null);
      playPickUpSound();
    },
    [start]
  );

  return (
    <div ref={rootRef} className={`so-play so-play--${activity.rule}`}>
      <NavPillButton
        label="Back"
        ariaLabel="Back to the Sort It home"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />

      <button
        type="button"
        className="so-leave pl-exit-pill font-rounded font-black"
        onClick={onExitPortal}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>

      {/* the green bar, with the little face riding the front of the fill */}
      <div
        className="so-progress"
        role="status"
        aria-label={`${done} of ${activity.objects.length} sorted`}
      >
        <ProgressBar
          value={done / activity.objects.length}
          trackClassName="so-progress-bar"
          fillClassName="so-progress-fill"
        />
        {/* a ruler slides along the bar instead of a mascot: this is a game
            about measuring things against each other, and the ruler says that
            without being another face on the screen */}
        <motion.span
          className="so-progress-ruler"
          animate={{ left: `${(done / activity.objects.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          aria-hidden="true"
        />
        <span className="so-round font-rounded font-black">
          {index + 1} / {total}
        </span>
      </div>

      {/* ── the two boards, with the pal standing between them ── */}
      <div className="so-boards">
        <BoardCard
          board={activity.boards[0]}
          landed={filled[activity.boards[0].group] ?? []}
          lit={over === activity.boards[0].group}
          puffAt={puff?.group === activity.boards[0].group ? puff.n : null}
          pieces={confettiPieces}
          onRef={registerBoard}
        />

        {/* the presenter stands IN the comparison, not off to one side: the
            child's eye crosses him on the way from one board to the other */}
        <div className="so-pal">
          <BigSmallPal cheer={cheer} />
        </div>

        <BoardCard
          board={activity.boards[1]}
          landed={filled[activity.boards[1].group] ?? []}
          lit={over === activity.boards[1].group}
          puffAt={puff?.group === activity.boards[1].group ? puff.n : null}
          pieces={confettiPieces}
          onRef={registerBoard}
        />
      </div>

      {/* ── the pile of things to sort ── */}
      <div className="so-tray">
        {activity.objects.map((object) => {
          const used = placedIds.has(object.id);
          return (
            <div className="so-tray-slot" key={object.id}>
              <button
                type="button"
                ref={(el) => {
                  registerTarget(looseRefs.current, object.id, el);
                  measureHand();
                }}
                className={`so-item so-item--loose ${object.big ? "so-item--big" : ""} ${
                  used ? "so-item--used" : ""
                } ${dragging?.id === object.id ? "so-item--dragging" : ""}`}
                onPointerDown={(e) => startDrag(e, object)}
                disabled={used}
                aria-label={`${object.picture} — put it where it belongs`}
              >
                <Picture id={object.picture} />
              </button>
            </div>
          );
        })}
      </div>

      {/* the thing under the finger */}
      {dragging && (
        <div ref={ghostRef} className="so-ghost pl-drag-ghost" aria-hidden="true">
          <span className={`so-item so-item--carry ${dragging.big ? "so-item--big" : ""}`}>
            <Picture id={dragging.picture} />
          </span>
        </div>
      )}

      {hand && !touched && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
    </div>
  );
}

/* ── One board ───────────────────────────────────────────────────────────── */

interface BoardCardProps {
  board: SortBoardData;
  /** What has been dropped in here, in arrival order. */
  landed: readonly SortObject[];
  /** A thing is hovering over this board. */
  lit: boolean;
  /** Which place just filled — that one bursts. */
  puffAt: number | null;
  pieces: readonly ReactNode[];
  onRef: (group: string, el: HTMLElement | null) => void;
}

/**
 * A board: its word, the worked example, and one place per thing still to
 * come — each drawn as the example picture with the colour taken out, so a
 * placeholder can never drift from what belongs in it.
 */
function BoardCard({ board, landed, lit, puffAt, pieces, onRef }: BoardCardProps) {
  return (
    <div
      ref={(el) => onRef(board.group, el)}
      className={`so-boardcard ${lit ? "so-boardcard--lit" : ""}`}
      aria-label={`${board.label} board`}
    >
      <span className="so-board-label font-rounded font-black">{board.label}</span>
      <div className="so-board-items">
        <span className={`so-item ${board.example.big ? "so-item--big" : ""}`}>
          <Picture id={board.example.picture} />
        </span>

        {Array.from({ length: board.slots }, (_, i) => {
          const thing = landed[i];
          if (!thing)
            return (
              // a question mark, not a blacked-out copy of the example: the
              // silhouette gave the answer away, and the question mark asks
              // the question the board is actually asking
              <span
                className="so-item so-item--ghost font-rounded font-black"
                key={i}
                aria-hidden="true"
              >
                ?
              </span>
            );
          return (
            <motion.span
              key={i}
              className={`so-item ${thing.big ? "so-item--big" : ""}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <Picture id={thing.picture} />
              {puffAt === i + 1 && (
                <span className="so-puff" aria-hidden="true">
                  <Burst
                    pieces={pieces}
                    count={30}
                    reach={[10, 34]}
                    gravity
                    size="clamp(6px, 1.4vmin, 14px)"
                  />
                </span>
              )}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
