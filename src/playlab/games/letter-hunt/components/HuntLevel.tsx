"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHuntStore } from "@games/letter-hunt/store/huntStore";
import { LETTERS } from "@games/letter-hunt/components/HuntScreens";
import { PencilPal, Notebook } from "@games/letter-hunt/components/PennyArt";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import { shuffle } from "@shared/utils/random";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playStarPop,
} from "@shared/audio/sfx";
import { StarRow } from "@shared/components/ui/StarRow";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { cssVars } from "@shared/styles/cssVars";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { HuntLetterField } from "@games/letter-hunt/components/HuntLetterField";

/** Letters that look too similar to make fair decoys for a given target */
const CONFUSABLE: Record<string, string[]> = {
  B: ["D", "P", "R"],
  D: ["B", "O", "Q"],
  O: ["Q", "C", "D"],
  Q: ["O", "G"],
  P: ["B", "R"],
  R: ["B", "P"],
  C: ["O", "G"],
  G: ["C", "Q"],
  I: ["L", "J", "T"],
  L: ["I", "J"],
  J: ["I", "L"],
  M: ["N", "W"],
  N: ["M"],
  W: ["M", "V"],
  V: ["W", "U"],
  U: ["V"],
  E: ["F"],
  F: ["E"],
};

/** Six clearly different visual treatments — same letter, different looks.
 *  The cognitive point: "A can look different but is still A." */
const CARD_STYLES = [
  { bg: "#DDD5F5", border: "#A882E8", color: "#7C5CBF", radius: "1.5rem", outline: false },
  { bg: "#FFFFFF", border: "#FF8FA3", color: "#FF8FA3", radius: "9999px", outline: false },
  { bg: "#C8F0D8", border: "#66CC94", color: "#3DAA72", radius: "1rem", outline: false },
  { bg: "#FFF0B3", border: "#F2C94C", color: "#C08A2D", radius: "1.75rem", outline: false },
  { bg: "#FFFFFF", border: "#74B9FF", color: "#74B9FF", radius: "1.25rem", outline: true },
  { bg: "#FFD6E8", border: "#FF9EBC", color: "#D14D82", radius: "9999px", outline: false },
] as const;

interface Card {
  id: number;
  letter: string;
  isTarget: boolean;
  found: boolean;
  style: (typeof CARD_STYLES)[number];
  /** percent position within the play area — a real spatial scatter, not a grid */
  x: number;
  y: number;
  rotate: number;
  fontSize: string;
}

/** Ten hand-placed slots spanning the FULL play area edge-to-edge — a busy,
 *  game-like scatter, not rows/columns. Shuffled per round. */
/** Card positions as percentages of the play area. Ordered so any prefix is
 *  still a balanced board, and inset from the edges (6%-94% / 7%-90%); the
 *  render additionally clamps in px, so a card can never be clipped. */
const SLOTS: readonly [number, number][] = [
  [7, 14],
  [23, 8],
  [41, 18],
  [59, 7],
  [77, 16],
  [93, 9],
  [6, 38],
  [26, 33],
  [48, 41],
  [70, 34],
  [92, 38],
  [10, 62],
  [30, 57],
  [52, 66],
  [74, 58],
  [94, 64],
  [20, 86],
  [44, 90],
  [66, 84],
  [88, 89],
];

/** How many cards are on the board. Five of them are targets (see
 *  TARGET_TOTAL); every other one is a decoy. Raising this makes the screen
 *  busier to scan WITHOUT changing how many letters the child must find. */
const CARD_TOTAL = SLOTS.length;

/** Five font-size tiers — deliberately extreme (tiny → huge) so the board
 *  reads as genuinely varied, not just "slightly different". Applied to the
 *  glyph only; the tap target is kept comfortable via container padding. */
const SIZE_TIERS = [
  "clamp(18px, 3.6vmin, 26px)",
  "clamp(26px, 5.2vmin, 38px)",
  "clamp(36px, 7.2vmin, 54px)",
  "clamp(50px, 10vmin, 76px)",
  "clamp(66px, 13.5vmin, 104px)",
] as const;

/** Slowly rotating concentric rings — a calm (non-flashing) hypnotic pattern
 *  behind each letter, purely to make the board busier/harder to scan. */
function HypnoRings({ hue }: { hue: string }) {
  const rings = [0.95, 0.76, 0.57, 0.38, 0.19];
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full opacity-40"
      animate={{ rotate: 360 }}
      transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      {rings.map((r, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={r * 46}
          fill="none"
          stroke={hue}
          strokeWidth="6"
          strokeDasharray={i % 2 === 0 ? "10 7" : "4 6"}
          opacity={0.5 + (i % 2) * 0.3}
        />
      ))}
    </motion.svg>
  );
}

