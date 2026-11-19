"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { playIncorrectSound } from "@shared/audio/sfx";
import { playSequence, stopVoice } from "@shared/audio/voice";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";

/** From the page coming in to its first line. */
const INTRO_MS = 400;

/**
 * What a lesson page of the newer games shares (Our World, Sticker Studio):
 * the stage, the kit's celebration, the misses, and the page's opening lines —
 * said once as the page comes in, and skipped if the child has already made a
 * move. `ready` turns on when the opening has been said (or skipped): that is
 * when the teaching hand may come.
 */
export function usePlayPage({
  round,
  intro,
  cast,
  onDone,
  onMiss,
}: {
  round: number;
  /** The page's opening, said once (clip ids). */
  intro: readonly string[];
  /** What rains in the cheer. A stable array. */
  cast: readonly ReactNode[];
  onDone: () => void;
  onMiss: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const celebration = useRoundCelebration({ cheerSeed: round + 6, stageRef, cast, onDone });
  const [ready, setReady] = useState(false);
  const [misses, setMisses] = useState(0);
  const acted = useRef(false);
  const introRef = useRef(intro);

  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      if (acted.current) {
        setReady(true);
        return;
      }
      void playSequence([...introRef.current], 200).then(() => {
        if (live) setReady(true);
      });
    }, INTRO_MS);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, []);

  /** The child did something: whatever is being said stops. */
  const act = useCallback(() => {
    if (!acted.current) stopVoice();
    acted.current = true;
    setReady(true);
  }, []);
  /** A wrong move: never punishing — a wiggle, "Try again!", a hint. */
  const miss = useCallback(() => {
    setMisses((n) => n + 1);
    playIncorrectSound();
    onMiss();
  }, [onMiss]);

  return { stageRef, ready, misses, act, miss, ...celebration };
}
