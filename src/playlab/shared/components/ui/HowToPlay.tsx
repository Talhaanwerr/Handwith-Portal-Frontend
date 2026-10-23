"use client";

import { useEffect, useId, useRef } from "react";

interface HowToPlayProps {
  /** The game's name, shown small above the heading. */
  gameTitle?: string;
  /** One or two short lines saying what the child does. More are ignored. */
  steps: readonly string[];
  /** The Play button. */
  onPlay: () => void;
  /** The ✕ button (or Escape). The game starts the same way as with Play. */
  onClose: () => void;
}

/**
 * The "How to Play" card every game opens with.
 *
 * A small centred white card — not a full-screen takeover — with the heading,
 * at most two short lines, a big Play button and a visible ✕. It never closes
 * by itself: the child (or a grown-up) decides. It makes no sound, and the
 * game behind it is not mounted until the card is dismissed (see GamePlayer),
 * so no music, narration or round timer can start while it is open.
 */
export function HowToPlay({ gameTitle, steps, onPlay, onClose }: HowToPlayProps) {
  const headingId = useId();
  const playRef = useRef<HTMLButtonElement>(null);
  const lines = steps.slice(0, 2);

  useEffect(() => {
    playRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="htp-stage">
      <div
        className="htp-card font-rounded"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <button type="button" className="htp-close" onClick={onClose} aria-label="Close and play">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {gameTitle ? <p className="htp-game">{gameTitle}</p> : null}
        <h2 id={headingId} className="htp-heading">
          How to Play
        </h2>
        <ol className="htp-steps">
          {lines.map((line, i) => (
            <li key={i} className="htp-step">
              {lines.length > 1 ? (
                <span className="htp-num" aria-hidden="true">
                  {i + 1}
                </span>
              ) : null}
              <span className="htp-line">{line}</span>
            </li>
          ))}
        </ol>
        <button ref={playRef} type="button" className="htp-play" onClick={onPlay}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play
        </button>
      </div>
    </div>
  );
}
