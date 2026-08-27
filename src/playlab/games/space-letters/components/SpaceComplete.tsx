"use client";

import { AlphabetFinale } from "@shared/components/game/AlphabetFinale";
import { SpaceBackdrop } from "@games/space-letters/components/SpaceScreens";
import { useSpaceStore } from "@games/space-letters/store/spaceStore";
import { clipText } from "@shared/audio/voice";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

interface SpaceCompleteProps {
  onExitPortal?: () => void;
}

/**
 * All 26 letters built — the finale for whichever CASE the child was
 * playing. Finishing the BIG letters leaves the small letters still to do
 * (and their own finale still to earn), exactly as jungle-spy handles it.
 */
export function SpaceComplete({ onExitPortal }: SpaceCompleteProps) {
  const { letterCase, resetProgress, beginRun, setScreen } = useSpaceStore();
  const lower = letterCase === "lower";

  const playAgain = () => {
    resetProgress(letterCase); // only the case just finished starts over
    beginRun(0, "fresh");
    setScreen("grid");
  };

  return (
    <AlphabetFinale
      symbols={lower ? LOWER : UPPER}
      headline={clipText("cheer-you-did-it")}
      subline={lower ? "You built all 26 small letters!" : "You built all 26 BIG letters!"}
      clipId="cheer-you-did-it"
      backdrop={<SpaceBackdrop />}
      rootClassName="spl-screen"
      headlineClassName="spl-finale-heading text-white"
      sublineClassName="text-white/80"
      tileClassName="bg-space"
      primaryClassName="bg-space"
      onPlayAgain={playAgain}
      playAgainLabel={lower ? "Play small letters again" : "Play BIG letters again"}
      onExitPortal={onExitPortal}
    />
  );
}
