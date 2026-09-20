"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  useOceanStore,
  doneFor,
  displayLetter,
  OCEAN_ALPHA,
  type LetterCase,
  type OceanModule,
} from "@games/ocean-abc/store/oceanStore";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import type { PopMode } from "@games/ocean-abc/constants/pop";
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
    setScreen("modules");
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

/**
 * 5 Times / Unlimited — how a standalone Bubble Pop round ends.
 *
 * Only the Pop module asks. The full voyage keeps the five-pop round, because
 * a letter there has a Trace stage waiting after it and an endless middle
 * beat would strand the child before it.
 */
const POP_MODE_OPTIONS: readonly Choice<PopMode>[] = [
  {
    value: "five",
    preview: "5",
    label: "5 Times",
    aria: "Pop five correct bubbles to finish",
    variant: "five",
  },
  {
    value: "unlimited",
    preview: "∞",
    label: "Unlimited",
    aria: "Keep popping until you are ready to move on",
    variant: "unlimited",
  },
];

export function OceanPopModeSelect() {
  const { setPopMode, setScreen } = useOceanStore();

  return (
    <div className="oab-screen relative h-full w-full">
      <ChoiceScreen<PopMode>
        title="Bubble Pop"
        subtitle="5 Times pops five correct bubbles · Unlimited keeps going"
        backdrop={<OceanWorld />}
        tone="ocean"
        backAriaLabel="Back to the letter size choice"
        onBack={() => setScreen("mode")}
        onPick={(m) => {
          setPopMode(m);
          setScreen("grid");
        }}
        options={POP_MODE_OPTIONS}
      />
    </div>
  );
}

/** BIG LETTERS / small letters — the only choice in the game. */
export function OceanModeSelect() {
  const router = useRouter();
  const { module, setCase, setScreen } = useOceanStore();

  const pick = (c: LetterCase) => {
    playClickSound();
    setCase(c);
    // Bubble Pop on its own has a second question — how the round ends. Every
    // other module goes straight to the letter map.
    setScreen(module === "pop" ? "popMode" : "grid");
  };

  const options: { c: LetterCase; title: string; preview: string; aria: string }[] = [
    { c: "upper", title: "BIG LETTERS", preview: "ABC", aria: "Play with big letters" },
    { c: "lower", title: "small letters", preview: "abc", aria: "Play with small letters" },
  ];

  return (
    // Shell / scroller split: the water and the Back pill sit OUTSIDE the
    // scrolling element. Inside it they scrolled with the content — the water
    // painting only one screenful (white below it) and `pinned`, which is
    // position:absolute, drifting off the top instead of staying pinned.
    <div className="oab-screen pl-screen-shell">
      <OceanWorld />

      <NavPillButton
        label="Back"
        ariaLabel="Back to activity choice"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          router.back();
        }}
      />

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-7 px-6 py-8">
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
    </div>
  );
}

/**
 * MODULE SELECT — after picking BIG/small, the child picks HOW to play:
 * the full voyage (all three beats per letter) or one activity on its own.
 * Four treasure-chest-sized cards in the same water: the combined card
 * leads (biggest, first, starred) and each single module shows the icon of
 * its own activity — the picture is the promise of what the button does.
 */
export function OceanModules({ onExitPortal = () => {} }: { onExitPortal?: () => void }) {
  const { module, setModule, setScreen } = useOceanStore();

  const pick = (m: OceanModule) => {
    playClickSound();
    setModule(m);
    setScreen("mode");
  };

  const options: { m: OceanModule; icon: string; title: string; sub: string; aria: string }[] = [
    {
      m: "combined",
      icon: "🌊",
      title: "Full Voyage",
      sub: "Build · Pop · Trace",
      aria: "Play all three activities for every letter",
    },
    {
      m: "build",
      icon: "🧩",
      title: "Build",
      sub: "Piece letters together",
      aria: "Play only the letter building activity",
    },
    {
      m: "pop",
      icon: "🫧",
      title: "Pop",
      sub: "Pop letter bubbles",
      aria: "Play only the bubble popping activity",
    },
    {
      m: "trace",
      icon: "✏️",
      title: "Trace",
      sub: "Write the letters",
      aria: "Play only the letter tracing activity",
    },
  ];

  return (
    <div className="oab-screen pl-screen-shell">
      <OceanWorld />

      <NavPillButton
        label="Back"
        ariaLabel="Back to all games"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-6 px-6 py-8">
        <motion.h1
          className="oab-heading font-rounded relative z-10 text-center font-black"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          How do you want to play?
        </motion.h1>
        <p className="oab-tagline font-rounded relative z-10 text-center font-bold">
          Build, pop and trace the alphabet under the sea
        </p>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-5">
          {options.map((o, i) => (
            <motion.button
              key={o.m}
              onClick={() => pick(o.m)}
              className={`oab-module-btn flex flex-col items-center justify-center gap-1 ${
                o.m === "combined" ? "oab-module-btn--hero" : ""
              } ${module === o.m ? "oab-module-btn--current" : ""}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 260, damping: 20 }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              aria-label={o.aria}
            >
              <span className="oab-module-icon" aria-hidden="true">
                {o.icon}
              </span>
              <span className="oab-module-title font-rounded font-black">{o.title}</span>
              <span className="oab-module-sub font-rounded font-bold">{o.sub}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Letter selection — A–Z (or a–z) as bubbles, plus Start from A / Continue. */
export function OceanGrid() {
  const router = useRouter();
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
    <div className="oab-screen pl-screen-shell">
      <OceanWorld />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the letter size choice"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          router.back();
        }}
      />

      {/* `mt-auto` on the heading and `mb-auto` on the start row used to centre
          this column. Once 26 bubbles plus chrome outgrew the box, that pair
          centred the OVERFLOW too and pushed the heading — and the pinned Back
          pill above it — past the top of the scrollable area. `pl-safe-center`
          centres only while it fits. */}
      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-4 px-5 py-6 pt-16">
        <div className="relative z-10 flex flex-col items-center">
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
                : `Continue · ${displayLetter(nextUndone, letterCase)}`
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
