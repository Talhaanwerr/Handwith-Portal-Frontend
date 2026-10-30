"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { CandyDefs } from "@games/letter-treats/components/candy-world/CandyDefs";
import { useSortTwoWaysStore, type StwScreen } from "@games/sort-two-ways/store/sortTwoWaysStore";
import { BOARDS } from "@games/sort-two-ways/constants/boards";
import { StwHome } from "@games/sort-two-ways/components/StwHome";
import { SortRound } from "@games/sort-two-ways/components/SortRound";
import { StwComplete } from "@games/sort-two-ways/components/StwComplete";

/** GAME_DEV: no `mode="wait"` on the screen router; the leaving screen takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

function toBucket(screen: StwScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/**
 * SORT TWO WAYS — one collection, organised by different attributes. Pick a
 * module; sort six things into two trays by one rule, then sort the SAME six
 * things again by another rule. Two sets per module, four boards, one
 * mechanic, in a quiet playroom with the teacher beside the trays.
 */
export function SortTwoWaysGame() {
  const router = useRouter();
  const {
    screen,
    module,
    board,
    misses,
    best,
    setScreen,
    toHome,
    start,
    advance,
    miss,
    restart,
    record,
  } = useSortTwoWaysStore();

  const exitPortal = useCallback(() => router.push(PORTAL_ROUTE), [router]);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "play" && module) setScreen(board >= BOARDS ? "complete" : "play");
      else setScreen("home");
    },
    [setScreen, module, board]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => toHome(),
    silentScreen: "home",
  });

  return (
    <GameStage>
      <div className="stw-root">
        {/* Letter Treats' sweet gradients, for the peppermints and gumdrops */}
        <CandyDefs />
        <AnimatePresence>
          {screen === "home" && (
            <motion.div key="home" className="stw-layer" {...SCREEN}>
              <StwHome best={best} onPick={start} onExitPortal={exitPortal} />
            </motion.div>
          )}
          {screen === "play" && module && board < BOARDS && (
            // one screen per SET: its two sorts share it, so the second sort
            // is dealt on the same board under the teacher's break
            <motion.div
              key={`${module}-${Math.floor(board / 2)}`}
              className="stw-layer"
              {...SCREEN}
            >
              <SortRound
                module={module}
                board={board}
                onAdvance={advance}
                onMiss={miss}
                onHome={toHome}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
          {screen === "complete" && module && (
            <motion.div key="complete" className="stw-layer" {...SCREEN}>
              <StwComplete
                module={module}
                misses={misses}
                onPlayAgain={restart}
                onChoose={toHome}
                onExitPortal={exitPortal}
                onRecord={record}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
