"use client";

import { useEffect } from "react";
import { stopVoice } from "@shared/audio/voice";

/** Bumped every time a screen that uses this hook mounts. */
let serial = 0;

/**
 * Silence the narrator when this screen goes away — but only if nothing newer
 * has taken over. Screens cross-fade: the next round is already mounted (and
 * already asking its question) when the old one finally unmounts, and a plain
 * `stopVoice()` on unmount cut that new question off. Leaving for Back, home
 * or the star card still stops the voice, because no newer round has mounted.
 */
export function useStopVoiceOnLeave(): void {
  useEffect(() => {
    const mine = ++serial;
    return () => {
      if (mine === serial) stopVoice();
    };
  }, []);
}
