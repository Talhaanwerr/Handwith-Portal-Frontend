"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import {
  useFindTheMouseStore,
  type FtmScreen,
} from "@games/find-the-mouse/store/findTheMouseStore";
import { ROUND_COUNT } from "@games/find-the-mouse/constants/scene";
import { FtmSplash } from "@games/find-the-mouse/components/FtmSplash";
import { FtmPeekRound } from "@games/find-the-mouse/components/FtmPeekRound";
import { FtmCountRound } from "@games/find-the-mouse/components/FtmCountRound";
import { FtmComplete } from "@games/find-the-mouse/components/FtmComplete";

/**
 * GAME_DEV's "Be wary of": never `<AnimatePresence mode="wait">` on the screen
 * router. Screens cross-fade and the leaving one takes no taps.
 */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

/** The title screen is "menu"; rounds and the finish are "play". */
function toBucket(screen: FtmScreen): "menu" | "play" {
  return screen === "picker" ? "menu" : "play";
}

/**
 * WHERE IS THE MOUSE? — a kitchen, a big block of cheese full of mouse-holes,
 * and two ways to play: Peek-a-Mouse (remember which hole the mouse peeked
 * from) and Count the Mice (count the mice poking out, then tap the number).
 */
export function FindTheMouseGame() {
  const router = useRouter();
  const {
    screen,
    mode,
    round,
    misses,
    setScreen,
    toPicker,
    startMode,
    advance,
    miss,
    restartMode,
  } = useFindTheMouseStore();

  const exitPortal = useCallback(() => router.push(PORTAL_ROUTE), [router]);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "play" && mode) setScreen(round >= ROUND_COUNT ? "complete" : "play");
      else setScreen("picker");
    },
    [setScreen, mode, round]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => toPicker(),
    silentScreen: "picker",
  });

  return (
    <GameStage>
      <div className="ftm-root">
        <AnimatePresence>
          {screen === "picker" && (
            <motion.div key="picker" className="ftm-layer" {...SCREEN}>
              <FtmSplash onPick={startMode} onExitPortal={exitPortal} />
            </motion.div>
          )}

          {screen === "play" && mode === "peek" && (
            <motion.div key={`peek-${round}`} className="ftm-layer" {...SCREEN}>
              <FtmPeekRound
                round={round}
                onFound={advance}
                onMiss={miss}
                onHome={toPicker}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "play" && mode === "count" && (
            <motion.div key={`count-${round}`} className="ftm-layer" {...SCREEN}>
              <FtmCountRound
                round={round}
                onFound={advance}
                onMiss={miss}
                onHome={toPicker}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "complete" && mode && (
            <motion.div key="complete" className="ftm-layer" {...SCREEN}>
              <FtmComplete
                mode={mode}
                misses={misses}
                onPlayAgain={restartMode}
                onChooseMode={() => startMode(mode === "peek" ? "count" : "peek")}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
