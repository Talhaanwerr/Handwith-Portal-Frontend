"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { playClickSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { MODULES } from "@games/shape-match/constants/modules";
import { SCENES } from "@games/shape-match/constants/scenes";
import { ScenePicture } from "@games/shape-match/components/SceneArt";
import { Tick } from "@games/shape-match/components/ShapeArt";
import { Leo } from "@games/shape-match/components/Leo";

/**
 * THE START SCREEN IS THE SHELF OF PICTURES, AND IT IS THE MENU.
 *
 * Eight pictures, each one a module: tap the park and you play the park. No
 * "start" button that drops a child wherever they left off, no locked doors,
 * no order to obey — a three-year-old picks the picture they like the look
 * of, which is the only kind of choosing they can do unaided.
 *
 * It doubles as the progress display: a picture that has been made keeps its
 * colours and wears a tick; the rest wait behind a soft veil.
 */

/** A card hangs slightly crooked, the way a child would pin it up. Fixed per
 *  card, so it never shifts under the same picture. */
const TILT = [-2, 1.6, -1.4, 2, 1.4, -2, 2.4, -1.6];

interface HomeProps {
  /** Module ids already finished. */
  finished: readonly string[];
  onOpen: (index: number) => void;
  onReset: () => void;
}

export function ShapeHome({ finished, onOpen, onReset }: HomeProps) {
  const made = MODULES.filter((module) => finished.includes(module.id)).length;

  /** Leo says hello — and, to a child who has made something already, asks
   *  which one is next. */
  useEffect(() => {
    void playClip(made > 0 ? "leo-home-again" : "leo-home");
  }, [made]);

  return (
    <div className="sm-screen">
      <motion.h1
        className="sm-title font-rounded font-black"
        initial={{ y: "-50%", opacity: 0, rotate: -2 }}
        animate={{ y: "0%", opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 190, damping: 14 }}
      >
        Pick a picture!
      </motion.h1>

      <div className="sm-picker">
        {MODULES.map((module, i) => {
          const done = finished.includes(module.id);
          return (
            <motion.button
              key={module.id}
              type="button"
              className="sm-card"
              data-done={done ? "yes" : undefined}
              onClick={() => {
                playClickSound();
                onOpen(i);
              }}
              aria-label={
                done ? module.title + " — made already. Play it again" : "Play " + module.title
              }
              initial={{ y: "18%", opacity: 0, rotate: 0 }}
              animate={{ y: "0%", opacity: 1, rotate: TILT[i % TILT.length] }}
              transition={{
                delay: 0.1 + i * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 16,
              }}
              whileHover={{ scale: 1.05, rotate: 0 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="sm-card-picture">
                <ScenePicture scene={SCENES[module.scene]} />
                {!done && <span className="sm-card-veil" aria-hidden="true" />}
              </span>
              <span className="sm-card-name font-rounded font-black">{module.title}</span>
              {done && (
                <span className="sm-card-tick" aria-hidden="true">
                  <Tick />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {made > 0 && (
        <div className="sm-buttons">
          <Button
            size="sm"
            variant="secondary"
            aria-label="Start again with every picture empty"
            onClick={() => {
              playClickSound();
              onReset();
            }}
          >
            Start again
          </Button>
        </div>
      )}

      <Leo mood="wave" say={made > 0 ? "Which one now?" : "Play with me!"} />
    </div>
  );
}
