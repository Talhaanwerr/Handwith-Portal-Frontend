"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { useQuizStore, type QuizScreen } from "@games/word-quiz/store/quizStore";
import { TOTAL_QUESTIONS, scoreOf } from "@games/word-quiz/constants/questions";
import { QuestionScreen } from "@games/word-quiz/components/QuestionScreen";
import { ReviewScreen, SplashScreen } from "@games/word-quiz/components/QuizScreens";

/** Coarse history buckets, so Back walks the game the way a child walked in. */
function toBucket(screen: QuizScreen): "menu" | "play" {
  return screen === "splash" ? "menu" : "play";
}

/**
 * SNOW WORDS — ten pictures on the ice, three words each, read one and tap it.
 *
 * The reference activity's shape, with its two-step answer dropped: tapping a
 * word IS the answer, because a Check button is a second puzzle stacked on the
 * reading one. What is kept is the part that matters — nothing is marked right
 * or wrong during play, and the run ends not on a trophy screen but on a
 * REVIEW, every question again beside a score that stays put while the list
 * scrolls.
 *
 * The world is the shared arctic theme and the voice is the portal's recorded
 * word clips, so this game draws almost nothing and records nothing.
 */
export function WordQuizGame() {
  const router = useRouter();
  const { screen, index, answers, best, setScreen, start, answer, bank } = useQuizStore();

  const score = scoreOf(answers);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else setScreen(index >= TOTAL_QUESTIONS ? "review" : "play");
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

  // the run is over: keep the score if it is the best one yet
  useEffect(() => {
    if (screen === "review") bank(score);
  }, [screen, score, bank]);

  const exitPortal = useCallback(() => {
    playClickSound();
    router.push(PORTAL_ROUTE);
  }, [router]);

  return (
    <GameStage>
      <div className="wq-root">
        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
              <SplashScreen best={best} onStart={start} onExitPortal={exitPortal} />
            </motion.div>
          )}

          {screen === "play" && index < TOTAL_QUESTIONS && (
            <motion.div key="play" className="absolute inset-0" {...PAGE_TRANSITION}>
              {/* one mounted screen for all ten questions: the reference swaps
                  the picture and the words, it does not rebuild the board */}
              <QuestionScreen
                index={index}
                onAnswer={answer}
                onBack={() => setScreen("splash")}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "review" && (
            <motion.div key="review" className="absolute inset-0" {...PAGE_TRANSITION}>
              <ReviewScreen
                answers={answers}
                score={score}
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