/**
 * How many copies of the target are hidden on the board. FIXED AT FIVE — the
 * play mode never changes this, only how many of them the child is asked to
 * find before the round is banked (see `goal` in HuntLevel).
 */
const TARGET_TOTAL = 5;

/** Cycles needed to finish a letter in 5 Star mode — one gold star each. */
const STAR_TOTAL = 5;

/** How long the celebration star takes to fly from the centre of the board up
 *  into the star row. The star is credited when it lands, so this doubles as
 *  the pause before the next cycle's board appears. Snappy on purpose — a
 *  celebration that outstays its welcome just delays the next round. */
const STAR_FLIGHT_MS = 850;

function buildCards(target: string): Card[] {
  const avoid = new Set([target, ...(CONFUSABLE[target] ?? [])]);
  const decoyPool = shuffle(LETTERS.filter((l) => !avoid.has(l)));
  const decoyCount = CARD_TOTAL - TARGET_TOTAL;
  // A handful of repeated decoy identities rather than one of everything —
  // repetition is what makes a board genuinely hard to scan. Every distractor
  // is still a letter that is NOT visually confusable with the target.
  const decoyIdentities = decoyPool.slice(0, 5);
  const decoys = Array.from(
    { length: decoyCount },
    (_, i) => decoyIdentities[i % decoyIdentities.length]
  );
  const styles = shuffle([...CARD_STYLES, ...CARD_STYLES, ...CARD_STYLES, ...CARD_STYLES]).slice(
    0,
    CARD_TOTAL
  );
  const slots = shuffle(SLOTS);
  const sizes = shuffle([...SIZE_TIERS, ...SIZE_TIERS, ...SIZE_TIERS, ...SIZE_TIERS]).slice(
    0,
    CARD_TOTAL
  );
  const letters = shuffle([
    ...Array.from({ length: TARGET_TOTAL }, () => ({ letter: target, isTarget: true })),
    ...decoys.map((l) => ({ letter: l, isTarget: false })),
  ]);
  return letters.map((l, i) => ({
    id: i,
    ...l,
    found: false,
    style: styles[i],
    x: slots[i][0],
    y: slots[i][1],
    rotate: [-8, -5, -2, 0, 2, 4, 6, -4, 3, -6, -7, 5, -3, 1, 7, -1, 4, -5, 2, 6][i],
    fontSize: sizes[i],
  }));
}

type Phase = "intro" | "find" | "done";

/** Tiny star burst local to one card — never screen-covering, so the child
 *  always keeps sight of the remaining letters. */
function MiniBurst() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3;
        return (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 text-base"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: Math.cos(a) * 42, y: Math.sin(a) * 42, opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            ✨
          </motion.span>
        );
      })}
    </div>
  );
}

