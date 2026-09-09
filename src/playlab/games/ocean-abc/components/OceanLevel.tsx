"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOceanStore, displayLetter, stagesFor } from "@games/ocean-abc/store/oceanStore";
import { OceanWorld } from "@games/ocean-abc/components/OceanScreens";
import { BuildStage } from "@games/ocean-abc/components/BuildStage";
import { PopStage } from "@games/ocean-abc/components/PopStage";
import { TraceStage } from "@games/ocean-abc/components/TraceStage";
import { materialFor } from "@games/ocean-abc/constants/materials";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { CelebrationMotif, useLetterFall } from "@shared/components/game/CelebrationMotif";
import { BubblePops } from "@shared/components/game/BubblePops";
import { GodRays } from "@shared/components/game/GodRays";
import { SwimIn, SwimAcross, type Swimmer, type Crosser } from "@shared/components/game/SwimIn";
import { Ripple } from "@shared/components/game/Ripple";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { useElementSize } from "@shared/hooks/useElementSize";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound, playFanfare } from "@shared/audio/sfx";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";

/** One spoken line per stage, all from clips that already exist.
 *
 *  Build says "your turn" rather than "watch carefully": the pieces are
 *  draggable from the first frame, so there is nothing to watch. The teaching
 *  hand that appears later is a nudge for a child who has paused, not a
 *  demonstration the line should be announcing. */
const STAGE_CLIP: Record<string, string> = {
  build: "instr-your-turn",
  pop: "instr-your-turn",
  trace: "instr-your-turn",
};

/** Act one of the celebration — the letter, its cheer and the fizz — holds
 *  this long before it clears and the clam takes the centre. Long enough for
 *  the cheer to be heard and the shoal to arrive; short enough that the clam
 *  is part of the same moment. */
const CLAM_AFTER_MS = 1800;
/** The celebration moves on by itself after this — the clam has opened and
 *  the pearl has been seen. Tapping the clam goes sooner. */
const ADVANCE_MS = 5400;

/**
 * Who swims in to see the letter — the reef's regulars, from both sides.
 *
 * Positions are hand-placed down the two edges, clear of the centre column
 * where the letter and then the clam live. Built once at module load: the
 * drawings are static, and rebuilding them on every render of a screen that
 * is already animating would be work for nothing.
 */
const OCEAN_FRIENDS: readonly Swimmer[] = (
  [
    { key: "octopus", x: "12%", y: "30%", delay: 0.4, from: "left" },
    { key: "turtle", x: "88%", y: "34%", delay: 0.65, from: "right" },
    { key: "x-ray fish", x: "14%", y: "70%", delay: 0.9, from: "left" },
    { key: "jellyfish", x: "86%", y: "72%", delay: 1.1, from: "right" },
  ] as const
).flatMap(({ key, ...place }) => {
  const Art = ANIMAL_ART[key];
  return Art ? [{ ...place, node: <Art key={key} /> }] : [];
});

/**
 * Who passes THROUGH: a whale, slow and huge, high up in the distance, and a
 * shoal of little fish darting the other way behind the letter. Depth, and
 * something happening in every part of the screen for the whole celebration.
 */
const SHOAL_SIZE = "clamp(24px, 5.5vmin, 50px)";
const OCEAN_CROSSERS: readonly Crosser[] = (
  [
    {
      key: "whale",
      y: "16%",
      delay: 0.5,
      dur: 8,
      from: "left",
      faces: "left",
      size: "clamp(96px, 24vmin, 230px)",
    },
    { key: "x-ray fish", y: "50%", delay: 1.0, dur: 3.6, from: "right", size: SHOAL_SIZE },
    { key: "x-ray fish", y: "55%", delay: 1.15, dur: 3.5, from: "right", size: SHOAL_SIZE },
    { key: "x-ray fish", y: "47%", delay: 1.3, dur: 3.7, from: "right", size: SHOAL_SIZE },
    { key: "x-ray fish", y: "58%", delay: 1.45, dur: 3.4, from: "right", size: SHOAL_SIZE },
    { key: "x-ray fish", y: "52%", delay: 1.6, dur: 3.8, from: "right", size: SHOAL_SIZE },
  ] as const
).flatMap(({ key, ...path }) => {
  const Art = ANIMAL_ART[key];
  return Art ? [{ ...path, node: <Art /> }] : [];
});

