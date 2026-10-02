"use client";

import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { playClip, clipText } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Teacher } from "@games/door-count/components/Teacher";
import { DotFace, Frog, Pond } from "@games/pond-numbers/components/PondArt";
import type { ModuleId } from "@games/pond-numbers/constants/rounds";

const ENTER_LINES = ["pond-welcome", "mouse-pick-one"];

/** What each card says when it is tapped. */
const MODE_CLIPS: Record<ModuleId, string> = {
  quick: "pond-mode-quick",
  more: "pond-mode-more",
};

/**
 * THE TITLE SCREEN — the game's home: the name on a plate, the teacher on the
 * bank, and one big card per module showing it in miniature (a card of dots;
 * frogs on a log with one more hopping on), so a child who can't read the
 * labels can still choose.
 */
export function PnHome({
  onPick,
  onExitPortal,
}: {
  onPick: (module: ModuleId) => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(ENTER_LINES);

  const pick = (m: ModuleId) => {
    playClickSound();
    // the card names itself — the round's own prompt queues after it
    void playClip(MODE_CLIPS[m]);
    onPick(m);
  };

  return (
    <div className="pn-screen pn-home">
      <Pond />

      <div className="pn-teacher-slot pn-teacher-slot--home" aria-hidden="true">
        <Teacher cheer={false} say={clipText("mouse-pick-one")} />
      </div>

      <div className="pn-home-col">
        <motion.div
          className="pn-title-plate"
          initial={{ y: -22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 18 }}
        >
          <span className="pn-title-icon" aria-hidden="true">
            <Frog />
          </span>
          <h1 className="pn-title font-rounded font-black">Pond Numbers</h1>
          <span className="pn-title-icon" aria-hidden="true">
            <Frog />
          </span>
        </motion.div>

        <div className="pn-modes">
          <motion.button
            type="button"
            className="pn-mode pn-mode--quick"
            onClick={() => pick("quick")}
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 19 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Quick Look: see the dots for a moment, then say how many"
          >
            <span className="pn-mini pn-mini--quick" aria-hidden="true">
              <span className="pn-mini-card">
                <DotFace count={5} color="#E5484D" />
              </span>
            </span>
            <span className="pn-mode-name font-rounded font-black">Quick Look</span>
            <span className="pn-mode-tag font-rounded font-bold">How many dots did you see?</span>
            <span className="pn-mode-go" aria-hidden="true">
              ▶
            </span>
          </motion.button>

          <motion.button
            type="button"
            className="pn-mode pn-mode--more"
            onClick={() => pick("more")}
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22, type: "spring", stiffness: 220, damping: 19 }}
            whileTap={{ scale: 0.96 }}
            aria-label="One More: one more frog hops on the log, how many now?"
          >
            <span className="pn-mini pn-mini--more" aria-hidden="true">
              <span className="pn-mini-log">
                <span className="pn-mini-frog">
                  <Frog />
                </span>
                <span className="pn-mini-frog">
                  <Frog />
                </span>
                <span className="pn-mini-frog pn-mini-frog--hop">
                  <Frog />
                </span>
              </span>
              <span className="pn-mini-plus font-rounded font-black">+1</span>
            </span>
            <span className="pn-mode-name font-rounded font-black">One More</span>
            <span className="pn-mode-tag font-rounded font-bold">One more frog hops on!</span>
            <span className="pn-mode-go" aria-hidden="true">
              ▶
            </span>
          </motion.button>
        </div>
      </div>

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="jungle"
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
