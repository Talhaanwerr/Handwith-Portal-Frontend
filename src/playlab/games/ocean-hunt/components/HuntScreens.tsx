"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import {
  useHuntStore,
  doneFor,
  displayLetter,
  type LetterCase,
} from "@games/ocean-hunt/store/huntStore";
import { ALPHA } from "@games/ocean-hunt/constants/sequence";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { CaseSelectScreen } from "@shared/components/game/CaseSelectScreen";
import { useScheduler } from "@shared/hooks/useScheduler";
import { continueLetter } from "@shared/utils/progression";
import { playClickSound } from "@shared/audio/sfx";
import { OceanBackdrop, BubbleStream } from "@games/feed-the-shark/components/OceanBackdrop";
import { FriendlyShark } from "@games/feed-the-shark/components/SharkArt";

/**
 * The world every Ocean Hunt screen sits in — the same seabed, rays and
 * rising bubbles as Feed the Shark and Ocean ABC, imported rather than
 * redrawn: the ocean games are one ocean, drawn once in the repo.
 */
export function HuntWorld() {
  return (
    <>
      <div className="oh-water pointer-events-none absolute inset-0" aria-hidden="true" />
      <OceanBackdrop />
      <BubbleStream />
    </>
  );
}

const SPLASH_MS = 2000;

/** Splash: title, then it moves on by itself. Tapping anywhere skips ahead. */
export function HuntSplash({ onExitPortal }: { onExitPortal?: () => void }) {
  const setScreen = useHuntStore((s) => s.setScreen);
  const schedule = useScheduler();
  const movedRef = useRef(false);

  const go = useCallback(() => {
    if (movedRef.current) return;
    movedRef.current = true;
    setScreen("case");
  }, [setScreen]);

  useEffect(() => {
    schedule(go, SPLASH_MS);
  }, [schedule, go]);

  return (
    <div
      className="oh-screen relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-8"
      onPointerDown={go}
    >
      <HuntWorld />

      {onExitPortal && (
        <NavPillButton
          label="Back to Games"
          ariaLabel="Back to the game portal"
          tone="ocean"
          surface="strong"
          pinned
          onClick={() => {
            playClickSound();
            onExitPortal();
          }}
        />
      )}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-3 text-center"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="oh-title font-rounded font-black">Ocean Hunt</h1>
        <p className="font-rounded text-lg font-semibold text-white/85 drop-shadow-md">
          Find the missing letter
        </p>
      </motion.div>

      <motion.div
        className="oh-splash-shark relative z-10"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        aria-hidden="true"
      >
        <FriendlyShark />
      </motion.div>
    </div>
  );
}

/** BIG/small — the SHARED picker, painted for this game by .oh-screen rules. */
export function HuntCaseSelect({ onExitPortal = () => {} }: { onExitPortal?: () => void }) {
  const { setCase, setScreen } = useHuntStore();

  return (
    <div className="oh-screen relative h-full w-full">
      <CaseSelectScreen
        title="Which letters?"
        subtitle="Find the missing letter in the row"
        backdrop={<HuntWorld />}
        tone="ocean"
        backAriaLabel="Back to Ocean Hunt home"
        onBack={onExitPortal}
        onPick={(c: LetterCase) => {
          setCase(c);
          setScreen("start");
        }}
      />
    </div>
  );
}

/** The doorway: Start from A always; Continue only when this case has saved
 *  progress mid-alphabet — the contract every game's start now follows. */
export function HuntStart() {
  const store = useHuntStore();
  const { letterCase, setScreen, beginRun } = store;
  const done = doneFor(store, letterCase);

  const nextUndone = continueLetter(ALPHA, done);
  const runComplete = done.length >= ALPHA.length;
  const hasProgress = done.length > 0 && !runComplete;

  return (
    // World + pinned pill outside the scroller; content column inside it.
    <div className="oh-screen pl-screen-shell">
      <HuntWorld />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the letter size choice"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          setScreen("case");
        }}
      />

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-6 px-6 py-8 pt-16">
        <motion.div
          className="relative z-10 flex flex-col items-center gap-1 text-center"
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="oh-heading font-rounded font-black">Ocean Hunt</h1>
          <p className="font-rounded text-sm font-semibold text-white/80 drop-shadow-md">
            {letterCase === "lower"
              ? "Which small letter is hiding?"
              : "Which big letter is hiding?"}
          </p>
        </motion.div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-1 flex justify-between">
            <span className="font-rounded text-sm font-bold text-white/85 drop-shadow-md">
              Letters found
            </span>
            <span className="font-rounded text-sm font-black text-white drop-shadow-md">
              {done.length} / 26
            </span>
          </div>
          <ProgressBar
            value={done.length / 26}
            trackClassName="h-4 w-full rounded-full bg-white/25"
            fillClassName="oh-progress-fill h-full rounded-full"
            ariaLabel={`${done.length} of 26 letters found`}
          />
        </div>

        <motion.div
          className="relative z-10"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StartOptions
            hasProgress={hasProgress || runComplete}
            onContinue={
              runComplete
                ? () => {
                    playClickSound();
                    setScreen("complete");
                  }
                : () => {
                    playClickSound();
                    beginRun(0, "continue");
                    setScreen("level");
                  }
            }
            continueLabel={
              runComplete
                ? "See my alphabet!"
                : `Continue · ${displayLetter(nextUndone, letterCase)}`
            }
            onStartFromA={() => {
              playClickSound();
              beginRun(0, "fresh");
              setScreen("level");
            }}
            startLabel={letterCase === "lower" ? "Start from a" : "Start from A"}
          />
        </motion.div>
      </div>
    </div>
  );
}
