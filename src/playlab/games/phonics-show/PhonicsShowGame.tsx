"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { useHowToPlay } from "@shared/components/ui/HowToPlayGate";
import { useShowStore, type ShowScreen } from "@games/phonics-show/store/showStore";
import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  answerOf,
  starsFor,
} from "@games/phonics-show/constants/questions";
import { QuestionScreen } from "@games/phonics-show/components/QuestionScreen";
import { ShowDone, ShowSplash } from "@games/phonics-show/components/ShowScreens";

/** The show's first three questions on the title screen; six pictures rain at the end. */
const SHOWCASE = QUESTIONS.slice(0, 3).map((q) => ({ word: q.word, letter: answerOf(q) }));
const RAIN = QUESTIONS.slice(0, 6).map((q) => q.word);

/** Coarse history buckets, so Back walks the game the way a child walked in. */
function toBucket(screen: ShowScreen): "menu" | "play" {
  return screen === "splash" ? "menu" : "play";
}

/**
 * PHONICS GAME SHOW — Level 2 Phonics. Fifteen pictures on a lit game-show
 * sign, three letters each: tap the sound the word starts with.
 *
 * The reference show's flow, in the portal's frame: its splash and "Let's
 * Go!" are this portal's title screen and the shared How to Play card; its
 * instructions modal IS that card. The run is Snow Words' (one mounted
 * question screen for all fifteen, wrong answers shown at once), the studio
 * is mixed from existing rooms, the host is Key Quest's teacher, and every
 * word, letter sound and line is an existing recording — nothing new to
 * record.
 */
export function PhonicsShowGame() {
  const router = useRouter();
  const { gate } = useHowToPlay();
  const { screen, index, firstTry, best, setScreen, start, solved } = useShowStore();

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else setScreen(index >= TOTAL_QUESTIONS ? "done" : "play");
    },
    [setScreen, index]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
    silentScreen: "splash",
  });

  const exitPortal = useCallback(() => {
    playClickSound();
    router.push(PORTAL_ROUTE);
  }, [router]);

  return (
    <GameStage>
      <div className="pgs-root">
        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
              <ShowSplash
                title="Phonics Game Show"
                level="Level 2 Phonics"
                showcase={SHOWCASE}
                best={best}
                total={TOTAL_QUESTIONS}
                onStart={() => gate(start)}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "play" && index < TOTAL_QUESTIONS && (
            <motion.div key="play" className="absolute inset-0" {...PAGE_TRANSITION}>
              <QuestionScreen
                index={index}
                onSolved={solved}
                onBack={() => setScreen("splash")}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "done" && (
            <motion.div key="done" className="absolute inset-0" {...PAGE_TRANSITION}>
              <ShowDone
                rain={RAIN}
                firstTry={firstTry}
                total={TOTAL_QUESTIONS}
                stars={starsFor(firstTry)}
                onAgain={start}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
