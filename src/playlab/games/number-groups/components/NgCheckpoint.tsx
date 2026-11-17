"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { StarRow } from "@shared/components/ui/StarRow";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Picture } from "@games/blend-read/components/PictureArt";
import { NgGuide } from "@games/number-groups/components/NgGuide";
import { FinaleRain, useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";
import type { ModuleInfo } from "@games/number-groups/constants/kit";

const CAST = [0, 1, 2].map((i) => (
  <span key={i} className="ng-cast">
    <Picture id="star" />
  </span>
));

/**
 * A BREAK IN A LONG RUN (NgShell's `breakEvery`): after a set of questions the
 * finale's light, confetti and stars come, the cheer is said, and two big
 * buttons wait: Continue plays the next set, Back goes to the game's home.
 */
export function NgCheckpoint<Id extends string>({
  info,
  world,
  cheerSeed,
  part,
  parts,
  onContinue,
  onBack,
}: {
  info: ModuleInfo<Id>;
  world: ReactNode;
  cheerSeed: number;
  /** Sets finished so far, and how many the run has. */
  part: number;
  parts: number;
  onContinue: () => void;
  onBack: () => void;
}) {
  const cheerId = useMemo(() => cheerFor(cheerSeed), [cheerSeed]);
  useFinaleCheer(cheerId);

  const go = (fn: () => void) => () => {
    playClickSound();
    fn();
  };

  return (
    <div className="ng-screen ng-done ng-break">
      {world}
      <FinaleRain cast={CAST} />

      <div className="ng-teacher-slot ng-teacher-slot--home" aria-hidden="true">
        <NgGuide cheer say={clipText(cheerId)} />
      </div>

      <div className="ng-done-center">
        <motion.div
          className="ng-done-card ng-break-card"
          style={cssVars({ "--ng-accent": info.accent, "--ng-edge": info.edge })}
          initial={{ scale: 0.84, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 }}
        >
          <h2 className="ng-done-title font-rounded font-black">{clipText(cheerId)}</h2>
          <StarRow earned={part} total={parts} size={44} />
          <div className="ng-break-buttons">
            <button
              type="button"
              className="ng-break-btn ng-break-btn--back font-rounded font-black"
              onClick={go(onBack)}
            >
              <span aria-hidden="true">◀</span> Back
            </button>
            <button
              type="button"
              className="ng-break-btn ng-break-btn--go font-rounded font-black"
              onClick={go(onContinue)}
            >
              Continue <span aria-hidden="true">▶</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
