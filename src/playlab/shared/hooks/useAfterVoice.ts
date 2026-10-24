"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSequenceChecked, stopVoice, voiceIdle } from "@shared/audio/voice";

/** A short beat of stillness AFTER the last word, so the picture can settle. */
const SETTLE_MS = 450;

/**
 * Spoken lines that gate what happens next.
 *
 *  - `thenAfter(ids, fn)` says the line and runs `fn` only once the WHOLE line
 *    has actually ended (the audio's own "end", through the voice engine) —
 *    never because a fixed delay ran out. A missing clip resolves quickly by
 *    itself, so a silent game still moves on. A new call, an unmount or Back
 *    cancels the pending `fn`, so a leaving screen can never advance a new one.
 *  - `useIntro(ids, key)` says the instruction when `key` changes and reports
 *    `busy` until it has finished, so a game can hold its board still instead
 *    of letting a tap cut the instruction off mid-word.
 *
 * Unmounting also stops the voice, so no line outlives its screen.
 */
export function useAfterVoice() {
  const alive = useRef(true);
  const run = useRef(0);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      // A counter, not a DOM ref: bumping it cancels any pending advance.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      run.current++;
      if (hold.current) clearTimeout(hold.current);
      stopVoice();
    };
  }, []);

  const cancel = useCallback(() => {
    run.current++;
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  }, []);

  const thenAfter = useCallback(
    (ids: string[], then: () => void, gapMs = 200) => {
      cancel();
      const mine = run.current;
      void (async () => {
        const whole = await playSequenceChecked(ids, gapMs);
        // Cut short by something else speaking: wait for that to end too.
        if (!whole) await voiceIdle();
        if (!alive.current || run.current !== mine) return;
        hold.current = setTimeout(() => {
          hold.current = null;
          if (alive.current && run.current === mine) then();
        }, SETTLE_MS);
      })();
    },
    [cancel]
  );

  return { thenAfter, cancel };
}

/**
 * Say an instruction when `key` changes (after `delayMs`), and report whether
 * it is still being said. Hold the board still while `busy` is true.
 */
export function useIntro(ids: readonly string[], key: unknown, delayMs = 600): boolean {
  const joined = ids.join("|");
  // One token per (key, line): the intro is "busy" until it has been marked
  // finished, which happens only when the audio ends — derived, not set in the
  // effect, so a new key is busy from the very first render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const token = useMemo(() => ({}), [key, joined]);
  const [finished, setFinished] = useState<object | null>(null);
  useEffect(() => {
    if (!joined) return;
    let live = true;
    const t = setTimeout(() => {
      void playSequenceChecked(joined.split("|"), 200).then(() => {
        if (live) setFinished(token);
      });
    }, delayMs);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [token, joined, delayMs]);
  return !!joined && finished !== token;
}
