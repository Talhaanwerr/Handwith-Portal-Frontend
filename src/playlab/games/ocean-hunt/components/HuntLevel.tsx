"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHuntStore, displayLetter } from "@games/ocean-hunt/store/huntStore";
import { sequenceWindow, optionsFor } from "@games/ocean-hunt/constants/sequence";
import { materialFor } from "@games/ocean-abc/constants/materials";
import { StarBurst } from "@games/ocean-hunt/components/StarBurst";
import { HuntWorld } from "@games/ocean-hunt/components/HuntScreens";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { CelebrationMotif, useLetterFall } from "@shared/components/game/CelebrationMotif";
import { BubblePops } from "@shared/components/game/BubblePops";
import { GodRays } from "@shared/components/game/GodRays";
import { SwimIn, type Swimmer } from "@shared/components/game/SwimIn";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { useElementSize } from "@shared/hooks/useElementSize";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { toRootPoint, registerTarget } from "@shared/utils/pointer";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playStarPop,
} from "@shared/audio/sfx";
import { playSequence, preloadClips, stopVoice, clipText } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";

/** How close to the empty bubble counts as "in": a share of the bubble,
 *  floored at a comfortable touch radius. */
const SNAP_RATIO = 0.9;
const SNAP_MIN_PX = 44;
/** The pause AFTER the win read-back finishes before the next letter — the
 *  advance follows the audio's real end (never a timer racing the clips,
 *  which cut the voice mid-word every round). */
/** How long the celebration stays on screen after the praise finishes —
 *  the child gets a full beat with their confetti before the next letter. */
const ADVANCE_MS = 1500;

/** The hand demonstration plays ONCE — the first round the child sees —
 *  and never again for the rest of the session. Module-scoped on purpose:
 *  it must survive the per-round remounts. */
let handDemoDone = false;

/**
 * Who swims in when the run is complete — the reef's regulars, from both
 * sides, placed down the edges clear of the letter in the centre. The whale
 * is the big one, so it gets a bigger box. Built once at module load.
 */
const HUNT_FRIENDS: readonly Swimmer[] = (
  [
    {
      key: "whale",
      x: "14%",
      y: "28%",
      delay: 0.4,
      from: "left",
      faces: "left",
      size: "clamp(64px, 15vmin, 130px)",
    },
    { key: "jellyfish", x: "87%", y: "32%", delay: 0.65, from: "right" },
    { key: "turtle", x: "13%", y: "72%", delay: 0.9, from: "left" },
    { key: "x-ray fish", x: "86%", y: "70%", delay: 1.1, from: "right" },
  ] as const
).flatMap(({ key, ...place }) => {
  const Art = ANIMAL_ART[key];
  return Art ? [{ ...place, node: <Art key={key} /> }] : [];
});

