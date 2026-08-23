"use client";

/**
 * Letter-tracing game audio hook.
 *
 * GAME-SPECIFIC: only the phonics knowledge lives here (letter name → sound →
 * anchor word). Everything generic — SFX, phrases, the speech engine, volume
 * management — comes from the shared audio layer, so every future game reuses
 * the exact same system.
 *
 * The returned API is intentionally unchanged from the pre-portal version so
 * no game screen needed modification during the refactor.
 */

import { useCallback, useEffect } from "react";
import { playClip, playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import {
  initAudio,
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playStarPop as sharedStarPop,
  playFanfare,
  playCelebrationSound,
  playChime,
} from "@shared/audio/sfx";

const NUM_RE = /^[0-9]+$/;
const ALPHA_RE = /^[A-Za-z]$/;

/**
 * The letter INTRODUCTION is case-aware, and the case is read off the glyph
 * itself — the tracing screen already renders exactly the character the child
 * is learning, so nothing has to be threaded down from the module setting and
 * no letter needs a special case of its own.
 *
 *   UPPERCASE  →  the letter NAME only          ("A")
 *   lowercase  →  name · phonic sound · word    ("a … aa … apple")
 *
 * Uppercase is the child's first contact with a glyph and is taught by name;
 * the phonic sound belongs with the lowercase form they will actually read.
 * Numbers were already name-only and are unchanged.
 */
function introClips(letter: string): string[] {
  if (NUM_RE.test(letter)) return [`number-${letter}`];
  const l = letter.toLowerCase();
  const isUppercase = ALPHA_RE.test(letter) && letter === letter.toUpperCase();
  // Uppercase says the letter NAME and the OBJECT NAME — "A … apple" — but
  // never the phonic sound. Only the phonics were unwanted; naming the picture
  // is what makes the picture mean anything.
  return isUppercase ? [`letter-${l}`, `word-${l}`] : [`letter-${l}`, `phonics-${l}`, `word-${l}`];
}

/** Index of the anchor-word clip in this letter's intro, or -1 when the intro
 *  does not speak one (uppercase, numbers) — the screen syncs the picture to it. */
function wordClipIndex(letter: string): number {
  return introClips(letter).findIndex((id) => id.startsWith("word-"));
}

export function useAudio() {
  // Wire shared volume/mute settings once on mount
  useEffect(() => {
    initAudio();
    return () => stopVoice();
  }, []);

  /** Speak the letter (or number) name from its pre-generated clip */
  const pronounceLetter = useCallback((letter: string) => {
    const id = NUM_RE.test(letter) ? `number-${letter}` : `letter-${letter.toLowerCase()}`;
    void playClip(id);
  }, []);

  /** Preload every clip this letter's full flow will need (intro, guidance,
   *  success feedback) so no interaction waits on a fetch */
  const preloadForLetter = useCallback((letter: string) => {
    // The intro's own clips FIRST — they are the ones with a deadline. Only
    // what this letter will actually speak is fetched, so an uppercase letter
    // no longer has its name clip queued behind a phonics and a word clip it
    // is never going to play.
    preloadClips([
      ...introClips(letter),
      "instr-watch-carefully",
      "instr-your-turn",
      "instr-try-again",
      "instr-again",
      "instr-next",
    ]);
  }, []);

  /**
   * The letter introduction, choreographed from REAL audio durations rather
   * than guessed timers:
   *
   *   uppercase / numbers →  name
   *   lowercase           →  name · pause · phonic sound · pause · anchor word
   *
   * onWord fires exactly when the anchor-word clip begins (lowercase only —
   * see introClips), so the picture and the word are always in sync. onDone
   * fires when the voice has genuinely finished.
   *
   * The inter-clip pause is short on purpose: it is a breath between two
   * spoken parts, not padding. Every clip still plays to its real end.
   */
  const speakLetterIntro = useCallback(
    (letter: string, onDone?: () => void, onWord?: () => void) => {
      const clips = introClips(letter);
      const wordAt = wordClipIndex(letter);
      void playSequence(clips, 160, (i) => {
        if (i === wordAt) onWord?.();
      }).then(() => onDone?.());
    },
    []
  );

  // Generic sounds — delegated to the shared SFX vocabulary
  const playSuccess = useCallback(() => playCorrectSound(), []);
  const playOops = useCallback(() => playIncorrectSound(), []);
  const playTap = useCallback(() => playClickSound(), []);
  const playStrokeComplete = useCallback(() => playChime(), []);
  const playStarPop = useCallback(() => sharedStarPop(), []);
  const playFiveStars = useCallback(() => playFanfare(), []);
  const playCelebration = useCallback(() => playCelebrationSound(), []);

  // Instruction phrases — pre-generated clips; each returns a promise that
  // resolves at the clip's REAL end, so callers choreograph against it
  const sayNowYourTurn = useCallback(() => playClip("instr-your-turn"), []);
  const sayWatchMe = useCallback(() => playClip("instr-watch-carefully"), []);
  const sayTryAgain = useCallback(() => playClip("instr-try-again"), []);
  const sayAgainButton = useCallback(() => playClip("instr-again"), []);
  const sayNextButton = useCallback(() => playClip("instr-next"), []);
  /** Play a SPECIFIC encouragement clip — the id is chosen by the screen so
   *  the displayed text always matches (see CelebrationScreen) */
  const sayCheer = useCallback((cheerId: string) => playClip(cheerId), []);

  return {
    pronounceLetter,
    preloadForLetter,
    speakLetterIntro,
    playSuccess,
    playStrokeComplete,
    playCelebration,
    playTap,
    playOops,
    playStarPop,
    playFiveStars,
    sayNowYourTurn,
    sayWatchMe,
    sayTryAgain,
    sayAgainButton,
    sayNextButton,
    sayCheer,
  };
}
