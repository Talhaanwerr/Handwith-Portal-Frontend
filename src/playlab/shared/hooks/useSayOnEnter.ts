"use client";

import { useEffect } from "react";
import { sayAfter } from "@shared/audio/voice";

/** A beat after the screen lands, so the line is not lost under the page
 *  transition's own sound. */
const ENTER_DELAY_MS = 450;

/**
 * Say these lines, in order, when a screen appears — the spoken instruction a
 * child who cannot read yet needs to know what the screen wants.
 *
 * Lines queue through `sayAfter`, so they never talk over a line already
 * playing, and any stop (Back, a reaction, the next screen) drops whatever is
 * still waiting. Pass an empty list to say nothing.
 */
export function useSayOnEnter(clips: readonly string[]): void {
  const key = clips.join("|");
  useEffect(() => {
    if (!key) return;
    const timer = setTimeout(() => {
      for (const id of key.split("|")) void sayAfter(id);
    }, ENTER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [key]);
}
