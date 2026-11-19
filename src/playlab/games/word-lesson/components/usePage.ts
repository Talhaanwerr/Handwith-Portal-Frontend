"use client";

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { playIncorrectSound } from "@shared/audio/sfx";
import { clipText, playClip, playSequenceChecked, stopVoice } from "@shared/audio/voice";
import { IDLE_HAND_MS, useIdleHand } from "@shared/hooks/useIdleHand";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { HandPath } from "@games/shadow-match/components/useHandAt";
import { WlPic } from "@games/word-lesson/components/LessonArt";
import { picOf, sayOf, type Lesson } from "@games/word-lesson/constants/lesson";

/** Round one: the longest the (silent) hand waits for the page's first line —
 *  with the first-play wait on top it shows by itself within ~3 s. */
const ARM_CAP_MS = 900;
/** After a second miss on a page the hand comes almost at once. */
const HELP_HAND_MS = 500;
/** From the page coming in to its first line. */
const INTRO_MS = 400;

const SCENE_SEED = { barn: 0, kitchen: 2, living: 4, park: 6, bedroom: 8 } as const;

/** A word's text, from the clip that says it (never typed twice). */
export const wordText = (w: string): string => clipText(sayOf(w)) || w;

/**
 * What every page of a lesson shares: its stage and board, the kit's
 * celebration (raining the page's own pictures), the misses, and when the
 * teaching hand may come.
 *
 * `ready` turns on once the page's opening has been said — or, on round one,
 * after ARM_CAP_MS whatever is still being said, so the silent hand shows by
 * itself almost at once. Any move (`act`) stops the voice and counts too: a
 * tap while things are being named is a real move.
 */
export function usePage({
  lesson,
  round,
  words,
  intro,
  onIntroPart,
  onDone,
  onMiss,
}: {
  lesson: Lesson;
  round: number;
  /** The page's pictures — they rain in its cheer. A stable array. */
  words: readonly string[];
  /** The page's opening, said once as it comes in (clip ids). */
  intro: readonly string[];
  /** Fires as each part of the opening starts. */
  onIntroPart?: (i: number) => void;
  onDone: () => void;
  onMiss: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const cast = useMemo(
    () =>
      words.map((w) =>
        createElement(
          "span",
          { key: w, className: "ng-cast" },
          createElement(WlPic, { src: picOf(w) })
        )
      ),
    [words]
  );
  const celebration = useRoundCelebration({
    cheerSeed: round + SCENE_SEED[lesson.scene],
    stageRef,
    cast,
    onDone,
  });

  const [ready, setReady] = useState(false);
  const [misses, setMisses] = useState(0);
  const acted = useRef(false);

  // round one: arm the hand soon whatever is still being said
  useEffect(() => {
    if (round !== 0) return;
    const t = setTimeout(() => setReady(true), ARM_CAP_MS);
    return () => clearTimeout(t);
  }, [round]);

  // the opening, once; a move before it starts skips it
  const introRef = useRef({ intro, onIntroPart });
  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      if (acted.current) {
        setReady(true);
        return;
      }
      const { intro: ids, onIntroPart: part } = introRef.current;
      void playSequenceChecked([...ids], 250, (i) => {
        if (live) part?.(i);
      }).then(() => {
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

  /** A wrong move: never punishing — the page shows the answer glowing. */
  const miss = useCallback(() => {
    setMisses((n) => n + 1);
    playIncorrectSound();
    onMiss();
  }, [onMiss]);

  return { stageRef, boardRef, ready, misses, act, miss, ...celebration };
}

/**
 * The page's teaching hand: silent on round one (it comes while the page is
 * still talking), "Watch carefully!" after 7 s idle on later pages, and
 * almost at once — silent — after a second miss. `from`/`to` must be stable;
 * a tap page passes the same element twice (the hand taps it).
 */
export function usePageHand({
  armed,
  resetKey,
  misses,
  round,
  stageRef,
  from,
  to,
}: {
  armed: boolean;
  resetKey: unknown;
  misses: number;
  round: number;
  stageRef: RefObject<HTMLDivElement | null>;
  from: () => Element | null | undefined;
  to: () => Element | null | undefined;
}) {
  const help = misses >= 2;
  const idle = useIdleHand(
    armed,
    `${String(resetKey)}#${misses}`,
    help ? HELP_HAND_MS : IDLE_HAND_MS
  );
  const voiced = round > 0 && !help;
  const [hand, setHand] = useState<HandPath | null>(null);
  // Rhyme Rocket's useQuietHand, measured on a timer instead of the next
  // frame: the hand must come even while nothing on the page is moving
  useEffect(() => {
    if (!idle) return;
    const measure = () => {
      const a = from();
      const b = to();
      if (!a || !b) return;
      const p = centreIn(stageRef.current, a);
      const q = centreIn(stageRef.current, b);
      setHand({ fx: p.x, fy: p.y, tx: q.x, ty: q.y });
    };
    if (voiced) void playClip("instr-watch-carefully");
    const t = setTimeout(measure, 0);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [idle, voiced, stageRef, from, to]);
  return idle ? hand : null;
}
