"use client";

import { AlphabetFinale } from "@shared/components/game/AlphabetFinale";
import { HuntWorld } from "@games/ocean-hunt/components/HuntScreens";
import { FriendlyShark } from "@games/feed-the-shark/components/SharkArt";
import { useHuntStore } from "@games/ocean-hunt/store/huntStore";
import { clipText } from "@shared/audio/voice";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

interface HuntCompleteProps {
  onExitPortal?: () => void;
}

/** Every missing letter found — the finale for the case just played; the
 *  other case still has its own alphabet to earn. */
export function HuntComplete({ onExitPortal }: HuntCompleteProps) {
  const { letterCase, resetProgress, beginRun, setScreen } = useHuntStore();
  const lower = letterCase === "lower";

  const playAgain = () => {
    resetProgress(letterCase); // only the case just finished starts over
    beginRun(0, "fresh");
    setScreen("level");
  };

  return (
    <AlphabetFinale
      symbols={lower ? LOWER : UPPER}
      headline={clipText("cheer-you-did-it")}
      subline={lower ? "You found all 26 small letters!" : "You found all 26 BIG letters!"}
      clipId="cheer-you-did-it"
      backdrop={<HuntWorld />}
      mascot={
        <div className="oh-finale-mascot">
          <FriendlyShark />
        </div>
      }
      rootClassName="oh-screen"
      headlineClassName="oh-finale-heading text-white"
      sublineClassName="text-white/80"
      tileClassName="bg-ocean"
      primaryClassName="bg-ocean"
      onPlayAgain={playAgain}
      playAgainLabel={lower ? "Hunt small letters again" : "Hunt BIG letters again"}
      onExitPortal={onExitPortal}
    />
  );
}
