"use client";

import { memo, type ReactNode, type RefObject } from "react";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { Teacher } from "@games/door-count/components/Teacher";
import { Picture } from "@games/blend-read/components/PictureArt";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";

/**
 * The frame every round of both games plays in — Pond Numbers' chrome, the
 * same in every module so the child learns one layout: the module's world
 * behind, the teacher bottom-left with the prompt in his bubble, the board
 * filling the rest, a trail of four stars along the top, Back (to the game's
 * title screen) top-left and Back to Games top-right.
 *
 * The chrome is split into memoised parts so a placement or a burst, which
 * re-renders the round, repaints only what changed.
 */
export function NgStage({
  stageRef,
  playClass,
  world,
  round,
  solved,
  say,
  title,
  onHome,
  onExitPortal,
  children,
  overlay,
}: {
  /** The board's root — drags and bursts are measured against it. */
  stageRef?: RefObject<HTMLDivElement | null>;
  /** The module's own class (its sizes), e.g. `ng-play--cards`. */
  playClass: string;
  world: ReactNode;
  round: number;
  /** The round is won: the teacher jumps and its star fills in. */
  solved: boolean;
  say: string;
  /** The game's name, for the Back pill's label. */
  title: string;
  onHome: () => void;
  onExitPortal: () => void;
  children: ReactNode;
  /** Drawn over everything, in stage coordinates: bursts, the cheer, the
   *  thing under the finger. */
  overlay?: ReactNode;
}) {
  return (
    <div ref={stageRef} className={`ng-screen ng-play ${playClass}`}>
      {world}
      <StageTeacher solved={solved} say={say} />
      <div className="ng-main">{children}</div>
      {overlay}
      <StageTrail round={round} solved={solved} />
      <p className="ng-sr" aria-live="polite">
        {say}
      </p>
      <StageNav title={title} onHome={onHome} onExitPortal={onExitPortal} />
    </div>
  );
}

const StageTeacher = memo(function StageTeacher({ solved, say }: { solved: boolean; say: string }) {
  return (
    <div className="ng-teacher-slot" aria-hidden="true">
      <Teacher cheer={solved} say={say} />
    </div>
  );
});

const StageTrail = memo(function StageTrail({ round, solved }: { round: number; solved: boolean }) {
  return (
    <div
      className="ng-trail"
      role="img"
      aria-label={`Round ${Math.min(round + 1, ROUND_COUNT)} of ${ROUND_COUNT}`}
    >
      {Array.from({ length: ROUND_COUNT }, (_, i) => (
        <span
          key={i}
          className={`ng-trail-item ${
            i < round || (i === round && solved) ? "is-done" : i === round ? "is-now" : ""
          }`}
        >
          <Picture id="star" />
        </span>
      ))}
    </div>
  );
});

const StageNav = memo(function StageNav({
  title,
  onHome,
  onExitPortal,
}: {
  title: string;
  onHome: () => void;
  onExitPortal: () => void;
}) {
  return (
    <>
      <NavPillButton
        label="Back"
        ariaLabel={`Back to the ${title} title screen`}
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
        className="ng-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>
    </>
  );
});
