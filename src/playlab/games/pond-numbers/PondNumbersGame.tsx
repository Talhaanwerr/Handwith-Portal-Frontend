"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { usePondNumbersStore, type PnScreen } from "@games/pond-numbers/store/pondNumbersStore";
import { ROUND_COUNT } from "@games/pond-numbers/constants/rounds";
import { PnHome } from "@games/pond-numbers/components/PnHome";
import { QuickLookRound } from "@games/pond-numbers/components/QuickLookRound";
import { OneMoreRound } from "@games/pond-numbers/components/OneMoreRound";
import { PnComplete } from "@games/pond-numbers/components/PnComplete";

/** GAME_DEV: no `mode="wait"` on the screen router; the leaving screen takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

function toBucket(screen: PnScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/**
 * POND NUMBERS — two early-number skills by a sunny pond, each one mechanic
 * repeated for six rounds and answered on the same number tiles:
 * Quick Look (see a dot pattern for a moment, say how many — subitising) and
 * One More (frogs on a log, one more hops on — counting on).
 */
export function PondNumbersGame() {
  const router = useRouter();
  const { screen, module, round, misses, setScreen, toHome, start, advance, miss, restart } =
    usePondNumbersStore();

  const exitPortal = useCallback(() => router.push(PORTAL_ROUTE), [router]);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "play" && module) setScreen(round >= ROUND_COUNT ? "complete" : "play");
      else setScreen("home");
    },
    [setScreen, module, round]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => toHome(),
    silentScreen: "home",
  });

  const roundProps = {
    round,
    onDone: advance,
    onMiss: miss,
    onHome: toHome,
    onExitPortal: exitPortal,
  };

  return (
    <GameStage>
      <div className="pn-root">
        <AnimatePresence>
          {screen === "home" && (
            <motion.div key="home" className="pn-layer" {...SCREEN}>
              <PnHome onPick={start} onExitPortal={exitPortal} />
            </motion.div>
          )}
          {screen === "play" && module === "quick" && (
            <motion.div key={`quick-${round}`} className="pn-layer" {...SCREEN}>
              <QuickLookRound {...roundProps} />
            </motion.div>
          )}
          {screen === "play" && module === "more" && (
            <motion.div key={`more-${round}`} className="pn-layer" {...SCREEN}>
              <OneMoreRound {...roundProps} />
            </motion.div>
          )}
          {screen === "complete" && module && (
            <motion.div key="complete" className="pn-layer" {...SCREEN}>
              <PnComplete
                module={module}
                misses={misses}
                onPlayAgain={restart}
                onOther={() => start(module === "quick" ? "more" : "quick")}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
