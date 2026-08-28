"use client";
import { StarRow } from "@shared/components/ui/StarRow";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { animalFor, JUNGLE_ANIMALS, animalPhotoPath } from "@games/jungle-spy/constants/animals";
import { AnimalDisplay } from "@games/jungle-spy/components/AnimalDisplay";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { cssVars } from "@shared/styles/cssVars";
import { JungleBackdrop } from "@games/jungle-spy/components/JungleScreens";
import { shuffle } from "@shared/utils/random";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playFanfare,
} from "@shared/audio/sfx";
import { playClip, preloadClips, clipText, stopVoice } from "@shared/audio/voice";

/** Age-5 tuning: big, well-spaced letters; no failure states. Always exactly
 *  5 copies of the target to find (that is what the 5 stars count), among as
 *  many decoys as the measured play area comfortably holds — see bubbleCount. */
const TARGET_COUNT = 5;

/** ── Board layout ─────────────────────────────────────────────────────────
 *
 *  The board is laid out in PIXELS against the measured play area, then
 *  stored as percentages. Percentages alone are not enough: a 13%-of-width
 *  gap is 250px on a desktop and 45px on a phone, so a single set of percent
 *  numbers cannot keep letters both spread out AND non-overlapping on every
 *  screen. Working in pixels makes spacing mean the same thing everywhere;
 *  storing percentages means the board still reflows if the window changes.
 *
 *  Three things scale with the measured area:
 *    - the letter size (the CSS clamp used to be viewport-based, which on a
 *      short wide screen sized letters off the viewport HEIGHT while they
 *      were being spaced by container WIDTH — the two disagreed),
 *    - the spacing between letters, which is a multiple of the letter size,
 *    - how many letters the board holds, so a big screen fills out to its
 *      edges instead of leaving the sides empty.
 */
interface PlayArea {
  /** play-area size in CSS px */
  w: number;
  h: number;
  /** the animal's occupied box in px, relative to the play area */
  keep: { left: number; top: number; right: number; bottom: number };
}

/** Letter size tiers as a fraction of the play area's SHORT side, so letters
 *  stay in proportion whatever the aspect ratio. Bounded: never too small to
 *  tap, never comically large on a big display. */
const FONT_TIERS = [0.115, 0.096, 0.08, 0.065] as const;
const FONT_MIN = 30;
const FONT_MAX = 104;

function letterFontPx(tier: number, play: PlayArea): number {
  const base = Math.min(play.w, play.h);
  return Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, FONT_TIERS[tier] * base)));
}

/**
 * THE FIXED LETTER MAP — the answer to "why does every round look different?"
 *
 * Positions used to be produced by a randomised rejection sampler, so each
 * round scattered letters somewhere new: one board bunched right, the next left
 * a corner empty, and a letter the sampler could not place was silently
 * dropped. The layout was never designed, only rolled.
 *
 * These are hand-placed percent coordinates covering every region and corner of
 * the play area, ordered so that any PREFIX of the list is still a balanced
 * board — the first 12 cover the screen, the first 18 cover it more densely,
 * and so on. That is what keeps the map responsive without making it random:
 * a small viewport uses fewer slots, but on a given device the SAME slots are
 * used every round and only the letter sitting in each one changes.
 *
 * Every value is inset from the edges (nothing below 6% or above 94%) and the
 * render clamps in px on top of that, so a letter can never be clipped.
 *
 * The centre band is deliberately empty — that is where the animal sits.
 */
const BASE_SLOTS: readonly [number, number][] = [
  // pass 1 — the eight anchors: corners and mid-edges, whole-screen coverage
  [10, 14],
  [50, 8],
  [90, 14],
  [7, 45],
  [93, 45],
  [10, 84],
  [50, 92],
  [90, 84],
  // pass 2 — fill the diagonals between the anchors
  [29, 26],
  [71, 26],
  [29, 72],
  [71, 72],
  // pass 3 — outer thirds, still clear of the animal
  [19, 60],
  [81, 60],
  [33, 47],
  [67, 47],
  // pass 4 — the remaining gaps
  [21, 33],
  [79, 33],
  [40, 18],
  [60, 18],
  [40, 84],
  [60, 84],
  [6, 26],
  [94, 26],
  [6, 70],
  [94, 70],
];

/**
 * THREE ORIENTATIONS of the map, and the board ALTERNATES between them per
 * letter — the same designed coverage, seen three ways, so consecutive
 * rounds never look identical without a single random number:
 *
 *   0 — the base map;
 *   1 — the base map mirrored left↔right;
 *   2 — the base map flipped top↕bottom.
 *
 * Mirroring preserves everything the base map guarantees (whole-screen
 * coverage, balanced prefixes, edge insets, the empty centre band for the
 * animal), which is why the variants are TRANSFORMS of the designed map
 * rather than three separately-rolled layouts.
 */
