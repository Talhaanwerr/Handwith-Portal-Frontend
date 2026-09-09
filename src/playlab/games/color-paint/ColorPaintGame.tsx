"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { stopVoice } from "@shared/audio/voice";
import { usePaintStore, type PaintScreen } from "@games/color-paint/store/paintStore";
import { ACTIVITIES } from "@games/color-paint/constants/activities";
import { PaintSplash } from "@games/color-paint/components/PaintSplash";
import { PaintIntro } from "@games/color-paint/components/PaintIntro";
import { PaintLevel } from "@games/color-paint/components/PaintLevel";
import { PaintFinale } from "@games/color-paint/components/PaintFinale";

/**
 * History step for a screen. The seven objects all collapse into "play", so
 * painting never spams history; the intro is its own step so browser Back
 * from the easel lands on "Let's paint!" rather than leaving the game.
 */
function toStep(screen: PaintScreen): string {
  return screen === "level" || screen === "finale" ? "play" : screen;
}

/**
 * COLOR & PAINT — the portal's splash → intro → play → finale shape.
 *
 * Seven objects, one colour each, one easel. Everything around the easel is
 * Candy Land: the same splash system, the same Bee, the same wash and buttons
 * and celebration overlay as Candy ABC. What is new is only the easel itself.
 */
export function ColorPaintGame() {
  const router = useRouter();
  const { screen, index, setScreen, advance, restart } = usePaintStore();

  const handlePop = useCallback(
    (step: string) => {
      stopVoice();
      if (step === "intro") setScreen("intro");
      else if (step === "play") setScreen(index >= ACTIVITIES.length ? "finale" : "level");
      else setScreen("splash");
    },
    [setScreen, index]
  );

  useGameSession({
    screen,
    step: toStep(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
  });

  const exitPortal = useCallback(() => {
    stopVoice();
    router.push(PORTAL_ROUTE);
  }, [router]);

  /** One object finished: the next one, or the rainbow. */
  const onObjectDone = useCallback(() => {
    if (!advance()) setScreen("finale");
  }, [advance, setScreen]);

  const activity = ACTIVITIES[Math.min(index, ACTIVITIES.length - 1)];

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <PaintSplash onPlay={() => setScreen("intro")} />
          </motion.div>
        )}
        {screen === "intro" && (
          <motion.div key="intro" className="absolute inset-0" {...PAGE_TRANSITION}>
            <PaintIntro onStart={() => setScreen("level")} onExitPortal={exitPortal} />
          </motion.div>
        )}
        {screen === "level" && (
          // Keyed by object: each one mounts fresh, so no paint, phase or
          // audio can leak from one picture into the next.
          <motion.div
            key={`level-${activity.id}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <PaintLevel
              activity={activity}
              index={index}
              total={ACTIVITIES.length}
              onDone={onObjectDone}
              onBack={() => setScreen("intro")}
            />
          </motion.div>
        )}
        {screen === "finale" && (
          <motion.div key="finale" className="absolute inset-0" {...PAGE_TRANSITION}>
            <PaintFinale onPlayAgain={restart} onExitPortal={exitPortal} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
