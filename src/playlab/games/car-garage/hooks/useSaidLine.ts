"use client";

import { useCallback, useRef, useState } from "react";
import { clipText, playClip } from "@shared/audio/voice";
import { useScheduler } from "@shared/hooks/useScheduler";

/** The least time a reaction stays in the guide bar, so a short one can be read. */
const MIN_MS = 1500;

/**
 * THE REACTION IN THE GUIDE BAR — a line said over the round ("That does not
 * go on a car!", "Watch carefully!") shows in the bar while it is being said,
 * then the bar goes back to the round's instruction (or its cheer).
 *
 * `say(id)` plays the clip NOW (`playClip`) and shows its text; `line` is that
 * text, or null while the bar should show the instruction; `clear()` drops it
 * (the round was won). The round shows `line ?? say(instruction)`.
 * Shared by Build-a-Car Garage and The Missing Sock Case.
 */
export function useSaidLine() {
  const [line, setLine] = useState<string | null>(null);
  const serial = useRef(0);
  const schedule = useScheduler();

  const say = useCallback(
    (id: string) => {
      const mine = ++serial.current;
      const t0 = Date.now();
      setLine(clipText(id));
      void playClip(id).then(() =>
        schedule(
          () => {
            if (serial.current === mine) setLine(null);
          },
          Math.max(0, MIN_MS - (Date.now() - t0))
        )
      );
    },
    [schedule]
  );

  const clear = useCallback(() => {
    serial.current++;
    setLine(null);
  }, []);

  return { line, say, clear };
}
