"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Board, CvcWord } from "@games/cvc-match/constants/words";
import { WordPicture } from "@games/cvc-match/components/WordPicture";
import { SiteScene } from "@games/cvc-match/components/SiteScene";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { Burst } from "@shared/components/game/Burst";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { cheerFor } from "@shared/audio/cheers";
import { playClip, sayAfter } from "@shared/audio/voice";
import { wordClip } from "@shared/audio/wordClips";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import {
  playClickSound,
  playIncorrectSound,
  playPickUpSound,
  playSnapSound,
} from "@shared/audio/sfx";

/** Generous, because a four-year-old's finger lands near a card, not on it. */
const DROP_SLOP_PX = 44;

/** The confetti every correct drop throws — squares in six colours. */
const CONFETTI_COLORS = ["#E0413F", "#3F6FBF", "#F6C544", "#5FAF3A", "#F28AB2", "#F28A2E"] as const;

interface BoardScreenProps {
  board: Board;
  index: number;
  total: number;
  /** A word dropped on the wrong picture. */
  onMiss: () => void;
  /** All four are matched. */
  onSolved: () => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/** Where the ghost hand demonstrates a drag, as root-relative points. */
interface HandPath {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * THE BOARD — four pictures over four drop zones, four words beneath them.
 *
 * Three details from the reference carry the whole feel and are easy to lose:
 *
 *  1. A matched card stops saying "Drop Here" and WEARS THE WORD instead, so
 *     the finished board reads as four labelled pictures rather than four
 *     ticks.
 *  2. The word tiles keep FIXED POSITIONS. When one is used its space stays
 *     empty — the remaining words must not slide along to close the gap, or a
 *     child who was reaching for "bus" finds "hen" under their finger.
 *  3. There is no CORRECT! banner. The word landing, the confetti and the
 *     worker's thumbs-up ARE the feedback, which keeps four matches to well
 *     under a minute.
 *
 * On the very first board a ghost hand shows the drag once, on a loop, until
 * the child touches anything — the portal's standing answer to "a three-year-
 * old cannot read the instructions".
 */
export function BoardScreen({
  board,
  index,
  total,
  onMiss,
  onSolved,
  onBack,
  onExitPortal,
}: BoardScreenProps) {
  /** picture id → the word sitting in it. */
  const [placed, setPlaced] = useState<Record<CvcWord, CvcWord>>({});
  /** The worker throws a thumbs-up for a beat after every match. */
  const [cheer, setCheer] = useState(false);
  /** The demo loop, measured once the board has a size and dropped on first
   *  touch — a hand that keeps waving while a child plays is just clutter. */
  const [hand, setHand] = useState<HandPath | null>(null);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<CvcWord, HTMLElement>>(new Map());
  const tileRefs = useRef<Map<CvcWord, HTMLElement>>(new Map());
  const schedule = useScheduler();
  // the how-to, once, on the first board of a set
  useSayOnEnter(index === 0 ? ["instr-site-drag-word", "instr-site-blend"] : []);

  const toRoot = useCallback((x: number, y: number) => toRootPoint(rootRef.current, x, y), []);

  const matchedCount = Object.keys(placed).length;
  const first = board.words[0];

  const confettiPieces = useMemo<readonly ReactNode[]>(
    () =>
      CONFETTI_COLORS.map((c) => (
        <span key={c} className="cv-confetti" style={cssVars({ "--pl-color": c })} />
      )),
    []
  );

  /** Measure the demo drag: from the first word tile to the card it belongs
   *  in. Runs from a ref callback, so it happens once both ends exist. */
  const measureHand = useCallback(() => {
    if (index !== 0 || touched || hand) return;
    const from = tileRefs.current.get(first);
    const to = targetRefs.current.get(first);
    if (!from || !to) return;
    const centre = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return toRoot(r.left + r.width / 2, r.top + r.height / 2);
    };
    const a = centre(from);
    const b = centre(to);
    setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
  }, [index, touched, hand, first, toRoot]);

