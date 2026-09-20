"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useHuntStore, completedFor } from "@games/letter-hunt/store/huntStore";
import { PencilPal } from "@games/letter-hunt/components/PennyArt";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { cssVars } from "@shared/styles/cssVars";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { playClickSound } from "@shared/audio/sfx";
import { continueLetter } from "@shared/utils/progression";

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Short splash — Penny + drifting letters, auto-advances (tap to skip). */
export function HuntSplash() {
  const setScreen = useHuntStore((s) => s.setScreen);
  useEffect(() => {
    const t = setTimeout(() => setScreen("home"), 2100);
    return () => clearTimeout(t);
  }, [setScreen]);

  return (
    <button
      className="bg-wash-lavender-sky relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden"
      onClick={() => setScreen("home")}
      aria-label="Letter Hunt — tap to start"
    >
      <HomeEnvironment />
      {/* drifting alphabet letters */}
      {[
        { l: "A", x: "18%", y: "20%", c: "#A882E8", d: 0 },
        { l: "b", x: "76%", y: "16%", c: "#FF8FA3", d: 0.4 },
        { l: "C", x: "12%", y: "66%", c: "#66CC94", d: 0.8 },
        { l: "d", x: "82%", y: "62%", c: "#74B9FF", d: 1.2 },
      ].map((f) => (
        <motion.span
          key={f.l}
          className="hunt-drift-glyph pl-at pl-tint font-rounded pointer-events-none absolute font-black"
          style={cssVars({ "--pl-x": f.x, "--pl-y": f.y, "--pl-color": f.c })}
          animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: f.d }}
          aria-hidden="true"
        >
          {f.l}
        </motion.span>
      ))}
      <motion.div
        className="hunt-penny-splash"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <PencilPal />
      </motion.div>
      <motion.h1
        className="font-rounded text-plum relative z-10 text-4xl font-black md:text-5xl"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Letter Hunt
      </motion.h1>
    </button>
  );
}

/** Home — title, Penny, Continue/Start buttons, the letter list right here
 *  (no separate "choose a letter" page to navigate to). */
