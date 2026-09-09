"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { useScheduler } from "@shared/hooks/useScheduler";
import {
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
  playStarPop,
} from "@shared/audio/sfx";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { CandyScene } from "@games/letter-treats/components/CandyScene";
import type { PaintActivity } from "@games/color-paint/constants/activities";
import { PAINT_COLORS, type PaintColorId } from "@games/color-paint/constants/colors";
import { Crayon, type CrayonState } from "@games/color-paint/components/Crayon";
import { PaintCanvas, type PaintCanvasHandle } from "@games/color-paint/components/PaintCanvas";

/** How long a wrong crayon shakes before it is just a crayon again. */
const WOBBLE_MS = 450;
/** Gap between the object's name and the colour prompt. */
const PROMPT_GAP_MS = 260;

/** Existing instruction clips this stage borrows. */
const YOUR_TURN_CLIP = "instr-your-turn";
const TRY_AGAIN_CLIP = "instr-try-again";

/**
 * What the child may do right now.
 *
 *   ask   — the lesson: find the colour the prompt names
 *   paint — that colour is in hand and the picture is being coloured
 *   free  — the main part is done; every crayon is unlocked and Next appears
 */
type Phase = "ask" | "paint" | "free";

interface PaintLevelProps {
  activity: PaintActivity;
  /** Position in the set — drives the star row. */
  index: number;
  total: number;
  onDone: () => void;
  onBack: () => void;
}

/**
 * One object: name it, ask for its colour, then let the child paint it.
 *
 * THE ROUND IS NOT OVER WHEN THE LESSON IS. Getting the apple red is what the
 * game is teaching, so that is what the prompt asks for and what the star
 * counts — but the moment it is done every crayon unlocks and the child keeps
 * the picture for as long as they want. The leaf can be green, or blue; the
 * Next button waits. An earlier version snatched the picture away the instant
 * enough red was down, which taught the colour and then punished the child for
 * enjoying it.
 *
 * The three beats are a `phase`, not three screens: same easel, same crayons,
 * only what is allowed changes.
 */
export function PaintLevel({ activity, index, total, onDone, onBack }: PaintLevelProps) {
  const [phase, setPhase] = useState<Phase>("ask");
  const [picked, setPicked] = useState<PaintColorId | null>(null);
  const [wrongId, setWrongId] = useState<PaintColorId | null>(null);
  const canvasHandle = useRef<PaintCanvasHandle | null>(null);
  const schedule = useScheduler();

  const target = PAINT_COLORS[activity.target];
  const promptClip = target.promptClip;
  const cheerId = cheerFor(index);
  const chosen = picked ? PAINT_COLORS[picked] : null;

  /** Once the lesson is done the whole box opens up. Before that, only the
   *  three the round is asking between. */
  const crayons: readonly PaintColorId[] =
    phase === "free" ? (Object.keys(PAINT_COLORS) as PaintColorId[]) : activity.choices;

  // Arrival: the object's name, then the ask — one sequence, so the two lines
  // never talk over each other.
  useEffect(() => {
    preloadClips([activity.wordClip, promptClip, YOUR_TURN_CLIP, TRY_AGAIN_CLIP, cheerId]);
    const t = setTimeout(() => {
      void playSequence([activity.wordClip, promptClip], PROMPT_GAP_MS);
    }, 400);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, [activity.wordClip, promptClip, cheerId]);

  const pick = useCallback(
    (id: PaintColorId) => {
      // In free play every crayon simply works — there is no wrong answer left.
      if (phase === "free") {
        playClickSound();
        setPicked(id);
        return;
      }
      if (id === activity.target) {
        playCorrectSound();
        stopVoice();
        void playClip(YOUR_TURN_CLIP);
        setPicked(id);
        setPhase("paint");
        return;
      }
      // Gentle: a shake, "try again", and the crayon is right back where it
      // was. The correct colour stays on the row the whole time.
      playIncorrectSound();
      stopVoice();
      void playClip(TRY_AGAIN_CLIP);
      setWrongId(id);
      schedule(() => setWrongId(null), WOBBLE_MS);
    },
    [phase, activity.target, schedule]
  );

  /** The main part is coloured — the lesson is banked. The picture stays. */
  const onMainComplete = useCallback(() => {
    setPhase("free");
    playStarPop();
    stopVoice();
    void playClip(cheerId);
  }, [cheerId]);

  const crayonState = (id: PaintColorId): CrayonState => {
    if (wrongId === id) return "wrong";
    if (picked === id) return "active";
    if (phase === "paint" && picked !== null) return "dim";
    return "idle";
  };

  const headline =
    phase === "ask"
      ? clipText(promptClip)
      : phase === "paint"
        ? clipText(YOUR_TURN_CLIP)
        : clipText(cheerId);

  return (
    <div className="lt-screen lt-wash relative flex h-full w-full flex-col overflow-hidden">
      <CandyScene variant="calm" />

      {/* chrome: back · the object · progress through the set */}
      <div className="cp-topbar relative z-20 flex w-full shrink-0 items-center justify-between gap-2 px-4 py-3">
        <NavPillButton
          label="Back"
          ariaLabel="Back to the start"
          tone="plum"
          surface="strong"
          onClick={() => {
            playClickSound();
            stopVoice();
            onBack();
          }}
        />
        <div className="cp-pill flex items-center rounded-full px-4 py-2">
          <span className="cp-object-name font-rounded font-black">{activity.label}</span>
        </div>
        <div className="cp-pill flex items-center rounded-full px-3 py-2" role="status">
          <StarRow earned={phase === "free" ? index + 1 : index} total={total} size={18} />
        </div>
      </div>

      {/* the easel column: the ask, the card, the crayons */}
      <div className="pl-screen-scroll pl-safe-center relative z-10 flex flex-col items-center px-4 pb-4">
        <div className="cp-stage">
          <motion.p
            key={phase}
            className="lt-question font-rounded relative z-10 text-center font-black"
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            aria-live="polite"
          >
            {headline}
          </motion.p>

          <PaintCanvas
            activity={activity}
            color={chosen}
            onMainComplete={onMainComplete}
            handleRef={canvasHandle}
          />

          <div className="cp-crayons" role="group" aria-label="Crayons">
            {crayons.map((id) => (
              <Crayon
                key={id}
                color={PAINT_COLORS[id]}
                state={crayonState(id)}
                onPick={() => pick(id)}
              />
            ))}
          </div>

          {/* Free play's two ways out. They appear together, once the lesson
              is banked: keep going and start the picture over, or move on. */}
          <AnimatePresence>
            {phase === "free" && (
              <motion.div
                className="cp-actions"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  type="button"
                  className="lt-secondary font-rounded font-black"
                  onClick={() => {
                    playClickSound();
                    canvasHandle.current?.clear();
                  }}
                  aria-label="Start this picture again"
                >
                  Start over
                </button>
                <button
                  type="button"
                  className="lt-primary font-rounded font-black"
                  onClick={() => {
                    playClickSound();
                    stopVoice();
                    onDone();
                  }}
                  aria-label="Go to the next picture"
                >
                  Next
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
