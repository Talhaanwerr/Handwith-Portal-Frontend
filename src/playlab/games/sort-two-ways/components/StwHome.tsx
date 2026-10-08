"use client";

import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Teacher } from "@games/door-count/components/Teacher";
import { Playroom } from "@games/jigsaw-fun/components/JfStage";
import { ThingArt } from "@games/sort-two-ways/components/ThingArt";
import { MODULES, slotsOf, type ModuleId } from "@games/sort-two-ways/constants/boards";

/** What each card says when it is tapped: its name and its two rules. The
 *  line runs on into the round, where the first board's prompt queues behind
 *  it. */
const MODE_CLIP: Record<ModuleId, string> = {
  shapes: "sort2-mode-shapes",
  animals: "sort2-mode-animals",
  sweets: "sort2-mode-sweets",
};

/**
 * THE TITLE SCREEN — the game's home: the name on a plate, the teacher by the
 * table, and one big card per module showing its first board already sorted
 * (two little trays of the real things), with the best stars earned on it.
 */
export function StwHome({
  best,
  onPick,
  onExitPortal,
}: {
  best: Partial<Record<ModuleId, number>>;
  onPick: (m: ModuleId) => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["sort2-welcome", "mouse-pick-one"]);

  return (
    <div className="stw-screen stw-home">
      <Playroom roomy />

      <div className="stw-teacher-slot stw-teacher-slot--home" aria-hidden="true">
        <Teacher cheer={false} say={clipText("mouse-pick-one")} />
      </div>

      <div className="stw-home-col">
        <motion.div
          className="stw-title-plate"
          initial={{ y: -22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 18 }}
        >
          <h1 className="stw-title font-rounded font-black">Sort Two Ways</h1>
          <p className="stw-subtitle font-rounded font-bold">The same things, sorted two ways</p>
        </motion.div>

        <div className="stw-modes">
          {MODULES.map((m, i) => {
            const set = m.sets[0];
            const first = set.boards[0];
            return (
              <motion.button
                key={m.id}
                type="button"
                className={`stw-mode stw-mode--${m.id}`}
                onClick={() => {
                  playClickSound();
                  void playClip(MODE_CLIP[m.id]);
                  onPick(m.id);
                }}
                initial={{ y: 26, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 220, damping: 19 }}
                whileTap={{ scale: 0.96 }}
                aria-label={m.aria}
              >
                <span className="stw-mini" aria-hidden="true">
                  {([0, 1] as const).map((t) => (
                    <span key={t} className="stw-mini-tray">
                      {slotsOf(set, first, t).map((thing) => (
                        <span key={thing.id} className="stw-mini-slot">
                          <ThingArt thing={thing} />
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
                <span className="stw-mode-name font-rounded font-black">{m.name}</span>
                <span className="stw-mode-tag font-rounded font-bold">{m.tag}</span>
                <span className="stw-mode-stars">
                  <StarRow earned={best[m.id] ?? 0} total={3} size={16} />
                </span>
                <span className="stw-mode-go" aria-hidden="true">
                  ▶
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />
    </div>
  );
}
