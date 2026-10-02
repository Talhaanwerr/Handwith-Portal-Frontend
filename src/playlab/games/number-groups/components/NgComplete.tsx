"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { StarRow } from "@shared/components/ui/StarRow";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Picture } from "@games/blend-read/components/PictureArt";
import { Teacher } from "@games/door-count/components/Teacher";
import { FinaleRain, useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";
import { ROUND_COUNT, starsFor, type ModuleInfo } from "@games/number-groups/constants/kit";

/** The stars that rain over the finale. */
const CAST = [0, 1, 2].map((i) => (
  <span key={i} className="ng-cast">
    <Picture id="star" />
  </span>
));

/**
 * THE FINISH — Jigsaw Fun's finale (`FinaleRain`, `useFinaleCheer`) in Pond
 * Numbers' star card: light pours down over the game's world, confetti falls
 * and stars rain in a beat later, the cheer is said and then the game's own
 * line, the teacher jumps, and a card shows the module in miniature, the stars earned
 * (from how few misses the run took) and three ways on.
 */
export function NgComplete<Id extends string>({
  info,
  mini,
  world,
  cheerSeed,
  doneClip,
  misses,
  onPlayAgain,
  onChoose,
  onExitPortal,
  onRecord,
}: {
  info: ModuleInfo<Id>;
  mini: ReactNode;
  world: ReactNode;
  cheerSeed: number;
  /** The game's own line, said after the cheer. */
  doneClip: string;
  misses: number;
  onPlayAgain: () => void;
  onChoose: () => void;
  onExitPortal: () => void;
  onRecord: (m: Id, stars: number) => void;
}) {
  const stars = starsFor(misses);
  const cheerId = useMemo(() => cheerFor(cheerSeed), [cheerSeed]);

  useEffect(() => {
    onRecord(info.id, stars);
  }, [info.id, stars, onRecord]);

  useFinaleCheer(cheerId, doneClip);

  const go = (fn: () => void) => () => {
    playClickSound();
    fn();
  };

  return (
    <div className="ng-screen ng-done">
      {world}
      <FinaleRain cast={CAST} />

      <div className="ng-teacher-slot ng-teacher-slot--home" aria-hidden="true">
        <Teacher cheer say={clipText(cheerId)} />
      </div>

      <div className="ng-done-center">
        <motion.div
          className="ng-done-card"
          style={cssVars({ "--ng-accent": info.accent, "--ng-edge": info.edge })}
          initial={{ scale: 0.84, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 }}
        >
          <span className="ng-done-pic">{mini}</span>
          <h2 className="ng-done-title font-rounded font-black">{clipText(cheerId)}</h2>
          <p className="ng-done-sub font-rounded font-bold">
            {info.name} · {ROUND_COUNT} rounds
          </p>
          <StarRow earned={stars} total={3} size={40} />
          <div className="ng-done-buttons">
            <button
              type="button"
              className="ng-done-btn ng-done-btn--go font-rounded font-black"
              onClick={go(onPlayAgain)}
            >
              Play again
            </button>
            <button
              type="button"
              className="ng-done-btn font-rounded font-black"
              onClick={go(onChoose)}
            >
              Pick another
            </button>
            <button
              type="button"
              className="ng-done-btn font-rounded font-black"
              onClick={go(onExitPortal)}
            >
              Back to Games
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
