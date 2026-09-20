"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { TreasureChest, GoldCoin } from "@shared/components/pirate/PirateTreasure";
import { TreasureGem } from "@shared/components/pirate/PirateNautical";
import { PirateParrot } from "@shared/components/pirate/PirateMapAndParrot";
import { Burst } from "@shared/components/game/Burst";
import { Ripple } from "@shared/components/game/Ripple";
import { useScheduler } from "@shared/hooks/useScheduler";
import { playStarPop, playChime } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";

/** The timeline, in seconds from the overlay appearing. */
/** The chest, having rocked, bursts open. */
const OPEN_S = 1.0;
/** The treasure fountains out of it. */
const FOUNTAIN_S = 1.05;
/** The giant letter rises out of the chest. */
const LETTER_S = 1.2;
/** The parrot swoops in. */
const PARROT_S = 1.5;
/** The cheer. */
const CHEER_S = 1.9;

/** Up and out of the chest, then down past it. */
const FOUNTAIN_ARC: readonly [number, number] = [-160, -20];
const FOUNTAIN_REACH: readonly [number, number] = [26, 54];

interface MatchWinProps {
  /** The round's letter as the child saw it — BIG or little. */
  shown: string;
  /** Every letter matched this round, as shown — they fly out as cards. */
  letters: readonly string[];
  cheerId: string;
}

/**
 * THE TREASURE — Pirate Match's round celebration.
 *
 * The child has just matched every letter to its picture, so the reward is
 * the treasure they found: a chest lands at the centre, rocks, and bursts
 * OPEN — gold coins, gems and the letters themselves fountain up out of it
 * and rain down, and a huge glowing letter rises out of the chest and hangs
 * in the air over it. The parrot swoops in to cheer. Then the round moves on
 * by itself, as it always did.
 *
 * The chest's lid is real state (TreasureChest swings it on a prop change);
 * everything else is a declarative Framer run on the constants above. No loop.
 */
export function MatchWin({ shown, letters, cheerId }: MatchWinProps) {
  const [open, setOpen] = useState(false);

  // The lid and the sounds, on the same clock as the pictures — every timer
  // cleared with the screen.
  const schedule = useScheduler();
  useEffect(() => {
    schedule(() => {
      setOpen(true);
      playStarPop();
    }, OPEN_S * 1000);
    schedule(playChime, LETTER_S * 1000);
  }, [schedule]);

  /** What the chest throws: coins, gems, and the letters just matched. */
  const treasure = useMemo<readonly ReactNode[]>(
    () =>
      letters.flatMap((l, i) => [
        <GoldCoin key={`coin-${i}`} />,
        <span key={`card-${l}`} className="pm-win-card font-rounded font-black">
          {l}
        </span>,
        <TreasureGem key={`gem-${i}`} tone={i % 2 ? "red" : "teal"} />,
        <GoldCoin key={`coin2-${i}`} />,
      ]),
    [letters]
  );

  return (
    <div className="pm-win-stage">
      {/* THE LETTER, rising out of the chest and hanging over it */}
      <div className="pm-win-letter-zone">
        <Ripple delay={LETTER_S + 0.3} count={3} gap={0.16} size="clamp(180px, 46vmin, 460px)" />
        <motion.span
          className="pm-win-letter font-rounded font-black"
          initial={{ y: "70%", scale: 0.3, opacity: 0 }}
          animate={{ y: ["70%", "-10%", "0%"], scale: [0.3, 1.08, 1], opacity: [0, 1, 1] }}
          transition={{ delay: LETTER_S, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {shown}
        </motion.span>
      </div>

      {/* THE CHEST: lands, rocks, and bursts open */}
      <motion.div
        className="pm-win-chest"
        initial={{ scale: 0.4, y: 40, opacity: 0, rotate: 0 }}
        animate={{
          scale: 1,
          y: 0,
          opacity: 1,
          rotate: [0, 0, -4, 4, -4, 4, -2, 0],
        }}
        transition={{
          scale: { type: "spring", stiffness: 220, damping: 15 },
          y: { type: "spring", stiffness: 220, damping: 15 },
          opacity: { duration: 0.25 },
          rotate: { delay: 0.35, duration: OPEN_S - 0.35, ease: "easeInOut" },
        }}
      >
        {/* the light pouring out once the lid is up */}
        <motion.span
          className="pm-win-beam"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: open ? 1 : 0, opacity: open ? [0, 0.9, 0.55] : 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <TreasureChest state={open ? "open" : "closed"} />
        {/* the mouth of the chest — where the treasure flies from */}
        <div className="pm-win-mouth">
          <Burst
            pieces={treasure}
            count={28}
            delay={FOUNTAIN_S}
            arc={FOUNTAIN_ARC}
            reach={FOUNTAIN_REACH}
            gravity
            size="clamp(22px, 5.5vmin, 52px)"
          />
        </div>
      </motion.div>

      {/* THE PARROT, swooping in to see */}
      <motion.div
        className="pm-win-parrot"
        initial={{ x: "60vw", y: "-20vmin", rotate: -18, opacity: 0 }}
        animate={{ x: "0vw", y: ["-20vmin", "2vmin", "0vmin"], rotate: 0, opacity: 1 }}
        transition={{ delay: PARROT_S, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <PirateParrot mood="celebrating" />
      </motion.div>

      <motion.h2
        className="pm-win-heading font-rounded font-black"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: CHEER_S, type: "spring", stiffness: 220, damping: 16 }}
      >
        {clipText(cheerId)}
      </motion.h2>
    </div>
  );
}
