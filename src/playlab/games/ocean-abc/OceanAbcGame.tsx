"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useOceanStore, type OceanScreen } from "@games/ocean-abc/store/oceanStore";
import {
  OceanSplash,
  OceanModeSelect,
  OceanModules,
  OceanGrid,
} from "@games/ocean-abc/components/OceanScreens";
import { OceanLevel } from "@games/ocean-abc/components/OceanLevel";
import { OceanComplete } from "@games/ocean-abc/components/OceanComplete";

/**
 * The history step for a screen.
 *
 * The three stages of a letter all collapse into "play", so playing never
 * spams history. The MENU SCREENS DO NOT COLLAPSE: this game has three of
 * them (activity → letter size → letter), and while they shared a single
 * "menu" step the pop handler had to guess which one to restore. It guessed
 * "grid", so any menu-level pop — a reload, a forward/back sync — dropped the
 * player onto the alphabet from wherever they actually were, and backing out
 * of that walked grid → mode → modules: the module ⇄ alphabet loop.
 *
 * One step per menu screen means back walks them one at a time and the pop
 * handler restores exactly the screen the step names, with nothing to guess.
 */
function toStep(screen: OceanScreen): string {
  return screen === "level" || screen === "complete" ? "play" : screen;
}

export function OceanAbcGame() {
  const router = useRouter();
  const { screen, currentLetter, letterCase, setScreen } = useOceanStore();

  const handlePop = useCallback(
    (step: string) => {
      // Restore the round when history says "play" (reload, forward-nav,
      // re-entry with a stale ?step=play URL) — ignoring it left the game on
      // a menu screen while the URL claimed play, so the next Back press
      // appeared to do nothing (the space-letters routing bug, fixed
      // portal-wide). Without a run there is no round to go back to, so the
      // letter grid is the honest destination.
      if (step === "play") {
        setScreen(useOceanStore.getState().run ? "level" : "grid");
        return;
      }
      // Every other step names its screen outright.
      if (step === "splash" || step === "modules" || step === "mode" || step === "grid") {
        setScreen(step);
      }
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toStep(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
  });

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <OceanSplash onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "mode" && (
          <motion.div key="mode" className="absolute inset-0" {...PAGE_TRANSITION}>
            <OceanModeSelect />
          </motion.div>
        )}
        {screen === "modules" && (
          <motion.div key="modules" className="absolute inset-0" {...PAGE_TRANSITION}>
            <OceanModules onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "grid" && (
          <motion.div key={`grid-${letterCase}`} className="absolute inset-0" {...PAGE_TRANSITION}>
            <OceanGrid />
          </motion.div>
        )}
        {screen === "level" && (
          // Keyed by letter AND case — each letter mounts fresh, the same
          // remount-per-round pattern as dino-dig's StonesLevel.
          <motion.div
            key={`level-${currentLetter}-${letterCase}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <OceanLevel />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <OceanComplete onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
