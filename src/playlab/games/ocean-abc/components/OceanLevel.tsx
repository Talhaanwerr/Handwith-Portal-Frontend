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
import { useElementSize } from "@shared/hooks/useElementSize";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound, playFanfare } from "@shared/audio/sfx";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Confetti } from "@shared/components/game/Confetti";

/** One spoken line per stage, all from clips that already exist. */
const STAGE_CLIP: Record<string, string> = {
  build: "instr-watch-carefully",
  pop: "instr-your-turn",
  trace: "instr-your-turn",
};

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

  const [celebrating, setCelebrating] = useState(false);
  const advancedRef = useRef(false);
  const [rootRef, dims] = useElementSize();
  const dragRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => stopVoice(), []);

  // The letter's name on arrival, then the stage's own cue. One sequence, so
  // the two lines never talk over each other.
  useEffect(() => {
    const key = currentLetter.toLowerCase();
    preloadClips([`letter-${key}`, "instr-watch-carefully", "instr-your-turn", cheerId]);
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
    if (!advance()) setScreen("complete");
  }, [advance, setScreen]);

  /** The celebration holds for a fixed beat, then moves on by itself —
   *  1.5s max, per the portal's celebration pacing. */
  useEffect(() => {
    if (!celebrating) return;
    // A NEW celebration re-arms the guard. Without this the ref stayed true
    // after the first advance and every later celebration hung on screen.
    advancedRef.current = false;
    const t = setTimeout(goNext, 1500);
    return () => clearTimeout(t);
  }, [celebrating, goNext]);

  return (
    <div
      ref={rootRef}
      className="oab-screen relative h-full w-full overflow-hidden"
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
      <div className="oab-topbar relative z-20 flex w-full items-center justify-between gap-2 px-4 py-3">
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
        <div className="oab-pill flex items-center rounded-full px-3 py-2" role="status">
          {/* a star per finished stage — and the LAST star actually fills:
              while celebrating, the whole row is earned (it used to advance
              to the next letter before the final star ever showed) */}
          <StarRow
            earned={celebrating ? activeStages.length : stageIndex}
            total={activeStages.length}
            size={18}
          />
        </div>
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
              <PopStage shown={shown} letter={currentLetter} onComplete={handleStageDone} />
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
          >
            <Confetti count={44} />
            <motion.span
              className="oab-win-letter font-rounded font-black"
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
            <button
              onClick={goNext}
              className="oab-next font-rounded min-h-[52px] rounded-full px-7 text-base font-black text-white shadow-lg"
              aria-label="Go to the next letter"
            >
              {runComplete ? "Finish!" : "Next letter"}
            </button>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
