"use client";

import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { playClip, clipText } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Teacher } from "@games/door-count/components/Teacher";
import { Picture } from "@games/blend-read/components/PictureArt";
import { Kitchen, MouseHead } from "@games/find-the-mouse/components/SceneArt";
import type { FtmMode } from "@games/find-the-mouse/store/findTheMouseStore";

const ENTER_LINES = ["mouse-welcome", "mouse-pick-one"];

/** What each card says when it is tapped. */
const MODE_CLIPS: Record<FtmMode, string> = {
  peek: "mouse-mode-peek",
  count: "mouse-mode-count",
};

/**
 * THE TITLE SCREEN — the game's home. The name on a big plate, the teacher
 * inviting the child in, and one big card per way to play, each showing the
 * game in miniature (a mouse peeking from a hole; three mice to count) so a
 * child who can't read the label can still choose.
 *
 * Deliberately NOT the shared ChoiceScreen: its plates take a text preview,
 * and these cards need a picture of the game on them.
 */
export function FtmSplash({
  onPick,
  onExitPortal,
}: {
  onPick: (mode: FtmMode) => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(ENTER_LINES);

  const pick = (mode: FtmMode) => {
    playClickSound();
    // the card names itself — the round's own prompt queues after it
    void playClip(MODE_CLIPS[mode]);
    onPick(mode);
  };

  return (
    <div className="ftm-screen ftm-splash">
      <Kitchen />

      <div className="ftm-teacher-slot ftm-teacher-slot--splash" aria-hidden="true">
        <Teacher cheer={false} say={clipText("mouse-pick-one")} />
      </div>

      <div className="ftm-splash-col">
        <motion.div
          className="ftm-title-plate"
          initial={{ y: -22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 18 }}
        >
          <span className="ftm-title-icon" aria-hidden="true">
            <Picture id="cheese" />
          </span>
          <h1 className="ftm-title font-rounded font-black">Where Is the Mouse?</h1>
          <span className="ftm-title-icon" aria-hidden="true">
            <Picture id="mouse" />
          </span>
        </motion.div>

        <div className="ftm-modes">
          <motion.button
            type="button"
            className="ftm-mode ftm-mode--peek"
            onClick={() => pick("peek")}
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 19 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Peek-a-Mouse: watch which hole the mouse peeks from, then tap that hole"
          >
            <span className="ftm-mini" aria-hidden="true">
              <span className="ftm-mini-hole" />
              <span className="ftm-mini-hole">
                <span className="ftm-mini-mask">
                  <span className="ftm-mini-head ftm-mini-head--peekaboo">
                    <MouseHead />
                  </span>
                </span>
              </span>
              <span className="ftm-mini-hole" />
            </span>
            <span className="ftm-mode-name font-rounded font-black">Peek-a-Mouse</span>
            <span className="ftm-mode-tag font-rounded font-bold">Watch where it hides</span>
            <span className="ftm-mode-go" aria-hidden="true">
              ▶
            </span>
          </motion.button>

          <motion.button
            type="button"
            className="ftm-mode ftm-mode--count"
            onClick={() => pick("count")}
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22, type: "spring", stiffness: 220, damping: 19 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Count the Mice: count how many mice are peeking, then tap the number"
          >
            <span className="ftm-mini" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span key={n} className="ftm-mini-hole">
                  <span className="ftm-mini-mask">
                    <span className="ftm-mini-head">
                      <MouseHead />
                    </span>
                  </span>
                  <span className="ftm-mini-num font-rounded font-black">{n}</span>
                </span>
              ))}
            </span>
            <span className="ftm-mode-name font-rounded font-black">Count the Mice</span>
            <span className="ftm-mode-tag font-rounded font-bold">How many can you see?</span>
            <span className="ftm-mode-go" aria-hidden="true">
              ▶
            </span>
          </motion.button>
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
