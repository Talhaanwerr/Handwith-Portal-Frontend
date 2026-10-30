"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { unit } from "@shared/utils/hash";

/**
 * BERRY AND SPLASH — original characters built for this game.
 *
 * LEGAL / ELMO SUBSTITUTION: this game is inspired by a colours-and-shapes
 * TV segment, but must not use that show's branding, character names or
 * likeness. Berry (a round RED furry friend who hosts every scene) and
 * Splash (a round BLUE furry friend who cheers beside him on the finish card) are
 * new characters with their own tells: a cream face disc with small dot
 * eyes, a pink heart nose, and a sprout on top — a berry's green leaves for
 * Berry, a water drop for Splash. Drawn flat and simple in the house style
 * of Magnet Match's chef and Leo's Puzzles' lion without being either.
 *
 * Both fit fixed viewBoxes (Berry 100 x 130, Splash 90 x 100) and draw
 * nothing outside them, so the Library card (which loads none of this
 * game's CSS) shows them whole.
 */

export type FriendMood = "idle" | "point" | "cheer";

const FUR_RED = "#F4553D";
const FUR_RED_DARK = "#C32E18";
const FUR_RED_LIGHT = "#FF8A70";
const FUR_BLUE = "#3DA5F4";
const FUR_BLUE_DARK = "#1476C0";
const FUR_BLUE_LIGHT = "#8CCBFA";
const FACE = "#FFF1D6";
const INK = "#3D3D5C";
const LEAF = "#5FCB52";
const LEAF_DARK = "#38982F";
const BLUSH = "#FF9EBC";
const NOSE = "#FF6F9C";

/** A ring of fur tufts around a centre — Leo's mane idea, worked out with
 *  plain trig instead of hand-placed circles. Fixed decimals, so the server
 *  and the client always agree. */
function tuftRing(count: number, rx: number, ry: number, cx: number, cy: number, from = 0) {
  return Array.from({ length: count }, (_, i) => {
    const angle = from + (i / count) * Math.PI * 2;
    return {
      cx: Number((cx + Math.cos(angle) * rx).toFixed(2)),
      cy: Number((cy + Math.sin(angle) * ry).toFixed(2)),
    };
  });
}

const BERRY_HEAD_TUFTS = tuftRing(12, 30, 29, 50, 44);
/** The shaggy hem of Berry's body — the lower half of a ring only. */
const BERRY_BODY_TUFTS = tuftRing(16, 32, 29, 50, 88).filter((t) => t.cy > 92);
const SPLASH_HEAD_TUFTS = tuftRing(10, 22, 21, 45, 41);

/** Arm swing per mood, in degrees about the shoulder: 0 hangs straight
 *  down, a large negative lifts the RIGHT arm up and out, a large positive
 *  lifts the LEFT arm up and out. */
const ARMS: Record<FriendMood, { left: number; right: number }> = {
  idle: { left: 12, right: -12 },
  point: { left: 14, right: -128 },
  cheer: { left: 148, right: -148 },
};

/** Blinks at uneven, hashed intervals (GAME_DEV.md's no-Math.random rule). */
function useBlink(still: boolean, seed: number): boolean {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (still) return;
    let alive = true;
    let tick = seed;
    let openTimer: ReturnType<typeof setTimeout>;
    let shutTimer: ReturnType<typeof setTimeout>;
    const loop = () => {
      const wait = 2400 + unit(tick++) * 2600;
      openTimer = setTimeout(() => {
        if (!alive) return;
        setBlinking(true);
        shutTimer = setTimeout(() => {
          if (!alive) return;
          setBlinking(false);
          loop();
        }, 130);
      }, wait);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(openTimer);
      clearTimeout(shutTimer);
    };
  }, [still, seed]);
  return blinking;
}

interface FriendProps {
  mood?: FriendMood;
  /** Hold still — a Library card must never animate. */
  still?: boolean;
}

