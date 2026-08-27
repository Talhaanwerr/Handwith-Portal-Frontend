"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playStarPop, playChime } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";

/** Bubbles to pop. Few and large — this is a reward beat between building the
 *  letter and writing it, not a test. */
const BUBBLES: readonly { id: number; x: string; delay: number; size: number }[] = [
  { id: 0, x: "26%", delay: 0.0, size: 1.0 },
  { id: 1, x: "52%", delay: 0.5, size: 0.84 },
  { id: 2, x: "76%", delay: 1.0, size: 0.94 },
];

interface PopStageProps {
  shown: string;
  /** Canonical letter, for the audio clip id. */
  letter: string;
  onComplete: () => void;
}

/**
 * STAGE 2 — POP.
 *
 * The letter the child just built rises through the water inside bubbles.
 * Tapping one pops it and says the letter again; when all three are gone the
 * stage hands on. Pure reinforcement: nothing to get wrong, nothing to lose,
 * and the letter's name is heard three more times.
 */
export function PopStage({ shown, letter, onComplete }: PopStageProps) {
  const [popped, setPopped] = useState<number[]>([]);
  const [showHand, setShowHand] = useState(false);
  const doneRef = useRef(false);
  const schedule = useScheduler();

  // A tap cue only if the child hesitates — this stage is obvious enough that
  // an immediate prompt would be nagging.
  useEffect(() => {
    const t = setTimeout(() => setShowHand(true), 2600);
    return () => clearTimeout(t);
  }, []);

  const pop = useCallback(
    (id: number) => {
      if (popped.includes(id)) return;
      setShowHand(false);
      playStarPop();
      void playClip(`letter-${letter.toLowerCase()}`);
      const now = [...popped, id];
      setPopped(now);
      if (now.length >= BUBBLES.length && !doneRef.current) {
        doneRef.current = true;
        playChime();
        schedule(onComplete, 900);
      }
    },
    [popped, letter, onComplete, schedule]
  );

  return (
    <div className="oab-stage relative z-10 h-full w-full">
      <AnimatePresence>
        {BUBBLES.filter((b) => !popped.includes(b.id)).map((b) => (
          <motion.button
            key={b.id}
            className="oab-pop pl-at"
            style={cssVars({ "--pl-x": b.x, "--pl-scale": `${b.size}` })}
            initial={{ top: "104%", opacity: 0 }}
            animate={{ top: "18%", opacity: 1, x: [0, 10, -8, 0] }}
            exit={{ scale: 1.7, opacity: 0 }}
            transition={{
              top: { duration: 9, delay: b.delay, repeat: Infinity, ease: "linear" },
              opacity: { duration: 0.4, delay: b.delay },
              x: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.3 },
            }}
            onPointerDown={() => pop(b.id)}
            aria-label={`Bubble with the letter ${shown} — tap to pop it`}
          >
            <span className="oab-pop-skin" aria-hidden="true" />
            <span className="oab-pop-glyph font-rounded font-black">{shown}</span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* the tap cue — a pulsing ring, not a dragging hand: this stage is a
          tap, and reusing the drag hand here would teach the wrong gesture */}
      {showHand && popped.length === 0 && (
        <motion.span
          className="oab-tap-cue pl-at"
          style={cssVars({ "--pl-x": BUBBLES[0].x, "--pl-y": "34%" })}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.8, 1.5], opacity: [0.85, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
