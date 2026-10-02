"use client";

import type { ReactNode } from "react";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { Teacher } from "@games/door-count/components/Teacher";
import { Picture } from "@games/blend-read/components/PictureArt";
import { Pond } from "@games/pond-numbers/components/PondArt";
import { ROUND_COUNT } from "@games/pond-numbers/constants/rounds";

/**
 * The frame every round plays in — identical for both modules, so the child
 * learns one layout: the pond, the teacher on the bank with the prompt in his
 * bubble, the round's picture in the middle, the number tiles on the dock,
 * and the chrome (Back to the title top-left, Back to Games top-right, a row
 * of six stars that fill in round by round).
 */
export function PnStage({
  round,
  say,
  cheer,
  onHome,
  onExitPortal,
  children,
  tiles,
}: {
  round: number;
  say: string;
  cheer: boolean;
  onHome: () => void;
  onExitPortal: () => void;
  /** The round's picture: the dot card, or the log of frogs. */
  children: ReactNode;
  tiles: ReactNode;
}) {
  return (
    <div className="pn-screen pn-play">
      <Pond />

      <div className="pn-teacher-slot" aria-hidden="true">
        <Teacher cheer={cheer} say={say} />
      </div>

      <div className="pn-main">{children}</div>
      {tiles}

      <div
        className="pn-trail"
        role="img"
        aria-label={`Round ${Math.min(round + 1, ROUND_COUNT)} of ${ROUND_COUNT}`}
      >
        {Array.from({ length: ROUND_COUNT }, (_, i) => (
          <span
            key={i}
            className={`pn-trail-item ${i < round ? "is-done" : i === round ? "is-now" : ""}`}
          >
            <Picture id="star" />
          </span>
        ))}
      </div>

      <p className="pn-sr" aria-live="polite">
        {say}
      </p>

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Pond Numbers title screen"
        tone="jungle"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onHome();
        }}
      />
      <button
        type="button"
        className="pn-leave pl-exit-pill font-rounded font-black"
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
