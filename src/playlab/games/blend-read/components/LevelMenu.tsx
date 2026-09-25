"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { ClassroomScene } from "@games/blend-read/components/ClassroomScene";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import {
  LEVELS,
  LEVEL_ORDER,
  questionCount,
  type LevelId,
} from "@games/blend-read/constants/levels";

interface LevelMenuProps {
  progress: Record<LevelId, number>;
  onBack: () => void;
  onPick: (id: LevelId) => void;
}

/** State 3 — five big square tiles in a wrapping grid over the same
 *  classroom, easiest first. Reopening a level that is already finished
 *  starts it over (the store handles that), so a tile never shows a dead
 *  end. */
export function LevelMenu({ progress, onBack, onPick }: LevelMenuProps) {
  useEffect(() => {
    void playClip("blend-menu");
  }, []);

  return (
    <div className="br-screen pl-screen-shell">
      <ClassroomScene />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-3 px-6 py-4">
        <motion.h1
          className="br-menu-title font-rounded font-black"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Blend &amp; Seek
        </motion.h1>

        <div className="br-menu-grid">
          {LEVEL_ORDER.map((id, i) => {
            const total = questionCount(id);
            const done = progress[id];
            const finished = done >= total;
            return (
              <motion.button
                key={id}
                type="button"
                className="br-menu-tile font-rounded font-black"
                data-n={i + 1}
                aria-label={`${LEVELS[id].title}${finished ? ", complete" : done > 0 ? `, ${done} of ${total} done` : ""}`}
                onClick={() => {
                  playClickSound();
                  onPick(id);
                }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.06 + i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.04 }}
              >
                <span className="br-menu-tile-num">{i + 1}</span>
                <span className="br-menu-tile-label">Level</span>
                {finished ? (
                  <span className="br-menu-badge" aria-hidden="true">
                    ★
                  </span>
                ) : done > 0 ? (
                  <span className="br-menu-badge br-menu-badge--partial" aria-hidden="true">
                    {done}/{total}
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
