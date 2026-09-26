"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { stopVoice } from "@shared/audio/voice";
import { TreatSplash } from "@games/letter-treats/components/TreatScreens";
import { AlphabetSetScreen } from "@games/letter-treats/components/AlphabetSetScreen";
import { LetterScreen } from "@games/letter-treats/components/LetterScreen";
import { ChallengeScreen } from "@games/letter-treats/components/ChallengeScreen";
import { useTreatsStore, type TreatScreen } from "@games/letter-treats/store/treatsStore";

/**
 * CANDY ABC - navigation model. One stack, Back = immediate logical parent.
 *
 *   PlayLab Games
 *     └ Alphabet Set             bucket "letters"  (splash auto-advances here)
 *         └ Letter               bucket "play"
 *             └ Challenge        bucket "challenge"
 *
 * Each bucket is a real browser-history entry (useScreenHistorySync), so the
 * in-game Back pills pop history and let the URL sync land on the parent:
 * browser Back and on-screen Back are the same thing. Letter-to-letter
 * changes stay inside "play" and never push. From the alphabet, Back is
 * "Back to Games" - a push to PORTAL_ROUTE that leaves the game.
 */
type Bucket = "letters" | "play" | "challenge";
const RANK: Record<Bucket, number> = { letters: 0, play: 1, challenge: 2 };

function toBucket(screen: TreatScreen): Bucket {
  if (screen === "letter") return "play";
  if (screen === "challenge") return "challenge";
  return "letters";
}

function screenFor(bucket: string): TreatScreen | null {
  if (bucket === "letters") return "alphabet-set";
  if (bucket === "play") return "letter";
  if (bucket === "challenge") return "challenge";
  return null;
}

const PARENT: Partial<Record<TreatScreen, TreatScreen>> = {
  letter: "alphabet-set",
  challenge: "letter",
};

export function LetterTreatsGame() {
  const router = useRouter();
  const { screen, currentLetter, setScreen } = useTreatsStore();
  /** Our own history entries above the one we entered on. At 0 (refresh /
   *  direct entry on a deep step) a history pop would leave the game, so Back
   *  falls back to a plain screen change. */
  const depthRef = useRef(0);
  const lastBucketRef = useRef<Bucket>(toBucket(screen));
  const pendingLetterRef = useRef<string | null>(null);
  const bucket = toBucket(screen);

  // Browser speech is off portal-wide now (voice.ts); only the stop is left.
  useEffect(() => () => stopVoice(), []);

  const handlePop = useCallback(
    (popped: string) => {
      stopVoice();
      if (popped === "play" && pendingLetterRef.current) {
        const letter = pendingLetterRef.current;
        pendingLetterRef.current = null;
        useTreatsStore.getState().openLetter(letter);
        return;
      }
      const next = screenFor(popped);
      if (next && next !== useTreatsStore.getState().screen) setScreen(next);
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: bucket,
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
  });

  useEffect(() => {
    const prev = lastBucketRef.current;
    if (bucket === prev) return;
    depthRef.current = Math.max(0, depthRef.current + (RANK[bucket] > RANK[prev] ? 1 : -1));
    lastBucketRef.current = bucket;
  }, [bucket]);

  /** Retreat to `target` through history when we own those entries, else by
   *  a plain screen change. */
  const retreatTo = useCallback(
    (target: TreatScreen) => {
      stopVoice();
      const from = useTreatsStore.getState().screen;
      const levels = RANK[toBucket(from)] - RANK[toBucket(target)];
      if (levels > 0 && depthRef.current >= levels) window.history.go(-levels);
      else setScreen(target);
    },
    [setScreen]
  );

  const goBack = useCallback(() => {
    const parent = PARENT[useTreatsStore.getState().screen];
    if (parent) retreatTo(parent);
  }, [retreatTo]);

  /** Challenge done -> next letter: pop to the letter level and swap the
   *  letter as we land, keeping exactly one "play" entry in the stack. */
  const goNextLetter = useCallback((letter: string) => {
    stopVoice();
    if (depthRef.current >= 1) {
      pendingLetterRef.current = letter;
      window.history.back();
    } else {
      useTreatsStore.getState().openLetter(letter);
    }
  }, []);

  const exitPortal = useCallback(() => {
    stopVoice();
    router.push(PORTAL_ROUTE);
  }, [router]);

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <TreatSplash />
          </motion.div>
        )}
        {screen === "alphabet-set" && (
          <motion.div key="alphabet-set" className="absolute inset-0" {...PAGE_TRANSITION}>
            <AlphabetSetScreen onExitPortal={exitPortal} />
          </motion.div>
        )}
        {screen === "letter" && (
          <motion.div
            key={`letter-${currentLetter}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            {/* keyed by letter: a new letter is a fresh screen */}
            <LetterScreen
              letter={currentLetter}
              onBack={goBack}
              onPlay={() => setScreen("challenge")}
            />
          </motion.div>
        )}
        {screen === "challenge" && (
          <motion.div
            key={`challenge-${currentLetter}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            <ChallengeScreen
              letter={currentLetter}
              onBack={goBack}
              onNextLetter={goNextLetter}
              onLetters={() => retreatTo("alphabet-set")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
