"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playStarPop, playChime } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";

/** Six bubbles rise: three carry THE letter, three carry other letters. The
 *  child pops their letter out of a small crowd — a real find-it beat rather
 *  than pure tapping — while a wrong bubble just wobbles and says its own
 *  name, so there is still nothing to lose. */
const BUBBLES: readonly { id: number; x: string; delay: number; size: number; target: boolean }[] =
  [
    { id: 0, x: "10%", delay: 0.0, size: 1.0, target: true },
    { id: 1, x: "34%", delay: 0.7, size: 0.78, target: false },
    { id: 2, x: "56%", delay: 0.35, size: 0.94, target: true },
    { id: 3, x: "22%", delay: 1.4, size: 0.74, target: false },
    { id: 4, x: "80%", delay: 1.0, size: 0.88, target: true },
    { id: 5, x: "68%", delay: 1.9, size: 0.72, target: false },
    { id: 6, x: "45%", delay: 2.3, size: 0.84, target: true },
    { id: 7, x: "90%", delay: 2.7, size: 0.7, target: false },
    { id: 8, x: "5%", delay: 3.1, size: 0.76, target: false },
  ];
const TARGET_TOTAL = BUBBLES.filter((b) => b.target).length;

/** The letters the decoy bubbles wear — deterministic neighbours of the
 *  target (never the target itself), so every letter meets a familiar-but-
 *  different crowd and no randomness ever touches render. */
function decoysFor(letter: string): string[] {
  const A = 65;
  const base = letter.toUpperCase().charCodeAt(0) - A;
  return [3, 7, 11, 17, 22].map((off) => String.fromCharCode(A + ((base + off) % 26)));
}

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
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [showHand, setShowHand] = useState(false);
  const doneRef = useRef(false);
  const schedule = useScheduler();

  const isLower = shown !== shown.toUpperCase();
  const decoys = decoysFor(letter).map((d) => (isLower ? d.toLowerCase() : d));

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
      const bubble = BUBBLES.find((b) => b.id === id);
      if (!bubble) return;

      if (!bubble.target) {
        // a decoy: it wobbles, says its own name, and floats on — gentle
        // information, never a punishment
        const decoy = decoys[BUBBLES.filter((b) => !b.target).findIndex((b) => b.id === id)];
        if (decoy) void playClip(`letter-${decoy.toLowerCase()}`);
        setWrongId(id);
        schedule(() => setWrongId(null), 500);
        return;
      }

      playStarPop();
      void playClip(`letter-${letter.toLowerCase()}`);
      const now = [...popped, id];
      setPopped(now);
      if (
        now.filter((n) => BUBBLES.find((b) => b.id === n)?.target).length >= TARGET_TOTAL &&
        !doneRef.current
      ) {
        doneRef.current = true;
        playChime();
        schedule(onComplete, 900);
      }
    },
    [popped, letter, decoys, onComplete, schedule]
  );

  return (
    <div className="oab-stage relative z-10 h-full w-full">
      <AnimatePresence>
        {BUBBLES.filter((b) => !popped.includes(b.id)).map((b) => {
          const glyph = b.target
            ? shown
            : (decoys[BUBBLES.filter((d) => !d.target).findIndex((d) => d.id === b.id)] ?? shown);
          return (
            <motion.button
              key={b.id}
              className={`oab-pop pl-at ${b.target ? "" : "oab-pop--decoy"}`}
              style={cssVars({ "--pl-x": b.x, "--pl-scale": `${b.size}` })}
              initial={{ top: "104%", opacity: 0 }}
              animate={{
                top: "18%",
                opacity: 1,
                x: wrongId === b.id ? [0, -10, 10, -6, 0] : [0, 10, -8, 0],
              }}
              exit={{ scale: 1.7, opacity: 0 }}
              transition={{
                top: { duration: 9, delay: b.delay, repeat: Infinity, ease: "linear" },
                opacity: { duration: 0.4, delay: b.delay },
                x:
                  wrongId === b.id
                    ? { duration: 0.45 }
                    : { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.3 },
              }}
              onPointerDown={() => pop(b.id)}
              aria-label={
                b.target
                  ? `Bubble with the letter ${shown} — tap to pop it`
                  : `Bubble with the letter ${glyph}`
              }
            >
              <span className="oab-pop-skin" aria-hidden="true" />
              <span className="oab-pop-glyph font-rounded font-black">{glyph}</span>
            </motion.button>
          );
        })}
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
