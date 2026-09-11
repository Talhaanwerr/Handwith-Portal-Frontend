"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Door, DustMotes, ExitDoor, Key } from "@games/door-count/components/DoorArt";
import { WordArt } from "@games/door-count/components/Knob";
import { Teacher } from "@games/door-count/components/Teacher";
import {
  LEVELS_PER_CORRIDOR,
  MODULES,
  MODULE_ORDER,
  homeTilt,
  levelCount,
  modulePaint,
  type ModuleId,
} from "@games/door-count/constants/levels";
import { Confetti } from "@shared/components/game/Confetti";
import { Button } from "@shared/components/ui/Button";
import { playClickSound } from "@shared/audio/sfx";

/**
 * The screens around the doors: the home screen you choose a module from,
 * the moment a corridor's double door opens, and the end of a module.
 */

/* ── HOME ─────────────────────────────────────────────────────────────────
   The home screen IS the game: two doors in the corridor, one for each
   module, and you start by opening one. No menu, no list, no cards — the
   first thing the child ever does here is the thing the whole game is made
   of. What is behind each door says what it teaches: apples to count, or
   the MORE and LESS arrows to compare. */

interface HomeProps {
  /** Doors already solved in each module, so a part-finished one shows it. */
  progress: Record<ModuleId, number>;
  onOpen: (id: ModuleId) => void;
}

export function DoorHome({ progress, onOpen }: HomeProps) {
  return (
    <div className="dc-screen dc-scene dc-home">
      <DustMotes />

      <motion.div
        className="dc-sign dc-sign--title"
        initial={{ y: "-120%", rotate: -3 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
      >
        <span className="dc-sign-rope dc-sign-rope--l" aria-hidden="true" />
        <span className="dc-sign-rope dc-sign-rope--r" aria-hidden="true" />
        <h1 className="dc-title font-rounded font-black">Count the Doors</h1>
      </motion.div>

      <div className="dc-doors" data-n="2">
        {MODULE_ORDER.map((id, i) => {
          const mod = MODULES[id];
          const done = Math.floor(progress[id] / LEVELS_PER_CORRIDOR);
          return (
            <motion.button
              key={id}
              type="button"
              className="dc-door-slot dc-door-slot--tappable dc-home-door"
              aria-label={`${mod.title}. ${mod.blurb}`}
              onClick={() => {
                playClickSound();
                onOpen(id);
              }}
              initial={{ y: "10%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1, rotate: homeTilt(i) }}
              transition={{ delay: 0.12 + i * 0.14, duration: 0.45, ease: "easeOut" }}
              whileTap={{ scale: 0.97 }}
            >
              <Door
                label={mod.title}
                count={3}
                paint={modulePaint(id)}
                theme={mod.theme}
                delay={0.12 + i * 0.14}
                inside={
                  id === "compare" ? (
                    <div className="dc-home-emblem">
                      <span className="dc-home-emblem-art">
                        <WordArt word="more" />
                      </span>
                      <span className="dc-home-emblem-art">
                        <WordArt word="less" />
                      </span>
                    </div>
                  ) : undefined
                }
              />
              <span className="dc-home-blurb font-rounded font-black">{mod.blurb}</span>
              {/* one key per corridor already cleared in this module */}
              <span className="dc-home-keys" aria-hidden="true">
                {Array.from({ length: Math.ceil(levelCount(id) / LEVELS_PER_CORRIDOR) }, (_, k) => (
                  <span key={k} className="dc-home-key" data-on={k < done ? "yes" : undefined}>
                    <Key />
                  </span>
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>

      <Teacher cheer={false} />
    </div>
  );
}

/* ── A CORRIDOR IS CLEAR ─────────────────────────────────────────────────── */

/** How long the keys take to gather and turn in the lock. */
const LOCK_MS = 1150;

/**
 * Four keys in the vault, so the double door at the end of the corridor
 * unlocks and swings open on the light of the next one. The keys gather,
 * dive into the lock together, and the leaves give — the whole reward for a
 * full vault, and the thing a progress bar never gives you.
 */
export function CorridorClear() {
  /** The keys have gone into the lock: the leaves may swing. */
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpening(true), LOCK_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="dc-clear"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label="All the keys! The big door is opening."
    >
      <div className="dc-clear-keys" aria-hidden="true">
        {Array.from({ length: LEVELS_PER_CORRIDOR }, (_, i) => (
          <motion.span
            key={i}
            className="dc-clear-key"
            initial={{ y: "-50%", opacity: 0, rotate: -22 }}
            // each key drops in, waits for the others, then dives into the
            // lock in the middle of the door below
            animate={{
              y: ["-50%", "0%", "0%", "150%"],
              x: ["0%", "0%", "0%", `${((LEVELS_PER_CORRIDOR - 1) / 2 - i) * 136}%`],
              rotate: [-22, 8, 0, 300],
              scale: [1, 1, 1, 0.35],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.09,
              times: [0, 0.22, 0.55, 1],
              ease: "easeInOut",
            }}
          >
            <Key />
          </motion.span>
        ))}
      </div>

      <motion.div
        className="dc-clear-door"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: opening ? 1.04 : 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <ExitDoor open={opening} />
      </motion.div>

      {opening && <Confetti count={34} />}
    </motion.div>
  );
}

/* ── THE END OF A MODULE ─────────────────────────────────────────────────── */

interface FinalProps {
  moduleId: ModuleId;
  onAgain: () => void;
}

export function DoorFinal({ moduleId, onAgain }: FinalProps) {
  const mod = MODULES[moduleId];
  const total = levelCount(moduleId);

  return (
    <div className="dc-screen dc-scene dc-scene--final">
      <DustMotes />
      <motion.div
        className="dc-sign dc-sign--title"
        initial={{ y: "-120%", rotate: -3 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
      >
        <span className="dc-sign-rope dc-sign-rope--l" aria-hidden="true" />
        <span className="dc-sign-rope dc-sign-rope--r" aria-hidden="true" />
        <h1 className="dc-title font-rounded font-black">{mod.title} — every door open!</h1>
      </motion.div>

      <p className="dc-final-count font-rounded font-black">
        {total} doors · {total} keys
      </p>

      <div className="dc-final-keys" aria-hidden="true">
        {Array.from({ length: LEVELS_PER_CORRIDOR * 2 }, (_, i) => (
          <motion.span
            key={i}
            className="dc-final-key"
            animate={{ y: ["0%", "-12%", "0%"], rotate: [0, i % 2 ? 8 : -8, 0] }}
            transition={{ duration: 1.4 + i * 0.12, repeat: Infinity, ease: "easeInOut" }}
          >
            <Key />
          </motion.span>
        ))}
      </div>

      {/* going back to the two doors is the pill.s job, so the end screen
          offers only the one thing the pill cannot do */}
      <div className="dc-final-buttons">
        <Button
          size="sm"
          aria-label={`Play ${mod.title} again`}
          onClick={() => {
            playClickSound();
            onAgain();
          }}
        >
          Play again
        </Button>
      </div>

      <Teacher cheer say="Hooray!" />
      <Confetti count={48} />
    </div>
  );
}
