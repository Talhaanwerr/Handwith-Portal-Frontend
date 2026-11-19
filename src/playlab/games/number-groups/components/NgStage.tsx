"use client";

import { memo, type ReactNode, type RefObject } from "react";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { GuideBar } from "@shared/components/game/GuideBar";
import { NgGuide } from "@games/number-groups/components/NgGuide";
import { useGuided, useRoundCount } from "@games/number-groups/components/NgGuided";
import { Picture } from "@games/blend-read/components/PictureArt";

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
  // the guided layout: the instruction goes in the thin bar beside the stars
  const guided = useGuided();
  return (
    <div ref={stageRef} className={`ng-screen ng-play ${playClass}`}>
      {world}
      <StageTeacher solved={solved} say={say} />
      <div className="ng-main">{children}</div>
      {overlay}
      {guided ? (
        <StageGuideBar round={round} solved={solved} say={say} />
      ) : (
        <>
          <StageTrail round={round} solved={solved} />
          <p className="ng-sr" aria-live="polite">
            {say}
          </p>
        </>
      )}
      <StageNav title={title} onHome={onHome} onExitPortal={onExitPortal} />
    </div>
  );
}

const StageTeacher = memo(function StageTeacher({ solved, say }: { solved: boolean; say: string }) {
  return (
    <div className="ng-teacher-slot" aria-hidden="true">
      <NgGuide cheer={solved} say={say} />
    </div>
  );
});

/** A star a round (four, or the game's `roundCount`): done, the one being
 *  played, still to come. */
function trailStars(round: number, solved: boolean, count: number) {
  return Array.from({ length: count }, (_, i) => (
    <span
      key={i}
      className={`ng-trail-item ${
        i < round || (i === round && solved) ? "is-done" : i === round ? "is-now" : ""
      }`}
    >
      <Picture id="star" />
    </span>
  ));
}

const StageTrail = memo(function StageTrail({ round, solved }: { round: number; solved: boolean }) {
  const count = useRoundCount();
  return (
    <div
      className="ng-trail"
      role="img"
      aria-label={`Round ${Math.min(round + 1, count)} of ${count}`}
    >
      {trailStars(round, solved, count)}
    </div>
  );
});

/** The guided layout's top bar: the stars and the line being said. */
const StageGuideBar = memo(function StageGuideBar({
  round,
  solved,
  say,
}: {
  round: number;
  solved: boolean;
  say: string;
}) {
  const count = useRoundCount();
  return <GuideBar text={say}>{trailStars(round, solved, count)}</GuideBar>;
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