const LAYOUTS: readonly (readonly [number, number][])[] = [
  BASE_SLOTS,
  BASE_SLOTS.map(([x, y]) => [100 - x, y] as [number, number]),
  BASE_SLOTS.map(([x, y]) => [x, 100 - y] as [number, number]),
];

/** Which orientation this letter's board uses — deterministic, so a replay
 *  of the same letter shows the same board, and A/B/C walk the cycle. */
function layoutFor(target: string): readonly [number, number][] {
  return LAYOUTS[Math.abs(target.toUpperCase().charCodeAt(0) - 65) % LAYOUTS.length];
}

/** How many of the fixed slots this viewport uses. Bigger screens use more of
 *  the map; the slots themselves never move. */
function slotCount(play: PlayArea): number {
  const area = play.w * play.h;
  // Denser boards across the board — phones now hold 16 letters (the old 12
  // left mobile rounds feeling sparse), and every tier fills its screen.
  if (area < 220_000) return 16;
  if (area < 420_000) return 20;
  if (area < 700_000) return 24;
  return BASE_SLOTS.length;
}

interface Bubble {
  id: number;
  letter: string; // display letter (case follows mode)
  isTarget: boolean;
  x: number;
  y: number;
  popped: boolean;
  /** four size tiers — playful variety; tap area stays comfortable */
  size: 0 | 1 | 2 | 3;
  color: string;
}

/** Bright, friendly letter colors (reference-sheet palette) */
const LETTER_COLORS = [
  "#E85D9E", // pink
  "#2BB3A3", // teal
  "#F2913D", // orange
  "#7C4DBE", // purple
  "#6FBF44", // green
  "#4D9EE8", // blue
  "#E8B33D", // golden
  "#E86A6A", // coral
];

function buildBubbles(target: string, letterCase: "upper" | "lower", play: PlayArea): Bubble[] {
  const slots = layoutFor(target);
  const total = Math.min(slotCount(play), slots.length);
  const others = JUNGLE_ANIMALS.map((a) => a.letter).filter((l) => l !== target);
  const decoys = shuffle(others).slice(0, Math.max(0, total - TARGET_COUNT));
  // Only the ASSIGNMENT is shuffled — which letter lands in which fixed slot.
  // The slots themselves are identical every round, which is the whole point.
  const letters = shuffle([
    ...Array.from({ length: TARGET_COUNT }, () => ({ letter: target, isTarget: true })),
    ...decoys.map((l) => ({ letter: l, isTarget: false })),
  ]);

  return letters.map((l, i) => ({
    id: i,
    letter: letterCase === "lower" ? l.letter.toLowerCase() : l.letter,
    isTarget: l.isTarget,
    popped: false,
    // Size varies for visual interest but is tied to the SLOT, not to the
    // letter, so a target is never predictably the big one.
    size: (i % 4) as 0 | 1 | 2 | 3,
    color: LETTER_COLORS[i % LETTER_COLORS.length],
    x: slots[i][0],
    y: slots[i][1],
  }));
}

/** Positions are FIXED, so a resize or orientation flip no longer needs to
 *  re-scatter anything — the same slots simply resolve against the new box.
 *  Kept as a named no-op so the call sites still read honestly. */
function respread(bubbles: Bubble[]): Bubble[] {
  return bubbles;
}

