"use client";

import { motion } from "framer-motion";
import { ProgressBar } from "@shared/components/ui/ProgressBar";

interface HudProps {
  /** The line the child has to act on right now. */
  prompt: string;
  /** The title screen also carries the game's name. */
  showTitle: boolean;
  /** 0–1 across the module's rounds, or null to hide the bar. */
  progress: number | null;
}

/**
 * The top-centre plate: the game's name on the title screen, the current
 * instruction always, and a progress bar across the module's rounds. It is
 * mounted once by the root (so it never cross-fades with the screens), sits
 * between the two pinned pills, and takes no taps — the top band belongs to
 * the pills.
 */
export function Hud({ prompt, showTitle, progress }: HudProps) {
  return (
    <div className={`csf-hud ${showTitle ? "csf-hud--title" : ""}`}>
      <motion.div
        className="csf-plate"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
      >
        {/* "Rainbow" one letter per colour of the rainbow, the rest in ink */}
        {showTitle && (
          <h1 className="csf-plate-title font-rounded font-black" aria-label="Rainbow Shapes">
            {"Rainbow".split("").map((ch, i) => (
              <span
                key={i}
                className={`csf-title-letter csf-title-letter--${i}`}
                aria-hidden="true"
              >
                {ch}
              </span>
            ))}
            <span className="csf-title-rest" aria-hidden="true">
              {" Shapes"}
            </span>
          </h1>
        )}
        <motion.p
          key={prompt}
          className="csf-plate-prompt font-rounded font-black"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          aria-live="polite"
        >
          {prompt}
        </motion.p>
        {progress !== null && (
          <ProgressBar
            value={progress}
            trackClassName="csf-progress"
            fillClassName="csf-progress-fill"
            ariaLabel="Activities finished"
          />
        )}
      </motion.div>
    </div>
  );
}