  /** A word let go: on its own picture it lands, on another it is a slip,
   *  and on open ground it is simply home again — not a wrong answer. */
  const drop = useCallback(
    (word: CvcWord, target: CvcWord | null) => {
      if (!target) return;
      if (target !== word) {
        playIncorrectSound();
        void playClip("instr-try-again");
        onMiss();
        return;
      }
      playSnapSound();
      setCheer(true);
      schedule(() => setCheer(false), 1200);
      // worked out HERE, not inside a state updater: an updater must be pure,
      // and this one used to play the word and schedule the win from inside it
      const next = { ...placed, [word]: word };
      setPlaced(next);
      // the word it landed on, then praise once the board is full
      const spoken = wordClip(word);
      if (spoken) void playClip(spoken);
      if (Object.keys(next).length >= board.pictures.length) {
        void sayAfter(cheerFor(board.id));
        schedule(onSolved, 620);
      }
    },
    [placed, board.id, board.pictures.length, onMiss, onSolved, schedule]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<CvcWord, CvcWord>({
    root: rootRef,
    targets: targetRefs,
    slopPx: DROP_SLOP_PX,
    isEligible: (id) => placed[id] === undefined,
    onDrop: drop,
  });

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, word: CvcWord) => {
      if (!start(e, word)) return;
      setTouched(true);
      setHand(null);
      playPickUpSound();
      // hearing the word as you lift it is the whole point of the game; a word
      // nobody has recorded stays silent rather than being read by the browser
      const spoken = wordClip(word);
      if (spoken) void playClip(spoken);
    },
    [start]
  );

  return (
    <div ref={rootRef} className="cv-board">
      <SiteScene cheer={cheer} />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Word Site home"
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
        className="cv-exit pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>

      <div className="cv-topbar">
        <span className="cv-round font-rounded font-black">
          {index + 1} / {total}
        </span>
        <ProgressBar
          value={matchedCount / board.pictures.length}
          trackClassName="cv-progress-bar"
          fillClassName="cv-progress-fill"
          ariaLabel={`${matchedCount} of ${board.pictures.length} words matched`}
        />
      </div>

      {/* ── the four pictures, each over its drop zone ── */}
      <div className="cv-cards">
        {board.pictures.map((word) => {
          const done = placed[word] !== undefined;
          const lit = over === word;
          return (
            <div
              key={word}
              ref={(el) => {
                registerTarget(targetRefs.current, word, el);
                measureHand();
              }}
              className={`cv-card ${done ? "cv-card--done" : ""}`}
            >
              <div className="cv-card-pic">
                <WordPicture word={word} />
              </div>
              <div
                className={`cv-drop ${lit ? "cv-drop--lit" : ""} ${done ? "cv-drop--done" : ""}`}
              >
                {done ? (
                  <motion.span
                    className="cv-drop-word font-rounded font-black"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  >
                    {word}
                  </motion.span>
                ) : (
                  <span className="cv-drop-hint font-rounded font-bold">Drop Here</span>
                )}
              </div>

              {/* every correct drop bursts where it landed */}
              {done && (
                <span className="cv-puff" aria-hidden="true">
                  <Burst
                    pieces={confettiPieces}
                    count={26}
                    reach={[10, 34]}
                    gravity
                    size="clamp(6px, 1.4vmin, 14px)"
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── the words, in slots that never move ── */}
      <div className="cv-words">
        {board.words.map((word) => {
          const used = placed[word] !== undefined;
          return (
            <div className="cv-word-slot" key={word}>
              <button
                type="button"
                ref={(el) => {
                  registerTarget(tileRefs.current, word, el);
                  measureHand();
                }}
                className={`cv-word font-rounded font-black ${used ? "cv-word--used" : ""} ${
                  dragging === word ? "cv-word--dragging" : ""
                }`}
                onPointerDown={(e) => startDrag(e, word)}
                disabled={used}
                aria-label={`${word} — drag it onto its picture`}
              >
                {word}
              </button>
            </div>
          );
        })}
      </div>

      {/* the tile under the finger */}
      {dragging !== null && (
        <div ref={ghostRef} className="cv-ghost pl-drag-ghost" aria-hidden="true">
          <span className="cv-word cv-word--ghost font-rounded font-black">{dragging}</span>
        </div>
      )}

      {/* the ghost hand, on the first board only, until the child takes over */}
      {hand && !touched && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}

      {/* ── how to play, on the hazard strip along the bottom ── */}
      <div className="cv-howto">
        <p className="cv-howto-text font-rounded font-bold">
          <strong className="font-black">How to play:</strong> drag each word onto the picture it
          names
        </p>
      </div>
    </div>
  );
}
