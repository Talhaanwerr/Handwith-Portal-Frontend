"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMatchStore, displayLetter } from "@games/pirate-match/store/matchStore";
import { ALPHA, buildRound, pairsIn } from "@games/pirate-match/constants/rounds";
import { ANCHOR_ART, getLetterWord, objectPhotoPath } from "@games/space-letters/constants/vocab";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { PirateWorld } from "@games/pirate-match/components/MatchScreens";
import { MatchWin } from "@games/pirate-match/components/MatchWin";
import { GoldCoin } from "@shared/components/pirate/PirateTreasure";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { toRootPoint, registerTarget } from "@shared/utils/pointer";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playStarPop,
} from "@shared/audio/sfx";
import { playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";

/** The hand demonstration plays ONCE — the first round the child sees —
 *  and never again for the rest of the session. Module-scoped on purpose:
 *  it must survive the per-round remounts. */
let handDemoDone = false;

/** How close to a picture card counts as "on it". */
const SNAP_MIN_PX = 44;
const SNAP_RATIO = 0.55;
/** How long the celebration stays on screen after the praise finishes —
 *  long enough for the chest to open and the treasure to fountain (see
 *  MatchWin) before the next round. */
const ADVANCE_MS = 2200;

interface DragState {
  letter: string;
  x: number;
  y: number;
}
interface FlyState {
  letter: string;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * ONE ROUND OF PIRATE MATCH.
 *
 * Three big letters ride wooden planks on the left; the letter-tracing
 * object photos (Apple, Cat…) sit on parchment cards to the right — SAME
 * images, same photo-first-with-SVG-fallback contract as Space ABC, via the
 * same vocab module. Rows are crossed on purpose: a pair never sits level
 * with its partner, so the child matches LETTERS, not rows.
 *
 * The portal drag contract throughout: pointer-captured root-relative
 * ghost; a letter dropped on the WRONG picture gets the soft note and
 * settles home (never a failure); open water is silent; the right picture
 * seats the letter with a coin pop and says "C — Cat!".
 *
 * The ghost hand PREVIEWS a real match — the target letter to its own
 * picture — after a pause, and cycles the unmatched pairs until the child's
 * first real drag dismisses it for good.
 */
export function MatchLevel() {
  const router = useRouter();
  const { currentLetter, letterCase, difficulty, markDone, advance, setScreen } = useMatchStore();
  const store = useMatchStore();

  // One deal per round: both columns come back together, so they can never
  // disagree and the board is built once instead of twice.
  const { letters, cards } = useMemo(
    () => buildRound(currentLetter, difficulty),
    [currentLetter, difficulty]
  );
  const cheerId = cheerFor(currentLetter);
  const doneCount = (letterCase === "lower" ? store.doneLower : store.done).length;

  const [matched, setMatched] = useState<string[]>([]);

  /** THIS RUN's rounds, ticking when the round's last pair lands (matched
   *  is full) — the all-time count froze on replayed letters. Lives below
   *  the matched state it reads. */
  const run = store.run;
  /** The pill counts PAIRS: every right move is +1, and every finished round
   *  contributes its own size. Summed rather than multiplied by a constant
   *  three, because an Easy round near the start of the alphabet is shorter —
   *  A has no letters before it to draw distractors from, B has one. */
  const pairsDone = run
    ? pairsIn(run.queue.slice(0, run.index), difficulty) + matched.length
    : pairsIn(ALPHA.slice(0, doneCount), difficulty);
  const pairsTotal = run ? pairsIn(run.queue, difficulty) : pairsIn(ALPHA, difficulty);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flying, setFlying] = useState<FlyState | null>(null);
  const [readyCard, setReadyCard] = useState<string | null>(null);
  const [hint, setHint] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  /** True only while a drag is in progress — the hand returns after every
   *  match and every idle pause, always demonstrating the FIRST unmatched
   *  pair, so the child is never left without the preview. */
  const hintSuppressedRef = useRef(false);
  const advancedRef = useRef(false);
  const aliveRef = useRef(true);

  const [rootRef, dims] = useElementSize<HTMLDivElement>();
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const tileRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const toRoot = useCallback(
    (x: number, y: number) => toRootPoint(rootRef.current, x, y),
    [rootRef] // <-- Add rootRef here
  );

  // Arrival: preload this round's voice, then the one instruction.
  //
  // "Now it's your turn", NOT "Watch carefully". Nothing is being demonstrated
  // when this plays — the ghost hand only appears after an idle pause — so the
  // child was told to watch and then shown nothing. This board is ready to be
  // touched the moment it arrives, and the line now says so. "Watch carefully"
  // is kept for letter tracing, where a stroke really is demonstrated first.
  useEffect(() => {
    const ids = letters.flatMap((l) => [`letter-${l.toLowerCase()}`, `word-${l.toLowerCase()}`]);
    preloadClips([...ids, cheerId, "instr-your-turn"]);
    const t = setTimeout(() => void playSequence(["instr-your-turn"], 0), 400);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, [letters, cheerId]);

  /** Which card (if any) this client point is over, by snap distance. */
  const cardAt = useCallback((clientX: number, clientY: number): string | null => {
    for (const [letter, el] of cardRefs.current) {
      const r = el.getBoundingClientRect();
      const dist = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2));
      if (dist <= Math.max(SNAP_MIN_PX, r.width * SNAP_RATIO)) return letter;
    }
    return null;
  }, []);

  // The ghost hand — ONE demonstration, ever: the first pair of the first
  // round. It loops gently until the child's first drag, and after that the
  // game trusts them for the rest of the session.
  useEffect(() => {
    if (handDemoDone) return;
    const letter = letters.find((l) => !matched.includes(l));
    if (!letter) return;
    const t = setTimeout(() => {
      if (handDemoDone || hintSuppressedRef.current) return;
      const from = tileRefs.current.get(letter);
      const to = cardRefs.current.get(letter);
      if (!from || !to) return;
      const f = from.getBoundingClientRect();
      const g = to.getBoundingClientRect();
      const a = toRoot(f.left + f.width / 2, f.top + f.height / 2);
      const b = toRoot(g.left + g.width / 2, g.top + g.height / 2);
      setHint({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    }, 1400);
    return () => clearTimeout(t);
  }, [letters, matched, toRoot]);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, letter: string) => {
      if (drag || flying || matched.includes(letter)) return;
      hintSuppressedRef.current = true;
      handDemoDone = true; // the one demonstration is over
      setHint(null);
      e.currentTarget.setPointerCapture(e.pointerId);
      playClickSound();
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ letter, x: p.x, y: p.y });
    },
    [drag, flying, matched, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
      const over = cardAt(e.clientX, e.clientY);
      setReadyCard(over === drag.letter ? over : null);
    },
    [drag, toRoot, cardAt]
  );

  /** The letter has settled onto its picture. */
  const land = useCallback(
    (letter: string) => {
      setFlying(null);
      stopVoice();
      playCorrectSound();
      playStarPop();
      const now = [...matched, letter];
      setMatched(now);
      const complete = now.length >= letters.length;

      if (!complete) {
        // name what was just matched: "C — Cat!"
        void playSequence([`letter-${letter.toLowerCase()}`, `word-${letter.toLowerCase()}`], 200);
        return;
      }

      // the round is done: last pair's name, the praise, then on — advance
      // chained on the AUDIO's real end (never a timer racing the clips)
      markDone(currentLetter);
      void playSequence(
        [`letter-${letter.toLowerCase()}`, `word-${letter.toLowerCase()}`, cheerId],
        220
      ).then(() => {
        if (!aliveRef.current || advancedRef.current) return;
        advancedRef.current = true;
        schedule(() => {
          if (!advance()) setScreen("complete");
        }, ADVANCE_MS);
      });
    },
    [matched, letters, currentLetter, cheerId, markDone, advance, setScreen, schedule]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const letter = drag.letter;
      setDrag(null);
      setReadyCard(null);
      hintSuppressedRef.current = false;

      const over = cardAt(e.clientX, e.clientY);
      if (!over) return; // open water — silent, the letter is home again

      if (over !== letter) {
        // the wrong picture: the soft note, another try. Never a failure.
        playIncorrectSound();
        return;
      }

      const card = cardRefs.current.get(letter);
      const rootRect = rootRef.current?.getBoundingClientRect();
      if (card && rootRect) {
        const r = card.getBoundingClientRect();
        const p = toRoot(e.clientX, e.clientY);
        setFlying({
          letter,
          fx: p.x,
          fy: p.y,
          tx: r.left + r.width / 2 - rootRect.left,
          ty: r.top + r.height / 2 - rootRect.top,
        });
      } else {
        land(letter);
      }
    },
    [drag, cardAt, toRoot, land, rootRef]
  );

  const complete = matched.length >= letters.length;

  return (
    <div
      ref={rootRef}
      className="pm-screen pp-world relative flex h-full w-full flex-col overflow-hidden"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <PirateWorld />

      {/* chrome: back · matched count */}
      <div className="pm-topbar relative z-20 flex w-full shrink-0 items-center justify-between gap-2 px-4 py-3">
        <NavPillButton
          label="Back"
          ariaLabel="Back to the start screen"
          tone="pirate"
          surface="strong"
          onClick={() => {
            playClickSound();
            stopVoice();
            router.back();
          }}
        />
        <div className="pm-hud flex items-center gap-2">
          {/* a star per pair — one for EVERY right move in the round */}
          <div className="pp-pill flex items-center rounded-full px-3 py-2" role="status">
            <StarRow earned={matched.length} total={letters.length} size={16} />
          </div>
          <div
            // shrink-0 + nowrap: "3 / 21 ⚓" was breaking onto three lines
            // inside a pill sized for one, because nothing stopped the flex
            // row from squeezing it.
            className="pp-pill font-rounded shrink-0 rounded-full px-4 py-2 text-sm font-black whitespace-nowrap"
            role="status"
          >
            {pairsDone} / {pairsTotal} ⚓
          </div>
        </div>
      </div>

      {/* the board: planks of letters · cards of pictures */}
      <div className="pm-board relative z-10">
        {/* letters, extremely big, on wooden planks */}
        <div className="pm-col" role="list" aria-label="Letters to match">
          {letters.map((l, i) => {
            const isMatched = matched.includes(l);
            const beingDragged = drag?.letter === l;
            return (
              <motion.button
                key={l}
                ref={(el) => registerTarget(tileRefs.current, l, el)}
                className={`pm-tile touch-none ${
                  beingDragged ? "opacity-30" : ""
                } ${isMatched ? "pm-tile--done" : ""}`}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: isMatched ? 0.35 : 1, scale: isMatched ? 0.9 : 1 }}
                transition={{ delay: 0.08 * i, type: "spring", stiffness: 240, damping: 20 }}
                onPointerDown={(e) => startDrag(e, l)}
                disabled={isMatched}
                aria-label={
                  isMatched
                    ? `Letter ${displayLetter(l, letterCase)} — matched`
                    : `Letter ${displayLetter(l, letterCase)} — drag it to its picture`
                }
              >
                <span className="pm-tile-glyph font-rounded font-black">
                  {displayLetter(l, letterCase)}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* pictures — the letter-tracing objects on parchment */}
        <div className="pm-col" role="list" aria-label="Pictures to match">
          {cards.map((l, i) => (
            <motion.div
              key={l}
              ref={(el) => registerTarget(cardRefs.current, l, el)}
              className={`pm-card pp-panel-parchment ${
                matched.includes(l) ? "pm-card--done pp-trim-gold" : ""
              } ${readyCard === l ? "pm-card--ready" : ""}`}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.08 * i + 0.1, type: "spring", stiffness: 240, damping: 20 }}
              role="listitem"
              aria-label={`Picture of ${getLetterWord(l) ?? "an object"}`}
            >
              <ObjectPicture letter={l} />
              {matched.includes(l) && (
                <>
                  <motion.span
                    className="pm-card-letter font-rounded font-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {displayLetter(l, letterCase)}
                  </motion.span>
                  <span className="pm-card-coin" aria-hidden="true">
                    <GoldCoin />
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* the round's celebration — the treasure the child just found (see
          MatchWin), on the portal's shared overlay; it auto-advances after
          the praise plus ADVANCE_MS. */}
      <AnimatePresence>
        {complete && (
          <CelebrationOverlay
            tintClassName="pm-win-tint"
            gapClassName="gap-0"
            blur="3px"
            size={dims}
            sparkles={false}
          >
            <MatchWin
              shown={displayLetter(currentLetter, letterCase)}
              letters={letters.map((l) => displayLetter(l, letterCase))}
              cheerId={cheerId}
            />
          </CelebrationOverlay>
        )}
      </AnimatePresence>

      {hint && !drag && !flying && !complete && (
        <>
          <TraceTrail fx={hint.fx} fy={hint.fy} tx={hint.tx} ty={hint.ty} />
          <TeachingHand fx={hint.fx} fy={hint.fy} tx={hint.tx} ty={hint.ty} />
        </>
      )}

      {/* the seat: a short settle from the drop point onto the card */}
      {flying && (
        <motion.div
          className="pointer-events-none absolute z-40"
          initial={{ left: flying.fx, top: flying.fy }}
          animate={{ left: flying.tx, top: flying.ty }}
          transition={{ duration: 0.16, ease: [0.3, 0.7, 0.2, 1] }}
          onAnimationComplete={() => land(flying.letter)}
          aria-hidden="true"
        >
          <span className="pm-ghost font-rounded font-black">
            {displayLetter(flying.letter, letterCase)}
          </span>
        </motion.div>
      )}

      {/* drag ghost — root-relative absolute, margin-centred, never a transform */}
      {drag && (
        <div
          className="pm-ghost pl-at pointer-events-none absolute z-40"
          style={cssVars({ "--pl-x": `${drag.x}px`, "--pl-y": `${drag.y}px` })}
          aria-hidden="true"
        >
          <span className="font-rounded font-black">{displayLetter(drag.letter, letterCase)}</span>
        </div>
      )}
    </div>
  );
}

/**
 * The trail under the teaching hand — the treasure map's own dotted-route
 * language, drawn from the letter to its picture: a golden S-curve of dots
 * marching toward a little red X on the treasure. This is what makes the
 * preview read as TRACING the match, the way the tracing game draws its
 * guide, rather than a bare floating hand.
 *
 * Geometry is a pure function of the endpoints (no randomness): the curve
 * bends perpendicular to the straight line by a fixed share of its length,
 * one way then the other — a playful squiggle that is the same squiggle
 * every time.
 */
function TraceTrail({ fx, fy, tx, ty }: { fx: number; fy: number; tx: number; ty: number }) {
  const dx = tx - fx;
  const dy = ty - fy;
  const len = Math.max(1, Math.hypot(dx, dy));
  // perpendicular unit, wiggle amplitude capped so short hops stay tidy
  const nx = -dy / len;
  const ny = dx / len;
  const amp = Math.min(56, len * 0.22);
  const c1x = fx + dx / 3 + nx * amp;
  const c1y = fy + dy / 3 + ny * amp;
  const c2x = fx + (2 * dx) / 3 - nx * amp;
  const c2y = fy + (2 * dy) / 3 - ny * amp;
  const d = `M ${fx.toFixed(1)} ${fy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${tx.toFixed(1)} ${ty.toFixed(1)}`;

  return (
    <motion.svg
      className="pm-trace pointer-events-none absolute inset-0 z-30 h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-hidden="true"
    >
      {/* the marching dots (animation in CSS: stroke-dashoffset) */}
      <path className="pm-trace-dots" d={d} />
      {/* X marks the treasure */}
      <g className="pm-trace-x">
        <line x1={tx - 11} y1={ty - 11} x2={tx + 11} y2={ty + 11} />
        <line x1={tx + 11} y1={ty - 11} x2={tx - 11} y2={ty + 11} />
      </g>
    </motion.svg>
  );
}

/**
 * The object picture — the SAME images as letter tracing and Space ABC:
 * the real photo where one exists, the pastel SVG where it does not, with
 * the remount-on-letter key that keeps one failed photo from condemning
 * every later letter to the fallback.
 */
function ObjectPicture({ letter }: { letter: string }) {
  return <ObjectPictureInner key={letter.toUpperCase()} letter={letter} />;
}

function ObjectPictureInner({ letter }: { letter: string }) {
  const key = letter.toUpperCase();
  const Art = ANCHOR_ART[key];
  const word = getLetterWord(letter);
  const [photoFailed, setPhotoFailed] = useState(false);
  if (!word) return null;

  return (
    <div className="pm-card-img" aria-hidden="true">
      {!photoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={objectPhotoPath(word)}
          alt=""
          onError={() => setPhotoFailed(true)}
          draggable={false}
        />
      ) : (
        Art && <Art />
      )}
    </div>
  );
}
