"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { TracingCanvas } from "@games/letter-tracing/components/tracing/TracingCanvas";
import { LETTER_DATA } from "@games/letter-tracing/constants/letterData";
import { LOWERCASE_LETTER_DATA } from "@games/letter-tracing/constants/lowercaseLetterData";
import type { LetterDefinition } from "@games/letter-tracing/types";
import type { LetterCase } from "@games/ocean-abc/store/oceanStore";
import { useScheduler } from "@shared/hooks/useScheduler";
import { playChime } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";

/**
 * The ocean palette for the shared tracing canvas.
 *
 * TracingCanvas takes a `theme` override (added for this game, defaulting to
 * Letter Tracing's plum so that game is untouched). Reusing the canvas means
 * the stroke order, the tolerance, the pencil demonstration and the arrows —
 * all of it hard-won — are the same engine, in this game's colours.
 */
const OCEAN_TRACE_THEME = {
  completed: "#FFD93D",
  activeGuide: "#BFE2F7",
  activeGlow: "#8FC9F0",
  future: "#7FA8C9",
  childInk: "#FFE07A",
  arrow: "#E4F4FF",
};

interface TraceStageProps {
  /** Canonical letter — the stroke data is keyed on it. */
  letter: string;
  letterCase: LetterCase;
  onComplete: () => void;
}

/**
 * STAGE 3 — WRITE.
 *
 * "Write the letter with your finger": the dotted guide, the direction
 * arrows and the pencil demonstration, straight from Letter Tracing. The
 * stroke data is that game's too — uppercase or lowercase, whichever case
 * the child is playing — so no letter shapes are authored twice.
 */
export function TraceStage({ letter, letterCase, onComplete }: TraceStageProps) {
  const schedule = useScheduler();
  const doneRef = useRef(false);

  const definition: LetterDefinition | undefined = useMemo(() => {
    const key = letterCase === "lower" ? letter.toLowerCase() : letter.toUpperCase();
    const set = letterCase === "lower" ? LOWERCASE_LETTER_DATA : LETTER_DATA;
    return set.find((d) => d.letter === key);
  }, [letter, letterCase]);

  const handleComplete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    playChime();
    schedule(onComplete, 800);
  }, [onComplete, schedule]);

  // No stroke data for this case (shouldn't happen — both sets are complete):
  // hand straight on rather than trapping the child on a blank screen. In an
  // EFFECT, not the render body — a ref write plus a scheduled callback during
  // render is what react-hooks/refs rejects, and under StrictMode's double
  // render it could fire twice.
  useEffect(() => {
    if (definition || doneRef.current) return;
    doneRef.current = true;
    schedule(onComplete, 300);
  }, [definition, schedule, onComplete]);

  if (!definition) return null;

  return (
    <div className="oab-stage oab-trace relative z-10 flex h-full w-full flex-col items-center justify-center">
      <motion.div
        className="oab-trace-board"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <TracingCanvas
          key={`${definition.letter}-${letterCase}`}
          letter={definition}
          onComplete={handleComplete}
          withDemo
          theme={OCEAN_TRACE_THEME}
        />
      </motion.div>

      <p className="oab-trace-caption font-rounded font-bold">{clipText("instr-your-turn")}</p>
    </div>
  );
}
