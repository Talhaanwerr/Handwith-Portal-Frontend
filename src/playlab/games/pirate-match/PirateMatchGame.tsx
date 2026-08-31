"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useMatchStore, type MatchScreen } from "@games/pirate-match/store/matchStore";
import {
  MatchSplash,
  MatchCaseSelect,
  MatchStart,
} from "@games/pirate-match/components/MatchScreens";
import { MatchLevel } from "@games/pirate-match/components/MatchLevel";
import { MatchComplete } from "@games/pirate-match/components/MatchComplete";

/** Coarse history bucket: splash, case choice and the doorway are browsing
 *  ("menu"); rounds and the finale are "play" — the portal's grain. */
function toBucket(screen: MatchScreen): "menu" | "play" {
  return screen === "level" || screen === "complete" ? "play" : "menu";
}

export function PirateMatchGame() {
  const router = useRouter();
  const { screen, currentLetter, letterCase, setScreen } = useMatchStore();

  const handlePop = useCallback(
    (bucket: string) => {
      // Back out of a round lands on the doorway — the screen the child
      // actually came from (the workflow rule Ocean Hunt set).
      if (bucket === "menu") setScreen("start");
      // Restore the round when history says "play" (reload, forward-nav,
      // re-entry with a stale ?step=play URL) — ignoring it left the game on
      // a menu screen while the URL claimed play, so the next Back press
      // appeared to do nothing (the space-letters routing bug, fixed
      // portal-wide).
      else if (bucket === "play") setScreen(useMatchStore.getState().run ? "level" : "start");
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
  });

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <MatchSplash onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "case" && (
          <motion.div key="case" className="absolute inset-0" {...PAGE_TRANSITION}>
            <MatchCaseSelect onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "start" && (
          <motion.div key={`start-${letterCase}`} className="absolute inset-0" {...PAGE_TRANSITION}>
            <MatchStart />
          </motion.div>
        )}
        {screen === "level" && (
          // Keyed by letter AND case — every round mounts fresh (the
          // portal's remount-per-round pattern), so no drag, hint or audio
          // state can leak between rounds.
          <motion.div
            key={`level-${currentLetter}-${letterCase}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <MatchLevel />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <MatchComplete onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
