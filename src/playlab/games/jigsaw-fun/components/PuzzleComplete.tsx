"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { harderThan, type Level } from "@games/jigsaw-fun/constants/levels";
import { FinaleRain, useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";

/** What a game shows on its star card for one finished puzzle. */
export interface PuzzleFinale {
  accent: string;
  /** What rains down behind the card. */
  cast: readonly ReactNode[];
  /** The finished puzzle, in the frame. */
  art: ReactNode;
  /** What jumps up out of the frame to cheer. */
  hero: ReactNode;
  /** "You finished the lion in 4 pieces!" */
  line: string;
  /** The button up a level: "Try 6 pieces", "Try Hard". */
  harderLabel: (level: Level) => string;
  /** Which way the frame leans (-1 left, 1 right). */
  lean: 1 | -1;
}

/**
 * THE STAR CARD — a puzzle done (Jigsaw Fun, Tangram Town). Light pours down,
 * the finished puzzle swings in in its frame and its hero jumps out of it to
 * cheer, confetti falls with the cast raining among sparkles, and the card
 * shows the stars and the ways on: the same puzzle again, the next level up
 * (when there is one), another picture, or back to the games.
 */
export function PuzzleComplete({
  prefix,
  world,
  finale,
  level,
  stars,
  cheerId,
  afterCheer,
  onPlay,
  onChoose,
  onExitPortal,
}: {
  prefix: string;
  world: ReactNode;
  finale: PuzzleFinale;
  level: Level;
  stars: number;
  cheerId: string;
  /** A clip said once the cheer has finished ("Ready for more pieces?"). */
  afterCheer?: string;
  /** Play this picture at a level — this one again, or the next one up. */
  onPlay: (level: Level) => void;
  onChoose: () => void;
  onExitPortal: () => void;
}) {
  const harder = harderThan(level);
  useFinaleCheer(cheerId, afterCheer);

  const go = (fn: () => void) => () => {
    playClickSound();
    fn();
  };
  const btn = `${prefix}-done-btn font-rounded font-black`;

  return (
    <div
      className={`${prefix}-screen ${prefix}-done`}
      style={{ [`--${prefix}-accent`]: finale.accent } as CSSProperties}
    >
      {world}
      <FinaleRain cast={finale.cast} />

      <div className={`${prefix}-done-row`}>
        <motion.div
          className={`${prefix}-frame`}
          initial={{ y: -40, rotate: 14 * finale.lean, opacity: 0 }}
          animate={{ y: 0, rotate: 3 * finale.lean, opacity: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 12, delay: 0.1 }}
        >
          <span className={`${prefix}-frame-art`}>{finale.art}</span>
          <motion.span
            className={`${prefix}-frame-hero`}
            initial={{ y: "40%", opacity: 0 }}
            animate={{ y: ["40%", "-30%", "0%", "-16%", "0%"], opacity: 1 }}
            transition={{ delay: 0.7, duration: 1.4, ease: "easeOut" }}
          >
            {finale.hero}
          </motion.span>
        </motion.div>

        <motion.div
          className={`${prefix}-done-card`}
          initial={{ scale: 0.86, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.25 }}
        >
          <h2 className={`${prefix}-done-title font-rounded font-black`}>{clipText(cheerId)}</h2>
          <p className={`${prefix}-done-sub font-rounded font-bold`}>{finale.line}</p>
          <StarRow earned={stars} total={3} size={40} />
          <div className={`${prefix}-done-buttons`}>
            <button
              type="button"
              className={`${btn} ${prefix}-done-btn--go`}
              onClick={go(() => onPlay(level))}
            >
              Play again
            </button>
            {harder && (
              <button
                type="button"
                className={`${btn} ${prefix}-done-btn--up`}
                onClick={go(() => onPlay(harder))}
              >
                {finale.harderLabel(harder)}
              </button>
            )}
            <button type="button" className={btn} onClick={go(onChoose)}>
              Another picture
            </button>
            <button type="button" className={btn} onClick={go(onExitPortal)}>
              Back to Games
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
