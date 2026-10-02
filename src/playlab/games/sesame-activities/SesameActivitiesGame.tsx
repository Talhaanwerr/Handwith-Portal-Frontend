"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { stopVoice } from "@shared/audio/voice";
import {
  useSesameActivitiesStore,
  type SesameScreen,
} from "@games/sesame-activities/store/sesameActivitiesStore";
import { HomeScreen } from "@games/sesame-activities/components/HomeScreen";
import { ColourScene } from "@games/sesame-activities/components/ColourScene";
import { SnackScene } from "@games/sesame-activities/components/SnackScene";
import { CompleteScreen } from "@games/sesame-activities/components/CompleteScreen";

/** Coarse history bucket: home is "menu"; a module and its finish card
 *  collapse into "play" — the same grain every other game uses. */
function toBucket(screen: SesameScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/**
 * Screens cross-fade (no `mode="wait"`) and the leaving screen takes no taps
 * — see GAME_DEV.md "Be wary of": a second screen change while one screen is
 * still leaving could otherwise strand the old screen on show for good.
 */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

/**
 * PLAY STREET PALS — two calm modules, each ONE activity played for six
 * rounds with the same layout every round (the Math Maze / Number Safari
 * pattern): home → pick a module → six rounds → star card.
 *
 *   Colour Match — match the ball Percy is holding (the park)
 *   Snack Time   — give the hungry pal the food they're thinking of (the table)
 *
 * Every character — Percy the chick, Ruby, Bo — is original art invented for
 * this game; no licensed characters, names or branding are used.
 */
export function SesameActivitiesGame() {
  const router = useRouter();
  const screen = useSesameActivitiesStore((s) => s.screen);
  const moduleId = useSesameActivitiesStore((s) => s.module);
  const round = useSesameActivitiesStore((s) => s.round);
  const lastStars = useSesameActivitiesStore((s) => s.lastStars);
  const best = useSesameActivitiesStore((s) => s.best);
  const goHome = useSesameActivitiesStore((s) => s.goHome);
  const start = useSesameActivitiesStore((s) => s.start);
  const replay = useSesameActivitiesStore((s) => s.replay);
  const miss = useSesameActivitiesStore((s) => s.miss);
  const next = useSesameActivitiesStore((s) => s.next);

  const handlePop = useCallback(
    (bucket: string) => (bucket === "menu" ? goHome() : start(moduleId)),
    [goHome, start, moduleId]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: goHome,
  });

  const exitPortal = useCallback(() => {
    playClickSound();
    router.push(PORTAL_ROUTE);
  }, [router]);

  const backHome = useCallback(() => {
    playClickSound();
    stopVoice(); // a queued round prompt must not follow us home
    goHome();
  }, [goHome]);

  const atHome = screen === "home";
  const playKey = `${moduleId}-play`;

  return (
    <GameStage>
      <div className="sa-root">
        <AnimatePresence>
          {screen === "home" && (
            <motion.div key="home" className="absolute inset-0" {...SCREEN}>
              <HomeScreen best={best} onPick={start} />
            </motion.div>
          )}
          {screen === "play" && (
            <motion.div key={playKey} className="absolute inset-0" {...SCREEN}>
              {moduleId === "colours" && <ColourScene round={round} onMiss={miss} onNext={next} />}
              {moduleId === "snack" && <SnackScene round={round} onMiss={miss} onNext={next} />}
            </motion.div>
          )}
          {screen === "complete" && (
            <motion.div key="complete" className="absolute inset-0" {...SCREEN}>
              <CompleteScreen
                moduleId={moduleId}
                stars={lastStars}
                onPlayAgain={() => {
                  playClickSound();
                  replay();
                }}
                onChoose={backHome}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinned pills only — never CornerControls' ✕/pause. Home is the
            game's home, so its one pill leaves for the portal; in a module,
            Back goes home and Back to Games sits top-right. */}
        <NavPillButton
          label={atHome ? "Back to Games" : "Back"}
          ariaLabel={atHome ? "Back to the game portal" : "Back to the Play Street Pals games"}
          tone="plum"
          surface="strong"
          pinned
          onClick={atHome ? exitPortal : backHome}
        />
        {screen === "play" && (
          <button
            type="button"
            className="sa-leave pl-exit-pill font-rounded font-black"
            onClick={exitPortal}
            aria-label="Back to the game portal"
          >
            Back to Games
          </button>
        )}
      </div>
    </GameStage>
  );
}