interface DragState {
  letter: string;
  x: number;
  y: number;
}
interface FlyState {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * ONE ROUND OF OCEAN HUNT.
 *
 * A run of consecutive letters floats in bubbles with one missing — its
 * bubble empty but present, holding the space. Three letters wait on the
 * sand. Dragging the right one into the empty bubble completes the run:
 * star-burst, the letter's name, the strip read back in order, next letter.
 *
 * The portal's drag contract throughout: pointer-captured, root-relative
 * ghost, a wrong letter aimed at the bubble gets the soft note and settles
 * back (never a failure state), a drop in open water is silent. The ghost
 * hand demonstrates from the CORRECT option after a pause, and is dismissed
 * for good on the child's first real drag.
 */
export function HuntLevel() {
  const router = useRouter();
  const { currentLetter, letterCase, markDone, advance, setScreen } = useHuntStore();
  const store = useHuntStore();

  const { letters, missingIndex } = useMemo(() => sequenceWindow(currentLetter), [currentLetter]);
  const options = useMemo(() => optionsFor(currentLetter), [currentLetter]);
  /** This letter's praise — deterministic, and its shown word is the clip's
   *  own text, so voice and banner can never disagree. */
  const cheerId = cheerFor(currentLetter);
  const material = materialFor(currentLetter);
  /** The found letter, ready to rain down among the celebration's bubbles. */
  const letterFall = useLetterFall(displayLetter(currentLetter, letterCase), 6);
  const doneCount = (letterCase === "lower" ? store.doneLower : store.done).length;
  /** THIS RUN's progress, ticking on the right move itself: rounds already
   *  advanced past, plus the one just solved (`placed`). The all-time done
   *  count froze whenever a replayed letter was already in it — the "stars
   *  don't progress" bug. */
  const [placed, setPlaced] = useState(false);

  /** THIS RUN's progress — lives below the `placed` state it reads. */
  const run = store.run;
  const runDone = run ? Math.min(run.index + (placed ? 1 : 0), run.queue.length) : 0;
  const runTotal = run ? run.queue.length : 26;
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flying, setFlying] = useState<FlyState | null>(null);
  const [snapReady, setSnapReady] = useState(false);
  const [hint, setHint] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const hintDismissedRef = useRef(false);
  const hintShownRef = useRef(0);
  const advancedRef = useRef(false);
  /** False once this round unmounts (Back, or the remount for the next
   *  letter) — the win sequence's .then must do nothing for a dead round. */
  const aliveRef = useRef(true);

  const [rootRef, dims] = useElementSize<HTMLDivElement>();
  const slotRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const toRoot = useCallback(
    (x: number, y: number) => toRootPoint(rootRef.current, x, y),
    [rootRef] // <-- Added rootRef here
  );