/**
 * ONE LETTER, THREE STAGES — build it, pop it, write it.
 *
 * The three stages share this screen rather than being three destinations:
 * same ocean, same letter, same chrome, only the middle changes. That is
 * what makes it read as one activity, and it means Back leaves the letter
 * (what a child expects) instead of stepping back through beats they have
 * already finished.
 *
 * The letter's material — gold, ice, coral — is set once here as CSS custom
 * properties on the root, so every stage below paints in the same colours
 * without any of them knowing which letter is being played.
 */
export function OceanLevel() {
  const router = useRouter();
  const store = useOceanStore();
  const { currentLetter, letterCase, stage, nextStage, markDone, setScreen, advance } = store;
  const run = store.run;
  const runComplete = !run || run.index >= run.queue.length - 1;

  const shown = displayLetter(currentLetter, letterCase);
  const material = materialFor(currentLetter);
  /** This letter's praise — deterministic; word and voice from the same clip. */
  const cheerId = cheerFor(currentLetter);
  /** The module's own stage list — one stage when a single activity was
   *  picked, three on the full voyage. */
  const activeStages = stagesFor(store.module);
  const stageIndex = Math.max(0, activeStages.indexOf(stage));

  /** The letter waiting inside the clam — the next one in the run. Undefined
   *  on the last round, where there is nothing to open on to. */
  const nextLetter = run && !runComplete ? run.queue[run.index + 1] : undefined;
  const nextMaterial = nextLetter ? materialFor(nextLetter) : null;
  /** This letter, ready to rain down among the bubbles. */
  const letterFall = useLetterFall(shown, 6);

  const [celebrating, setCelebrating] = useState(false);
  /** The celebration's SECOND ACT: the letter and its cheer clear away and
   *  the giant clam takes the centre with the next letter inside. */
  const [clamOpen, setClamOpen] = useState(false);
  const advancedRef = useRef(false);
  const [rootRef, dims] = useElementSize();
  const dragRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => stopVoice(), []);

  // The letter's name on arrival, then the stage's own cue. One sequence, so
  // the two lines never talk over each other.
  useEffect(() => {
    const key = currentLetter.toLowerCase();
    preloadClips([`letter-${key}`, "instr-your-turn", cheerId]);
    const t = setTimeout(() => {
      void playSequence([`letter-${key}`, STAGE_CLIP[stage] ?? "instr-your-turn"], 280);
    }, 350);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLetter, letterCase, stage]);

  /** A stage finished: move to the next, or finish the letter. */
  const handleStageDone = useCallback(() => {
    if (nextStage()) return;
    markDone(currentLetter);
    setCelebrating(true);
    void playClip(cheerId).then(() => playFanfare());
  }, [nextStage, markDone, currentLetter, cheerId]);

  const goNext = useCallback(() => {
    if (advancedRef.current) return; // tap + timer must not both advance
    advancedRef.current = true;
    stopVoice();
    setCelebrating(false);
    setClamOpen(false);
    if (!advance()) setScreen("complete");
  }, [advance, setScreen]);

  /** Act one holds for CLAM_AFTER_MS, then the clam takes over; the whole
   *  celebration moves on by itself at ADVANCE_MS. Timers rather than
   *  animation callbacks, so the beats land at the same moments whatever the
   *  child's device manages to render. */
  useEffect(() => {
    if (!celebrating) return;
    // A NEW celebration re-arms the guard. Without this the ref stayed true
    // after the first advance and every later celebration hung on screen.
    advancedRef.current = false;
    const clam = setTimeout(() => setClamOpen(true), CLAM_AFTER_MS);
    const next = setTimeout(goNext, ADVANCE_MS);
    return () => {
      clearTimeout(clam);
      clearTimeout(next);
    };
  }, [celebrating, goNext]);

  return (
    <div
      ref={rootRef}
      className="oab-screen relative flex h-full w-full flex-col overflow-hidden"
      style={cssVars({
        "--pl-from": material.from,
        "--pl-to": material.to,
        "--pl-rim": material.rim,
        "--pl-cut": material.cut,
        "--pl-glow": material.glow,
      })}
    >
      <OceanWorld />

      {/* chrome: back · the letter · which stage */}
      <div className="oab-topbar relative z-20 flex w-full shrink-0 items-center justify-between gap-2 px-4 py-3">
        <NavPillButton
          label="Letters"
          ariaLabel="Back to the letter map"
          tone="ocean"
          surface="strong"
          onClick={() => {
            playClickSound();
            stopVoice();
            router.back();
          }}
        />
        <div className="oab-pill flex items-center gap-2 rounded-full px-4 py-2">
          <span className="font-rounded text-ocean text-2xl font-black">{shown}</span>
        </div>
        {/* A star per finished STAGE — so it only says anything on the full
            voyage, where a letter has three of them. Playing one module on its
            own it was a single star that stayed empty until the round ended,
            taking up the corner and competing with the round's own counter for
            the child's attention. Shown only when there is a sequence to
            track. The LAST star actually fills: while celebrating, the whole
            row is earned (it used to advance to the next letter before the
            final star ever showed). */}
        {activeStages.length > 1 ? (
          <div className="oab-pill flex items-center rounded-full px-3 py-2" role="status">
            <StarRow
              earned={celebrating ? activeStages.length : stageIndex}
              total={activeStages.length}
              size={18}
            />
          </div>
        ) : (
          // keeps the letter pill centred between Back and this corner
          <div className="min-h-[44px] w-[84px]" aria-hidden="true" />
        )}
      </div>

      {/* the stage itself — one letter, three beats, one scene */}
      <div ref={dragRootRef} className="oab-arena relative z-10">
        <AnimatePresence mode="wait">
          {stage === "build" && (
            <motion.div
              key={`build-${currentLetter}-${letterCase}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <BuildStage shown={shown} rootRef={dragRootRef} onComplete={handleStageDone} />
            </motion.div>
          )}
          {stage === "pop" && (
            <motion.div
              key={`pop-${currentLetter}-${letterCase}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              {/* Unlimited is only offered for the standalone Pop module. In
                  the full voyage a Trace stage waits after this one, so an
                  endless middle beat would strand the child before it. */}
              <PopStage
                shown={shown}
                letter={currentLetter}
                mode={store.module === "pop" ? store.popMode : "five"}
                onComplete={handleStageDone}
              />
            </motion.div>
          )}
          {stage === "trace" && (
            <motion.div
              key={`trace-${currentLetter}-${letterCase}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <TraceStage
                letter={currentLetter}
                letterCase={letterCase}
                onComplete={handleStageDone}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the letter is finished */}
      <AnimatePresence>
        {celebrating && (
          <CelebrationOverlay
            tintClassName="oab-win-tint"
            gapClassName="gap-4"
            blur="3px"
            size={dims}
            sparkles={false}
          >
            {/* THE WATER'S OWN CELEBRATION. Light through the surface, the
                whole sea fizzing with bubbles that swell and POP, a column of
                bubbles carrying the letter up, and the reef's regulars
                swimming in from both sides. The generic sparkles and the
                confetti this used to throw are gone — confetti does not fall
                underwater, and bubbles are the sparkle here. */}
            <GodRays />
            <BubblePops count={56} />
            {/* a second fizz, timed to the pearl */}
            {clamOpen && <BubblePops count={36} delay={1.1} />}
            <CelebrationMotif motif="bubble" count={30} extras={letterFall} extraEvery={4} />
            <SwimIn swimmers={OCEAN_FRIENDS} />
            <SwimAcross crossers={OCEAN_CROSSERS} />

            {/* ACT ONE — the letter and its cheer. Holds for CLAM_AFTER_MS,
                then the whole act clears away together so the clam can take
                the centre of the screen. */}
            <AnimatePresence>
              {!clamOpen && (
                <motion.div
                  key="act-one"
                  className="oab-win-act"
                  exit={{ opacity: 0, scale: 0.6, y: -40 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* the splash where the letter lands */}
                  <Ripple delay={0.3} count={2} />
                  <motion.span
                    className="oab-win-letter font-rounded relative z-10 font-black"
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: [0, -12, 0] }}
                    transition={{
                      scale: { type: "spring", stiffness: 220, damping: 16 },
                      y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
                    }}
                  >
                    {shown}
                  </motion.span>
                  <h2 className="oab-win-heading font-rounded font-black">{clipText(cheerId)}</h2>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACT TWO — THE GIANT CLAM.
                Once act one has cleared, a clam takes the centre of the
                screen, its lid swings up and a pearl rises out wearing the
                NEXT letter in that letter's own material — so the child sees
                what is coming, and tapping the clam is how they get there.
                The whole clam is the Next button. On the last letter there is
                nothing to open on to, so a plain Finish takes its place. */}
            {clamOpen && nextLetter && nextMaterial ? (
              <motion.div
                key="act-two"
                className="oab-win-actions relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  onClick={goNext}
                  className="oab-clam"
                  style={cssVars({
                    "--pl-from": nextMaterial.from,
                    "--pl-to": nextMaterial.to,
                    "--pl-rim": nextMaterial.rim,
                    "--pl-glow": nextMaterial.glow,
                  })}
                  aria-label={`Open the clam and go to the letter ${displayLetter(nextLetter, letterCase)}`}
                  initial={{ scale: 0.3, opacity: 0, y: 30, rotate: 0 }}
                  // pops in, then rocks on the sand as the lid heaves open
                  animate={{ scale: 1, opacity: 1, y: 0, rotate: [0, 0, -5, 5, -3, 0] }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 190,
                    damping: 17,
                    rotate: { delay: 0.9, duration: 0.7, ease: "easeInOut" },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* the pearl — hidden between the shells until the lid
                      lifts, then it rises to sit in the open shell, rings of
                      its own light spreading as it appears */}
                  <motion.span
                    className="oab-pearl"
                    initial={{ y: 0, scale: 0.7 }}
                    animate={{ y: "-44%", scale: 1 }}
                    transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Ripple delay={1.35} count={3} gap={0.14} />
                    <span className="oab-pearl-glyph font-rounded font-black">
                      {displayLetter(nextLetter, letterCase)}
                    </span>
                  </motion.span>
                  <span className="oab-clam-shell oab-clam-shell--bottom" aria-hidden="true" />
                  {/* the lid swings up on its hinge, with a little overshoot */}
                  <motion.span
                    className="oab-clam-shell oab-clam-shell--lid"
                    aria-hidden="true"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -108, -100] }}
                    transition={{
                      delay: 0.75,
                      duration: 1.0,
                      ease: [0.22, 1, 0.36, 1],
                      times: [0, 0.7, 1],
                    }}
                  />
                  <span className="oab-clam-label font-rounded font-black">Next</span>
                </motion.button>
              </motion.div>
            ) : clamOpen ? (
              <div className="oab-win-actions relative z-10">
                <button
                  onClick={goNext}
                  className="oab-next font-rounded min-h-[52px] rounded-full px-7 text-base font-black text-white shadow-lg"
                  aria-label="Finish and see every letter"
                >
                  Finish!
                </button>
              </div>
            ) : null}
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
