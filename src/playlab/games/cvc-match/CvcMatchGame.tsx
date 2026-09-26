"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { useCvcStore, type CvcScreen } from "@games/cvc-match/store/cvcStore";
import { boardsFor, moduleById, starsFor } from "@games/cvc-match/constants/words";
import { BoardScreen } from "@games/cvc-match/components/BoardScreen";
import {
  AllDone,
  ModuleScreen,
  RoundDone,
  SplashScreen,
} from "@games/cvc-match/components/CvcScreens";

/** Coarse history buckets, so the browser Back button walks the game the way
 *  a child walked in: title → which sound → playing. */
function toBucket(screen: CvcScreen): "menu" | "pick" | "play" {
  if (screen === "splash") return "menu";
  if (screen === "pick") return "pick";
  return "play";
}

/**
 * WORD SITE — CVC word and picture matching, on a building site.
 *
 * Fifty CVC words in five modules, one per short vowel sound: a child picks a
 * sound rather than a difficulty, practises its twelve words over three boards
 * of four, and can come back to a different sound tomorrow. Drag each word
 * onto the thing it names; when a board is full the site goes dark and one lit
 * panel gives three stars and a Next.
 *
 * The pictures are Twemoji and the site is the shared construction theme, so
 * this game draws nothing of its own.
 */
export function CvcMatchGame() {
  const router = useRouter();
  const {
    screen,
    moduleId,
    boardIndex,
    misses,
    best,
    setScreen,
    beginModule,
    nextBoard,
    addMiss,
    bank,
  } = useCvcStore();
  /** The board is solved and the panel is up. */
  const [solved, setSolved] = useState(false);

  const activeModule = moduleById(moduleId);
  const boards = useMemo(() => boardsFor(activeModule), [activeModule]);
  const board = boards[Math.min(boardIndex, boards.length - 1)];

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else if (bucket === "pick") setScreen("pick");
      else setScreen(boardIndex >= boards.length ? "complete" : "play");
    },
    [setScreen, boardIndex, boards.length]
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

  const pick = useCallback(
    (id: string) => {
      setSolved(false);
      beginModule(id);
    },
    [beginModule]
  );

  const solve = useCallback(() => {
    bank(board.id, starsFor(misses));
    setSolved(true);
  }, [bank, board.id, misses]);

  const advance = useCallback(() => {
    setSolved(false);
    nextBoard(boards.length);
  }, [nextBoard, boards.length]);

  const totalStars = Object.values(best).reduce((a, b) => a + b, 0);

  return (
    <GameStage>
      <div className="cv-root">
        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
              <SplashScreen onStart={() => setScreen("pick")} onExitPortal={exitPortal} />
            </motion.div>
          )}

          {screen === "pick" && (
            <motion.div key="pick" className="absolute inset-0" {...PAGE_TRANSITION}>
              <ModuleScreen onPick={pick} onBack={() => setScreen("splash")} />
            </motion.div>
          )}

          {screen === "play" && boardIndex < boards.length && (
            <motion.div key={board.id} className="absolute inset-0" {...PAGE_TRANSITION}>
              {/* keyed by board — every board mounts clean, the way the
                  reference swaps its content without redrawing the board */}
              <BoardScreen
                board={board}
                index={boardIndex}
                total={boards.length}
                onMiss={addMiss}
                onSolved={solve}
                onBack={() => setScreen("pick")}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "complete" && (
            <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
              <AllDone
                totalStars={totalStars}
                onAgain={() => setScreen("pick")}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {solved && screen === "play" && (
            <RoundDone
              key="board-done"
              stars={starsFor(misses)}
              last={boardIndex + 1 >= boards.length}
              onNext={advance}
            />
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
