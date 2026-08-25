"use client";

import { AlphabetFinale } from "@shared/components/game/AlphabetFinale";
import { OceanWorld } from "@games/ocean-abc/components/OceanScreens";
import { FriendlyShark } from "@games/feed-the-shark/components/SharkArt";
import { useOceanStore } from "@games/ocean-abc/store/oceanStore";
import { clipText } from "@shared/audio/voice";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

interface OceanCompleteProps {
  onExitPortal?: () => void;
}

/**
 * All 26 letters built, popped and written — the finale for whichever CASE
 * the child was playing. Finishing the BIG letters leaves the small ones
 * still to earn their own finale, as every alphabet game here does.
 */
export function OceanComplete({ onExitPortal }: OceanCompleteProps) {
  const { letterCase, resetProgress, beginRun, setScreen } = useOceanStore();
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
      subline={lower ? "You finished all 26 small letters!" : "You finished all 26 BIG letters!"}
      clipId="cheer-you-did-it"
      backdrop={<OceanWorld />}
      mascot={
        <div className="oab-finale-mascot">
          <FriendlyShark />
        </div>
      }
      rootClassName="oab-screen"
      headlineClassName="oab-finale-heading text-white"
      sublineClassName="text-white/80"
      tileClassName="bg-ocean"
      primaryClassName="bg-ocean"
      onPlayAgain={playAgain}
      playAgainLabel={lower ? "Play small letters again" : "Play BIG letters again"}
      onExitPortal={onExitPortal}
    />
  );
}
