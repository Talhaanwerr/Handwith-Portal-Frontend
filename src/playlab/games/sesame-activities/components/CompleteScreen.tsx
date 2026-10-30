"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Confetti } from "@shared/components/game/Confetti";
import { StarRow } from "@shared/components/ui/StarRow";
import { playCelebrationSound } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { BirdArt } from "@games/sesame-activities/components/SesameArt";
import { StreetWorld } from "@games/sesame-activities/components/HomeScreen";
import { MODULES, ROUNDS, type ModuleId } from "@games/sesame-activities/constants/content";

/** The finish: back on the street, confetti, and the white star card — the
 *  cheer (shared `cheerFor()` rotation), the stars this run earned, and
 *  Play again / Choose another / Back to Games. */
export function CompleteScreen({
  moduleId,
  stars,
  onPlayAgain,
  onChoose,
  onExitPortal,
}: {
  moduleId: ModuleId;
  stars: number;
  onPlayAgain: () => void;
  onChoose: () => void;
  onExitPortal: () => void;
}) {
  const cheer = cheerFor(stars + 1);
  const doneClip = MODULES[moduleId].doneClip;

  useEffect(() => {
    playCelebrationSound();
    // cheer, then "You matched all the balls!" — `live` keeps a stopped
    // cheer (Play again, Back) from starting the second line late
    let live = true;
    void playClip(cheer).then(() => (live ? sayAfter(doneClip) : undefined));
    return () => {
      live = false;
    };
  }, [cheer, doneClip]);

  return (
    <div className="sa-world sa-world--street sa-world--done">
      <StreetWorld />
      <Confetti count={36} />

      <div className="sa-done-center">
        <motion.div
          className="sa-done-card"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
        >
          <div className="sa-done-percy" aria-hidden="true">
            <BirdArt happy />
          </div>
          <h1 className="sa-done-title font-rounded font-black">
            {clipText(cheer) || "You did it!"}
          </h1>
          <p className="sa-done-sub font-rounded font-bold">
            {MODULES[moduleId].title} · {ROUNDS} rounds
          </p>
          <div className="sa-done-stars">
            <StarRow earned={stars} total={3} size={40} />
          </div>
          <div className="sa-done-buttons">
            <button
              className="sa-done-btn sa-done-btn--go font-rounded font-black"
              onClick={onPlayAgain}
            >
              Play again
            </button>
            <button className="sa-done-btn font-rounded font-black" onClick={onChoose}>
              Choose another
            </button>
            <button className="sa-done-btn font-rounded font-black" onClick={onExitPortal}>
              Back to Games
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
