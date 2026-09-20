"use client";

import { useRouter } from "next/navigation";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";

import { useGameStore } from "@games/letter-tracing/store/gameStore";
import type { GameScreen } from "@games/letter-tracing/types";
import { LETTER_DATA } from "@games/letter-tracing/constants/letterData";
import { LOWERCASE_LETTER_DATA } from "@games/letter-tracing/constants/lowercaseLetterData";
import { NUMBER_DATA } from "@games/letter-tracing/constants/numberData";

import { SplashScreen } from "@games/letter-tracing/components/screens/SplashScreen";
import { MainMenuScreen } from "@games/letter-tracing/components/screens/MainMenuScreen";
import { HomeScreen } from "@games/letter-tracing/components/screens/HomeScreen";
import { ModeSelectScreen } from "@games/letter-tracing/components/screens/ModeSelectScreen";
import { TracingScreen } from "@games/letter-tracing/components/screens/TracingScreen";
import { CelebrationScreen } from "@games/letter-tracing/components/screens/CelebrationScreen";
import { CompletionScreen } from "@games/letter-tracing/components/screens/CompletionScreen";
import { LetterSequencingScreen } from "@games/letter-tracing/components/screens/LetterSequencingScreen";

/**
 * Coarse history bucket for the tracing game's larger screen graph:
 *   entry  — splash
 *   menu   — main-menu, home (the letter/number shelf — browsing, not play)
 *   mode-select shares "menu": like Letter Hunt, it is a gate the child passes
 *   THROUGH, not a screen they retreat to — Back from tracing goes to the menu.
 *   play   — tracing, celebration, sequencing, completion (gameplay itself;
 *            collapsed together deliberately — a 26-letter session would
 *            otherwise leave 26+ stacked history entries)
 */
function toBucket(screen: GameScreen): "entry" | "menu" | "play" {
  if (screen === "splash") return "entry";
  if (screen === "main-menu" || screen === "home" || screen === "mode-select") return "menu";
  return "play"; // tracing, celebration, sequencing, completion
}

