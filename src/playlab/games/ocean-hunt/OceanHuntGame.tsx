"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useHuntStore, type HuntScreen } from "@games/ocean-hunt/store/huntStore";
import { HuntSplash, HuntCaseSelect, HuntStart } from "@games/ocean-hunt/components/HuntScreens";
import { HuntLevel } from "@games/ocean-hunt/components/HuntLevel";
import { HuntComplete } from "@games/ocean-hunt/components/HuntComplete";

/** Coarse history bucket: splash, case choice and the doorway are all
 *  browsing ("menu"); rounds and the finale are "play" — the same grain as
 *  every game in the portal. */
function toBucket(screen: HuntScreen): "menu" | "play" {
  return screen === "level" || screen === "complete" ? "play" : "menu";
}

export function OceanHuntGame() {
  const router = useRouter();
  const { screen, currentLetter, letterCase, setScreen } = useHuntStore();

  const handlePop = useCallback(
    (bucket: string) => {
      // Back out of a round lands on the doorway, not the splash — the
      // screen the child actually came from (the workflow gap the dino
      // audit flagged, closed here from the start).
      if (bucket === "menu") setScreen("start");
      // Restore the round when history says "play" (reload, forward-nav,
      // re-entry with a stale ?step=play URL) — ignoring it left the game on
      // a menu screen while the URL claimed play, so the next Back press
      // appeared to do nothing (the space-letters routing bug, fixed
      // portal-wide).
      else if (bucket === "play") setScreen(useHuntStore.getState().run ? "level" : "start");
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
            <HuntSplash onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "case" && (
          <motion.div key="case" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntCaseSelect onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "start" && (
          <motion.div key={`start-${letterCase}`} className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntStart />
          </motion.div>
        )}
        {screen === "level" && (
          // Keyed by letter AND case — every round mounts fresh, the portal's
          // remount-per-round pattern, so no drag or hint state can leak.
          <motion.div
            key={`level-${currentLetter}-${letterCase}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <HuntLevel />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntComplete onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
