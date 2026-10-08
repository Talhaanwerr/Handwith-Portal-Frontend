"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Confetti } from "@shared/components/game/Confetti";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound, playFanfare } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { moduleInfo, roundCount, type ModuleId } from "@games/color-shape-friends/constants/rounds";
import { BerryArt, SplashArt } from "@games/color-shape-friends/components/Friends";

interface CompleteScreenProps {
  module: ModuleId;
  stars: number;
  onAgain: () => void;
  onChoose: () => void;
  onExitPortal: () => void;
}

/**
 * The end of a module, in the portal's house style (Math Maze's and Number
 * Safari's prize card): confetti over the playroom, a white star card with
 * the `cheerFor()` praise, the stars this run earned, and the three ways on —
 * Play again (the same module from round one), Choose another (the title
 * screen) and Back to Games (the root's PORTAL_ROUTE exit). Berry and his
 * friend Splash cheer from the floor either side.
 */
export function CompleteScreen({
  module,
  stars,
  onAgain,
  onChoose,
  onExitPortal,
}: CompleteScreenProps) {
  const cheer = cheerFor(module);
  const info = moduleInfo(module);

  useEffect(() => {
    // cheer → "You know your colors!" → fanfare, one after another. `live`
    // keeps a stopped cheer (Play again, Back) from starting the rest late.
    let live = true;
    void playClip(cheer)
      .then(() => (live ? sayAfter(info.doneClip) : undefined))
      .then(() => {
        if (live) playFanfare();
      });
    return () => {
      live = false;
    };
  }, [cheer, info.doneClip]);

  return (
    <div className="csf-done">
      <div className="csf-done-tint" aria-hidden="true" />
      <Confetti count={48} />

      <div className="csf-done-friend csf-done-friend--berry" aria-hidden="true">
        <BerryArt mood="cheer" />
      </div>
      <div className="csf-done-friend csf-done-friend--splash" aria-hidden="true">
        <SplashArt mood="cheer" />
      </div>

      <motion.div
        className="csf-done-card"
        initial={{ scale: 0.84, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <h1 className="csf-done-title font-rounded font-black">
          {clipText(cheer) || "Great job!"}
        </h1>
        <p className="csf-done-sub font-rounded font-bold">
          {info.name} · {roundCount(module)} rounds
        </p>
        <span className="csf-done-stars">
          <StarRow earned={stars} total={3} size={44} />
        </span>
        <div className="csf-done-buttons">
          <button
            type="button"
            className="csf-done-btn csf-done-btn--go font-rounded font-black"
            onClick={() => {
              playClickSound();
              onAgain();
            }}
            aria-label={`Play ${info.name} again`}
          >
            Play again
          </button>
          <button
            type="button"
            className="csf-done-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onChoose();
            }}
            aria-label="Choose another game"
          >
            Choose another
          </button>
          <button
            type="button"
            className="csf-done-btn font-rounded font-black"
            onClick={onExitPortal}
            aria-label="Back to the game portal"
          >
            Back to Games
          </button>
        </div>
      </motion.div>
    </div>
  );
}
