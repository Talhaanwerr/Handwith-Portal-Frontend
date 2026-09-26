"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { useSafariStore, type SafariScreen } from "@games/number-safari/store/numberSafariStore";
import { RUNS, runLength, starsFor, type Difficulty } from "@games/number-safari/constants/levels";
import { LevelScreen } from "@games/number-safari/components/LevelScreen";
import {
  CompleteScreen,
  DifficultyScreen,
  SplashScreen,
} from "@games/number-safari/components/SafariScreens";

/** Coarse history buckets, so the browser Back button walks the game the way
 *  a child walked in: title → which safari → playing. */
function toBucket(screen: SafariScreen): "menu" | "pick" | "play" {
  if (screen === "splash") return "menu";
  if (screen === "pick") return "pick";
  return "play";
}

/** Scenes slide in from the right and out to the left, overlapping the way a
 *  children's TV activity cuts between screens — no fade, no card. */
const SLIDE = {
  initial: { x: "100%" },
  animate: { x: "0%" },
  exit: { x: "-100%" },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
};

/**
 * NUMBER SAFARI.
 *
 * Two puzzles — how many are there, and which number is missing — over
 * eighteen levels split into three runs a child chooses between at the start.
 * The ants come from Numbers 1 – 5, the other seventy things to count come
 * from Blend & Seek, and the grown-up who jumps when you get it right is Key
 * Quest's teacher: this game draws nothing of its own, which is the whole
 * point of it existing in one afternoon rather than one week.
 */
export function NumberSafariGame() {
  const router = useRouter();
  const { screen, difficulty, levelIndex, misses, best, setScreen, beginRun, nextLevel, addMiss } =
    useSafariStore();

  const total = runLength(difficulty);
  const levels = RUNS[difficulty];
  const level = levels[Math.min(levelIndex, total - 1)];

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else if (bucket === "pick") setScreen("pick");
      else if (bucket === "play") setScreen(levelIndex >= total ? "complete" : "play");
    },
    [setScreen, levelIndex, total]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
    silentScreen: "splash",
  });

  const pick = useCallback((d: Difficulty) => beginRun(d), [beginRun]);

  const exitPortal = useCallback(() => {
    playClickSound();
    router.push(PORTAL_ROUTE);
  }, [router]);

  const scene = screen === "play" ? level.scene : "leaf";

  return (
    <GameStage>
      <div className="ns-root" data-scene={scene}>
        {/* the scene's own colour, blurred, either side of the canvas */}
        <div className="ns-side ns-side--l" aria-hidden="true" />
        <div className="ns-side ns-side--r" aria-hidden="true" />

        <div className="ns-canvas">
          <AnimatePresence mode="sync" initial={false}>
            {screen === "splash" && (
              <motion.div key="splash" className="ns-screen" {...SLIDE}>
                <SplashScreen onStart={() => setScreen("pick")} onExitPortal={exitPortal} />
              </motion.div>
            )}

            {screen === "pick" && (
              <motion.div key="pick" className="ns-screen" {...SLIDE}>
                <DifficultyScreen onPick={pick} onBack={() => setScreen("splash")} />
              </motion.div>
            )}

            {screen === "play" && levelIndex < total && (
              <motion.div
                key={`level-${difficulty}-${levelIndex}`}
                className="ns-screen"
                {...SLIDE}
              >
                {/* keyed by level — every level mounts clean */}
                <LevelScreen
                  level={level}
                  index={levelIndex}
                  total={total}
                  onMiss={addMiss}
                  onComplete={nextLevel}
                />
              </motion.div>
            )}

            {screen === "complete" && (
              <motion.div key="complete" className="ns-screen" {...SLIDE}>
                <CompleteScreen
                  difficulty={difficulty}
                  stars={Math.max(starsFor(misses), best[difficulty] ?? 0)}
                  onAgain={() => pick(difficulty)}
                  onChoose={() => setScreen("pick")}
                  onExitPortal={exitPortal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* While playing, the two controls this portal uses: back home, and
            out to the shelf. No pause and no ✕ — a child who wants to stop
            presses the one button that says where it goes. */}
        {screen === "play" && (
          <>
            {/* Back goes home to the safari picker from ANY level — stepping
                back one level at a time read to children as the game going
                backwards, not as a way out */}
            <NavPillButton
              label="Back"
              ariaLabel="Back to choosing a safari"
              tone="jungle"
              surface="strong"
              pinned
              onClick={() => {
                playClickSound();
                setScreen("pick");
              }}
            />
            <button
              type="button"
              className="ns-leave pl-exit-pill font-rounded font-black"
              onClick={exitPortal}
              aria-label="Back to the game portal"
            >
              Back to Games
            </button>
          </>
        )}
      </div>
    </GameStage>
  );
}