/** Berry — the game's host, a round red furry friend with a berry sprout. */
export function BerryArt({ mood = "idle", still = false }: FriendProps) {
  const blinking = useBlink(still, 0);
  const arms = ARMS[mood];
  const shut = blinking && mood !== "cheer";

  return (
    <motion.svg
      viewBox="0 0 100 130"
      className="csf-friend-figure"
      role="img"
      aria-label="Berry"
      animate={
        still ? undefined : mood === "cheer" ? { y: ["0%", "-9%", "0%", "-4%", "0%"] } : { y: "0%" }
      }
      // calm by design: Berry only moves as a reaction to the child (a cheer,
      // a point), never on an idle loop that competes with the task
      transition={
        mood === "cheer"
          ? { duration: 1.1, repeat: Infinity, repeatDelay: 0.5, ease: "easeOut" }
          : { duration: 0.3, ease: "easeOut" }
      }
    >
      {/* the shadow Berry casts on the floor */}
      <ellipse cx="50" cy="125.5" rx="30" ry="3.6" fill="#3a2410" opacity="0.16" />

      {/* feet */}
      <ellipse cx="37" cy="119" rx="12.5" ry="7.5" fill={FUR_RED_DARK} />
      <ellipse cx="63" cy="119" rx="12.5" ry="7.5" fill={FUR_RED_DARK} />
      <path
        d="M31 121.5v-3M37 122.5v-3.4M57 122.5v-3.4M63 121.5v-3"
        stroke="#9E2211"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* left arm — behind the body, swings from the shoulder */}
      <motion.g
        className="csf-arm csf-arm--left"
        initial={false}
        animate={still ? undefined : { rotate: arms.left }}
        transition={{ type: "spring", stiffness: 190, damping: 14 }}
      >
        <path d="M24 82 20 104" stroke={FUR_RED} strokeWidth="13" strokeLinecap="round" />
        <circle cx="20" cy="106" r="7.4" fill={FUR_RED_DARK} />
      </motion.g>
      <motion.g
        className="csf-arm csf-arm--right"
        initial={false}
        animate={still ? undefined : { rotate: arms.right }}
        transition={{ type: "spring", stiffness: 190, damping: 14 }}
      >
        <path d="M76 82 80 104" stroke={FUR_RED} strokeWidth="13" strokeLinecap="round" />
        <circle cx="80" cy="106" r="7.4" fill={FUR_RED_DARK} />
      </motion.g>

      {/* body, its shaggy hem and a lighter tummy */}
      {BERRY_BODY_TUFTS.map((t, i) => (
        <circle key={i} cx={t.cx} cy={t.cy} r={6.4} fill={FUR_RED} />
      ))}
      <ellipse cx="50" cy="88" rx="32" ry="29" fill={FUR_RED} />
      <ellipse cx="50" cy="95" rx="18" ry="16" fill={FUR_RED_LIGHT} />
      <path
        d="M41 90q2 3 0 6M50 92q2 3 0 6M59 90q2 3 0 6"
        stroke="#FFB29F"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* the berry sprout — two leaves and a stem, Berry's own tell */}
      <path d="M50 16V6" stroke={LEAF_DARK} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M50 9C44 1 36 3 34 8c5 3 11 4 16 1Z"
        fill={LEAF}
        stroke={LEAF_DARK}
        strokeWidth="1.4"
      />
      <path
        d="M50 9c6-8 14-6 16-1-5 3-11 4-16 1Z"
        fill={LEAF}
        stroke={LEAF_DARK}
        strokeWidth="1.4"
      />

      {/* head + fur tufts */}
      {BERRY_HEAD_TUFTS.map((t, i) => (
        <circle key={i} cx={t.cx} cy={t.cy} r={8.6} fill={FUR_RED} />
      ))}
      <circle cx="50" cy="44" r="30" fill={FUR_RED} />
      <ellipse cx="50" cy="49" rx="23" ry="21" fill={FACE} />

      {shut ? (
        <path
          d="M35 46q5-4.5 10 0M55 46q5-4.5 10 0"
          stroke={INK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ) : mood === "cheer" ? (
        <path
          d="M35 47q5-6 10 0M55 47q5-6 10 0"
          stroke={INK}
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse cx="40" cy="45" rx="4.6" ry="5.6" fill={INK} />
          <ellipse cx="60" cy="45" rx="4.6" ry="5.6" fill={INK} />
          <circle cx="41.6" cy="43" r="1.7" fill="#fff" />
          <circle cx="61.6" cy="43" r="1.7" fill="#fff" />
        </>
      )}

      {/* a pink heart nose */}
      <path
        d="M50 58.6c-4.6-2.8-6-4.8-6-6.8 0-1.8 1.4-3 3-3 1.3 0 2.4.7 3 1.8.6-1.1 1.7-1.8 3-1.8 1.6 0 3 1.2 3 3 0 2-1.4 4-6 6.8Z"
        fill={NOSE}
      />
      <path
        d={mood === "cheer" ? "M40 61q10 13 20 0Z" : "M43 62q7 6 14 0"}
        fill={mood === "cheer" ? "#B7281A" : "none"}
        stroke="#B7281A"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {mood === "cheer" && <path d="M45 66.5q5 3 10 0" stroke="#FF8A9E" strokeWidth="2.4" />}
      <circle cx="31" cy="55" r="4.4" fill={BLUSH} opacity="0.65" />
      <circle cx="69" cy="55" r="4.4" fill={BLUSH} opacity="0.65" />
    </motion.svg>
  );
}

