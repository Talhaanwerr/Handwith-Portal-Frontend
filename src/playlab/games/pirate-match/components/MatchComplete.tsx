"use client";

import { AlphabetFinale } from "@shared/components/game/AlphabetFinale";
import { PirateWorld } from "@games/pirate-match/components/MatchScreens";
import { PirateParrot } from "@shared/components/pirate/PirateMapAndParrot";
import { useMatchStore } from "@games/pirate-match/store/matchStore";
import { clipText } from "@shared/audio/voice";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

interface MatchCompleteProps {
  onExitPortal?: () => void;
}

/** All 26 letters matched to their treasures — the finale for the case just
 *  played, cheered by the celebrating parrot. The other case still has its
 *  own alphabet to earn. */
export function MatchComplete({ onExitPortal }: MatchCompleteProps) {
  const { letterCase, resetProgress, beginRun, setScreen } = useMatchStore();
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
      subline={lower ? "You matched all 26 small letters!" : "You matched all 26 BIG letters!"}
      clipId="cheer-you-did-it"
      backdrop={<PirateWorld />}
      mascot={
        <div className="pm-finale-mascot">
          <PirateParrot mood="celebrating" />
        </div>
      }
      rootClassName="pm-screen pp-world"
      headlineClassName="pm-finale-heading text-white"
      sublineClassName="text-white/85"
      tileClassName="bg-pirate-gold"
      primaryClassName="bg-pirate"
      onPlayAgain={playAgain}
      playAgainLabel={lower ? "Match small letters again" : "Match BIG letters again"}
      onExitPortal={onExitPortal}
    />
  );
}
