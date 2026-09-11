"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { CelebrationMotif, useLetterFall } from "@shared/components/game/CelebrationMotif";
import { BubblePops } from "@shared/components/game/BubblePops";
import { GodRays } from "@shared/components/game/GodRays";
import { SwimIn, type Swimmer } from "@shared/components/game/SwimIn";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { useElementSize } from "@shared/hooks/useElementSize";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playCorrectSound, playIncorrectSound, playClickSound } from "@shared/audio/sfx";
import { playClip, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { shuffle } from "@shared/utils/random";
import { ROUNDS, TOTAL_ROUNDS, type LetterPair } from "@games/feed-the-shark/constants/letters";
import { useSharkStore } from "@games/feed-the-shark/store/sharkStore";
import { FriendlyShark, LetterFish } from "@games/feed-the-shark/components/SharkArt";
import { OceanBackdrop, BubbleStream } from "@games/feed-the-shark/components/OceanBackdrop";

interface SharkLevelProps {
  roundIndex: number;
  onRoundComplete: () => void;
}

/** How far outside a shark's visible box a drop still counts (px) —
 *  deliberately generous for small fingers. */
const DROP_SLOP_PX = 28;
/** Pause after a correct feed before the next fish swims in */
const NEXT_FISH_MS = 900;
/** How long the round-complete celebration shows before auto-advancing —
 *  long enough for the sea to fizz, the shoal to arrive and the cheer to be
 *  heard, without the child waiting on it. */
const ROUND_DONE_MS = 3400;

/**
 * Who swims in when both sharks are fed — the reef's regulars, from both
 * sides, placed down the edges clear of the shark in the centre. Built once
 * at module load.
 */
const SHARK_FRIENDS: readonly Swimmer[] = (
  [
    { key: "x-ray fish", x: "13%", y: "28%", delay: 0.4, from: "left" },
    { key: "octopus", x: "87%", y: "32%", delay: 0.65, from: "right" },
    { key: "turtle", x: "14%", y: "72%", delay: 0.9, from: "left" },
    { key: "jellyfish", x: "86%", y: "70%", delay: 1.1, from: "right" },
  ] as const
).flatMap(({ key, ...place }) => {
  const Art = ANIMAL_ART[key];
  return Art ? [{ ...place, node: <Art key={key} /> }] : [];
});

interface DragState {
  /** lowercase letter of the fish being dragged (identifies the fish in
   *  "both" mode, where two fish are active at once) */
  lower: string;
  x: number; // root-relative — never position:fixed, which breaks inside
  y: number; // the transformed PAGE_TRANSITION ancestor (see HuntLevel note)
}

export function SharkLevel({ roundIndex, onRoundComplete }: SharkLevelProps) {
  const router = useRouter();
  const pair = ROUNDS[roundIndex];

  // Shark left/right positions are shuffled per round so the child must
  // actually read the letters — the answer is never "always the left shark".
  const sharks = useMemo(() => shuffle([...pair]), [pair]);

  const mode = useSharkStore((s) => s.mode);
  /** Lowercase letters fed so far this round (2 = round done) */
  const [fedLowers, setFedLowers] = useState<string[]>([]);
  // "one": the classic flow — a's fish, then b's fish. "both": every unfed
  // fish is on screen and draggable simultaneously.
  const activeFish: LetterPair[] =
    mode === "both"
      ? pair.filter((p) => !fedLowers.includes(p.lower))
      : pair[fedLowers.length]
        ? [pair[fedLowers.length]]
        : [];
  const [drag, setDrag] = useState<DragState | null>(null);
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [happyShark, setHappyShark] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  /** Both of this round's letters, ready to rain down among the bubbles —
   *  the two things the child just matched, in the celebration's colours. */
  const fallFirst = useLetterFall(pair[0].upper, 3);
  const fallSecond = useLetterFall(pair[1].upper, 3);
  const letterFall = useMemo(() => [...fallFirst, ...fallSecond], [fallFirst, fallSecond]);

  const [rootRef, dims] = useElementSize();
  const sharkRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Every timer this screen schedules, cleared on unmount — nothing can fire
  // a state change or screen advance after the child has navigated away.
  const schedule = useScheduler();
  useEffect(() => () => stopVoice(), []);

  // Fresh round: preload this round's clips; speak the instruction once, on
  // the very first round only (repeating it 13 times would be noise).
  useEffect(() => {
    preloadClips([
      `letter-${pair[0].lower}`,
      `letter-${pair[1].lower}`,
      "cheer-great-job",
      "cheer-amazing",
    ]);
    if (roundIndex === 0) {
      const t = setTimeout(() => void playClip("shark-instruction"), 600);
      return () => {
        clearTimeout(t);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  // ── Drag engine — root-relative coordinates, pointer capture ─────────────
  const toRoot = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const r = rootRef.current?.getBoundingClientRect();
      return { x: clientX - (r?.left ?? 0), y: clientY - (r?.top ?? 0) };
    },
    [rootRef]
  );

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, f: LetterPair) => {
      if (celebrating || drag) return; // one drag at a time, even in "both"
      e.currentTarget.setPointerCapture(e.pointerId);
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ lower: f.lower, x: p.x, y: p.y });
    },
    [celebrating, drag, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ ...drag, x: p.x, y: p.y });
    },
    [drag, toRoot]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const fish = pair.find((p) => p.lower === drag.lower);
      setDrag(null);
      if (!fish || fedLowers.includes(fish.lower)) return;

      // Which shark was the fish dropped on? Hit boxes are the sharks'
      // visible rects inflated by DROP_SLOP_PX — forgiving on purpose. When
      // both inflated boxes contain the point (they can overlap on narrow
      // phones), the NEAREST shark center wins, so a drop in the middle zone
      // always credits the shark the child was clearly aiming at.
      let hit: string | null = null;
      let bestDist = Infinity;
      for (const [upper, el] of sharkRefs.current) {
        const r = el.getBoundingClientRect();
        const inside =
          e.clientX >= r.left - DROP_SLOP_PX &&
          e.clientX <= r.right + DROP_SLOP_PX &&
          e.clientY >= r.top - DROP_SLOP_PX &&
          e.clientY <= r.bottom + DROP_SLOP_PX;
        if (!inside) continue;
        const d = Math.hypot(
          e.clientX - (r.left + r.width / 2),
          e.clientY - (r.top + r.height / 2)
        );
        if (d < bestDist) {
          bestDist = d;
          hit = upper;
        }
      }

      if (!hit) return; // dropped in open water — fish just returns, no fuss

      if (hit === fish.upper) {
        // Correct — snap into the mouth, celebrate, then the next fish
        playCorrectSound();
        void playClip(`letter-${fish.lower}`);
        setHappyShark(hit);
        schedule(() => setHappyShark(null), 700);
        const fedNow = [...fedLowers, fish.lower];
        setFedLowers(fedNow);
        if (fedNow.length >= 2) {
          // Round complete — short celebration, then auto-advance
          schedule(() => {
            setCelebrating(true);
            void playClip("cheer-great-job");
          }, NEXT_FISH_MS);
          schedule(onRoundComplete, NEXT_FISH_MS + ROUND_DONE_MS);
        }
        // (fedNow.length === 1 → the next fish renders immediately via state;
        // its entry animation provides the natural beat, no timer needed)
      } else {
        // Wrong shark — gentle shake + soft oops; fish returns, no penalty
        playIncorrectSound();
        setWrongShake(hit);
        schedule(() => setWrongShake(null), 550);
      }
    },
    [drag, pair, fedLowers, onRoundComplete, schedule]
  );

  return (
    <div
      ref={rootRef}
      className="fs-bg relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-3"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <OceanBackdrop />
      <BubbleStream />

      {/* ── Top bar: back · instruction · progress ── */}
      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between gap-2">
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

        <div className="shadow-soft flex min-h-[44px] items-center rounded-full bg-white/85 px-4">
          <span
            className="font-rounded text-plum text-sm font-black whitespace-nowrap"
            aria-label={`Round ${roundIndex + 1} of ${TOTAL_ROUNDS}`}
          >
            {roundIndex + 1} / {TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      {/* Instruction — text matches the spoken clip via clipText */}
      <p className="font-rounded text-plum/80 shadow-soft relative z-10 mt-2 rounded-full bg-white/85 px-4 py-1.5 text-center text-xs font-bold md:text-sm">
        {clipText("shark-instruction")}
      </p>

      {/* ── The two sharks ── */}
      <div className="relative z-10 flex w-full max-w-3xl flex-1 items-center justify-center gap-[4vw]">
        {sharks.map((s, i) => {
          const fed = fedLowers.includes(s.lower);
          return (
            <motion.div
              key={s.upper}
              ref={(el) => {
                if (el) sharkRefs.current.set(s.upper, el);
                else sharkRefs.current.delete(s.upper);
              }}
              className="fs-shark relative"
              initial={{ scale: 0.6, opacity: 0, y: 16 }}
              animate={
                wrongShake === s.upper
                  ? { scale: 1, opacity: 1, y: 0, x: [-7, 7, -6, 6, -3, 0] }
                  : happyShark === s.upper
                    ? { scale: [1, 1.12, 1], opacity: 1, y: [0, -10, 0], x: 0 }
                    : { scale: 1, opacity: 1, y: 0, x: 0 }
              }
              transition={{ duration: 0.5, delay: drag ? 0 : i * 0.08 }}
              role="img"
              aria-label={`Shark with the big letter ${s.upper}${fed ? " — fed!" : ""}`}
            >
              {/* soft target halo while a fish is being dragged */}
              {drag && !fed && (
                <div className="fs-halo absolute -inset-3 rounded-full" aria-hidden="true" />
              )}
              <FriendlyShark letter={s.upper} fedLower={fed ? s.lower : undefined} />
              {fed && (
                <span
                  className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-sm"
                  aria-hidden="true"
                >
                  ⭐
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── The draggable fish (one in "one" mode, both in "both") ── */}
      <div className="relative z-10 flex min-h-[clamp(96px,20vmin,150px)] w-full items-center justify-center gap-[5vw] pb-[clamp(16px,6vh,56px)]">
        <AnimatePresence mode="popLayout">
          {!celebrating &&
            activeFish.map((f, fi) => {
              const beingDragged = drag?.lower === f.lower;
              return (
                <motion.div
                  key={f.lower}
                  className={`fs-fish touch-none ${beingDragged ? "cursor-grabbing opacity-25" : "cursor-grab"}`}
                  initial={{ scale: 0, x: -40 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: fi * 0.07 }}
                  onPointerDown={(e) => startDrag(e, f)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Little fish with the letter ${f.lower} — drag it to the shark with the big ${f.upper}`}
                >
                  {/* white bubble plate — legible over any backdrop decor,
                      and clearly reads as "grab me" */}
                  <div className="fs-plate shadow-card rounded-full bg-white/80 p-2.5">
                    <LetterFish letter={f.lower} colorIndex={pair.indexOf(f) + roundIndex} />
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Drag ghost — root-relative absolute, never position:fixed */}
      {drag && (
        <div
          className="fs-ghost pl-at pointer-events-none absolute z-40"
          style={cssVars({ "--pl-x": `${drag.x}px`, "--pl-y": `${drag.y}px` })}
          aria-hidden="true"
        >
          <div className="fs-plate shadow-card rounded-full bg-white/80 p-2.5">
            <LetterFish
              letter={drag.lower}
              colorIndex={pair.findIndex((p) => p.lower === drag.lower) + roundIndex}
            />
          </div>
        </div>
      )}

      {/* ── Round complete — short, auto-advancing celebration ── */}
      <AnimatePresence>
        {celebrating && (
          <CelebrationOverlay tintClassName="fs-celebrate-tint" size={dims} sparkles={false}>
            {/* THE WATER'S OWN CELEBRATION: light through the surface, the
                whole sea fizzing with bubbles that swell and POP, the round's
                two letters rising on a column of bubbles, the reef's regulars
                swimming in from both sides — and the shark himself, well fed.
                The generic sparkles are off; bubbles are the sparkle here. */}
            <GodRays />
            <BubblePops count={40} />
            <CelebrationMotif motif="bubble" count={22} extras={letterFall} extraEvery={4} />
            <SwimIn swimmers={SHARK_FRIENDS} />

            <motion.div
              className="fs-cheer-shark relative z-10"
              initial={{ scale: 0.5, x: -40, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1, y: [0, -12, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 200, damping: 15 },
                x: { type: "spring", stiffness: 200, damping: 15 },
                opacity: { duration: 0.3 },
                y: { duration: 1.1, repeat: 2, ease: "easeInOut", delay: 0.3 },
              }}
            >
              <FriendlyShark />
            </motion.div>

            <motion.h2
              className="fs-cheer font-rounded text-plum shadow-card relative z-10 rounded-full bg-white/90 px-8 py-3 font-black"
              initial={{ scale: 0.5, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.15 }}
            >
              {clipText("cheer-great-job")}
            </motion.h2>
            <p className="font-rounded relative z-10 text-base font-bold text-white drop-shadow">
              Both sharks are fed!
            </p>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