/** Splash — a blue furry friend with a water-drop tuft, cameo only. */
export function SplashArt({ mood = "idle", still = false }: FriendProps) {
  const blinking = useBlink(still, 7);
  const waving = mood !== "idle";

  return (
    <svg viewBox="0 0 90 100" className="csf-friend-figure" role="img" aria-label="Splash">
      <ellipse cx="45" cy="97" rx="22" ry="2.6" fill="#10243a" opacity="0.16" />
      <ellipse cx="36" cy="92" rx="9" ry="5.6" fill={FUR_BLUE_DARK} />
      <ellipse cx="54" cy="92" rx="9" ry="5.6" fill={FUR_BLUE_DARK} />

      <path d="M24 70 20 84" stroke={FUR_BLUE} strokeWidth="10" strokeLinecap="round" />
      <motion.g
        className="csf-arm csf-arm--splash"
        animate={still ? undefined : waving ? { rotate: [-120, -150, -120] } : { rotate: -10 }}
        transition={
          waving
            ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 190, damping: 14 }
        }
      >
        <path d="M66 70 70 84" stroke={FUR_BLUE} strokeWidth="10" strokeLinecap="round" />
        <circle cx="70" cy="86" r="5.6" fill={FUR_BLUE_DARK} />
      </motion.g>

      <ellipse cx="45" cy="70" rx="24" ry="22" fill={FUR_BLUE} />
      <ellipse cx="45" cy="75" rx="13" ry="11" fill={FUR_BLUE_LIGHT} />

      {/* the water-drop tuft */}
      <path
        d="M45 3c5 7 7 10 7 13a7 7 0 0 1-14 0c0-3 2-6 7-13Z"
        fill="#9ED8FF"
        stroke={FUR_BLUE_DARK}
        strokeWidth="1.4"
      />

      {SPLASH_HEAD_TUFTS.map((t, i) => (
        <circle key={i} cx={t.cx} cy={t.cy} r={7} fill={FUR_BLUE} />
      ))}
      <circle cx="45" cy="41" r="22" fill={FUR_BLUE} />
      <ellipse cx="45" cy="44" rx="17" ry="15.5" fill={FACE} />
      {blinking ? (
        <path
          d="M34 42q4-3.4 7.4 0M49 42q4-3.4 7.4 0"
          stroke={INK}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse cx="37.6" cy="41.5" rx="3.4" ry="4.2" fill={INK} />
          <ellipse cx="52.4" cy="41.5" rx="3.4" ry="4.2" fill={INK} />
          <circle cx="38.8" cy="40" r="1.3" fill="#fff" />
          <circle cx="53.6" cy="40" r="1.3" fill="#fff" />
        </>
      )}
      <path
        d="M45 52c-3.4-2-4.4-3.5-4.4-5 0-1.3 1-2.2 2.2-2.2 1 0 1.8.5 2.2 1.3.4-.8 1.2-1.3 2.2-1.3 1.2 0 2.2.9 2.2 2.2 0 1.5-1 3-4.4 5Z"
        fill={NOSE}
      />
      <path
        d="M39 54.5q6 5.5 12 0"
        stroke={FUR_BLUE_DARK}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="31.5" cy="49" r="3.4" fill={BLUSH} opacity="0.6" />
      <circle cx="58.5" cy="49" r="3.4" fill={BLUSH} opacity="0.6" />
    </svg>
  );
}
