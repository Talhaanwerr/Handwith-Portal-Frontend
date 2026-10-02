"use client";

import type { ReactNode } from "react";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { Teacher } from "@games/door-count/components/Teacher";
import { Picture } from "@games/blend-read/components/PictureArt";
import { CheeseBlock, Kitchen } from "@games/find-the-mouse/components/SceneArt";
import { ROUND_COUNT } from "@games/find-the-mouse/constants/scene";

/**
 * The frame both modes play in: the kitchen, the teacher at the left giving
 * the prompt in his speech bubble (and jumping when the child gets it), the
 * cheese block with the round's burrows on it, and the chrome — Back (to the
 * title screen, the game's home) top-left, Back to Games top-right, and a
 * trail of six cheeses across the top that fills in round by round.
 */
export function FtmStage({
  mode,
  round,
  say,
  cheer,
  onHome,
  onExitPortal,
  children,
  footer,
}: {
  /** Count mode lifts the cheese to make room for the number tiles. */
  mode: "peek" | "count";
  round: number;
  /** The teacher's line. */
  say: string;
  /** The teacher is jumping for joy. */
  cheer: boolean;
  onHome: () => void;
  onExitPortal: () => void;
  /** The burrows, laid over the cheese's front face. */
  children: ReactNode;
  /** Anything that sits on the counter in front of the cheese (number tiles). */
  footer?: ReactNode;
}) {
  return (
    <div className={`ftm-screen ftm-mode-${mode}`}>
      <Kitchen />

      <div className="ftm-teacher-slot" aria-hidden="true">
        <Teacher cheer={cheer} say={say} />
      </div>

      <CheeseBlock>{children}</CheeseBlock>

      {footer}

      <div
        className="ftm-trail"
        role="img"
        aria-label={`Round ${Math.min(round + 1, ROUND_COUNT)} of ${ROUND_COUNT}`}
      >
        {Array.from({ length: ROUND_COUNT }, (_, i) => (
          <span
            key={i}
            className={`ftm-trail-item ${i < round ? "is-done" : i === round ? "is-now" : ""}`}
          >
            <Picture id="cheese" />
          </span>
        ))}
      </div>

      {/* the live prompt, for screen readers — the bubble is decoration */}
      <p className="ftm-sr" aria-live="polite">
        {say}
      </p>

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Where Is the Mouse title screen"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onHome();
        }}
      />
      <button
        type="button"
        className="ftm-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>
    </div>
  );
}
