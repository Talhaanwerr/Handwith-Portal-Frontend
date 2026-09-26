"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { SiteScene } from "@games/cvc-match/components/SiteScene";
import { playClickSound } from "@shared/audio/sfx";
import { useMazeStore, type MazeScreen } from "@games/math-maze/store/mazeStore";
import { mazeFor, starsFor, type LevelId } from "@games/math-maze/constants/mazes";
import { MazeBoard } from "@games/math-maze/components/MazeBoard";
import { DoneScreen, PickScreen, SplashScreen } from "@games/math-maze/components/MazeScreens";

/** Coarse history buckets, so the browser Back button walks the game the way
 *  a child walked in: title → which maze → playing. */
function toBucket(screen: MazeScreen): "menu" | "pick" | "play" {
  if (screen === "splash") return "menu";
  if (screen === "pick") return "pick";
  return "play";
}

/**
 * The portal's page transition, plus one rule: a screen on its way OUT takes
 * no taps. Screens cross-fade rather than waiting for each other — waiting let
 * a second screen change, arriving while the finish card was still leaving,
 * strand that card on show while the game had moved on underneath it
 * (reproduced in the test harness).
 */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

/**
 * MATH MAZE — find the way to the prize by tapping the numbers in order.
 *
 * Four runs a child picks between — 1 → 5 on a small board, the reference's
 * 1 → 10, 10 → 1 counting down, and 2 → 20 in twos — with three mazes in
 * each, dealt in turn so a replay is a new walk. The building site is Word Site's, the
 * builder is the shared construction crew's, the confetti puff is Numbers
 * 1 – 5's, the prize and the start are Blend & Seek's pictures, and the hand,
 * the bar, the stars and the picker are the portal's shared kit — this game
 * adds only the maze.
 */
export function MathMazeGame() {
  const router = useRouter();
  const screen = useMazeStore((s) => s.screen);
  const level = useMazeStore((s) => s.level);
  const round = useMazeStore((s) => s.round);
  const misses = useMazeStore((s) => s.misses);
  const setScreen = useMazeStore((s) => s.setScreen);
  const begin = useMazeStore((s) => s.begin);
  const addMiss = useMazeStore((s) => s.addMiss);
  const finish = useMazeStore((s) => s.finish);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else if (bucket === "pick") setScreen("pick");
      else setScreen("play");
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
    silentScreen: "splash",
  });

  const exitPortal = useCallback(() => {
    playClickSound();
    router.push(PORTAL_ROUTE);
  }, [router]);

  const toPick = useCallback(() => setScreen("pick"), [setScreen]);
  const pick = useCallback((l: LevelId) => begin(l), [begin]);

  const maze = mazeFor(level, round);

  return (
    <GameStage>
      <div className="mz-root">
        {/* Word Site's building site — sky, city, crane, digger — behind every
            screen; its own bricklayer steps aside (see the stylesheet) because
            the maze's builder is the one who reacts to the child */}
        <SiteScene />
        <AnimatePresence>
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...SCREEN}>
              <SplashScreen onStart={toPick} onExitPortal={exitPortal} />
            </motion.div>
          )}

          {screen === "pick" && (
            <motion.div key="pick" className="absolute inset-0" {...SCREEN}>
              <PickScreen onPick={pick} onBack={() => setScreen("splash")} />
            </motion.div>
          )}

          {screen === "play" && (
            <motion.div key={`play-${maze.id}`} className="absolute inset-0" {...SCREEN}>
              {/* keyed by maze — every walk starts clean */}
              <MazeBoard
                maze={maze}
                onMiss={addMiss}
                onWon={finish}
                onBack={toPick}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "done" && (
            <motion.div key="done" className="absolute inset-0" {...SCREEN}>
              <DoneScreen
                maze={maze}
                stars={starsFor(misses)}
                next={level}
                onNext={() => begin(level)}
                onAgain={() => begin(level)}
                onChoose={toPick}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
