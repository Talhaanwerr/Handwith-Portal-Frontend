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
import { ROUNDS, TOTAL_ROUNDS, answerOf, starsFor } from "@games/sound-show/constants/rounds";
import { RoundScreen } from "@games/sound-show/components/RoundScreen";

const useSoundShowStore = createShowStore("sound-show-progress", TOTAL_ROUNDS);

/** Three letters and their pictures on the title screen; six rain at the end. */
const SHOWCASE = ROUNDS.slice(0, 3).map((r) => ({ word: answerOf(r), letter: r.letter }));
const RAIN = ROUNDS.slice(0, 6).map(answerOf);

/** Coarse history buckets, so Back walks the game the way a child walked in. */
function toBucket(screen: ShowScreen): "menu" | "play" {
  return screen === "splash" ? "menu" : "play";
}

/**
 * SOUND SHOW — Level 1 Phonics, the toddlers' show on Phonics Game Show's
 * stage. A big letter on the lit sign, its sound said slowly twice, then two
 * or three pictures: tap the one that starts with that sound.
 *
 * Everything but the round is Phonics Game Show's — the studio, the sign,
 * the title screen with the host, the finish card and the run's store — and
 * every line is an existing recording (the letter sounds, Candy ABC's "Find
 * something that starts with…", the word clips and the cheers).
 */
export function SoundShowGame() {
  const router = useRouter();
  const { gate } = useHowToPlay();
  const { screen, index, firstTry, best, setScreen, start, solved } = useSoundShowStore();

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
      <div className="pgs-root snd-root">
        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
              <ShowSplash
                title="Sound Show"
                level="Level 1 Phonics"
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
              <RoundScreen
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
