"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { cssVars } from "@shared/styles/cssVars";
import { playStarPop, playChime, playIncorrectSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { usePopGame } from "@games/ocean-abc/hooks/usePopGame";
import { TARGET_GOAL, type PopMode } from "@games/ocean-abc/constants/pop";
import { decoysFor } from "@games/ocean-abc/constants/decoys";

interface PopStageProps {
  shown: string;
  /** Canonical letter, for the audio clip id. */
  letter: string;
  /** "five" ends at five correct pops; "unlimited" runs until Next. */
  mode?: PopMode;
  onComplete: () => void;
}

/**
 * STAGE 2 — POP.
 *
 * The letter the child just built rises through the water inside bubbles.
 * Tapping one pops it and says the letter again. A bubble that reaches the
 * surface unpopped turns over into a PARACHUTE and drifts back down, still
 * tappable — catching it sends it up for another go. Pure reinforcement:
 * nothing to get wrong, nothing to lose, and the letter's name is heard again
 * every time.
 *
 * This component is the VIEW. What a bubble is and what may happen to it lives
 * in constants/pop.ts; the spawning and the frame loop live in usePopGame.
 * Nothing here knows about time — it renders whatever the game hands it and
 * reports taps back.
 */
export function PopStage({ shown, letter, mode = "five", onComplete }: PopStageProps) {
  const [showCue, setShowCue] = useState(false);

  const isLower = shown !== shown.toUpperCase();
  const decoys = useMemo(
    () => decoysFor(letter).map((d) => (isLower ? d.toLowerCase() : d)),
    [letter, isLower]
  );

  const onPop = useCallback(() => {
    playStarPop();
    void playClip(`letter-${letter.toLowerCase()}`);
  }, [letter]);

  const onWrong = useCallback((glyph: string) => {
    // A decoy wobbles and says its OWN name — gentle information, never a
    // punishment, so there is still nothing to lose on this stage.
    playIncorrectSound();
    void playClip(`letter-${glyph.toLowerCase()}`);
  }, []);

  const onRescue = useCallback(() => playStarPop(), []);

  const onGoalReached = useCallback(() => {
    playChime();
    onComplete();
  }, [onComplete]);

  const { bubbles, correct, wrongId, rescuedId, tap, register } = usePopGame({
    target: shown,
    decoys,
    letter,
    mode,
    onGoalReached,
    onPop,
    onWrong,
    onRescue,
  });

  // A tap cue only if the child hesitates — this stage is obvious enough that
  // an immediate prompt would be nagging.
  useEffect(() => {
    const t = setTimeout(() => setShowCue(true), 3200);
    return () => clearTimeout(t);
  }, []);

  const finishUnlimited = useCallback(() => {
    playChime();
    onComplete();
  }, [onComplete]);

  return (
    <div className="oab-stage relative z-10 h-full w-full">
      {/* Correct: 2 / 5 — the count is of POPS, not of bubbles spawned, so it
          only ever moves when the child gets one right. Unlimited has no
          denominator to show, so it shows the tally alone. */}
      <div className="oab-pop-hud" role="status" aria-live="polite">
        <span className="font-rounded font-black">
          {mode === "five" ? `${correct} / ${TARGET_GOAL}` : correct}
        </span>
        <span className="oab-pop-hud-icon" aria-hidden="true">
          🫧
        </span>
      </div>

      <AnimatePresence>
        {bubbles.map((b) => {
          const parachuting = b.phase === "parachuting";
          return (
            <motion.button
              key={b.id}
              ref={(el) => register(b.id, el)}
              // NOT `pl-at`: that utility sets `top: var(--pl-y)`, and this
              // bubble measures --pl-y from the SEA BED with `bottom`. Both
              // set at once is over-constrained, `top` wins, and the rise
              // renders upside down. .oab-pop owns both axes itself.
              className={`oab-pop ${b.isTarget ? "" : "oab-pop--decoy"} ${
                parachuting ? "oab-pop--chute" : ""
              } ${rescuedId === b.id ? "oab-pop--rescued" : ""}`}
              style={cssVars({ "--pl-scale": `${b.scale}` })}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: wrongId === b.id ? [0, -10, 10, -6, 0] : [0, 8, -6, 0],
              }}
              // A correct pop BURSTS outward; a wrong letter and a lost
              // parachute shrink away instead, so the three endings never look
              // like the same event.
              exit={{ scale: b.phase === "popped" ? 1.7 : 0.55, opacity: 0 }}
              transition={{
                opacity: { duration: 0.35 },
                scale: { type: "spring", stiffness: 260, damping: 18 },
                x:
                  wrongId === b.id
                    ? { duration: 0.45 }
                    : { duration: 5, repeat: Infinity, ease: "easeInOut" },
              }}
              onPointerDown={() => tap(b.id)}
              aria-label={
                parachuting
                  ? `The letter ${b.glyph} is floating down — tap to catch it`
                  : b.isTarget
                    ? `Bubble with the letter ${b.glyph} — tap to pop it`
                    : `Bubble with the letter ${b.glyph}`
              }
            >
              {/* The canopy only exists while the bubble is a parachute, so the
                  change of state is unmistakable rather than a tint. */}
              {parachuting && (
                <span className="oab-chute" aria-hidden="true">
                  <span className="oab-chute-canopy" />
                  <span className="oab-chute-string oab-chute-string--l" />
                  <span className="oab-chute-string oab-chute-string--r" />
                </span>
              )}
              <span className="oab-pop-skin" aria-hidden="true" />
              <span className="oab-pop-glyph font-rounded font-black">{b.glyph}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Unlimited has no finish line, so the child needs a way to say when
          they are done. Placed low and to the side: reachable on a phone,
          never over the water where the bubbles are. */}
      {mode === "unlimited" && (
        <div className="oab-pop-next">
          <Button size="md" variant="secondary" onClick={finishUnlimited}>
            Next
          </Button>
        </div>
      )}

      {/* the tap cue — a pulsing ring, not a dragging hand: this stage is a
          tap, and reusing the drag hand here would teach the wrong gesture */}
      {showCue && correct === 0 && bubbles.length > 0 && (
        <motion.span
          className="oab-tap-cue pl-at"
          style={cssVars({ "--pl-x": "50%", "--pl-y": "40%" })}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.8, 1.5], opacity: [0.85, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
