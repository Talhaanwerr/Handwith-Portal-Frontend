"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useHuntStore, type HuntScreen } from "@games/letter-hunt/store/huntStore";
import { HuntSplash, HuntHome } from "@games/letter-hunt/components/HuntScreens";
import { HuntLevel } from "@games/letter-hunt/components/HuntLevel";
import { HuntComplete } from "@games/letter-hunt/components/HuntComplete";
import { HuntModeSelect } from "@games/letter-hunt/components/HuntModeSelect";

/**
 * Coarse history bucket for this game's screen graph.
 *
 * mode-select deliberately shares the "menu" bucket with splash/home rather
 * than owning a step of its own. Giving it a step made Back from an active
 * hunt pop to the mode picker — which is not a place the child was retreating
 * *to*, it is a gate they already passed through. The hierarchy the UX implies
 * is menu (choose letter / choose mode) → play, so that is what history models:
 *
 *   Back during a hunt  →  HOME
 *
 * The finale sits with gameplay, so Back from it returns home rather than
 * dropping out of the game entirely.
 */
function toBucket(screen: HuntScreen): "menu" | "play" {
  return screen === "level" || screen === "complete" ? "play" : "menu";
}

export function LetterHuntGame() {
  const router = useRouter();
  const { screen, setScreen } = useHuntStore();

  // Back button: from "level" (play), returns to "home" (menu) instead of
  // exiting straight to the portal. "play" popped-to has no meaningful target
  // here (you can only reach play going forward from home), so nothing to do —
  // the forward push that created it already put the right screen in place.
  const handlePop = useCallback(
    (bucket: string) => {
      // "menu" always resolves to home specifically — a safe, always-valid
      // landing spot, and the screen the child expects Back to reach.
      if (bucket === "menu") setScreen("home");
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"), // always enter through the short splash
  });

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntSplash />
          </motion.div>
        )}
        {screen === "home" && (
          <motion.div key="home" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntHome onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "mode-select" && (
          <motion.div key="mode-select" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntModeSelect />
          </motion.div>
        )}
        {screen === "level" && (
          <motion.div key="level" className="absolute inset-0" {...PAGE_TRANSITION}>
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
