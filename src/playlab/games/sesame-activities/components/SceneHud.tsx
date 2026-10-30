"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { ROUNDS } from "@games/sesame-activities/constants/content";

/** What every module's scene gets from the root: which round (0-based), and
 *  who to tell about a wrong tap and a solved round. */
export interface RoundProps {
  round: number;
  onMiss: () => void;
  onNext: () => void;
}

/**
 * The one instruction plate every module uses: what to do now (or the cheer
 * once a round is solved), an optional picture of what to look for, and a
 * six-step progress bar. Sits top-centre between the two pinned pills;
 * nothing in it is tappable.
 */
export function SceneHud({
  text,
  picture,
  done,
}: {
  text: string;
  picture?: ReactNode;
  /** Rounds finished so far (0–6). */
  done: number;
}) {
  return (
    <div className="sa-hud">
      <div className="sa-hud-plate" role="status" aria-live="polite">
        <div className="sa-hud-line">
          {picture && <span className="sa-hud-pic">{picture}</span>}
          {/* old and new line share one grid cell, so a swap cross-fades in place */}
          <span className="sa-hud-textstack">
            <AnimatePresence initial={false}>
              <motion.p
                key={text}
                className="sa-hud-text font-rounded font-black"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {text}
              </motion.p>
            </AnimatePresence>
          </span>
        </div>
        <ProgressBar
          value={done / ROUNDS}
          trackClassName="sa-progress-track"
          fillClassName="sa-progress-fill"
          ariaLabel={`${done} of ${ROUNDS} rounds done`}
        />
      </div>
    </div>
  );
}

/** A big "Well done!"-style word that pops up over the scene for a moment. */
export function CheerPop({ text }: { text: string }) {
  return (
    <div className="sa-cheer-wrap" aria-hidden="true">
      <motion.p
        className="sa-cheer-pop font-rounded font-black"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 16 }}
      >
        {text}
      </motion.p>
    </div>
  );
}
