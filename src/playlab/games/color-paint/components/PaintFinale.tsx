"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { useElementSize } from "@shared/hooks/useElementSize";
import { playCelebrationSound } from "@shared/audio/sfx";
import { playClip, clipText, stopVoice } from "@shared/audio/voice";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { ACTIVITIES, ART_BOX } from "@games/color-paint/constants/activities";
import { PAINT_COLORS, RAINBOW_ORDER, OUTLINE_INK } from "@games/color-paint/constants/colors";
import { ObjectOutline } from "@games/color-paint/components/ObjectOutline";

/** The finale's own cheer — the one that says what just happened. */
const FINALE_CLIP = "cheer-you-did-it";

/** Rainbow geometry, in ART_BOX units: the outer radius and one band's width. */
const RAINBOW_OUTER = 92;
const RAINBOW_BAND = 11;

interface PaintFinaleProps {
  onPlayAgain: () => void;
  onExitPortal: () => void;
}

/**
 * The rainbow — every colour the child just learned, stacked into one shape.
 *
 * Under it, the crayons in the same order, and the seven pictures as they
 * were painted. Kept still on purpose: the sparkle canvas and the Bee are the
 * only things that move, so the rainbow itself reads as a finished piece of
 * work rather than as another animation.
 */
export function PaintFinale({ onPlayAgain, onExitPortal }: PaintFinaleProps) {
  const [rootRef, dims] = useElementSize<HTMLDivElement>();

  // Cheer first, jingle after — never talking over itself.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      void playClip(FINALE_CLIP).then(() => {
        if (!cancelled) playCelebrationSound();
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
      stopVoice();
    };
  }, []);

  return (
    <div ref={rootRef} className="lt-screen lt-wash pl-screen-shell">
      <CandyScene variant="soft" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <CelebrationSparkles active width={dims.w} height={dims.h} />
      </div>

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-4 px-6 py-6">
        <motion.h1
          className="lt-done-headline font-rounded relative z-10 text-center font-black"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {clipText(FINALE_CLIP)}
        </motion.h1>

        {/* The rainbow: one arc per colour, outermost first, so the bands
            nest. Drawn as thick stroked arcs rather than filled rings — the
            same fat coloring-book line as everything else in the game. */}
        <motion.svg
          className="cp-rainbow relative z-10"
          viewBox={`0 0 ${ART_BOX} ${ART_BOX / 2 + RAINBOW_BAND}`}
          role="img"
          aria-label="A rainbow"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.2 }}
        >
          <g fill="none" strokeLinecap="round">
            {RAINBOW_ORDER.map((id, i) => {
              const r = RAINBOW_OUTER - i * RAINBOW_BAND;
              const cx = ART_BOX / 2;
              const cy = ART_BOX / 2;
              return (
                <path
                  key={id}
                  d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  stroke={PAINT_COLORS[id].fill}
                  strokeWidth={RAINBOW_BAND}
                />
              );
            })}
            {/* the ink edge around the whole arch */}
            <path
              d={`M ${ART_BOX / 2 - RAINBOW_OUTER - RAINBOW_BAND / 2} ${ART_BOX / 2} A ${
                RAINBOW_OUTER + RAINBOW_BAND / 2
              } ${RAINBOW_OUTER + RAINBOW_BAND / 2} 0 0 1 ${
                ART_BOX / 2 + RAINBOW_OUTER + RAINBOW_BAND / 2
              } ${ART_BOX / 2}`}
              stroke={OUTLINE_INK}
              strokeWidth="4"
            />
          </g>
        </motion.svg>

        <motion.div
          className="relative z-10 flex items-end gap-3"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <div className="cp-intro-bee" style={{ width: "clamp(72px, 14vmin, 120px)" }}>
            <Bee mood="cheer" />
          </div>
          {/* the crayons, in rainbow order */}
          <div className="cp-finale-row" aria-label="The crayons" role="img">
            {RAINBOW_ORDER.map((id) => (
              <svg
                key={id}
                className="cp-finale-crayon"
                viewBox="0 0 60 120"
                aria-hidden="true"
                focusable="false"
              >
                <g stroke={OUTLINE_INK} strokeWidth="5" strokeLinejoin="round">
                  <path d="M30 6 L44 30 L16 30 Z" fill={PAINT_COLORS[id].fill} />
                  <rect x="12" y="30" width="36" height="82" rx="8" fill={PAINT_COLORS[id].fill} />
                  <rect x="12" y="52" width="36" height="18" fill={PAINT_COLORS[id].shade} />
                </g>
              </svg>
            ))}
          </div>
        </motion.div>

        {/* every picture, painted */}
        <motion.div
          className="cp-finale-row relative z-10"
          role="img"
          aria-label="Everything you painted"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {ACTIVITIES.map((a) => (
            <div key={a.id} className="cp-finale-object">
              {/* every part in the colour it was meant to be */}
              <ObjectOutline activity={a} filled className="h-full w-full" />
            </div>
          ))}
        </motion.div>

        <motion.div
          className="relative z-10 flex w-full max-w-sm flex-col items-center gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            size="xl"
            onClick={onPlayAgain}
            className="w-full"
            aria-label="Paint them all again"
          >
            Paint Again
          </Button>
          <Button
            size="md"
            variant="secondary"
            onClick={onExitPortal}
            className="w-full"
            aria-label="Back to the game portal"
          >
            Back to Games
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
