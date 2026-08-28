"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import {
  useMatchStore,
  doneFor,
  displayLetter,
  type LetterCase,
} from "@games/pirate-match/store/matchStore";
import { ALPHA } from "@games/pirate-match/constants/rounds";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { CaseSelectScreen } from "@shared/components/game/CaseSelectScreen";
import { useScheduler } from "@shared/hooks/useScheduler";
import { continueLetter } from "@shared/utils/progression";
import { playClickSound } from "@shared/audio/sfx";
import { PirateOcean, IslandMound, PalmTree } from "@shared/components/pirate/PirateOcean";
import { PirateShip } from "@shared/components/pirate/PirateShip";
import { PirateParrot } from "@shared/components/pirate/PirateMapAndParrot";

/**
 * The world every Pirate Match screen sits in — COMPOSED from the shared
 * Pirate Theme, drawn in this game zero times: the layered ocean, a sandy
 * island with its palm on the right, sky above. Exactly the consumption the
 * theme was built for.
 */
export function PirateWorld({ ship = true }: { ship?: boolean }) {
  return (
    <div className="pm-world pointer-events-none absolute inset-0" aria-hidden="true">
      <PirateOcean />
      {/* the ship rides low in the left corner of every screen — the splash
          opts out because its own hero ship takes centre stage */}
      {ship && (
        <div className="pm-world-ship">
          <PirateShip />
        </div>
      )}
      <div className="pm-world-island">
        <IslandMound />
        <div className="pm-world-palm">
          <PalmTree />
        </div>
      </div>
    </div>
  );
}

const SPLASH_MS = 2000;

/** Splash: the ship rides at anchor, then the game moves on by itself.
 *  Tapping anywhere skips ahead. */
export function MatchSplash({ onExitPortal }: { onExitPortal?: () => void }) {
  const setScreen = useMatchStore((s) => s.setScreen);
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
      className="pm-screen pp-world relative flex h-full w-full flex-col items-center overflow-hidden px-6 py-8"
      onPointerDown={go}
    >
      <PirateWorld ship={false} />

      {onExitPortal && (
        <NavPillButton
          label="Back to Games"
          ariaLabel="Back to the game portal"
          tone="pirate"
          surface="strong"
          pinned
          onClick={() => {
            playClickSound();
            onExitPortal();
          }}
        />
      )}

      <motion.div
        className="relative z-10 mt-6 flex flex-col items-center gap-2 text-center"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="pm-title font-rounded font-black">Pirate Match</h1>
        <p className="font-rounded text-lg font-semibold text-white/90 drop-shadow-md">
          Match letters to their treasures
        </p>
      </motion.div>

      <motion.div
        className="pm-splash-ship relative z-10"
        initial={{ x: -70, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <PirateShip bob />
      </motion.div>

      <motion.div
        className="pm-splash-parrot absolute z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 16 }}
        aria-hidden="true"
      >
        <PirateParrot mood="happy" />
      </motion.div>
    </div>
  );
}

/** BIG/small — the SHARED picker; pirate.css paints the plates via pp-world. */
export function MatchCaseSelect({ onExitPortal = () => {} }: { onExitPortal?: () => void }) {
  const { setCase, setScreen } = useMatchStore();

  return (
    <div className="pm-screen pp-world relative h-full w-full">
      <CaseSelectScreen
        title="Which letters?"
        subtitle="Match each letter to its treasure picture"
        backdrop={<PirateWorld />}
        tone="pirate"
        backAriaLabel="Back to Pirate Match home"
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
 *  progress mid-alphabet — the contract every game's start follows. */
export function MatchStart() {
  const store = useMatchStore();
  const { letterCase, setScreen, beginRun } = store;
  const done = doneFor(store, letterCase);

  const nextUndone = continueLetter(ALPHA, done);
  const runComplete = done.length >= ALPHA.length;
  const hasProgress = done.length > 0 && !runComplete;

  return (
    <div className="pm-screen pp-world relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-8">
      <PirateWorld />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the letter size choice"
        tone="pirate"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          setScreen("case");
        }}
      />

      <motion.div
        className="pp-panel-parchment relative z-10 flex w-full max-w-md flex-col items-center gap-5 px-6 py-7"
        initial={{ y: 14, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="pm-heading font-rounded font-black">Pirate Match</h1>
          <p className="font-rounded text-sm font-bold opacity-80">
            {letterCase === "lower"
              ? "Match each small letter to its picture"
              : "Match each big letter to its picture"}
          </p>
        </div>

        <div className="w-full">
          <div className="mb-1 flex justify-between">
            <span className="font-rounded text-sm font-bold opacity-80">Letters matched</span>
            <span className="font-rounded text-sm font-black">{done.length} / 26</span>
          </div>
          <ProgressBar
            value={done.length / 26}
            trackClassName="h-4 w-full rounded-full bg-black/10"
            fillClassName="pp-progress-fill h-full rounded-full"
            ariaLabel={`${done.length} of 26 letters matched`}
          />
        </div>

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
      </motion.div>
    </div>
  );
}
