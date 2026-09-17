"use client";

/**
 * The small controls in the four corners of a full-bleed game: leave, play
 * again, pause, and a step either way. Dark translucent rounded squares with
 * white icons and no text, the way a children's TV activity does it — the
 * child ignores them, a grown-up finds them instantly.
 *
 * Numbers 1–5 drew these first and Key Quest needed the same five
 * buttons in the same places, so they live here once. Geometry and colour are
 * in utilities.css under `.pl-ctl*`; a game that wants its own palette can
 * repaint those classes under its own root.
 */

interface CornerControlsProps {
  paused: boolean;
  /** Leave the game — must route through PORTAL_ROUTE. */
  onExit: () => void;
  onBack: () => void;
  onReplay: () => void;
  onTogglePause: () => void;
  onForward: () => void;
}

const stroke = {
  stroke: "#FFFFFF",
  strokeWidth: 3.2,
  strokeLinecap: "round" as const,
  fill: "none",
};

export function CornerControls({
  paused,
  onExit,
  onBack,
  onReplay,
  onTogglePause,
  onForward,
}: CornerControlsProps) {
  return (
    <>
      <button
        type="button"
        className="pl-ctl pl-ctl--exit"
        onClick={onExit}
        aria-label="Leave the game"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6 L18 18 M18 6 L6 18" {...stroke} />
        </svg>
      </button>

      <div className="pl-ctl pl-ctl--capsule">
        <button
          type="button"
          className="pl-ctl-inner"
          onClick={onReplay}
          aria-label="Play this one again"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.5 12 A6.5 6.5 0 1 1 15 6.4" {...stroke} />
            <path d="M15 3 L15.4 7.2 L11.2 7" {...stroke} />
          </svg>
        </button>
        <button
          type="button"
          className="pl-ctl-inner"
          onClick={onTogglePause}
          aria-label={paused ? "Play" : "Pause"}
          aria-pressed={paused}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5 L19 12 L8 19 Z" fill="#FFFFFF" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5 V19 M16 5 V19" {...stroke} strokeWidth={4} />
            </svg>
          )}
        </button>
      </div>

      <button type="button" className="pl-ctl pl-ctl--back" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 5 L7.5 12 L14.5 19" {...stroke} />
        </svg>
      </button>

      <button
        type="button"
        className="pl-ctl pl-ctl--forward"
        onClick={onForward}
        aria-label="Forward"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.5 5 L16.5 12 L9.5 19" {...stroke} />
        </svg>
      </button>
    </>
  );
}
