"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { Button } from "@shared/components/ui/Button";
import { Burst } from "@shared/components/game/Burst";
import { CelebrationMotif } from "@shared/components/game/CelebrationMotif";
import { Confetti } from "@shared/components/game/Confetti";
import { GodRays } from "@shared/components/game/GodRays";
import { Ripple } from "@shared/components/game/Ripple";
import { cssVars } from "@shared/styles/cssVars";
import { unit } from "@shared/utils/hash";
import { playCelebrationSound, playClickSound, playStarPop } from "@shared/audio/sfx";
import { sayAfter } from "@shared/audio/voice";
import { setOf, type Module } from "@games/shape-match/constants/modules";
import { SCENES } from "@games/shape-match/constants/scenes";
import { ScenePicture } from "@games/shape-match/components/SceneArt";
import { ShapeGlyph, Twinkle } from "@games/shape-match/components/ShapeArt";
import { Leo } from "@games/shape-match/components/Leo";

/**
 * THE END OF A MODULE — and the biggest thing that happens in this game.
 *
 * The meadow goes away completely and the screen turns purple: the one moment
 * that looks like nothing else in the game, which is what makes it feel like a
 * reward rather than another screen.
 *
 * IT ARRIVES IN BEATS, like a curtain going up, because everything landing at
 * once is a flash rather than an event:
 *
 *   0.00  the purple, the rays and the glow
 *   0.15  the words drop in
 *   0.32  the finished picture flies up, rings going out behind it
 *   0.60  the friends arrive, one at a time, each with its own little pop
 *   0.95  confetti, and the module's OWN SHAPES raining down among it
 *   1.25  Leo runs his whole celebration
 *
 * AND IT WAITS. Nothing moves the child on: the picture they just made is
 * held up with two big buttons under it and stays there until somebody
 * chooses. The friends can be poked while they wait, and every one of them
 * answers — a party a three-year-old can play with is worth staying in.
 */

/** Who comes to the party, from the portal's shared animals — the game draws
 *  no new cast for a celebration. */
const GUESTS: readonly string[] = [
  "rabbit",
  "penguin",
  "bear",
  "frog",
  "monkey",
  "elephant",
  "cat",
  "turtle",
];

/** Four places to stand; WHERE they are is in the stylesheet, because a tall
 *  screen and a wide one have their free corners in different places. There
 *  were five, but the fifth had nowhere to go that was not Leo's corner, the
 *  title or the buttons — the layout harness found it at every size. */
const SPOTS = [1, 2, 3, 4] as const;

/** The curtain, beat by beat, in milliseconds from the start. */
const BEATS = [0, 150, 320, 600, 950, 1250];

/** Soft glowing blobs behind everything. */
const ORBS = Array.from({ length: 7 }, (_, i) => ({
  x: Number((6 + unit(i * 3) * 88).toFixed(2)),
  y: Number((8 + unit(i * 5) * 82).toFixed(2)),
  size: Number((16 + unit(i * 7) * 26).toFixed(2)),
  delay: Number((unit(i * 11) * 1.6).toFixed(2)),
  dur: Number((2.6 + unit(i * 13) * 2).toFixed(2)),
}));

interface ModuleDoneProps {
  outing: Module;
  /** Which module it is, 0-based — picks who comes to the party. */
  index: number;
  /** There is another picture after this one. */
  hasNext: boolean;
  onNext: () => void;
  onHome: () => void;
}

