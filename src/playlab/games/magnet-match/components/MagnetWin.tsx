"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChefArt, SoupPot, PuzzleMagnet as Magnet } from "@games/magnet-match/components/MagnetArt";
import {
  HorseshoeMagnet,
  CarrotSlice,
  Pea,
  Noodle,
  Sparkle,
} from "@games/magnet-match/components/MagnetWinArt";
import { CelebrationMotif } from "@shared/components/game/CelebrationMotif";
import { Burst } from "@shared/components/game/Burst";
import { Ripple } from "@shared/components/game/Ripple";
import { useScheduler } from "@shared/hooks/useScheduler";
import { playStarPop } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";

/** The timeline, in seconds from the overlay appearing. */
/** The soup boils over — a fountain of what went in. */
const FOUNTAIN_S = 0.45;
/** The big magnet swings down. */
const MAGNET_S = 1.1;
/** The three letters snap up onto it — CLACK. */
const SNAP_S = 1.7;

/** Up and out of the pot, then down past it. */
const FOUNTAIN_ARC: readonly [number, number] = [-155, -25];
const FOUNTAIN_REACH: readonly [number, number] = [24, 50];
/** Sparks off the poles. */
const SPARK_ARC: readonly [number, number] = [-175, -5];
const SPARK_REACH: readonly [number, number] = [8, 24];
const SPARKS: readonly ReactNode[] = [<Sparkle key="spark" />];

interface MagnetWinProps {
  /** The three letters that just went into the soup, in group order. */
  letters: readonly string[];
  groupIndex: number;
  total: number;
}

/**
 * THE BIG MAGNET — Magnet Match's group celebration.
 *
 * The soup boils over with joy: carrots, peas, noodles and the three letters
 * fountain up out of the pot and rain down. Then the game's namesake finally
 * shows itself — a giant horseshoe magnet swings down from above, its field
 * pulling in rings, and the three letter magnets SNAP up onto its poles in a
 * shower of sparks. The chef jumps for joy beside it all.
 *
 * Every picture is a declarative Framer run against the constants above; the
 * clack is a timer on the same number. No loop.
 */
export function MagnetWin({ letters, groupIndex, total }: MagnetWinProps) {
  // the CLACK of three magnets snapping on, on the same clock as the snap —
  // cleared with the screen, like every timer in the portal
  const schedule = useScheduler();
  useEffect(() => {
    schedule(playStarPop, SNAP_S * 1000);
  }, [schedule]);

  /** What the soup throws: its ingredients, and the letters that went in. */
  const soup = useMemo(
    () =>
      letters.flatMap((l, i) => [
        <CarrotSlice key={`carrot-${i}`} />,
        <Magnet key={l} letter={l} colorIndex={i} size="100%" />,
        <Pea key={`pea-${i}`} />,
        <Noodle key={`noodle-${i}`} />,
      ]),
    [letters]
  );

  return (
    <div className="mm-win-stage">
      {/* steam lifting off the soup, all the way up */}
      <CelebrationMotif motif="steam" count={30} />

      {/* the chef, jumping for joy beside the show */}
      <motion.div
        className="mm-win-chef"
        initial={{ scale: 0.5, y: 24, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [24, -16, 0, -8, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 220, damping: 15 },
          opacity: { duration: 0.3 },
          y: { duration: 1.0, ease: "easeOut" },
        }}
      >
        <ChefArt happy />
      </motion.div>

      {/* THE MAGNET RIG: the giant magnet swings down, its field pulls, and
          the letters snap up onto the poles. One rig, so it rocks as a whole
          when they clack on. */}
      <motion.div
        className="mm-win-rig"
        animate={{ rotate: [0, 0, -5, 5, -3, 0] }}
        transition={{ delay: SNAP_S + 0.2, duration: 0.6, ease: "easeInOut" }}
      >
        <motion.div
          className="mm-win-magnet"
          initial={{ y: "-70vmin", rotate: -14, opacity: 0 }}
          animate={{ y: "0vmin", rotate: 0, opacity: 1 }}
          transition={{ delay: MAGNET_S, type: "spring", stiffness: 150, damping: 13 }}
        >
          {/* the field: rings drawing in toward the poles */}
          <Ripple
            inward
            delay={MAGNET_S + 0.15}
            count={3}
            gap={0.16}
            size="clamp(150px, 38vmin, 340px)"
          />
          <HorseshoeMagnet />
        </motion.div>

        <motion.div
          className="mm-win-letters"
          initial={{ y: "0vmin" }}
          animate={{ y: "-7vmin" }}
          transition={{ delay: SNAP_S, type: "spring", stiffness: 400, damping: 18 }}
        >
          {/* sparks off the poles as they clack on */}
          <div className="mm-win-poles">
            <Burst
              pieces={SPARKS}
              count={16}
              delay={SNAP_S + 0.05}
              arc={SPARK_ARC}
              reach={SPARK_REACH}
              size="clamp(14px, 3.4vmin, 30px)"
            />
          </div>
          <div className="mm-cheer-letters">
            {letters.map((l, i) => (
              <motion.div
                key={l}
                className="mm-cheer-magnet"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.25 + i * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 16,
                }}
              >
                <Magnet letter={l} colorIndex={i} size="100%" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.h2
        className="mm-cheer font-rounded shadow-card relative z-10 rounded-full bg-white/95 px-8 py-3 font-black"
        initial={{ scale: 0.5, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.1 }}
      >
        {clipText("magnet-excellent")}
      </motion.h2>

      {/* THE POT, boiling over: a fountain of soup and letters */}
      <motion.div
        className="mm-win-pot"
        initial={{ scale: 0.6, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
      >
        <div className="mm-pot-art">
          <SoupPot />
        </div>
        <div className="mm-win-soup">
          <Burst
            pieces={soup}
            count={32}
            delay={FOUNTAIN_S}
            arc={FOUNTAIN_ARC}
            reach={FOUNTAIN_REACH}
            gravity
            size="clamp(22px, 5.5vmin, 52px)"
          />
        </div>
      </motion.div>

      <p className="font-rounded text-kitchen-ink relative z-10 text-base font-bold">
        {groupIndex + 1} / {total}
      </p>
    </div>
  );
}
