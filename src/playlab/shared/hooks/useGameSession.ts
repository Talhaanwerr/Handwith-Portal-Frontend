"use client";

import { useEffect, useRef } from "react";
import { initAudio, warmSfx } from "@shared/audio/sfx";
import { prepareMusic, startMusic, stopMusic } from "@shared/audio/music";
import { useScreenHistorySync } from "@shared/hooks/useScreenHistorySync";

interface GameSessionOptions {
  /** The game's current screen key — only used to decide when music starts. */
  screen: string;
  /** Coarse history bucket for this screen (see useScreenHistorySync). */
  step: string;
  /** Browser back/forward landed on `step` — put the game on the right screen. */
  onHistoryPop: (step: string) => void;
  /**
   * Run once when the game mounts, before anything else — the place to reset
   * to the intro screen. Captured by ref, so an inline closure is fine and
   * never re-triggers the effect.
   */
  onEnter?: () => void;
  /**
   * The pre-gesture screen, where music must stay silent. Browsers only
   * unlock the AudioContext after a real user gesture, and every game's
   * splash requires a tap to leave — so the first non-splash screen is
   * exactly the first moment music can reliably play. Default: "splash".
   */
  silentScreen?: string;
}

/**
 * The lifecycle every game screen-router shares: wire the shared audio
 * settings, enter through the intro, run the background music for the
 * session, and keep the browser's back button stepping through the game's
 * own screens instead of exiting straight to the portal.
 *
 * All five games repeated these four effects verbatim. Centralising them
 * means a fix to (say) the music start condition is a fix for every game,
 * and a new game gets the whole contract in one line.
 */
export function useGameSession({
  screen,
  step,
  onHistoryPop,
  onEnter,
  silentScreen = "splash",
}: GameSessionOptions): void {
  // First-render onEnter only — mount effect must not re-run when the parent
  // passes a new inline callback, and refs must not be written during render.
  const enterRef = useRef(onEnter);

  useEffect(() => {
    initAudio();
    // Build the sound effects and compose the music in idle moments now,
    // not on the frame of the first round or the first celebration.
    warmSfx();
    prepareMusic();
    // Fresh entries come in with a clean URL and get the intro. Re-entries
    // (browser back/forward into the game, or a reload mid-session) carry
    // ?step= — for those the history pop handler restores the right screen,
    // and the intro must not stomp it with the splash.
    const hasStep =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).has("step");
    if (!hasStep) enterRef.current?.();
  }, []);

  // startMusic is a shared singleton and idempotent, so calling it on every
  // screen change can never stack two tracks — including when hopping
  // straight from one game to another.
  useEffect(() => {
    if (screen !== silentScreen) startMusic();
  }, [screen, silentScreen]);

  useEffect(() => () => stopMusic(), []);

  useScreenHistorySync(step, onHistoryPop);
}
