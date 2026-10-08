"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Teacher } from "@games/door-count/components/Teacher";
import { Picture } from "@games/blend-read/components/PictureArt";
import { FinaleRain, useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";
import { Backdrop } from "@games/on-off/components/OoArt";
import { SCENES, starsFor } from "@games/on-off/constants/scenes";

/** "You put things on, and took them off!" — said after the cheer, and shown
 *  on the card with its ON and OFF drawn big. */
const DONE_CLIP = "onoff-done";

/**
 * THE FINISH — the portal's star card in the playroom: light pours down,
 * confetti falls with the six things raining among sparkles, the teacher
 * jumps, and the card shows the six things the child moved, the stars from
 * how few drags missed, and two ways on: Play again, Back to Games.
 */
export function OoComplete({
  misses,
  onPlayAgain,
  onExitPortal,
  onRecord,
}: {
  misses: number;
  onPlayAgain: () => void;
  onExitPortal: () => void;
  onRecord: (stars: number) => void;
}) {
  const stars = starsFor(misses);
  const cheerId = useMemo(() => cheerFor(misses), [misses]);
  const cast = useMemo(
    () =>
      SCENES.map((s) => (
        <span key={s.id} className="jf-cast">
          <Picture id={s.thing} />
        </span>
      )),
    []
  );

  useEffect(() => {
    onRecord(stars);
  }, [stars, onRecord]);

  useFinaleCheer(cheerId, DONE_CLIP);

  const go = (fn: () => void) => () => {
    playClickSound();
    fn();
  };

  return (
    <div className="oo-screen">
      <Backdrop id="room" />
      <FinaleRain cast={cast} />

      <div className="oo-teacher-slot" aria-hidden="true">
        <Teacher cheer />
      </div>

      <div className="oo-done-center">
        <motion.div
          className="oo-done-card"
          initial={{ scale: 0.86, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.2 }}
        >
          <h2 className="oo-done-title font-rounded font-black">{clipText(cheerId)}</h2>
          <p className="oo-done-sub font-rounded font-bold">
            {clipText(DONE_CLIP)
              .split(/\b(on|off)\b/)
              .map((part, i) =>
                i % 2 === 1 ? (
                  <em key={i} className={`oo-word oo-word--${part}`}>
                    {part.toUpperCase()}
                  </em>
                ) : (
                  part
                )
              )}
          </p>
          <div className="oo-done-things" aria-hidden="true">
            {SCENES.map((s, i) => (
              <motion.span
                key={s.id}
                className="oo-done-thing"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.3 }}
              >
                <Picture id={s.thing} />
              </motion.span>
            ))}
          </div>
          <StarRow earned={stars} total={3} size={40} />
          <div className="oo-done-buttons">
            <button
              type="button"
              className="oo-done-btn oo-done-btn--go font-rounded font-black"
              onClick={go(onPlayAgain)}
            >
              Play again
            </button>
            <button
              type="button"
              className="oo-done-btn font-rounded font-black"
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
