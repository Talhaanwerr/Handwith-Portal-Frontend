"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { playSequence, playSequenceChecked, sayAfter, stopVoice } from "@shared/audio/voice";
import { IDLE_HAND_MS, useIdleHand } from "@shared/hooks/useIdleHand";
import { useQuietHand } from "@games/rhyme-rocket/components/useQuietHand";
import { LESSONS, type Lesson, type LessonId } from "@games/shape-lesson/constants/lessons";

/** Which lesson is playing — set once by the lesson's game around NgShell. */
export const LessonContext = createContext<LessonId>("circle");
export const useLesson = (): Lesson => LESSONS[useContext(LessonContext)];

/** After two misses on a page the hand comes this soon. */
const HINT_HAND_MS = 400;

/** Say these now, over anything being said (a reaction to a tap). */
export function sayNow(clips: readonly string[]): Promise<void> {
  stopVoice();
  return playSequence([...clips], 150);
}

/**
 * The page's opening line: said once, a moment after the page is on screen
 * (after whatever the last page is still saying). `ready` turns true as the
 * line STARTS — the teaching hand may arm then (on page one it comes by
 * itself ~2 s later, silent). `onPart(i)` fires as each later clip begins
 * (page 5 lights each picture as it is named), and -1 when done or cut.
 * Anything the child does first (`act()`) cuts the rest of the line.
 */
export function useOpening(clips: readonly string[], onPart?: (i: number) => void) {
  const [ready, setReady] = useState(false);
  const acted = useRef(0);
  const act = useCallback(() => {
    acted.current++;
  }, []);
  const partRef = useRef(onPart);
  useEffect(() => {
    partRef.current = onPart;
  });
  const key = clips.join("|");
  useEffect(() => {
    let live = true;
    const startedAt = acted.current;
    const [first, ...rest] = key.split("|");
    const t = setTimeout(() => {
      if (!live) return;
      setReady(true);
      void sayAfter(first).then(async () => {
        if (!live || acted.current !== startedAt || rest.length === 0) return;
        await playSequenceChecked(rest, 250, (i) => {
          if (live && acted.current === startedAt) partRef.current?.(i + 1);
        });
        if (live) partRef.current?.(-1);
      });
    }, 400);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [key]);
  return { ready, act, acted };
}

/**
 * The teaching hand of a page. Page one (round 0): the guided shell's
 * first-play wait (1.8 s) after the opening starts, and SILENT. Later pages:
 * after 7 s idle, saying "Watch carefully!". After two misses it comes at
 * once and silent, showing the right move. `from`/`to` find the elements
 * (the same element for a tap).
 */
export function usePageHand({
  round,
  armed,
  misses,
  resetKey,
  stageRef,
  from,
  to,
}: {
  round: number;
  armed: boolean;
  misses: number;
  resetKey: string | number;
  stageRef: RefObject<HTMLDivElement | null>;
  from: () => Element | null | undefined;
  to: () => Element | null | undefined;
}) {
  const idle = useIdleHand(
    armed,
    `${resetKey}#${misses}`,
    misses >= 2 ? HINT_HAND_MS : IDLE_HAND_MS
  );
  return useQuietHand(idle, round > 0 && misses < 2, stageRef, from, to);
}

/** A shape's box class (the rectangle's tap box is wide, like its drawing). */
export const boxClass = (s: string) => `msh-box--${s}`;

/** A page's misses: `miss()` counts one (and tells the shell). */
export function useMisses(onMiss: () => void) {
  const [misses, setMisses] = useState(0);
  const miss = useCallback(() => {
    setMisses((n) => n + 1);
    onMiss();
  }, [onMiss]);
  return { misses, miss };
}

/** True while the page is mounted (late promises check it). */
export function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}
