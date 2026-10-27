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
import { createShowStore, type ShowScreen } from "@games/phonics-show/store/showStore";
import { ShowDone, ShowSplash } from "@games/phonics-show/components/ShowScreens";
import { ROUNDS, TOTAL_ROUNDS, starsFor } from "@games/odd-sound/constants/rounds";
import { OddRound } from "@games/odd-sound/components/OddRound";

const useOddSoundStore = createShowStore("odd-sound-progress", TOTAL_ROUNDS);

/** The first round on the title screen (two b's and the odd c); pictures rain at the end. */
const SHOWCASE = ROUNDS[0].pictures.slice(0, 3).map((word) => ({ word, letter: word[0] }));
const RAIN = ROUNDS.slice(0, 3).flatMap((r) => r.pictures.slice(0, 2));

/** Coarse history buckets, so Back walks the game the way a child walked in. */
function toBucket(screen: ShowScreen): "menu" | "play" {
  return screen === "splash" ? "menu" : "play";
}

/**
 * ODD SOUND OUT — Level 3 Phonics, the hardest show on Phonics Game Show's
 * stage. Four pictures are named one by one; three start with the same
 * sound. Tap the odd one out.
 *
 * The studio, the lit sign, the title screen with the host, the finish card
 * and the run's store are Phonics Game Show's; the voice is the portal's word
 * clips and letter sounds, plus one new line (the ask).
 */
export function OddSoundGame() {
  const router = useRouter();
  const { gate } = useHowToPlay();
  const { screen, index, firstTry, best, setScreen, start, solved } = useOddSoundStore();

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else setScreen(index >= TOTAL_ROUNDS ? "done" : "play");
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
      {/* `pgs-root`: the stage's container and its shared screen styles */}
      <div className="pgs-root odd-root">
        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
              <ShowSplash
                title="Odd Sound Out"
                level="Level 3 Phonics"
                showcase={SHOWCASE}
                best={best}
                total={TOTAL_ROUNDS}
                onStart={() => gate(start)}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "play" && index < TOTAL_ROUNDS && (
            <motion.div key="play" className="absolute inset-0" {...PAGE_TRANSITION}>
              <OddRound
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
                total={TOTAL_ROUNDS}
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
