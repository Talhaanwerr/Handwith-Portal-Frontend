"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import {
  useOceanStore,
  doneFor,
  displayLetter,
  OCEAN_ALPHA,
  type LetterCase,
} from "@games/ocean-abc/store/oceanStore";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { useScheduler } from "@shared/hooks/useScheduler";
import { continueLetter } from "@shared/utils/progression";
import { playClip } from "@shared/audio/voice";
import { playClickSound } from "@shared/audio/sfx";
import { OceanBackdrop, BubbleStream } from "@games/feed-the-shark/components/OceanBackdrop";
import { FriendlyShark } from "@games/feed-the-shark/components/SharkArt";

/**
 * The world every Ocean ABC screen sits in — the SAME seabed, light rays and
 * rising bubbles as Feed the Shark, imported rather than redrawn. The two
 * games are meant to feel like the same ocean, and there is exactly one
 * drawing of it in the repo.
 */
export function OceanWorld() {
  return (
    <>
      <div className="oab-water pointer-events-none absolute inset-0" aria-hidden="true" />
      <OceanBackdrop />
      <BubbleStream />
    </>
  );
}

const SPLASH_MS = 2000;

/** Splash: title, then it moves on by itself. Tapping anywhere skips ahead. */
export function OceanSplash({ onExitPortal }: { onExitPortal?: () => void }) {
  const setScreen = useOceanStore((s) => s.setScreen);
  const schedule = useScheduler();
  const movedRef = useRef(false);

  const go = useCallback(() => {
    if (movedRef.current) return;
    movedRef.current = true;
    setScreen("mode");
  }, [setScreen]);

  useEffect(() => {
    schedule(go, SPLASH_MS);
  }, [schedule, go]);

  return (
    <div
      className="oab-screen relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-8"
      onPointerDown={go}
    >
      <OceanWorld />

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
        <h1 className="oab-title font-rounded font-black">Ocean ABC</h1>
        <p className="font-rounded text-lg font-semibold text-white/85 drop-shadow-md">
          Build, pop and write every letter
        </p>
      </motion.div>

      <motion.div
        className="oab-splash-shark relative z-10"
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

/** BIG LETTERS / small letters — the only choice in the game. */
export function OceanModeSelect() {
  const { setCase, setScreen } = useOceanStore();

  const pick = (c: LetterCase) => {
    playClickSound();
    setCase(c);
    setScreen("grid");
  };

  const options: { c: LetterCase; title: string; preview: string; aria: string }[] = [
    { c: "upper", title: "BIG LETTERS", preview: "ABC", aria: "Play with big letters" },
    { c: "lower", title: "small letters", preview: "abc", aria: "Play with small letters" },
  ];

  return (
    <div className="oab-screen relative flex h-full w-full flex-col items-center justify-center gap-7 overflow-y-auto px-6 py-8">
      <OceanWorld />

      <NavPillButton
        label="Back"
        ariaLabel="Back to Ocean ABC home"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          setScreen("splash");
        }}
      />

      <motion.h1
        className="oab-heading font-rounded relative z-10 text-center font-black"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Which letters?
      </motion.h1>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6">
        {options.map((o, i) => (
          <motion.button
            key={o.c}
            onClick={() => pick(o.c)}
            className={`oab-mode-btn oab-mode-btn--${o.c} flex flex-col items-center justify-center gap-2`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
            aria-label={o.aria}
          >
            <span className="oab-mode-preview font-rounded font-black">{o.preview}</span>
            <span className="oab-mode-title font-rounded font-black">{o.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/** Letter selection — A–Z (or a–z) as bubbles, plus Start from A / Continue. */
export function OceanGrid() {
  const store = useOceanStore();
  const { letterCase, setScreen, beginRun, jumpTo } = store;
  const done = doneFor(store, letterCase);

  useEffect(() => {
    const t = setTimeout(() => void playClip("instr-choose-a-letter"), 450);
    return () => clearTimeout(t);
  }, []);

  const openLetter = (l: string) => {
    playClickSound();
    jumpTo(l);
    setScreen("level");
  };

  const nextUndone = continueLetter(OCEAN_ALPHA, done);
  const runComplete = done.length >= OCEAN_ALPHA.length;
  const hasProgress = done.length > 0 && !runComplete;

  return (
    <div className="oab-screen relative flex h-full w-full flex-col items-center gap-4 overflow-x-hidden overflow-y-auto px-5 py-6">
      <OceanWorld />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the letter size choice"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          setScreen("mode");
        }}
      />

      <div className="relative z-10 mt-auto flex flex-col items-center">
        <h1 className="oab-heading font-rounded text-center font-black">Ocean ABC</h1>
        <p className="font-rounded text-sm font-semibold text-white/80 drop-shadow-md">
          {letterCase === "lower" ? "Pick a small letter" : "Pick a big letter"}
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md md:max-w-2xl">
        <div className="mb-1 flex justify-between">
          <span className="font-rounded text-sm font-bold text-white/85 drop-shadow-md">
            Letters finished
          </span>
          <span className="font-rounded text-sm font-black text-white drop-shadow-md">
            {done.length} / 26
          </span>
        </div>
        <ProgressBar
          value={done.length / 26}
          trackClassName="h-4 w-full rounded-full bg-white/25"
          fillClassName="oab-progress-fill h-full rounded-full"
          ariaLabel={`${done.length} of 26 letters finished`}
        />
      </div>

      {/* the alphabet, each letter inside its own bubble */}
      <div className="oab-letter-grid relative z-10 w-full max-w-md gap-2.5 md:max-w-2xl">
        {OCEAN_ALPHA.map((l, i) => {
          const isDone = done.includes(l);
          const shown = displayLetter(l, letterCase);
          return (
            <motion.button
              key={l}
              onClick={() => openLetter(l)}
              className={`oab-bubble-tile relative flex aspect-square items-center justify-center ${
                isDone ? "oab-bubble-tile--done" : ""
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.015 * i, type: "spring", stiffness: 300, damping: 20 }}
              whileTap={{ scale: 0.92 }}
              aria-label={`Letter ${shown}${isDone ? " (finished)" : ""}`}
            >
              <span className="oab-tile-glyph font-rounded font-black">{shown}</span>
              {isDone && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] shadow-sm"
                  aria-hidden="true"
                >
                  ⭐
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="relative z-10 mb-auto">
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
            runComplete ? "See my alphabet!" : `Continue · ${displayLetter(nextUndone, letterCase)}`
          }
          onStartFromA={() => {
            playClickSound();
            beginRun(0, "fresh");
            setScreen("level");
          }}
          startLabel={letterCase === "lower" ? "Start from a" : "Start from A"}
        />
      </div>
    </div>
  );
}
