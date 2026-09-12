"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { useScheduler } from "@shared/hooks/useScheduler";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { useCountingStore, type CountingScreen } from "@games/counting-numbers/store/countingStore";
import {
  BREAK_EVERY,
  LEVELS,
  TOTAL_LEVELS,
  type CharacterId,
} from "@games/counting-numbers/constants/levels";
import { LevelScreen } from "@games/counting-numbers/components/LevelScreen";
import {
  CelebrationBreak,
  FinalScreen,
  PauseSheet,
  TitleScreen,
} from "@games/counting-numbers/components/CountingScreens";
import { CornerControls } from "@shared/components/game/CornerControls";

/** Coarse history bucket: the title is "menu"; the levels and the summary
 *  collapse into "play". */
function toBucket(screen: CountingScreen): "menu" | "play" {
  return screen === "title" ? "menu" : "play";
}

/** Scenes slide in from the right and out to the left, overlapping for the
 *  length of the slide the way a children's TV game cuts between screens —
 *  no fade to black, no card. */
const SLIDE = {
  initial: { x: "100%" },
  animate: { x: "0%" },
  exit: { x: "-100%" },
  transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
};

/** How long the friend's cheer holds between levels. */
const BREAK_MS = 2300;

/** Who cheers after each block of levels, in turn. */
const CHEERERS: readonly CharacterId[] = ["pip", "nova", "dot", "rusty", "momo"];

/**
 * NUMBERS 1 – 5.
 *
 * A counting game in the shape of a children's TV activity: one central
 * widescreen canvas with soft colour either side, tiny controls in the
 * corners, and twenty-two levels of the same three puzzles — match, missing
 * number, how many — each ending in the chosen number flying into place,
 * confetti, and a green progress strip before the next one slides in.
 */
export function CountingNumbersGame() {
  const router = useRouter();
  const { screen, levelIndex, setScreen, goTo, nextLevel, resetProgress } = useCountingStore();
  const [paused, setPaused] = useState(false);
  /** Bumped by ↻ so the current level remounts fresh. */
  const [replay, setReplay] = useState(0);
  /** The friend cheering between levels, if one is. */
  const [cheerer, setCheerer] = useState<CharacterId | null>(null);
  const schedule = useScheduler();

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("title");
      else if (bucket === "play") setScreen(levelIndex >= TOTAL_LEVELS ? "final" : "play");
    },
    [setScreen, levelIndex]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("title"),
    silentScreen: "title",
  });

  const start = useCallback(() => {
    playClickSound();
    if (levelIndex >= TOTAL_LEVELS) resetProgress();
    setScreen("play");
  }, [levelIndex, resetProgress, setScreen]);

  /** A level is done. Every BREAK_EVERY levels a friend cheers first. */
  const complete = useCallback(() => {
    const finished = levelIndex + 1;
    if (finished % BREAK_EVERY === 0 && finished < TOTAL_LEVELS) {
      setCheerer(CHEERERS[(finished / BREAK_EVERY - 1) % CHEERERS.length]);
      schedule(() => {
        setCheerer(null);
        nextLevel();
      }, BREAK_MS);
      return;
    }
    nextLevel();
  }, [levelIndex, nextLevel, schedule]);

  const level = LEVELS[Math.min(levelIndex, TOTAL_LEVELS - 1)];
  const scene = screen === "play" ? level.scene : screen === "final" ? "final" : "field";

  return (
    <GameStage>
      <div className="cn-root" data-scene={scene}>
        {/* the soft colour either side of the canvas — the scene's own */}
        <div className="cn-side cn-side--l" aria-hidden="true" />
        <div className="cn-side cn-side--r" aria-hidden="true" />

        <div className="cn-canvas">
          <AnimatePresence mode="sync" initial={false}>
            {screen === "title" && (
              <motion.div key="title" className="cn-screen" {...SLIDE}>
                <TitleScreen onStart={start} />
              </motion.div>
            )}
            {screen === "play" && levelIndex < TOTAL_LEVELS && (
              <motion.div key={`level-${levelIndex}-${replay}`} className="cn-screen" {...SLIDE}>
                {/* keyed by level and replay — every level mounts fresh */}
                <LevelScreen
                  level={level}
                  index={levelIndex}
                  paused={paused || cheerer !== null}
                  onComplete={complete}
                />
              </motion.div>
            )}
            {screen === "final" && (
              <motion.div key="final" className="cn-screen" {...SLIDE}>
                <FinalScreen onAgain={start} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {cheerer && <CelebrationBreak key="break" id={cheerer} />}
            {paused && <PauseSheet key="pause" onResume={() => setPaused(false)} />}
          </AnimatePresence>
        </div>

        <CornerControls
          paused={paused}
          onExit={() => {
            playClickSound();
            router.push(PORTAL_ROUTE);
          }}
          onBack={() => {
            playClickSound();
            setPaused(false);
            if (screen !== "play" || levelIndex === 0) setScreen("title");
            else goTo(levelIndex - 1);
          }}
          onReplay={() => {
            playClickSound();
            setPaused(false);
            if (screen === "play") setReplay((n) => n + 1);
            else start();
          }}
          onTogglePause={() => {
            playClickSound();
            if (screen === "play") setPaused((p) => !p);
          }}
          onForward={() => {
            playClickSound();
            setPaused(false);
            if (screen === "title") start();
            else if (screen === "play") {
              if (levelIndex + 1 >= TOTAL_LEVELS) nextLevel();
              else goTo(levelIndex + 1);
            }
          }}
        />
      </div>
    </GameStage>
  );
}
