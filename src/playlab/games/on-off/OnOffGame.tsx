"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useOnOffStore, type OoScreen } from "@games/on-off/store/onOffStore";
import { ROUND_COUNT, SCENES } from "@games/on-off/constants/scenes";
import { OoHome } from "@games/on-off/components/OoHome";
import { OoRound } from "@games/on-off/components/OoRound";
import { OoComplete } from "@games/on-off/components/OoComplete";

/** GAME_DEV: no `mode="wait"` on the screen router; the leaving screen takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

/** The pictures drawn as inline SVG; every other scene picture is a file. */
const DRAWN = new Set<string>(["tree", "table", "rug"]);

function toBucket(screen: OoScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/**
 * ON & OFF — the positional words ON and OFF, taught with one drag repeated
 * over one run of eight rounds that mixes the two: some rounds the thing
 * waits in a bubble and its silhouette sits ON the bed, the tree, the
 * table… ("Put the teddy ON the bed"); others it sits on the furniture and
 * its silhouette waits on the floor beside it ("Take the cat OFF the
 * chair"). Title (one Play card) → the run → the star card.
 */
export function OnOffGame() {
  const router = useRouter();
  const { screen, round, misses, best, setScreen, toHome, start, advance, miss, record } =
    useOnOffStore();

  const exitPortal = useCallback(() => router.push(PORTAL_ROUTE), [router]);

  // Warm the pictures every round uses while the child is on the title
  // screen, so no round opens on an empty bubble while its image loads.
  useEffect(() => {
    const ids = new Set<string>(["star", ...SCENES.flatMap((s) => [s.thing, s.surface])]);
    ids.forEach((id) => {
      if (DRAWN.has(id)) return;
      const img = new Image();
      img.src = `/games/blend-read/icons/${id}.svg`;
    });
  }, []);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "play") setScreen(round >= ROUND_COUNT ? "complete" : "play");
      else setScreen("home");
    },
    [setScreen, round]
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
      <div className="oo-root">
        <AnimatePresence>
          {screen === "home" && (
            <motion.div key="home" className="oo-layer" {...SCREEN}>
              <OoHome best={best} onPlay={start} onExitPortal={exitPortal} />
            </motion.div>
          )}
          {screen === "play" && round < ROUND_COUNT && (
            <motion.div key={`round-${round}`} className="oo-layer" {...SCREEN}>
              <OoRound
                round={round}
                onDone={advance}
                onMiss={miss}
                onHome={toHome}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
          {screen === "complete" && (
            <motion.div key="complete" className="oo-layer" {...SCREEN}>
              <OoComplete
                misses={misses}
                onPlayAgain={start}
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
