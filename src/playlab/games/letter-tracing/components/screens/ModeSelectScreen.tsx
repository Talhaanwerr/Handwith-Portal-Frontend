"use client";

import { ModeSelect } from "@shared/components/game/ModeSelect";
import type { PracticeMode } from "@games/letter-tracing/types";

interface ModeSelectScreenProps {
  onSelect: (mode: PracticeMode) => void;
}

/**
 * Thin wrapper over the shared Free / 5 Star picker.
 *
 * The screen itself now lives in @shared/components/game/ModeSelect so Letter
 * Hunt can offer the identical flow without a second copy of it. Everything
 * this game used to render — the wash, the card borders, the copy — is passed
 * through unchanged, so the screen looks exactly as it did before.
 */
export function ModeSelectScreen({ onSelect }: ModeSelectScreenProps) {
  return (
    <ModeSelect
      onSelect={onSelect}
      washClassName="bg-wash-lavender-sky"
      freeCardClassName="lt-mode-card lt-mode-card--free"
      starCardClassName="lt-mode-card lt-mode-card--star"
      freeSubtitle="Trace each letter once"
      starSubtitle="Practice five times"
      freeAriaLabel="Free mode — trace each letter once"
      starAriaLabel="Five star mode — practice each letter five times"
    />
  );
}
