"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import {
  useSpaceStore,
  builtFor,
  displayLetter,
  SPACE_ALPHA,
  type LetterCase,
} from "@games/space-letters/store/spaceStore";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { continueLetter } from "@shared/utils/progression";
import { playClip } from "@shared/audio/voice";
import { playClickSound } from "@shared/audio/sfx";
import { useScheduler } from "@shared/hooks/useScheduler";
import { SpaceScene } from "@games/space-letters/components/SpaceScene";

/**
 * The backdrop every screen sits on, in three layers:
 *
 *   1. a plain gradient wash — no network request, so there is never a
 *      flash of white on first paint,
 *   2. the illustrated space scene (SpaceScene) — static, composed into the
 *      corners, the default world,
 *   3. `space.jpg`, IF that file exists in public/games/space-letters/. It
 *      is an opaque cover layer, so dropping a photo in simply takes over
 *      and the illustration becomes its fallback — the same photo-first
 *      pattern the animal and object art already use. Nothing breaks when
 *      the file is absent.
 *
 * A soft top/bottom vignette sits over whichever of those is showing, so the
 * pinned nav pill and the letter tiles stay legible either way.
 */
export function SpaceBackdrop() {
  return (
    <div
      className="spl-bg-wash pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* one drawing, two shapes — CSS shows the one that fits the screen */}
      <SpaceScene />
      <SpaceScene tall />
      <div className="spl-bg absolute inset-0" />
      <div className="spl-vignette absolute inset-0" />
    </div>
  );
}

/** How long the splash holds before moving on by itself. */
const SPLASH_MS = 2000;

/**
 * Splash: title, then it moves on by itself. Tapping anywhere skips ahead.
 *
 * NOTE: because nothing here requires a tap any more, the AudioContext may
 * still be locked when the mode screen mounts — browsers only unlock it on
 * a real gesture. Music therefore starts at the child's first tap (choosing
 * BIG/small) instead of on arrival. Narration is unaffected.
 */
export function SpaceSplash({ onExitPortal }: { onExitPortal?: () => void }) {
  const setScreen = useSpaceStore((s) => s.setScreen);
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
      className="spl-screen relative flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden px-6 py-8"
      onPointerDown={go}
    >
      <SpaceBackdrop />

      {onExitPortal && (
        <NavPillButton
          label="Back to Games"
          ariaLabel="Back to the game portal"
          tone="space"
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
        <h1 className="spl-title font-rounded font-black text-white drop-shadow-lg">Space ABC</h1>
        <p className="font-rounded text-lg font-semibold text-white/85 drop-shadow-md">
          Build letters among the stars
        </p>
      </motion.div>
    </div>
  );
}

/**
 * BIG LETTERS / SMALL LETTERS — the only choice in the game.
 *
 * Two large tactile plates, each previewing the alphabet it opens. Same
 * shape as jungle-spy's ABC/abc picker, which is the repo's existing
 * case-choice pattern; no settings screen, no extra modes.
 */
export function SpaceModeSelect({ onExitPortal = () => {} }: { onExitPortal?: () => void }) {
  const { setCase, setScreen } = useSpaceStore();

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
    // Backdrop and pinned pill live on the non-scrolling shell; only the
    // content column scrolls. Previously all three shared one scroller, so the
    // starfield covered a single screenful (white beneath it) and Back scrolled
    // out of sight.
    <div className="spl-screen pl-screen-shell">
      <SpaceBackdrop />

      <NavPillButton
        label="Back"
        ariaLabel="Back to all games"
        tone="space"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-7 px-6 py-8">
        <motion.h1
          className="spl-heading font-rounded relative z-10 text-center font-black text-white drop-shadow-lg"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Which letters?
        </motion.h1>
        <p className="font-rounded relative z-10 text-center text-sm font-bold text-white/85 md:text-base">
          Build each letter from its puzzle pieces
        </p>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-6">
          {options.map((o, i) => (
            <motion.button
              key={o.c}
              onClick={() => pick(o.c)}
              className={`sap-mode-btn sap-mode-btn--${o.c} flex flex-col items-center justify-center gap-2`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              aria-label={o.aria}
            >
              <span className="sap-mode-preview font-rounded font-black">{o.preview}</span>
              <span className="sap-mode-title font-rounded font-black">{o.title}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Letter selection: A–Z (or a–z) + the shared Start from A / Continue. */
export function SpaceGrid() {
  const store = useSpaceStore();
  const { letterCase, setScreen, beginRun, jumpTo } = store;
  const built = builtFor(store, letterCase);

  useEffect(() => {
    const t = setTimeout(() => void playClip("instr-choose-a-letter"), 450);
    return () => clearTimeout(t);
  }, []);

  const openLetter = (l: string) => {
    playClickSound();
    jumpTo(l);
    setScreen("level");
  };

  const nextUnbuilt = continueLetter(SPACE_ALPHA, built);
  const runComplete = built.length >= SPACE_ALPHA.length;
  const hasProgress = built.length > 0 && !runComplete;

  return (
    <div className="spl-screen pl-screen-shell">
      <SpaceBackdrop />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the letter size choice"
        tone="space"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          setScreen("mode");
        }}
      />

      {/* pt-16 keeps the heading clear of the pinned Back pill now that the
          pill is a sibling of the scroller rather than a child of it. */}
      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-4 px-5 py-6 pt-16">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="spl-heading font-rounded text-center font-black text-white drop-shadow-lg">
            Space ABC
          </h1>
          <p className="font-rounded text-sm font-semibold text-white/80 drop-shadow-md">
            {letterCase === "lower" ? "Pick a small letter to build" : "Pick a big letter to build"}
          </p>
        </div>

        <div className="relative z-10 w-full max-w-md md:max-w-2xl">
          <div className="mb-1 flex justify-between">
            <span className="font-rounded text-sm font-bold text-white/85 drop-shadow-md">
              Letters built
            </span>
            <span className="font-rounded text-sm font-black text-white drop-shadow-md">
              {built.length} / 26
            </span>
          </div>
          <ProgressBar
            value={built.length / 26}
            trackClassName="h-4 w-full rounded-full bg-white/25"
            fillClassName="spl-progress-fill h-full rounded-full"
            ariaLabel={`${built.length} of 26 letters built`}
          />
        </div>

        <div className="spl-letter-grid relative z-10 w-full max-w-md gap-2.5 md:max-w-2xl">
          {SPACE_ALPHA.map((l, i) => {
            const isBuilt = built.includes(l);
            const shown = displayLetter(l, letterCase);
            return (
              <motion.button
                key={l}
                onClick={() => openLetter(l)}
                className={`spl-letter-tile relative flex aspect-square items-center justify-center rounded-2xl ${
                  isBuilt ? "spl-letter-tile--found" : ""
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.015 * i, type: "spring", stiffness: 300, damping: 20 }}
                whileTap={{ scale: 0.92 }}
                aria-label={`Letter ${shown}${isBuilt ? " (built)" : ""}`}
              >
                <span className="spl-tile-glyph font-rounded font-black">{shown}</span>
                {isBuilt && (
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

        <div className="relative z-10">
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
                : `Continue · ${displayLetter(nextUnbuilt, letterCase)}`
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
    </div>
  );
}
