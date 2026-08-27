"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useOceanStore, type OceanScreen } from "@games/ocean-abc/store/oceanStore";
import { OceanSplash, OceanModeSelect, OceanGrid } from "@games/ocean-abc/components/OceanScreens";
import { OceanLevel } from "@games/ocean-abc/components/OceanLevel";
import { OceanComplete } from "@games/ocean-abc/components/OceanComplete";

/** Coarse history bucket: the three stages of a letter are all "play", so
 *  browsing them never spams history; splash/mode/grid collapse into "menu".
 *  The same grain every other game in the portal uses. */
function toBucket(screen: OceanScreen): "menu" | "play" {
  return screen === "level" || screen === "complete" ? "play" : "menu";
}

export function OceanAbcGame() {
  const router = useRouter();
  const { screen, currentLetter, letterCase, setScreen } = useOceanStore();

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("grid");
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
            <OceanSplash onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "mode" && (
          <motion.div key="mode" className="absolute inset-0" {...PAGE_TRANSITION}>
            <OceanModeSelect />
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
