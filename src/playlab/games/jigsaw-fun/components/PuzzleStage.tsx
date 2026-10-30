"use client";

import { memo, type CSSProperties, type ReactNode, type RefObject } from "react";
import { NavPillButton, type NavTone } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { LeavePill } from "@games/jigsaw-fun/components/JfStage";

/**
 * The frame a puzzle is played in (Jigsaw Fun and Tangram Town): the game's
 * world, the puzzle on its board (`-mat`), the pieces in a box the picture's
 * own colour with its name on the label, one plate for the words with a dot
 * per piece, and the chrome — Back goes to the game's pictures. Every class
 * carries the game's `prefix`, so each game paints it in its own stylesheet.
 */
export function PuzzleStage({
  prefix,
  stageRef,
  accent,
  world,
  say,
  solved,
  pieces,
  placed,
  boxLabel,
  tone,
  backAria,
  board,
  tray,
  children,
  onHome,
  onExitPortal,
}: {
  prefix: string;
  stageRef: RefObject<HTMLDivElement | null>;
  accent: string;
  world: ReactNode;
  say: string;
  solved: boolean;
  /** How many pieces the puzzle has, and how many are in. */
  pieces: number;
  placed: number;
  boxLabel: ReactNode;
  tone: NavTone;
  backAria: string;
  board: ReactNode;
  tray: ReactNode;
  children?: ReactNode;
  onHome: () => void;
  onExitPortal: () => void;
}) {
  return (
    <div
      ref={stageRef}
      className={`${prefix}-screen ${prefix}-play`}
      style={{ [`--${prefix}-accent`]: accent } as CSSProperties}
    >
      {world}

      <div className={`${prefix}-plate ${solved ? `${prefix}-plate--done` : ""}`}>
        <p className={`${prefix}-plate-text font-rounded font-black`} aria-live="polite">
          {say}
        </p>
        <span
          className={`${prefix}-dots`}
          role="img"
          aria-label={`${placed} of ${pieces} pieces in`}
        >
          {Array.from({ length: pieces }, (_, i) => (
            <span key={i} className={`${prefix}-dot ${i < placed ? "is-done" : ""}`} />
          ))}
        </span>
      </div>

      <div className={`${prefix}-mat ${solved ? "is-solved" : ""}`}>
        <div className={`${prefix}-mat-face`}>{board}</div>
        <span className={`${prefix}-shine`} aria-hidden="true" />
      </div>

      <div className={`${prefix}-box`}>
        <div className={`${prefix}-box-inner`}>{tray}</div>
        <span className={`${prefix}-box-label font-rounded font-black`}>{boxLabel}</span>
      </div>

      {children}

      <NavPillButton
        label="Back"
        ariaLabel={backAria}
        tone={tone}
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onHome();
        }}
      />
      <LeavePill className={`${prefix}-leave`} onExit={onExitPortal} />
    </div>
  );
}

/**
 * One piece in the box: a button the child presses to pick it up, hidden
 * once it is out of the box. Memoised — `art` must be a stable element (the
 * rounds build their tray art once per puzzle).
 */
export const TrayPiece = memo(function TrayPiece({
  prefix,
  index,
  label,
  art,
  style,
  hidden,
  lifted,
  onPick,
  register,
}: {
  prefix: string;
  index: number;
  label: string;
  art: ReactNode;
  style?: CSSProperties;
  hidden: boolean;
  lifted: boolean;
  onPick: (e: React.PointerEvent<HTMLButtonElement>, piece: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={(el) => register(index, el)}
      type="button"
      className={`${prefix}-tpiece ${hidden ? "is-used" : ""} ${lifted ? "is-lifted" : ""}`}
      style={style}
      disabled={hidden}
      onPointerDown={hidden ? undefined : (e) => onPick(e, index)}
      aria-label={label}
    >
      {art}
    </button>
  );
});
