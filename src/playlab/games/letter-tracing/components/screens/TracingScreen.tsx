"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useAnimate, AnimatePresence } from "framer-motion";
import {
  TracingCanvas,
  type TracingPhase,
} from "@games/letter-tracing/components/tracing/TracingCanvas";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { StarRow } from "@shared/components/ui/StarRow";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { RotateDevicePrompt } from "@shared/components/ui/RotateDevicePrompt";
import {
  AnchorWordCard,
  type AnchorMode,
} from "@games/letter-tracing/components/ui/AnchorWordCard";
import { useAudio } from "@games/letter-tracing/hooks/useAudio";
import { stopVoice } from "@shared/audio/voice";
import type { LetterDefinition, PracticeMode } from "@games/letter-tracing/types";

interface TracingScreenProps {
  letter: LetterDefinition;
  /** Free = one trace per letter; five-star = five traces per letter */
  mode: PracticeMode;
  onComplete: () => void;
  onHome: () => void;
}

const STAR_COUNT = 5;

// ─── Five-star mastery row ────────────────────────────────────────────────────
export function TracingScreen({ letter, mode, onComplete, onHome }: TracingScreenProps) {
  const starTarget = mode === "five-star" ? STAR_COUNT : 1;
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState(0);
  const [attempt, setAttempt] = useState(0); // bumps to remount the canvas per repeat
  const [phase, setPhase] = useState<TracingPhase>("demo-draw");
  const [replayToken, setReplayToken] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  const [canvasScope, canvasAnimate] = useAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    playSuccess,
    playStrokeComplete,
    playStarPop,
    playFiveStars,
    playOops,
    speakLetterIntro,
    preloadForLetter,
    sayWatchMe,
    sayNowYourTurn,
  } = useAudio();
  /** True once the intro has finished — after this nothing may re-raise
   *  the anchor picture to its centred hero pose. */
  const introEndedRef = useRef(false);
  const starsRef = useRef(0);
  // Tracks setTimeouts scheduled by handleLetterSuccess so they can be
  // cancelled if the child navigates away (e.g. taps Home) before they fire.
  // Without this, a stale timer could call onComplete() after the screen has
  // already changed, unexpectedly yanking the child back to "celebration".
  const successTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    return () => {
      successTimeoutsRef.current.forEach(clearTimeout);
      successTimeoutsRef.current = [];
    };
  }, []);
  const [introDone, setIntroDone] = useState(false);
  // Starts on "hero": the object is on screen from the first paint, which is
  // its entrance. The screen remounts per letter (keyed in LetterTracingGame),
  // so this initial value IS the per-letter reset — no effect needs to do it.
  const [anchorMode, setAnchorMode] = useState<AnchorMode>("hero");

  const isDemoing = phase.startsWith("demo");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Preload every clip this letter's flow needs the moment the screen mounts
  useEffect(() => {
    preloadForLetter(letter.letter);
  }, [letter.letter, preloadForLetter]);

  // ── The letter introduction ──────────────────────────────────────────────
  //
  // The object APPEARS (hero: big, centred), the letter is spoken, then the
  // object SLIDES to its dock beside the board as the pencil is released.
  //
  // Three bugs lived here and they compounded into "the apple returns to the
  // middle and A is never spoken":
  //
  //  1. React StrictMode mounts every component twice in development. The old
  //     code guarded with a `hasAutoPlayed` ref so the second mount would not
  //     replay — but refs SURVIVE that remount while the cleanup still ran,
  //     and useAudio's cleanup calls stopVoice(). So the first mount's "A" was
  //     killed mid-word and the second mount refused to start over: the child
  //     heard only "apple". The guard is gone; the effect is now idempotent
  //     the way an effect should be — cleanup stops the voice, the re-run
  //     starts the intro cleanly from the top.
  //
  //  2. The old cleanup set `cancelled = true`, and onDone was gated on it —
  //     so after StrictMode's cleanup the intro could never FINISH, and the
  //     picture was never docked.
  //
  //  3. onWord ("raise the picture as the word is spoken") was NOT gated on
  //     anything. Once the 4s failsafe had already docked the picture, the
  //     word clip beginning at ~4.2s threw it straight back to centre — with
  //     nothing left to dock it again. That is the apple stuck in the middle.
  //
  // The failsafe deadline was also simply too short: a lowercase intro is
  // three clips (1.78 + 1.42 + 1.63 + gaps ≈ 5.1s), so a 4s failsafe fired
  // BEFORE every normal lowercase intro had finished. It is a hang guard, not
  // a pacing device, so it now sits well clear of the longest real intro.
  useEffect(() => {
    let cancelled = false;
    introEndedRef.current = false;

    /** The single place the intro ends — reached normally or by the guard. */
    const finishIntro = () => {
      if (cancelled || introEndedRef.current) return;
      introEndedRef.current = true;
      setAnchorMode("docked");
      setIntroDone(true);
    };

    speakLetterIntro(
      letter.letter,
      () => {
        finishIntro();
        if (!cancelled) void sayWatchMe();
      },
      () => {
        // The picture rises for the anchor word ONLY while the intro is still
        // running. After it has ended, nothing may move the picture again.
        if (!cancelled && !introEndedRef.current) setAnchorMode("hero");
      }
    );

    // Hang guard only (missing MP3, blocked autoplay, a promise that never
    // settles). Comfortably longer than the longest real intro.
    const failsafe = setTimeout(finishIntro, 9000);

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      stopVoice();
    };
  }, [letter.letter, speakLetterIntro, sayWatchMe]);

  const handleFirstTurn = useCallback(() => {
    sayNowYourTurn();
  }, [sayNowYourTurn]);

  // Subtle chime for every completed stroke except the letter's final one
  // (the final stroke triggers the bigger letter-success sound instead)
  const handleStrokeComplete = useCallback(
    (strokeIndex: number, total: number) => {
      if (strokeIndex < total - 1) playStrokeComplete();
    },
    [playStrokeComplete]
  );

  // Fires when the child has traced EVERY stroke = one complete letter.
  // Five-star mode: one gold star per complete letter, five to finish.
  // Free mode: a single complete letter finishes immediately.
  const handleLetterSuccess = useCallback(() => {
    playSuccess();
    const nextStars = Math.min(starTarget, starsRef.current + 1);
    starsRef.current = nextStars;
    setStars(nextStars);
    if (mode === "five-star") playStarPop();
    setBurstActive(true);

    // All of these are deliberately delayed for pacing — but if the child
    // navigates away in the meantime (e.g. taps Home), none of them should
    // still fire, so every id is tracked and cleared on unmount.
    const schedule = (fn: () => void, ms: number) => {
      successTimeoutsRef.current.push(setTimeout(fn, ms));
    };

    schedule(() => setBurstActive(false), 600);

    if (nextStars >= starTarget) {
      // Letter finished — celebration screen offers Again / Next
      if (mode === "five-star") schedule(() => playFiveStars(), 150);
      schedule(onComplete, 1100);
    } else {
      // Reset the SAME letter for another round — no dialogs, no buttons.
      // Repeat rounds skip the pencil demo (withDemo only on attempt 0).
      schedule(() => {
        setProgress(0);
        setAttempt((a) => a + 1);
      }, 800);
    }
  }, [playSuccess, playStarPop, playFiveStars, onComplete, mode, starTarget]);

  // Off-path scribble → gentle wiggle + soft "oops", never an error message
  const handleOffPath = useCallback(() => {
    playOops();
    if (canvasScope.current) {
      canvasAnimate(
        canvasScope.current,
        { x: [-7, 7, -6, 6, -3, 3, 0] },
        { duration: 0.4, ease: "easeInOut" }
      );
    }
  }, [canvasAnimate, canvasScope, playOops]);

  const handleReplayDemo = useCallback(() => {
    setProgress(0);
    setReplayToken((t) => t + 1);
  }, []);

  const caption =
    !introDone && attempt === 0
      ? "Listen..."
      : isDemoing
        ? "Watch carefully..."
        : phase === "await-lift"
          ? "Lift your finger!"
          : progress === 0
            ? "Now you try — start at the purple dot"
            : progress < 0.99
              ? "Keep going — one stroke at a time!"
              : "Wonderful! ✨";

  return (
    <div
      ref={containerRef}
      className="lt-trace-backdrop trace-stage compact-on-short relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
    >
      {/* Portrait-phone orientation prompt (CSS-only visibility) */}
      <RotateDevicePrompt />

      {burstActive && <CelebrationSparkles active width={dims.w} height={dims.h} />}

      {/* "b … buh … ball" — the picture appears exactly when the word is spoken */}
      <AnchorWordCard letter={letter.letter} mode={anchorMode} />

      {/* Top bar — [Home]  Trace X 🔊 ↻  ····  ☆☆☆☆☆ */}
      <motion.div
        className="relative z-10 w-full max-w-md md:max-w-2xl"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onHome}
            className="shadow-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 md:h-11 md:w-11"
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.06 }}
            aria-label="Go back to main menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15"
                stroke="#7C5CBF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-rounded text-plum/60 text-sm font-bold">Trace</span>
              <span className="font-rounded text-plum text-3xl leading-none font-black md:text-4xl">
                {letter.letter}
              </span>
              <motion.button
                onClick={() =>
                  speakLetterIntro(
                    letter.letter,
                    () => setAnchorMode("docked"),
                    () => setAnchorMode("hero")
                  )
                }
                className="shadow-soft ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/70"
                whileTap={{ scale: 0.9 }}
                aria-label="Hear pronunciation"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#A882E8" />
                  <path
                    d="M19.07 4.93a10 10 0 0 1 0 14.14"
                    stroke="#A882E8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15.54 8.46a5 5 0 0 1 0 7.07"
                    stroke="#A882E8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>
              {!isDemoing && (
                <motion.button
                  onClick={handleReplayDemo}
                  className="shadow-soft flex h-8 w-8 items-center justify-center rounded-full bg-white/70"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Watch the pencil write this letter again, stroke by stroke"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 1 0 2-9.5L4 8"
                      stroke="#A882E8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Five-star mastery row — one star per COMPLETE letter trace */}
            {mode === "five-star" && (
              <div className="shadow-soft rounded-full bg-white/70 px-3.5 py-2">
                <StarRow earned={stars} total={STAR_COUNT} size={26} />
              </div>
            )}
          </div>
        </div>

        {/* Letter progress bar — hidden on short landscape phones to give the board room */}
        <ProgressBar
          value={progress}
          trackClassName="hide-on-short mt-3 h-2.5 w-full rounded-full bg-lavender/60"
          fillClassName={`h-full rounded-full ${
            progress >= 0.99 ? "bg-jade-light" : progress >= 0.4 ? "bg-plum-light" : "bg-lavender"
          }`}
          transition={{ duration: 0.2 }}
          ariaLabel="How much of the letter is traced"
        />
      </motion.div>

      {/* Tracing board — sized by the --trace-size variable declared on
          .trace-stage above, so it fills landscape phones, scales up on
          tablets/desktop and never distorts. The variable lives on the stage
          rather than on the board itself so the anchor picture, which is a
          SIBLING of the board, can dock against the board's real width. */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center">
        <motion.div
          ref={canvasScope}
          className="rounded-board shadow-board"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <TracingCanvas
            key={`${letter.letter}-${attempt}-${replayToken}`}
            letter={letter}
            onComplete={handleLetterSuccess}
            onProgress={setProgress}
            onStrokeComplete={handleStrokeComplete}
            onOffPath={handleOffPath}
            withDemo={attempt === 0 || replayToken > 0}
            holdDemo={attempt === 0 && !introDone}
            onFirstTurn={handleFirstTurn}
            onPhaseChange={setPhase}
            replayToken={replayToken}
          />
        </motion.div>
      </div>

      {/* Bottom caption — hidden on short landscape phones */}
      <motion.div
        className="hide-on-short relative z-10 flex w-full max-w-md flex-col items-center gap-3 pb-1 md:max-w-2xl"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="font-rounded text-plum/60 text-center text-sm font-semibold md:text-base"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