export function LetterTracingGame() {
  const router = useRouter();
  const {
    screen,
    module,
    practiceMode,
    setScreen,
    setModule,
    setPracticeMode,
    progress,
    lowercaseProgress,
    completeCurrentLetter,
    beginRun,
    jumpTo,
    advance,
  } = useGameStore();

  const { numbersProgress } = useGameStore();
  const currentProgress =
    module === "lowercase" ? lowercaseProgress : module === "numbers" ? numbersProgress : progress;
  const letterData =
    module === "lowercase"
      ? LOWERCASE_LETTER_DATA
      : module === "numbers"
        ? NUMBER_DATA
        : LETTER_DATA;
  const currentLetter = letterData[currentProgress.currentLetterIndex];

  // Handle splash → main-menu transition
  // Back button: step backward through entry → menu → mode → play instead
  // of exiting straight to the portal. Popping to "menu" always resolves to
  // main-menu specifically (a safe, always-valid landing spot) rather than
  // trying to reconstruct whether "home" was showing — simple and correct
  // for the common case of retreating out of gameplay.
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("main-menu");
      // "entry" pops have no reconstruction to do — entry is only ever the
      // initial state. A popped "play" IS restored when a session run
      // exists (tracing is the right screen for any letter mid-run); with
      // no run (a stale ?step=play URL on a fresh mount — the session
      // queue is never persisted) it lands on the menu so Back is never
      // stuck showing a screen the URL disagrees with.
      else if (bucket === "play") {
        const st = useGameStore.getState();
        setScreen(st.run ? "tracing" : "main-menu");
      }
    },
    [setScreen]
  );
  useGameSession({ screen, step: toBucket(screen), onHistoryPop: handlePop });

  const handleSplashComplete = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Main menu → module home
  const handleSelectModule = useCallback(
    (selectedModule: typeof module) => {
      setModule(selectedModule);
      if (selectedModule === "sequencing") {
        setScreen("sequencing");
      } else {
        setScreen("home");
      }
    },
    [setModule, setScreen]
  );

  // A practice mode must be chosen once per session before the first letter
  const enterTracing = useCallback(() => {
    setScreen(practiceMode ? "tracing" : "mode-select");
  }, [setScreen, practiceMode]);

  // Home → tracing (via mode-select the first time in a session)
  // CONTINUE — a run of only the letters still outstanding.
  const handleContinue = useCallback(() => {
    if (currentProgress.completedLetters.length >= letterData.length) {
      setScreen("completion");
      return;
    }
    beginRun(0, "continue");
    enterTracing();
  }, [
    setScreen,
    currentProgress.completedLetters.length,
    letterData.length,
    enterTracing,
    beginRun,
  ]);

  // Home → start from beginning
  // START FROM A — a FRESH run: every letter from the top, completed or not.
  //
  // This used to call resetProgress(), which wiped the child's saved record to
  // fake the behaviour. Replaying the alphabet must not cost them their 26/26,
  // so the run simply ignores completion instead of deleting it.
  const handleStartFromA = useCallback(() => {
    beginRun(0, "fresh");
    enterTracing();
  }, [beginRun, enterTracing]);

  // Home → the child taps ANY letter on the alphabet shelf
  const handleSelectLetter = useCallback(
    (index: number) => {
      jumpTo(letterData[index]?.letter ?? "");
      enterTracing();
    },
    [jumpTo, letterData, enterTracing]
  );

  // Mode select → tracing (mode remembered for the rest of the session)
  const handleModeSelected = useCallback(
    (mode: NonNullable<typeof practiceMode>) => {
      setPracticeMode(mode);
      setScreen("tracing");
    },
    [setPracticeMode, setScreen]
  );

  // Tracing complete (once in Free Mode, five stars in 5 Star Mode) → celebration
  const handleTracingComplete = useCallback(() => {
    completeCurrentLetter();
    setScreen("celebration");
  }, [setScreen, completeCurrentLetter]);

  // Home button during gameplay → main menu
  const handleGoHome = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Celebration → AGAIN: replay the current letter (stars reset via remount)
  const handleAgain = useCallback(() => {
    setScreen("tracing");
  }, [setScreen]);

  // Celebration → NEXT: advance to the next letter (or completion)
  // Walk the RUN, not the completion list — a fresh run intentionally holds
  // letters the child has already finished.
  const handleNext = useCallback(() => {
    if (advance()) setScreen("tracing");
    else setScreen("completion");
  }, [advance, setScreen]);

  // Completion → main menu
  const handlePlayAgain = useCallback(() => {
    setScreen("main-menu");
  }, [setScreen]);

  // Safety guard — ensure currentLetter exists for screens that need it
  const needsLetter =
    screen !== "splash" &&
    screen !== "main-menu" &&
    screen !== "home" &&
    screen !== "mode-select" &&
    screen !== "completion" &&
    screen !== "sequencing";

  if (!currentLetter && needsLetter) {
    return (
      <div className="bg-lavender flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-rounded text-plum text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    // The orientation hint mounts inside the tracing/sequencing screens (where
    // the extra width matters), not at the stage level like the other games.
    <GameStage withRotatePrompt={false}>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}

        {screen === "main-menu" && (
          <motion.div key="main-menu" className="absolute inset-0" {...PAGE_TRANSITION}>
            <MainMenuScreen
              onExitPortal={() => router.push(PORTAL_ROUTE)}
              onSelectModule={handleSelectModule}
            />
          </motion.div>
        )}

        {screen === "home" && (
          <motion.div key="home" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HomeScreen
              onContinue={handleContinue}
              onStartFromA={handleStartFromA}
              onSelectLetter={handleSelectLetter}
              onBack={handleGoHome}
            />
          </motion.div>
        )}

        {screen === "mode-select" && (
          <motion.div key="mode-select" className="absolute inset-0" {...PAGE_TRANSITION}>
            <ModeSelectScreen onSelect={handleModeSelected} />
          </motion.div>
        )}

        {screen === "tracing" && currentLetter && (
          <motion.div
            key={`tracing-${currentLetter.letter}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <TracingScreen
              letter={currentLetter}
              mode={practiceMode ?? "five-star"}
              onComplete={handleTracingComplete}
              onHome={handleGoHome}
            />
          </motion.div>
        )}

        {screen === "celebration" && currentLetter && (
          <motion.div
            key={`celebration-${currentLetter.letter}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <CelebrationScreen
              letter={currentLetter.letter}
              onAgain={handleAgain}
              onNext={handleNext}
            />
          </motion.div>
        )}

        {screen === "completion" && (
          <motion.div key="completion" className="absolute inset-0" {...PAGE_TRANSITION}>
            <CompletionScreen onPlayAgain={handlePlayAgain} />
          </motion.div>
        )}

        {screen === "sequencing" && (
          <motion.div key="sequencing" className="absolute inset-0" {...PAGE_TRANSITION}>
            <LetterSequencingScreen onHome={handleGoHome} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