export function JungleLevel() {
  const router = useRouter();
  const store = useJungleStore();
  const { currentLetter, letterCase, markFound, setScreen, advance } = store;
  /** Last animal of the RUN the child is actually playing — not "every animal
   *  in the game is found". A fresh Start-from-A run ends at Z even when the
   *  child had already found everything before starting it, which is why this
   *  can no longer be derived from `found`. */
  const run = store.run;
  const runComplete = !run || run.index >= run.queue.length - 1;
  const animal = animalFor(currentLetter);
  const display = letterCase === "lower" ? currentLetter.toLowerCase() : currentLetter;

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const levelKey = `${currentLetter}|${letterCase}|${round}`;
  const [sessionKey, setSessionKey] = useState(levelKey);
  const [won, setWon] = useState(false);
  if (sessionKey !== levelKey) {
    setSessionKey(levelKey);
    setWon(false);
  }

  // The board is scattered against the MEASURED play area and the animal's
  // MEASURED box, so it fills whatever screen it is on and never covers the
  // picture. Measured in a layout effect (before paint) and re-measured on
  // resize, so an orientation flip re-scatters into the new shape.
  const playRef = useRef<HTMLDivElement>(null);
  const animalRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState<PlayArea | null>(null);
  useLayoutEffect(() => {
    const el = playRef.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const a = animalRef.current?.getBoundingClientRect();
      const keep = a
        ? {
            left: a.left - box.left,
            top: a.top - box.top,
            right: a.right - box.left,
            bottom: a.bottom - box.top,
          }
        : {
            left: box.width * 0.36,
            top: box.height * 0.3,
            right: box.width * 0.64,
            bottom: box.height * 0.8,
          };
      setPlay({ w: el.offsetWidth, h: el.offsetHeight, keep });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /** A coarse fingerprint of the play area: changes on a real resize or an
   *  orientation flip, not on every sub-pixel reflow. */
  const layoutKey = play ? `${Math.round(play.w / 40)}x${Math.round(play.h / 40)}` : null;
  const boardKey = `${currentLetter}|${letterCase}|${round}`;
  const builtRef = useRef<{ board: string; layout: string } | null>(null);
  // Measured from the actual rendered root — NOT window.innerWidth/height via
  // position:fixed, which breaks (confetti bunches to one side) inside any
  // transformed Framer Motion ancestor. This matches the tracing game's
  // reliable CelebrationScreen pattern.
  const [rootRef, dims] = useElementSize();

  const targetsLeft = useMemo(
    () => (bubbles.length ? bubbles.filter((b) => b.isTarget && !b.popped).length : TARGET_COUNT),
    [bubbles]
  );
  const targetsTotal = useMemo(
    () => (bubbles.length ? bubbles.filter((b) => b.isTarget).length : TARGET_COUNT),
    [bubbles]
  );

  // A fresh board for a new letter / replay, and a re-scatter (progress kept)
  // when the play area itself changes shape.
  useEffect(() => {
    if (!play || !layoutKey) return;
    const prev = builtRef.current;
    if (prev?.board === boardKey && prev.layout === layoutKey) return;
    if (prev?.board === boardKey) {
      builtRef.current = { board: boardKey, layout: layoutKey };
      setBubbles((current) => (current.length ? respread(current) : current));
      return;
    }
    builtRef.current = { board: boardKey, layout: layoutKey };
    setBubbles(buildBubbles(currentLetter, letterCase, play));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardKey, layoutKey, play]);

  // Fresh board + the pre-generated intro sentence on letter change / replay;
  // preload everything this level needs (same clip system as letter tracing)
  useEffect(() => {
    const l = currentLetter.toLowerCase();
    preloadClips([
      `jungle-find-${l}`,
      `letter-${l}`,
      "instr-try-again",
      "cheer-great-job",
      "instr-again",
      "instr-next",
    ]);
    const t = setTimeout(() => void playClip(`jungle-find-${l}`), 350);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, [currentLetter, letterCase, round]);

  const tapBubble = useCallback(
    (b: Bubble) => {
      if (won || b.popped) return;
      if (b.isTarget) {
        playCorrectSound();
        void playClip(`letter-${currentLetter.toLowerCase()}`);
        setBubbles((prev) => {
          const next = prev.map((p) => (p.id === b.id ? { ...p, popped: true } : p));
          if (next.every((p) => !p.isTarget || p.popped)) {
            // Level complete
            setTimeout(() => {
              setWon(true);
              markFound(currentLetter);
              // warm the next letter's photo while the child celebrates
              const idx = JUNGLE_ANIMALS.findIndex((a) => a.letter === currentLetter);
              const nxt = JUNGLE_ANIMALS[(idx + 1) % JUNGLE_ANIMALS.length];
              new Image().src = animalPhotoPath(nxt.art);
              void playClip("cheer-great-job").then(() => playFanfare());
            }, 350);
          }
          return next;
        });
      } else {
        // Never a failure — a gentle wiggle and a friendly nudge
        playIncorrectSound();
        setShakeId(b.id);
        setTimeout(() => setShakeId(null), 500);
        void playClip("instr-try-again");
      }
    },
    [won, currentLetter, markFound]
  );

  const goNext = useCallback(() => {
    stopVoice(); // never let the cheer keep talking into the next level
    void playClip("instr-next");
    // Walk the RUN the child started, NOT the found list. Consulting `found`
    // here is precisely what made "Start from A" skip animals already found:
    // a fresh run deliberately contains them.
    setRound((r) => r + 1); // fresh keys — the win overlay and board fully reset
    if (!advance()) setScreen("complete");
  }, [advance, setScreen]);

  const playAgain = useCallback(() => {
    void playClip("instr-again");
    setRound((r) => r + 1);
  }, []);

  return (
    <div
      ref={rootRef}
      className="bg-wash-mint relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-3"
    >
      <JungleBackdrop />

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between gap-2">
        <button
          onClick={() => {
            playClickSound();
            router.back();
          }}
          className="shadow-soft flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2"
          aria-label="Back to the letter grid"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="#3DAA72"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-rounded text-jungle text-xs font-bold">Letters</span>
        </button>

        <div className="shadow-soft flex items-center gap-2 rounded-full bg-white/80 px-4 py-2">
          <span className="font-rounded text-plum/70 text-sm font-bold">I spy the letter</span>
          <span className="font-rounded text-jungle text-2xl font-black">{display}</span>
        </div>

        {/* spacer balances the back button so the title stays centered */}
        <div className="min-h-[44px] w-[84px]" aria-hidden="true" />
      </div>

      {/* Collected stars — the shared gold-star row every game uses */}
      <div
        className="shadow-soft relative z-10 mt-2 flex items-center justify-center rounded-2xl bg-white/85 px-4 py-1.5"
        role="status"
      >
        <StarRow earned={targetsTotal - targetsLeft} total={targetsTotal} />
      </div>

      {/* Play area — FULL WIDTH on purpose. It used to be capped at max-w-3xl
          (768px), so on any wider screen the letters could only ever be
          scattered inside a centred 768px column and the sides of the screen
          stayed empty however many letters were added. */}
      <div ref={playRef} className="relative z-10 mt-1 w-full flex-1">
        {/* Animal center */}
        {/* anchored at (50%, 55%) — the SAME point ANIMAL_KEEP_OUT excludes,
            so a scattered letter can never land on top of the picture */}
        <div
          ref={animalRef}
          className="pointer-events-none absolute top-[55%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            aria-label={animal.name}
            role="img"
          >
            {/* The animal itself is the visual — no frame, no mount, no card.
                object-contain inside keeps the whole animal and its true
                proportions; the silhouette drop-shadow comes from .jsp-animal */}
            <div className="jsp-animal flex items-center justify-center">
              <AnimalDisplay art={animal.art} />
            </div>
            <p className="jsp-animal-name font-rounded text-plum/80 shadow-soft mt-1.5 rounded-full bg-white/85 px-3 py-0.5 text-center font-black">
              {animal.name}
            </p>
          </motion.div>
        </div>

        {/* Letter bubbles */}
        <AnimatePresence>
          {bubbles.map(
            (b) =>
              !b.popped && (
                <motion.button
                  key={`${round}-${b.id}`}
                  onClick={() => tapBubble(b)}
                  className="jsp-bubble pl-at absolute flex min-h-[48px] min-w-[48px] items-center justify-center p-1.5"
                  style={cssVars({ "--pl-x": `${b.x}%`, "--pl-y": `${b.y}%` })}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    shakeId === b.id
                      ? { scale: 1, opacity: 1, x: [-6, 6, -5, 5, -3, 3, 0] }
                      : { scale: 1, opacity: 1, x: 0 }
                  }
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  aria-label={`Letter ${b.letter}`}
                >
                  <span
                    className="pl-glyph pl-tint font-rounded leading-none font-black drop-shadow-sm"
                    style={cssVars({
                      "--pl-color": b.color,
                      "--pl-font-size": `${play ? letterFontPx(b.size, play) : 40}px`,
                    })}
                  >
                    {b.letter}
                  </span>
                </motion.button>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <CelebrationOverlay
            tintClassName="jsp-win-tint"
            gapClassName="gap-4"
            blur="3px"
            size={dims}
          >
            <motion.div
              className="jsp-animal jsp-win-photo"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: [0, -14, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 220, damping: 16 },
                y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
              }}
            >
              <AnimalDisplay art={animal.art} />
            </motion.div>
            <h2 className="jsp-win-heading font-rounded text-plum font-black">
              {clipText("cheer-great-job")}
            </h2>
            <p className="font-rounded text-plum/60 text-base font-semibold">
              You found every {display}! {display} is for {animal.name}.
            </p>
            <div className="flex gap-4">
              <button
                onClick={playAgain}
                className="font-rounded text-plum min-h-[52px] rounded-full bg-white px-6 text-base font-black shadow-lg"
                aria-label="Play this letter again"
              >
                Again
              </button>
              <button
                onClick={goNext}
                className="bg-jungle font-rounded min-h-[52px] rounded-full px-6 text-base font-black text-white shadow-lg"
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
