"use client";

import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { playClickSound } from "@shared/audio/sfx";
import { useDinoStore, stonesRoundFor, displayLetter } from "@games/dino-dig/store/dinoStore";
import { STONE_GROUPS, TOTAL_CROSSINGS } from "@games/dino-dig/constants/rounds";
import { DinoBackdrop } from "@games/dino-dig/components/DinoBackdrop";
import { CAST } from "@games/dino-dig/components/DinoArt";

/**
 * RIVER CROSSING'S DOORWAY.
 *
 * The mode used to jump straight into whichever crossing was saved, which
 * meant a returning child was thrown mid-bridge with no say — and a child
 * wanting to start over had no way to. This screen is the same contract as
 * every alphabet game's letter screen, via the same shared control:
 *
 *   Start from A  — always there, crossing 1, letter A
 *   Continue      — ONLY when a crossing is saved mid-way (the primary
 *                   action then, exactly as StartOptions renders it)
 *
 * A finished river shows just Start from A: there is nothing left to
 * continue, and the finale already celebrated the finish.
 *
 * The screen also shows WHO is waiting: the next dino in the cast and the
 * letters its crossing carries, so "Continue" is a promise a child can see,
 * not an abstract word.
 */
export function StonesStart() {
  const store = useDinoStore();
  const { letterCase, setScreen, startStonesFresh, continueStones } = store;
  const stonesRound = stonesRoundFor(store, letterCase);

  const inProgress = stonesRound > 0 && stonesRound < TOTAL_CROSSINGS;
  /** The crossing Continue would open (safe when finished — Continue hidden). */
  const nextIndex = Math.min(stonesRound, TOTAL_CROSSINGS - 1);
  const member = CAST[nextIndex];
  const letters = STONE_GROUPS[nextIndex];
  const Dino = member.Art;

  return (
    <div className="dd-bg pl-screen-shell">
      <DinoBackdrop />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the letter size choice"
        tone="dino"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          setScreen("case-select");
        }}
      />

      {/* Backdrop and pinned pill sit outside this scroller, so neither the
          jungle sky nor Back scrolls away and no white shows beneath. */}
      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center px-6 py-6 pt-16">
        <div className="relative z-10 flex flex-col items-center gap-5">
          <motion.div
            className="flex flex-col items-center gap-1 text-center"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="font-rounded text-3xl font-black text-white drop-shadow-md md:text-5xl">
              River Crossing
            </h1>
            <p className="font-rounded text-dino-ink mt-1 rounded-full bg-white/85 px-4 py-1 text-xs font-bold md:text-sm">
              {inProgress
                ? `${member.name} is waiting — crossing ${stonesRound + 1} of ${TOTAL_CROSSINGS}`
                : "Build the letter bridge, one dino at a time"}
            </p>
          </motion.div>

          {/* the dino the child would meet next, with its crossing's letters */}
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
          >
            <motion.div
              className="dd-start-dino"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              <Dino mood="happy" />
            </motion.div>
            <div
              className="flex items-center gap-1.5"
              aria-label={`Letters ${letters.map((l) => displayLetter(l, letterCase)).join(", ")}`}
            >
              {letters.map((canonical, i) => {
                const l = displayLetter(canonical, letterCase);
                return (
                  <motion.span
                    key={canonical}
                    className="dd-start-letter font-rounded flex items-center justify-center font-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.25 + i * 0.07,
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                  >
                    {l}
                  </motion.span>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <StartOptions
              hasProgress={inProgress}
              onContinue={() => {
                playClickSound();
                continueStones();
              }}
              continueLabel={`Continue · Crossing ${stonesRound + 1}`}
              onStartFromA={() => {
                playClickSound();
                startStonesFresh();
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