export function ModuleDone({ outing, index, hasNext, onNext, onHome }: ModuleDoneProps) {
  const scene = SCENES[outing.scene];

  /** How far into the show we are. */
  const [beat, setBeat] = useState(0);
  /** Guest → how many times it has been poked, so a second poke plays again. */
  const [poked, setPoked] = useState<Record<number, number>>({});

  useEffect(() => {
    playCelebrationSound();
    const timers = BEATS.map((at, i) => setTimeout(() => setBeat(i), at));
    return () => timers.forEach(clearTimeout);
  }, []);

  /** Each friend arrives with its own little pop rather than all at once. */
  useEffect(() => {
    if (beat < 3) return;
    const timers = SPOTS.map((_, i) => setTimeout(() => playStarPop(), i * 140));
    return () => timers.forEach(clearTimeout);
  }, [beat]);

  /** And he says it: what they made, as the words land; hooray, as he throws
   *  his arms up. */
  useEffect(() => {
    // queued, so "Hooray!" follows "You made the park!" instead of cutting it
    if (beat === 1) void sayAfter("leo-made-" + outing.scene);
    if (beat === 5) void sayAfter("leo-hooray");
  }, [beat, outing.scene]);

  const poke = useCallback((spot: number) => {
    playStarPop();
    setPoked((now) => ({ ...now, [spot]: (now[spot] ?? 0) + 1 }));
  }, []);

  /**
   * WHAT RAINS DOWN IS WHAT THE CHILD JUST MADE. The module's own six shapes
   * fall among the sparkles, so the party is about this module rather than
   * being the same confetti every game throws.
   */
  const shapes = useMemo(
    () =>
      [...setOf(outing, 0).parts, ...setOf(outing, 1).parts].map((piece, i) => (
        <ShapeGlyph key={i} piece={piece} />
      )),
    [outing]
  );

  const sparks = useMemo(() => [<Twinkle key="a" />, <Twinkle key="b" fill="#FFD84D" />], []);

  return (
    <motion.div
      className="sm-reward"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
      role="status"
      aria-label={"You finished the " + scene.name}
    >
      <GodRays />

      {/* rings going out across the whole screen as the picture lands — the
          frame itself clips its contents, so they cannot live inside it */}
      {beat >= 2 && <Ripple count={3} gap={0.18} size="90%" />}

      {ORBS.map((orb, i) => (
        <motion.span
          key={i}
          className="sm-orb"
          style={cssVars({
            "--sm-x": orb.x + "%",
            "--sm-y": orb.y + "%",
            "--sm-w": orb.size + "%",
          })}
          animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: orb.dur, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      ))}

      <motion.p
        className="sm-reward-title font-rounded font-black"
        initial={{ scale: 0.6, opacity: 0, y: "-24%" }}
        animate={
          beat >= 1 ? { scale: 1, opacity: 1, y: "0%" } : { scale: 0.6, opacity: 0, y: "-24%" }
        }
        // THE BOUNCE IS THE SPRING'S, not a keyframe's. A spring takes two
        // keyframes and no more — asking it for [0.6, 1.12, 1] throws at
        // runtime — and a low damping overshoots past 1 on its own anyway.
        transition={{ type: "spring", stiffness: 240, damping: 11 }}
      >
        You made the {scene.name}!
      </motion.p>

      <motion.div
        className="sm-reward-frame"
        initial={{ scale: 0.4, rotate: -6, opacity: 0 }}
        animate={
          beat >= 2
            ? { scale: 1, rotate: -1.2, opacity: 1 }
            : { scale: 0.4, rotate: -6, opacity: 0 }
        }
        transition={{ type: "spring", stiffness: 180, damping: 13 }}
      >
        <ScenePicture scene={scene} />

        {/* a light sweeping across what they made, once it has landed */}
        {beat >= 3 && <span className="sm-shine" aria-hidden="true" />}
      </motion.div>

      {/* the two ways out, and nothing happens until one is chosen */}
      <motion.div
        className="sm-buttons"
        initial={{ y: "30%", opacity: 0 }}
        animate={beat >= 4 ? { y: "0%", opacity: 1 } : { y: "30%", opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {hasNext && (
          <Button
            size="lg"
            aria-label="Play the next picture"
            onClick={() => {
              playClickSound();
              onNext();
            }}
          >
            Next picture
          </Button>
        )}
        <Button
          size={hasNext ? "md" : "lg"}
          variant={hasNext ? "secondary" : "primary"}
          aria-label="Back to all the pictures"
          onClick={() => {
            playClickSound();
            onHome();
          }}
        >
          All pictures
        </Button>
      </motion.div>

      {SPOTS.map((spot, i) => {
        const name = GUESTS[(index * 3 + i) % GUESTS.length];
        const Animal = ANIMAL_ART[name];
        if (!Animal) return null;
        const hops = poked[spot] ?? 0;
        return (
          <motion.button
            key={spot}
            type="button"
            className="sm-guest"
            data-spot={spot}
            onClick={() => poke(spot)}
            aria-label={"Say hello to the " + name}
            initial={{ scale: 0, y: "40%" }}
            animate={
              beat < 3
                ? { scale: 0, y: "40%" }
                : hops > 0
                  ? { scale: [1, 1.3, 0.94, 1.08, 1], rotate: [0, -12, 12, -6, 0], y: "0%" }
                  : { scale: 1, y: ["0%", "-9%", "0%"] }
            }
            transition={
              hops > 0
                ? { duration: 0.62, ease: "easeOut" }
                : {
                    scale: { type: "spring", stiffness: 240, damping: 12, delay: i * 0.14 },
                    y: {
                      duration: 1.6 + i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3 + i * 0.14,
                    },
                  }
            }
          >
            <Animal />
            {/* poked: it throws a handful of sparkle */}
            {hops > 0 && <Burst key={hops} pieces={sparks} count={10} size="26%" />}
          </motion.button>
        );
      })}

      {beat >= 4 && (
        <>
          <Confetti count={60} />
          <CelebrationMotif motif="sparkle" count={20} extras={shapes} extraEvery={2} />
        </>
      )}

      <Leo mood="cheer" say={beat >= 5 ? "Hooray!" : undefined} />
    </motion.div>
  );
}
