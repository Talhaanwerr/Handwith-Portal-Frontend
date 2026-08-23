"use client";

import { ModeSelect } from "@shared/components/game/ModeSelect";
import { useHuntStore, type HuntMode } from "@games/letter-hunt/store/huntStore";
import { playClickSound } from "@shared/audio/sfx";

/**
 * Letter Hunt's Free / 5 Star picker — the SAME screen component the tracing
 * game uses, so the two games read as one ecosystem rather than two takes on
 * the same idea. Only the wash, the card colours and the two sub-labels differ.
 *
 * What the modes mean here mirrors tracing exactly: one repetition versus five.
 * The BOARD is unchanged in both — five copies of the target letter are always
 * hidden among the decoys; the mode only decides how many the child is asked
 * to find before the round is banked.
 */
export function HuntModeSelect() {
  const setMode = useHuntStore((s) => s.setMode);
  const setScreen = useHuntStore((s) => s.setScreen);

  const choose = (mode: HuntMode) => {
    playClickSound();
    setMode(mode);
    setScreen("level");
  };

  return (
    <ModeSelect
      onSelect={choose}
      washClassName="bg-wash-lavender-sky"
      freeCardClassName="hunt-mode-card hunt-mode-card--free"
      starCardClassName="hunt-mode-card hunt-mode-card--star"
      freeSubtitle="Find the letter once"
      starSubtitle="Find all five"
      freeAriaLabel="Free mode — find the letter once"
      starAriaLabel="Five star mode — find all five copies of the letter"
    />
  );
}
