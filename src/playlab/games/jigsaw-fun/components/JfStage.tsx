"use client";

import { memo } from "react";
import { playClickSound } from "@shared/audio/sfx";
import { Picture } from "@games/blend-read/components/PictureArt";

/**
 * The playroom: a wall papered with faint puzzle pieces, a wooden table along
 * the bottom, and — where there is room to see them (the picker, the finale) —
 * a sunny window and a shelf of toys. All still: nothing behind the puzzle
 * moves, so the puzzle is the only thing asking to be looked at. Memoised:
 * nothing a puzzle does can change it. (Sort Two Ways, On & Off and Count &
 * Match stand in this room too.)
 */
export const Playroom = memo(function Playroom({ roomy = false }: { roomy?: boolean }) {
  return (
    <div className="jf-world" aria-hidden="true">
      <div className="jf-wall" />
      {roomy && (
        <>
          <div className="jf-window">
            <span className="jf-window-hill" />
            <span className="jf-window-sun" />
            <span className="jf-window-bars" />
            <span className="jf-curtain jf-curtain--l" />
            <span className="jf-curtain jf-curtain--r" />
          </div>
          <div className="jf-shelf">
            <span className="jf-shelf-block jf-shelf-block--a" />
            <span className="jf-shelf-block jf-shelf-block--b" />
            <span className="jf-shelf-block jf-shelf-block--c" />
            <span className="jf-shelf-pic">
              <Picture id="toys" />
            </span>
          </div>
        </>
      )}
      <div className="jf-table" />
    </div>
  );
});

/** The small "Back to Games" pill opposite the Back pill (`.pl-exit-pill`
 *  places it); `className` paints it in the game's colours. */
export function LeavePill({ className, onExit }: { className: string; onExit: () => void }) {
  return (
    <button
      type="button"
      className={`${className} pl-exit-pill font-rounded font-black`}
      onClick={() => {
        playClickSound();
        onExit();
      }}
      aria-label="Back to the game portal"
    >
      Back to Games
    </button>
  );
}