  // Arrival: read the strip so far, then leave the question hanging on the
  // empty bubble. One sequence so lines never overlap.
  useEffect(() => {
    const ids = letters
      .filter((_, i) => i !== missingIndex)
      .map((l) => `letter-${l.toLowerCase()}`);
    preloadClips([...ids, `letter-${currentLetter.toLowerCase()}`, cheerId]);
    const t = setTimeout(() => void playSequence(ids, 240), 400);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, [currentLetter, letters, missingIndex, cheerId]);

  /** Is this client point inside the empty bubble's snap radius? */
  const nearSlot = useCallback((clientX: number, clientY: number) => {
    const slot = slotRef.current;
    if (!slot) return false;
    const r = slot.getBoundingClientRect();
    const dist = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2));
    return dist <= Math.max(SNAP_MIN_PX, r.width * SNAP_RATIO);
  }, []);

  // Ghost hand from the correct letter to the empty bubble — ONLY on the
  // first round of the whole session. After the first real drag the child
  // has the mechanic, and re-demonstrating every round reads as nagging.
  useEffect(() => {
    if (handDemoDone || hintDismissedRef.current || placed) return;
    const t = setTimeout(
      () => {
        if (hintDismissedRef.current) return;
        const from = optionRefs.current.get(currentLetter);
        const to = slotRef.current;
        if (!from || !to) return;
        const f = from.getBoundingClientRect();
        const g = to.getBoundingClientRect();
        const a = toRoot(f.left + f.width / 2, f.top + f.height / 2);
        const b = toRoot(g.left + g.width / 2, g.top + g.height / 2);
        setHint({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
        hintShownRef.current += 1;
      },
      hintShownRef.current === 0 ? 2600 : 4200
    );
    return () => clearTimeout(t);
    // hint itself is deliberately not a dependency: once shown, the hand
    // loops on its own until the first real drag dismisses it.
  }, [currentLetter, placed, toRoot]);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, letter: string) => {
      if (drag || flying || placed) return;
      hintDismissedRef.current = true;
      handDemoDone = true;
      setHint(null);
      e.currentTarget.setPointerCapture(e.pointerId);
      playClickSound();
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ letter, x: p.x, y: p.y });
    },
    [drag, flying, placed, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
      setSnapReady(drag.letter === currentLetter && nearSlot(e.clientX, e.clientY));
    },
    [drag, currentLetter, toRoot, nearSlot]
  );

  /** The right letter has settled into its bubble. */
  const land = useCallback(() => {
    setFlying(null);
    setPlaced(true);
    stopVoice(); // end the arrival narration cleanly before the praise
    playCorrectSound();
    playStarPop();
    markDone(currentLetter);
    // the praise, then the completed run read back in order (the found
    // letter is IN the run — naming it twice was noise)
    const ids = [cheerId, ...letters.map((l) => `letter-${l.toLowerCase()}`)];
    void playSequence(ids, 220).then(() => {
      // resolves at the real end of the audio — or early if something
      // stopped it; a round the child has already left must not advance
      // screens from the grave
      if (!aliveRef.current || advancedRef.current) return;
      advancedRef.current = true;
      schedule(() => {
        if (!advance()) setScreen("complete");
      }, ADVANCE_MS);
    });
  }, [cheerId, letters, currentLetter, markDone, advance, setScreen, schedule]);

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const letter = drag.letter;
      setDrag(null);
      setSnapReady(false);

      if (!nearSlot(e.clientX, e.clientY)) return; // open water — silent

      if (letter !== currentLetter) {
        // aimed at the bubble with the wrong letter: the soft note, and the
        // letter simply stays on the sand for another try. Never a failure.
        playIncorrectSound();
        return;
      }

      const slot = slotRef.current;
      const rootRect = rootRef.current?.getBoundingClientRect();
      if (slot && rootRect) {
        const r = slot.getBoundingClientRect();
        const p = toRoot(e.clientX, e.clientY);
        setFlying({
          fx: p.x,
          fy: p.y,
          tx: r.left + r.width / 2 - rootRect.left,
          ty: r.top + r.height / 2 - rootRect.top,
        });
      } else {
        land();
      }
    },
    [drag, currentLetter, nearSlot, toRoot, land, rootRef]
  );

  const shownTarget = displayLetter(currentLetter, letterCase);

  return (
    <div
      ref={rootRef}
      className="oh-screen relative h-full w-full overflow-hidden"
      style={cssVars({
        "--pl-from": material.from,
        "--pl-to": material.to,
        "--pl-rim": material.rim,
        "--pl-glow": material.glow,
      })}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <HuntWorld />

      {/* chrome: back · found count */}
      <div className="oh-topbar relative z-20 flex w-full items-center justify-between gap-2 px-4 py-3">
        <NavPillButton
          label="Back"
          ariaLabel="Back to the start screen"
          tone="ocean"
          surface="strong"
          onClick={() => {
            playClickSound();
            stopVoice();
            router.back();
          }}
        />
        <div className="oh-pill flex shrink-0 items-center rounded-full px-4 py-2" role="status">
          <span className="font-rounded text-ocean text-sm font-black whitespace-nowrap">
            {run ? runDone : doneCount} / {runTotal} ⭐
          </span>
        </div>
      </div>

      {/* the strip: a run of letters with one bubble waiting empty */}
      <div className="oh-sequence relative z-10">
        {letters.map((l, i) => {
          const isMissing = i === missingIndex;
          const shown = displayLetter(l, letterCase);
          const filled = !isMissing || placed;
          return (
            <motion.div
              key={l}
              className="oh-seq-item"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3.2 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.25,
              }}
            >
              <button
                ref={isMissing ? slotRef : undefined}
                className={`oh-seq-bubble ${isMissing && !placed ? "oh-seq-bubble--empty" : ""} ${
                  isMissing && snapReady ? "oh-seq-bubble--ready" : ""
                }`}
                aria-label={
                  filled ? `Letter ${shown}` : `Empty bubble — the missing letter goes here`
                }
                tabIndex={-1}
              >
                <AnimatePresence>
                  {filled && (
                    <motion.span
                      className={`oh-seq-glyph font-rounded font-black ${
                        isMissing ? "oh-seq-glyph--found" : ""
                      }`}
                      initial={isMissing ? { scale: 0 } : false}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                    >
                      {shown}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              {isMissing && placed && <StarBurst />}
            </motion.div>
          );
        })}
      </div>

      {/* the letters waiting on the sand */}
      <div className="oh-options relative z-10">
        {options.map((l, i) => {
          const m = materialFor(l);
          const beingDragged = drag?.letter === l;
          const gone = placed && l === currentLetter;
          return (
            <motion.button
              key={l}
              ref={(el) => registerTarget(optionRefs.current, l, el)}
              className={`oh-option touch-none ${beingDragged ? "opacity-25" : ""} ${
                gone ? "oh-option--gone" : ""
              }`}
              style={cssVars({ "--pl-from": m.from, "--pl-to": m.to, "--pl-rim": m.rim })}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: gone ? 0 : 1, opacity: gone ? 0 : 1, rotate: [0, -2, 2, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 260, damping: 18 },
                rotate: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
              }}
              onPointerDown={(e) => startDrag(e, l)}
              aria-label={`Letter ${displayLetter(l, letterCase)} — drag it to the empty bubble`}
            >
              <span className="oh-option-glyph font-rounded font-black">
                {displayLetter(l, letterCase)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* the celebration — the portal's shared full-screen overlay: tinted
          water, the letter large, the cheer as the heading. It holds while
          the run is read back, then auto-advances after ADVANCE_MS. */}
      <AnimatePresence>
        {placed && (
          <CelebrationOverlay
            tintClassName="oh-win-tint"
            gapClassName="gap-4"
            blur="3px"
            size={dims}
            sparkles={false}
          >
            {/* THE WATER'S OWN CELEBRATION: light through the surface, the
                whole sea fizzing with bubbles that swell and POP, the found
                letter rising to the surface on a column of bubbles, and the
                reef's regulars swimming in from both sides. The generic
                sparkles are off — bubbles are the sparkle here. */}
            <GodRays />
            <BubblePops count={40} />
            <CelebrationMotif motif="bubble" count={22} extras={letterFall} extraEvery={4} />
            <SwimIn swimmers={HUNT_FRIENDS} />
            <motion.span
              className="oh-win-letter font-rounded relative z-10 font-black"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: [0, -12, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 220, damping: 16 },
                y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
              }}
            >
              {displayLetter(currentLetter, letterCase)}
            </motion.span>
            <h2 className="oh-win-heading font-rounded relative z-10 font-black">
              {clipText(cheerId)}
            </h2>
          </CelebrationOverlay>
        )}
      </AnimatePresence>

      {hint && !drag && !flying && !placed && (
        <TeachingHand fx={hint.fx} fy={hint.fy} tx={hint.tx} ty={hint.ty} />
      )}

      {/* the seat: a short settle from the drop point into the bubble */}
      {flying && (
        <motion.div
          className="pointer-events-none absolute z-40"
          initial={{ left: flying.fx, top: flying.fy }}
          animate={{ left: flying.tx, top: flying.ty }}
          transition={{ duration: 0.16, ease: [0.3, 0.7, 0.2, 1] }}
          onAnimationComplete={land}
          aria-hidden="true"
        >
          <span className="oh-ghost oh-ghost--flying font-rounded font-black">{shownTarget}</span>
        </motion.div>
      )}

      {/* drag ghost — root-relative absolute, never position:fixed */}
      {drag && (
        <div
          className="oh-ghost pl-at pointer-events-none absolute z-40"
          style={cssVars({
            "--pl-x": `${drag.x}px`,
            "--pl-y": `${drag.y}px`,
            "--pl-from": materialFor(drag.letter).from,
            "--pl-to": materialFor(drag.letter).to,
            "--pl-rim": materialFor(drag.letter).rim,
          })}
          aria-hidden="true"
        >
          <span className="oh-ghost-glyph font-rounded font-black">
            {displayLetter(drag.letter, letterCase)}
          </span>
        </div>
      )}
    </div>
  );
}