export function HuntLevel() {
  const store = useHuntStore();
  const { currentIndex, letterCase, mode, markCompleted, setScreen, advance } = store;
  /**
   * BOTH modes require finding all five targets — that is one CYCLE.
   * The modes differ only in how many cycles the letter takes:
   *
   *   Free       1 cycle  — find all 5, round done
   *   Five Star  5 cycles — find all 5, earn a star, board re-scatters, repeat
   *
   * Same shape as tracing (one rep vs five reps, one star per rep); the
   * target count is never anything but five.
   */
  const cyclesTarget = mode === "free" ? 1 : STAR_TOTAL;
  const target = LETTERS[currentIndex]; // canonical uppercase — audio, data, keys
  /** How the letter is DRAWN: the child hunts BIG or little letters. */
  const shown = letterCase === "lower" ? target.toLowerCase() : target;
  /** Last letter of the RUN the child is actually playing — not "everything in
   *  the alphabet is complete". A fresh Start-from-A run ends at Z even if the
   *  child had already finished every letter before starting it. */
  const run = store.run;
  const runComplete = !run || run.index >= run.queue.length - 1;

  const [phase, setPhase] = useState<Phase>("intro");
  const [introStep, setIntroStep] = useState(0); // 0 settle · 1 letter shown · 2 prompt
  const roundKey = `${target}-${letterCase}`;
  const [sessionKey, setSessionKey] = useState(roundKey);
  const [cards, setCards] = useState<Card[]>(() => buildCards(target));
  /** Completed 5-find cycles for THIS letter — one star apiece in 5 Star. */
  const [cycles, setCycles] = useState(0);
  /** The celebration star in flight: where in the top row it is heading, in
   *  coordinates relative to the level root. Null when no star is flying. */
  const [starFlight, setStarFlight] = useState<{ dx: number; dy: number } | null>(null);
  const starRowRef = useRef<HTMLDivElement>(null);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [cheerId] = useState(
    () =>
      ["cheer-well-done", "cheer-great-job", "cheer-you-did-it", "cheer-fantastic"][
        Math.floor(Math.random() * 4)
      ]
  );
  if (sessionKey !== roundKey) {
    setSessionKey(roundKey);
    setPhase("intro");
    setIntroStep(0);
    setCards(buildCards(target));
    setCycles(0);
  }
  // Measured from the ACTUAL rendered root — not window.innerWidth/height —
  // so the confetti always spans the true play viewport, immune to any
  // transformed ancestor (which is what causes confetti to bunch to one
  // side: position:fixed breaks inside a transformed parent, this doesn't).
  const [rootRef, dims] = useElementSize();

  const foundCount = useMemo(() => cards.filter((c) => c.isTarget && c.found).length, [cards]);

  // ── Introduction choreography, driven by the real audio lifecycle:
  // Penny settles → notebook + letter → "A" → "aaah" → "Can you find A?" → find
  useEffect(() => {
    const l = target.toLowerCase();
    preloadClips([`letter-${l}`, `phonics-${l}`, `hunt-find-${l}`, cheerId]);
    let cancelled = false;
    // Speak IMMEDIATELY. The old 900ms head start existed to let Penny and the
    // notebook settle, but the letter pops in on the first clip anyway (i === 0
    // below), so all the delay bought was silence: the child watched an inert
    // screen for nearly a second every single round. The entrance springs run
    // underneath the narration now, which is what "settling" should have meant.
    void playSequence([`letter-${l}`, `phonics-${l}`, `hunt-find-${l}`], 220, (i) => {
      if (cancelled) return;
      if (i === 0) setIntroStep(1); // letter pops as its name is spoken
      if (i === 2) setIntroStep(2); // prompt caption as the question is asked
    }).then(() => {
      if (!cancelled) setTimeout(() => !cancelled && setPhase("find"), 300);
    });
    return () => {
      cancelled = true;
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const tapCard = useCallback(
    (c: Card) => {
      if (phase !== "find" || c.found) return;
      if (c.isTarget) {
        playCorrectSound();
        void playClip(`letter-${target.toLowerCase()}`);
        const next = cards.map((p) => (p.id === c.id ? { ...p, found: true } : p));
        setCards(next);

        // A cycle ends only when ALL FIVE targets are found — never after one.
        if (next.filter((p) => p.isTarget && p.found).length < TARGET_TOTAL) return;

        const done = cycles + 1;
        playStarPop();

        // THE STAR: it bursts in the middle of the screen where the child is
        // looking, then flies to its slot in the top row — so the row visibly
        // GAINS that star rather than silently ticking up while the child's
        // eyes are still on the board. Measured from the real elements, so it
        // lands correctly whatever the viewport.
        const rootBox = rootRef.current?.getBoundingClientRect();
        const rowBox = starRowRef.current?.getBoundingClientRect();
        if (rootBox && rowBox) {
          // Offset in PX from the centre of the board to the centre of the star
          // row. Storing a delta rather than an absolute position is what lets
          // the star animate on transforms alone (see the markup below).
          setStarFlight({
            dx: rowBox.left + rowBox.width / 2 - (rootBox.left + rootBox.width / 2),
            dy: rowBox.top + rowBox.height / 2 - (rootBox.top + rootBox.height / 2),
          });
        }

        // The star is only credited once it has ARRIVED — that is what makes
        // the flight read as the star being delivered into the row.
        setTimeout(() => {
          setStarFlight(null);
          setCycles(done);
          if (done >= cyclesTarget) {
            setPhase("done");
            markCompleted(target);
            void playClip(cheerId);
          } else {
            // More cycles to go: the SAME five targets return on a freshly
            // scattered board — same practice, new arrangement.
            setCards(buildCards(target));
          }
        }, STAR_FLIGHT_MS);
      } else {
        playIncorrectSound();
        setShakeId(c.id);
        setTimeout(() => setShakeId(null), 500);
      }
    },
    [phase, target, cheerId, markCompleted, cycles, cyclesTarget, cards, rootRef]
  );

  const goNext = useCallback(() => {
    playClickSound();
    stopVoice();
    // Walk the RUN the child started, not the completion list. A "fresh" run
    // (Start from A) deliberately contains letters they have already finished,
    // so consulting `completed` here is exactly what used to skip them.
    if (!advance()) setScreen("complete");
  }, [advance, setScreen]);

  return (
    <div
      ref={rootRef}
      className="bg-wash-mint relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-4"
    >
      {/* Scenery only — no birds or butterflies. This screen asks the child to
          scan for letters, and drifting creatures pull the eye away from that. */}
      <HomeEnvironment creatures={false} />

      {/* The alphabet soup the hunt happens inside — ~65 faint letters filling
          the screen, z-0 and pointer-events-none so they sit strictly behind
          every gameplay element and can never absorb a tap. Re-seeded per
          round, stable within one. */}
      <HuntLetterField seed={currentIndex * 31 + (letterCase === "lower" ? 7 : 0)} />

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-xl items-center justify-between">
        <NavPillButton
          label="Home"
          ariaLabel="Back to Letter Hunt home"
          tone="plum"
          onClick={() => {
            playClickSound();
            stopVoice();
            // setScreen, NOT router.back(): adding the mode-select step put a
            // "mode" history entry between menu and play, so a single back()
            // from gameplay now lands on the mode picker rather than home.
            // This is a multi-step jump, which useScreenHistorySync documents
            // as a forward push — and it is how Letter Tracing's own in-game
            // home button already behaves.
            setScreen("home");
          }}
        />

        {phase === "find" && (
          <div className="shadow-soft flex items-center gap-2 rounded-full bg-white/80 px-4 py-2">
            <span className="font-rounded text-plum/70 text-sm font-bold">Find</span>
            <span className="font-rounded text-plum text-2xl font-black">{shown}</span>
          </div>
        )}

        {/* collected stars — same gold stars as the tracing game's 5-star mode */}
        {phase !== "intro" ? (
          <div
            ref={starRowRef}
            className="shadow-soft flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5"
            role="status"
            aria-label={
              mode === "free"
                ? `${foundCount} of ${TARGET_TOTAL} letters found`
                : `${cycles} of ${STAR_TOTAL} stars earned`
            }
          >
            {/* Free shows the five finds; 5 Star shows the five STARS, one per
                completed cycle, so the row always means "progress to done". */}
            <StarRow
              earned={mode === "free" ? foundCount : cycles}
              total={mode === "free" ? TARGET_TOTAL : STAR_TOTAL}
            />
          </div>
        ) : (
          <div className="w-[84px]" aria-hidden="true" />
        )}
      </div>

      {/* ── INTRODUCTION: Penny + the notebook ── */}
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="relative z-10 flex flex-1 items-center justify-center gap-2 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <motion.div
              className="hunt-penny-intro"
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
            >
              <PencilPal pointing />
            </motion.div>

            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 18 }}
              className="flex flex-col items-center gap-3"
            >
              <Notebook>
                <AnimatePresence>
                  {introStep >= 1 && (
                    <motion.span
                      className="hunt-notebook-letter font-rounded text-plum leading-none font-black"
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: [0.3, 1.12, 1], opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {shown}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Notebook>
              {/* caption matches the spoken clip exactly */}
              <div className="min-h-[32px]">
                <AnimatePresence>
                  {introStep >= 2 && (
                    <motion.p
                      className="font-rounded text-plum shadow-soft rounded-full bg-white/85 px-4 py-1.5 text-base font-black"
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {clipText(`hunt-find-${target.toLowerCase()}`)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── FIND: a real play-space — six cards scattered across the
              whole area, varied tilt/scale, never a grid or list ── */}
        {phase !== "intro" && (
          <motion.div
            key="find"
            // FULL WIDTH on purpose — the same fix Jungle Spy already carries.
            // The slot map below spans 6%–94%, but those percentages resolve
            // against THIS box: capped at max-w-3xl (768px) the whole hunt was
            // squeezed into a narrow centred column on any wide screen, which
            // is why the letters looked clustered in the middle while the
            // decorative letter field behind them filled the screen. Uncapped,
            // the cards spread across the viewport like the animals do.
            className="relative z-10 w-full flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {cards.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => tapCard(c)}
                className="hunt-card shadow-card absolute flex min-h-[52px] min-w-[52px] items-center justify-center p-2"
                style={cssVars({
                  "--pl-x": `clamp(60px, ${c.x}%, calc(100% - 60px))`,
                  "--pl-y": `clamp(52px, ${c.y}%, calc(100% - 52px))`,
                  "--pl-bg": c.style.bg,
                  "--pl-border": c.found ? "#66CC94" : c.style.border,
                  "--pl-radius": c.style.radius,
                })}
                initial={{ x: "-50%", y: "-50%", scale: 0, opacity: 0, rotate: c.rotate }}
                animate={
                  shakeId === c.id
                    ? {
                        x: ["-56%", "-44%", "-53%", "-47%", "-51%", "-50%"],
                        y: "-50%",
                        scale: 1,
                        opacity: 1,
                        rotate: c.rotate,
                      }
                    : {
                        x: "-50%",
                        y: "-50%",
                        scale: c.found ? [1, 1.12, 1] : 1,
                        opacity: 1,
                        rotate: c.rotate,
                      }
                }
                transition={
                  shakeId === c.id || c.found
                    ? { duration: shakeId === c.id ? 0.4 : 0.35, ease: "easeOut" }
                    : { type: "spring", stiffness: 260, damping: 20 }
                }
                aria-label={`Letter ${letterCase === "lower" ? c.letter.toLowerCase() : c.letter}${c.found ? " — found!" : ""}`}
                disabled={c.found}
              >
                {/* slow, calm hypnotic ring pattern — clipped to the card shape only,
                    so the sparkle burst below can still fly freely outside it */}
                <div className="hunt-card-clip absolute inset-0 overflow-hidden">
                  <HypnoRings hue={c.style.border} />
                </div>
                {/* soft halo keeps the letter legible over the busy rings */}
                <span
                  className="hunt-card-halo absolute rounded-full bg-white/70"
                  aria-hidden="true"
                />
                <span
                  className={`pl-glyph font-rounded relative leading-none font-black ${
                    c.style.outline ? "hunt-glyph--outline" : "pl-tint"
                  }`}
                  style={cssVars({ "--pl-font-size": c.fontSize, "--pl-color": c.style.color })}
                >
                  {letterCase === "lower" ? c.letter.toLowerCase() : c.letter}
                </span>
                {/* small local sparkle on found — never screen-covering */}
                {c.found && <MiniBurst />}
                {c.found && (
                  <span
                    className="absolute -top-1.5 -right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-sm"
                    aria-hidden="true"
                  >
                    ⭐
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── The earned star: pops centre-board, then flies into the row ──
          Three nested elements, each with exactly one job, because that is what
          keeps the motion honest:

            outer   a zero-size point pinned to the centre of the board
            middle  framer animates x/y (PX offsets from that point)
            inner   centres the glyph on the point

          The previous version animated `left`/`top` between "50%" and a px
          value while ALSO holding an x:"-50%" transform. Framer cannot
          interpolate percent→px cleanly, and the leftover -50% translate stayed
          applied at the destination — which is why the star drifted off to the
          left instead of landing in the row. Transforms only, one unit, no
          drift, and it runs on the compositor so it is smoother too. */}
      <AnimatePresence>
        {starFlight && (
          <div
            key="star-flight"
            className="pointer-events-none absolute top-1/2 left-1/2 z-30"
            aria-hidden="true"
          >
            <motion.div
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 0, rotate: -20 }}
              animate={{
                x: [0, 0, starFlight.dx],
                y: [0, 0, starFlight.dy],
                scale: [0.4, 1, 0.42],
                opacity: [0, 1, 1],
                rotate: [-20, 0, 22],
              }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{
                duration: STAR_FLIGHT_MS / 1000,
                // a brief hold at full size, then a quick decisive flight
                times: [0, 0.3, 1],
                ease: [0.34, 0.8, 0.3, 1],
              }}
            >
              <div className="hunt-flying-star -translate-x-1/2 -translate-y-1/2">⭐</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Completion: Penny with a star + MATCHING spoken/displayed cheer ── */}
      <AnimatePresence>
        {phase === "done" && (
          <CelebrationOverlay
            tintClassName="hunt-done-tint"
            gapClassName="gap-4"
            blur="3px"
            size={dims}
          >
            <motion.div
              className="hunt-penny-done relative"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: [0, -10, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 220, damping: 16 },
                y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
              }}
            >
              <motion.span
                className="absolute -top-3 -right-3 text-4xl"
                animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                aria-hidden="true"
              >
                ⭐
              </motion.span>
              <PencilPal />
            </motion.div>
            <h2 className="hunt-done-heading font-rounded text-plum font-black">
              {clipText(cheerId)}
            </h2>
            <p className="font-rounded text-plum/60 text-base font-semibold">
              {mode === "free"
                ? `You found every ${shown}!`
                : `You found every ${shown}, five times!`}
            </p>
            <button
              onClick={goNext}
              className="bg-plum font-rounded inline-flex min-h-[52px] items-center gap-2 rounded-full px-7 text-base font-black text-white shadow-lg"
              aria-label={runComplete ? "See your finished alphabet" : "Next letter"}
            >
              <span>{runComplete ? "Finish!" : "Next"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