export function HuntHome({ onExitPortal }: { onExitPortal?: () => void }) {
  const store = useHuntStore();
  const { currentIndex, letterCase, setScreen, setCase, beginRun, jumpTo } = store;
  // BIG letters and little letters are separate runs with separate finales
  const completed = completedFor(store, letterCase);
  const cased = (l: string) => (letterCase === "lower" ? l.toLowerCase() : l);
  /** What Continue will ACTUALLY open — the same calculation beginRun uses, so
   *  the button can no longer promise one letter and deliver another. */
  const continueAt = continueLetter(LETTERS, completed);

  /**
   * EVERY entry into play from this screen asks for the mode.
   *
   * This used to be `setScreen(mode ? "level" : "mode-select")` — a once-per-
   * session gate copied from the tracing game. That was wrong here: the mode
   * stuck after the first answer, so coming back to home and tapping a
   * different letter dropped the child straight into a hunt under whichever
   * mode they had picked earlier, with no way to change it short of reloading.
   *
   * A Letter Hunt round is one letter, so the mode is a per-round choice, not
   * a per-session one. Advancing WITHIN a run (the Next button) keeps the mode
   * and does not re-ask — only coming back out to home does.
   */
  const enterLevel = () => setScreen("mode-select");

  /** START FROM A — a FRESH run: every letter from A onward, whether or not
   *  it has been completed before. Saved progress is left untouched. */
  const startFromA = () => {
    playClickSound();
    beginRun(0, "fresh");
    enterLevel();
  };
  /** Tapping a tile starts (or redirects) a run at that letter. */
  const pick = (i: number) => {
    playClickSound();
    jumpTo(LETTERS[i]);
    enterLevel();
  };
  /** CONTINUE — a run of only the letters still outstanding. */
  const continueRun = () => {
    beginRun(0, "continue");
    enterLevel();
  };

  const runComplete = completed.length >= 26;
  const hasProgress = (currentIndex > 0 || completed.length > 0) && !runComplete;

  return (
    <div className="bg-wash-mint relative flex h-full w-full flex-col overflow-x-hidden overflow-y-auto px-6 py-6">
      <HomeEnvironment />

      {onExitPortal && (
        <NavPillButton
          label="Back to Games"
          ariaLabel="Back to the game portal"
          tone="plum"
          surface="soft"
          pinned
          onClick={() => {
            playClickSound();
            onExitPortal();
          }}
        />
      )}

      {/* m-auto wrapper: the whole selection column sits at the VERTICAL
          CENTER of the viewport (was pinned high), and on short screens it
          scrolls cleanly from the top instead of clipping */}
      <div className="relative z-10 m-auto flex w-full flex-col items-center gap-4">
        <div className="relative z-10 flex flex-col items-center gap-1">
          <h1 className="font-rounded text-plum text-3xl font-black md:text-4xl">Letter Hunt</h1>
          {/* One instruction, not two. The second line ("Find the matching
              letters!") said the same thing as the first in weaker words —
              the registry's one-line description had been pasted in under a
              subtitle that already carried it. */}
          <p className="font-rounded text-plum/70 text-sm font-bold md:text-base">
            Find and tap the letters that match
          </p>
        </div>

        <motion.div
          className="hunt-penny-home relative z-10"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <PencilPal />
        </motion.div>

        {/* BIG letters / little letters — the same picker Jungle Spy uses, so
          switching case works the same way in both alphabet games */}
        <div
          className="shadow-soft relative z-10 flex items-center gap-1 rounded-full bg-white/70 p-1"
          role="group"
          aria-label="Letter style"
        >
          {(["upper", "lower"] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                playClickSound();
                setCase(c);
              }}
              className={`font-rounded min-h-[40px] rounded-full px-4 text-sm font-black ${
                letterCase === c
                  ? "text-plum shadow-pill bg-white"
                  : "text-plum-muted bg-transparent"
              }`}
              aria-pressed={letterCase === c}
              aria-label={c === "upper" ? "Big letters" : "Little letters"}
            >
              {c === "upper" ? "ABC" : "abc"}
            </button>
          ))}
        </div>

        {/* soft progress */}
        <div className="relative z-10 w-full max-w-xs">
          <ProgressBar
            value={completed.length / 26}
            trackClassName="h-3 w-full rounded-full bg-white/70"
            fillClassName="hunt-progress-fill h-full rounded-full"
            ariaLabel={`${completed.length} of 26 letters found`}
          />
          <p className="font-rounded text-plum/55 mt-1 text-center text-xs font-bold">
            {completed.length} / 26 letters found
          </p>
        </div>

        {/* The letter list, right on this page — no separate screen to visit */}
        <motion.div
          className="relative z-10 w-full max-w-md rounded-3xl bg-white/75 p-4 shadow-lg backdrop-blur-sm md:max-w-2xl"
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className="mb-3 text-center">
            <span className="font-rounded text-plum/70 text-sm font-bold">Pick a letter</span>
          </div>
          <div className="pl-symbol-grid gap-1.5 sm:gap-2">
            {LETTERS.map((l, i) => {
              const isDone = completed.includes(l);
              return (
                <motion.button
                  key={l}
                  onClick={() => pick(i)}
                  className={`flex aspect-square min-h-[48px] min-w-[48px] items-center justify-center rounded-xl shadow-sm ${
                    isDone ? "hunt-tile--done" : "hunt-tile"
                  }`}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.06 }}
                  aria-label={`Hunt the letter ${l}${isDone ? " (already found)" : ""}`}
                >
                  <span
                    className={`hunt-tile-glyph font-rounded font-black ${isDone ? "text-white" : "text-plum"}`}
                  >
                    {cased(l)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Unified start flow — beneath the grid, same shared control as the other games */}
        <StartOptions
          hasProgress={hasProgress || runComplete}
          onContinue={
            runComplete
              ? () => {
                  playClickSound();
                  setScreen("complete");
                }
              : continueRun
          }
          continueLabel={runComplete ? "See my alphabet!" : `Continue · ${cased(continueAt)}`}
          onStartFromA={startFromA}
        />
      </div>
    </div>
  );
}
