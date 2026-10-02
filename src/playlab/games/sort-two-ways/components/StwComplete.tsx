"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Teacher } from "@games/door-count/components/Teacher";
import { FinaleRain, useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";
import { Playroom } from "@games/jigsaw-fun/components/JfStage";
import { ThingArt } from "@games/sort-two-ways/components/ThingArt";
import {
  MODULE_IDS,
  moduleById,
  slotsOf,
  starsFor,
  type ModuleId,
} from "@games/sort-two-ways/constants/boards";

/** "You sorted them two ways!" — said after the cheer; the card's title. */
const DONE_CLIP = "sort2-done";

/**
 * THE FINISH — light pours down, confetti falls with the module's things
 * raining among sparkles, the teacher cheers, and the star card shows the
 * lesson itself: the SAME six things, sorted one way and then the other.
 */
export function StwComplete({
  module,
  misses,
  onPlayAgain,
  onChoose,
  onExitPortal,
  onRecord,
}: {
  module: ModuleId;
  misses: number;
  onPlayAgain: () => void;
  onChoose: () => void;
  onExitPortal: () => void;
  onRecord: (m: ModuleId, stars: number) => void;
}) {
  const m = moduleById(module);
  const set = m.sets[1];
  const stars = starsFor(misses);
  const cheerId = useMemo(
    () => cheerFor(MODULE_IDS.indexOf(module) * 3 + misses),
    [module, misses]
  );
  const cast = useMemo(
    () =>
      set.things.slice(0, 4).map((t) => (
        <span key={t.id} className="stw-cast">
          <ThingArt thing={t} />
        </span>
      )),
    [set]
  );

  useEffect(() => {
    onRecord(module, stars);
  }, [module, stars, onRecord]);

  useFinaleCheer(cheerId, DONE_CLIP);

  const go = (fn: () => void) => () => {
    playClickSound();
    fn();
  };

  return (
    <div className="stw-screen stw-done">
      <Playroom roomy />
      <FinaleRain cast={cast} />

      <div className="stw-teacher-slot stw-teacher-slot--done" aria-hidden="true">
        <Teacher cheer say={clipText(cheerId)} />
      </div>

      <div className="stw-done-center">
        <motion.div
          className="stw-done-card"
          initial={{ scale: 0.86, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.2 }}
        >
          <h2 className="stw-done-title font-rounded font-black">{clipText(DONE_CLIP)}</h2>
          <p className="stw-done-sub font-rounded font-bold">{m.name}</p>
          <div className="stw-done-ways" aria-hidden="true">
            {set.boards.map((board, k) => (
              <motion.span
                key={board.id}
                className="stw-done-way"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + k * 0.18, duration: 0.3 }}
              >
                <span className="stw-mini stw-mini--done">
                  {([0, 1] as const).map((t) => (
                    <span key={t} className="stw-mini-tray">
                      {slotsOf(set, board, t).map((thing) => (
                        <span key={thing.id} className="stw-mini-slot">
                          <ThingArt thing={thing} />
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
                <span className="stw-done-rule font-rounded font-black">
                  {k === 0 ? "One way" : "Another way"}
                </span>
              </motion.span>
            ))}
          </div>
          <StarRow earned={stars} total={3} size={40} />
          <div className="stw-done-buttons">
            <button
              type="button"
              className="stw-done-btn stw-done-btn--go font-rounded font-black"
              onClick={go(onPlayAgain)}
            >
              Play again
            </button>
            <button
              type="button"
              className="stw-done-btn font-rounded font-black"
              onClick={go(onChoose)}
            >
              Another game
            </button>
            <button
              type="button"
              className="stw-done-btn font-rounded font-black"
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
