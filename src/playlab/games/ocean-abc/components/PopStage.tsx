"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { cssVars } from "@shared/styles/cssVars";
import { playStarPop, playChime, playIncorrectSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { usePopGame } from "@games/ocean-abc/hooks/usePopGame";
import { TARGET_GOAL, type Bubble, type PopMode } from "@games/ocean-abc/constants/pop";
import { decoysFor } from "@games/ocean-abc/constants/decoys";

interface PopStageProps {
  shown: string;
  /** Canonical letter, for the audio clip id. */
  letter: string;
  /** "five" ends at five pops; "unlimited" runs until Next. */
  mode?: PopMode;
  onComplete: () => void;
}

/** How a bubble leaves, by how its life ended: a pop BURSTS outward; a
 *  decoy that escapes drifts off the top; a decoy dismissed or a parachute
 *  missed shrinks away. Four endings that never look like the same event. */
function exitFor(phase: Bubble["phase"]) {
  if (phase === "popped") return { scale: 1.7, opacity: 0 };
  if (phase === "escaped") return { y: -40, opacity: 0 };
  return { scale: 0.55, opacity: 0 };
}

/**
 * STAGE 2 — POP.
 *
 * The letter the child just built rises through the water inside bubbles,
 * among other letters. Tap the right one and it pops and says its name; tap
 * another and it says ITS name and leaves. A right letter that reaches the
 * surface unpopped opens a parachute and floats back down — tapping that
 * pops it too. The full rules are at the top of constants/pop.ts.
 *
 * This component is the VIEW. Nothing here knows about time — it renders
 * whatever the game hands it and reports taps back.
 */
export function PopStage({ shown, letter, mode = "five", onComplete }: PopStageProps) {
  const [showCue, setShowCue] = useState(false);

  const isLower = shown !== shown.toUpperCase();
  const decoys = useMemo(
    () => decoysFor(letter).map((d) => (isLower ? d.toLowerCase() : d)),
    [letter, isLower]
  );

  const onPop = useCallback(
    (caught: boolean) => {
      playStarPop();
      if (caught) playChime(); // the catch earns a little extra
      void playClip(`letter-${letter.toLowerCase()}`);
    },
    [letter]
  );

  const onWrong = useCallback((glyph: string) => {
    // A decoy wobbles and says its OWN name — gentle information, never a
    // punishment, so there is still nothing to lose on this stage.
    playIncorrectSound();
    void playClip(`letter-${glyph.toLowerCase()}`);
  }, []);

  const onGoalReached = useCallback(() => {
    playChime();
    onComplete();
  }, [onComplete]);

  const { bubbles, correct, wrongId, caughtId, tap, register } = usePopGame({
    target: shown,
    decoys,
    letter,
    mode,
    onGoalReached,
    onPop,
    onWrong,
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
      {/* 2 / 5 — the count is of POPS, so it only ever moves when the child
          gets one right. Unlimited has no denominator, so it shows the tally. */}
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
              } ${caughtId === b.id ? "oab-pop--rescued" : ""}`}
              style={cssVars({ "--pl-scale": `${b.scale}` })}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: wrongId === b.id ? [0, -10, 10, -6, 0] : [0, 8, -6, 0],
              }}
              exit={exitFor(b.phase)}
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
                  ? `The letter ${b.glyph} is floating down — tap to pop it`
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
