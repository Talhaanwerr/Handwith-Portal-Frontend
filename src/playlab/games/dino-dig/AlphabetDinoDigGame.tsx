"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useDinoStore, stonesRoundFor, type DinoScreen } from "@games/dino-dig/store/dinoStore";
import { TOTAL_CROSSINGS } from "@games/dino-dig/constants/rounds";
import { DinoSplash } from "@games/dino-dig/components/DinoSplash";
import { StonesStart } from "@games/dino-dig/components/StonesStart";
import { DinoCaseSelect } from "@games/dino-dig/components/DinoCaseSelect";
import { FeedLevel } from "@games/dino-dig/components/FeedLevel";
import { StonesLevel } from "@games/dino-dig/components/StonesLevel";
import { DinoComplete } from "@games/dino-dig/components/DinoComplete";

/** Coarse history bucket: the mode-picking splash and River Crossing's start
 *  screen are both "menu" (browsing, not playing); the modes and the finale
 *  collapse into "play" — the same grain as every other game. */
function toBucket(screen: DinoScreen): "menu" | "play" {
  return screen === "splash" || screen === "case-select" || screen === "stones-start"
    ? "menu"
    : "play";
}

export function AlphabetDinoDigGame() {
  const router = useRouter();
  const store = useDinoStore();
  const {
    screen,
    mode,
    letterCase,
    feedLetters,
    setScreen,
    startMode,
    completeFeed,
    crossingDone,
    playAgain,
  } = store;
  /** The chosen case's crossing progress — drives the guard and the remount key. */
  const stonesRound = stonesRoundFor(store, letterCase);

  // Back from gameplay retreats to the mode picker rather than exiting.
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"), // always enter through the picker
  });

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <DinoSplash onPick={startMode} onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "case-select" && (
          <motion.div key="case-select" className="absolute inset-0" {...PAGE_TRANSITION}>
            <DinoCaseSelect />
          </motion.div>
        )}
        {screen === "stones-start" && (
          <motion.div key="stones-start" className="absolute inset-0" {...PAGE_TRANSITION}>
            <StonesStart />
          </motion.div>
        )}
        {screen === "play" && mode === "feed" && (
          <motion.div key="feed" className="absolute inset-0" {...PAGE_TRANSITION}>
            {/* remounts fresh from the picker or Play Again — a new shuffled
                menu every session, no manual reset logic */}
            <FeedLevel letterCase={letterCase} onComplete={completeFeed} />
          </motion.div>
        )}
        {screen === "play" && mode === "stones" && stonesRound < TOTAL_CROSSINGS && (
          <motion.div
            key={`stones-${letterCase}-${stonesRound}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            {/* keyed by crossing — each crossing remounts clean: fresh stones,
                zero drag carry-over */}
            <StonesLevel
              crossing={stonesRound}
              letterCase={letterCase}
              onCrossingDone={crossingDone}
            />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <DinoComplete
              mode={mode}
              letterCase={letterCase}
              feedLetters={feedLetters}
              onPlayAgain={playAgain}
              onExitPortal={() => router.push(PORTAL_ROUTE)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
