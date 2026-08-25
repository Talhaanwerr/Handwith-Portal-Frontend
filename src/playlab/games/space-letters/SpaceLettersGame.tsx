"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useSpaceStore, type SpaceScreen } from "@games/space-letters/store/spaceStore";
import {
  SpaceSplash,
  SpaceModeSelect,
  SpaceGrid,
} from "@games/space-letters/components/SpaceScreens";
import { SpaceLevel } from "@games/space-letters/components/SpaceLevel";
import { SpaceComplete } from "@games/space-letters/components/SpaceComplete";

/** Coarse history bucket: gameplay (level -> complete) is one step;
 *  splash/mode/grid collapse into "menu" so browsing never spams history —
 *  the same grain every other game uses. */
function toBucket(screen: SpaceScreen): "menu" | "play" {
  return screen === "level" || screen === "complete" ? "play" : "menu";
}

export function SpaceLettersGame() {
  const router = useRouter();
  const { screen, currentLetter, letterCase, setScreen } = useSpaceStore();

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
            <SpaceSplash onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "mode" && (
          <motion.div key="mode" className="absolute inset-0" {...PAGE_TRANSITION}>
            <SpaceModeSelect />
          </motion.div>
        )}
        {screen === "grid" && (
          <motion.div key={`grid-${letterCase}`} className="absolute inset-0" {...PAGE_TRANSITION}>
            <SpaceGrid />
          </motion.div>
        )}
        {screen === "level" && (
          // Keyed by letter AND case — each round mounts fresh, the same
          // remount-per-round pattern as dino-dig's StonesLevel.
          <motion.div
            key={`level-${currentLetter}-${letterCase}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <SpaceLevel />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <SpaceComplete onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
