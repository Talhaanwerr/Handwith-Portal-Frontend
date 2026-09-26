"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useBlendReadStore, type BRScreen } from "@games/blend-read/store/blendReadStore";
import { LEVELS, questionCount } from "@games/blend-read/constants/levels";
import { TitleScreen } from "@games/blend-read/components/TitleScreen";
import { InstructionsModal } from "@games/blend-read/components/InstructionsModal";
import { LevelMenu } from "@games/blend-read/components/LevelMenu";
import { PlayScreen } from "@games/blend-read/components/PlayScreen";
import { CompleteModal } from "@games/blend-read/components/CompleteModal";

/** Three history buckets — title, level menu, play — the grain
 *  `useScreenHistorySync` itself recommends; "complete" collapses into
 *  "play" so the well-done screen never earns its own back-stack entry. */
function toBucket(screen: BRScreen): "splash" | "menu" | "play" {
  if (screen === "splash") return "splash";
  if (screen === "menu") return "menu";
  return "play";
}

/**
 * BLEND & SEEK.
 *
 * A word-to-picture matching game: a target word, its phoneme markers, and a
 * grid of eight pictures with exactly one right answer. The core loop —
 * phoneme sound, wrong picture stays crossed out, right picture holds then
 * clears, next word — lives entirely in `PhonicsQuestion`; everything here is
 * the screen router around it (title, instructions, level menu, the question
 * itself, and "Well Done!"), the same split Key Quest uses for its doors.
 *
 * Five levels, easiest to hardest — see constants/levels.ts.
 */
export function BlendReadGame() {
  const router = useRouter();
  const {
    screen,
    levelId,
    progress,
    seenInstructions,
    setScreen,
    markInstructionsSeen,
    openLevel,
    nextQuestion,
    restartLevel,
  } = useBlendReadStore();

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "splash") setScreen("splash");
      else if (bucket === "menu") setScreen("menu");
      else setScreen("play");
    },
    [setScreen]
  );

  // STABLE, because the title screen's auto-advance timer re-arms whenever
  // this changes: an inline arrow restarted the wait (and said the title
  // again) on every render of the game
  const toMenu = useCallback(() => setScreen("menu"), [setScreen]);

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
  });

  const level = LEVELS[levelId];
  const total = questionCount(levelId);
  const index = Math.min(progress[levelId], total - 1);
  const question = level.questions[index];

  return (
    <GameStage>
      <div className="br-root">
        <AnimatePresence mode="wait" initial={false}>
          {screen === "splash" && (
            <motion.div key="splash" className="br-screen-wrap" {...PAGE_TRANSITION}>
              <TitleScreen onPlay={toMenu} />
            </motion.div>
          )}

          {screen === "menu" && (
            <motion.div key="menu" className="br-screen-wrap" {...PAGE_TRANSITION}>
              <LevelMenu
                progress={progress}
                onBack={() => router.push(PORTAL_ROUTE)}
                onPick={(id) => openLevel(id)}
              />
            </motion.div>
          )}

          {screen === "play" && (
            <motion.div key="play" className="br-screen-wrap" {...PAGE_TRANSITION}>
              <PlayScreen
                question={question}
                questionNumber={index + 1}
                total={total}
                onBack={() => setScreen("menu")}
                onCorrect={nextQuestion}
              />
            </motion.div>
          )}

          {screen === "complete" && (
            <motion.div key="complete" className="br-screen-wrap" {...PAGE_TRANSITION}>
              <CompleteModal
                onHome={() => setScreen("menu")}
                onReplay={() => restartLevel(levelId)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!seenInstructions && screen === "menu" && (
          <InstructionsModal onClose={markInstructionsSeen} />
        )}
      </div>
    </GameStage>
  );
}
