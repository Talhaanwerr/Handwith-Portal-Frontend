"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unit } from "@shared/utils/hash";

/**
 * LEO, the lion cub — a player in the game, not a picture beside it.
 *
 * He is never simply standing there. He breathes, blinks at uneven intervals,
 * shifts his weight, looks from the puzzle to the child and back, and if
 * nobody has touched anything for a few seconds he leans in and POINTS at the
 * answers — without ever showing which one is right.
 *
 * And he answers what happens:
 *
 *   PUT A PIECE IN   a quick delighted bounce
 *   GET IT WRONG     a soft head shake and a concerned little face; no telling
 *                    off, and the child goes again
 *   FINISH A ROUND   a whole sequence — he notices, his eyes go wide, he
 *                    grins, throws both arms up, bounces, squeezes his eyes
 *                    shut with happiness, and finally points at what the child
 *                    made, as if to say "look what you did"
 *
 * The moods below are what the game asks of him; the timing of everything
 * inside a mood is his own, so the game never has to choreograph a lion.
 */

export type LeoMood = "idle" | "watch" | "point" | "cheer" | "oops" | "wave";

/** The celebration, beat by beat, in milliseconds from the start. */
const CHEER_BEATS = [0, 160, 420, 820, 1320, 1780];

/** How long an eye stays shut. */
const BLINK_MS = 130;

const FUR = "#F6A93B";
const FUR_DARK = "#D9871F";
const FACE = "#FFD98A";
const MUZZLE = "#FFF1D6";
const SHIRT = "#3DA5F4";
const SHIRT_DARK = "#1476C0";
const INK = "#3D3D5C";

/** The mane: a ring of fluff around the face, worked out once. */
const MANE = Array.from({ length: 13 }, (_, i) => {
  const angle = (i / 13) * Math.PI * 2;
  return {
    cx: Number((50 + Math.cos(angle) * 33).toFixed(2)),
    cy: Number((49 + Math.sin(angle) * 33).toFixed(2)),
    r: i % 2 === 0 ? 12 : 10,
  };
});

/** Where he is looking. The board is to his right; the child is straight out. */
type Gaze = "board" | "child";

/** What his face is doing. */
type Face = "open" | "wide" | "happy" | "worried";

interface LeoProps {
  mood: LeoMood;
  /** What is in the speech bubble, if anything. */
  say?: string;
}

/**
 * Leo standing in the meadow: the figure, his shadow and whatever he is
 * saying. The figure itself is separate below, because the Library card shows
 * the same lion and a card must not animate.
 */
export function Leo({ mood, say }: LeoProps) {
  const bouncing = mood === "cheer";
  const timing = bouncing
    ? { duration: 1.1, ease: "easeOut" as const }
    : { duration: mood === "point" ? 2.6 : 3.6, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="sm-leo" data-mood={mood}>
      <AnimatePresence>
        {say && (
          <motion.span
            className="sm-leo-says font-rounded font-black"
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {say}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        className="sm-leo-shadow"
        animate={
          bouncing
            ? { scaleX: [1, 0.68, 1, 0.84, 1], opacity: [1, 0.45, 1, 0.7, 1] }
            : { scaleX: [1, 1.03, 1], opacity: 1 }
        }
        transition={timing}
        aria-hidden="true"
      />

      <LeoFigure mood={mood} />
    </div>
  );
}

interface FigureProps {
  mood: LeoMood;
  /** Hold still — the Library card shows him in a grid of cards, and a card
   *  that breathes is a card that distracts. */
  still?: boolean;
}

/** The lion himself, in a 100 x 150 box that fills whatever it is put in. */
export function LeoFigure({ mood, still = false }: FigureProps) {
  /* ── the things he does on his own ───────────────────────────────────── */

  /** Eyes shut for a moment, every few seconds, never on a metronome. */
  const [blinking, setBlinking] = useState(false);
  const [blinks, setBlinks] = useState(0);

  useEffect(() => {
    if (still) return;
    const wait = 2200 + unit(blinks * 13) * 3200;
    const open = setTimeout(() => {
      setBlinking(true);
      setBlinks((n) => n + 1);
    }, wait);
    return () => clearTimeout(open);
  }, [blinks, still]);

  useEffect(() => {
    if (!blinking) return;
    const shut = setTimeout(() => setBlinking(false), BLINK_MS);
    return () => clearTimeout(shut);
  }, [blinking]);

  /** Idly, he looks from the puzzle to the child and back. */
  const [gaze, setGaze] = useState<Gaze>("board");

  useEffect(() => {
    if (still || mood !== "idle") return;
    const turn = setTimeout(() => setGaze((now) => (now === "board" ? "child" : "board")), 2800);
    return () => clearTimeout(turn);
  }, [gaze, mood, still]);

  /** And shifts his weight from one foot to the other. */
  const [lean, setLean] = useState(0);

  useEffect(() => {
    if (still || mood !== "idle") return;
    const shift = setTimeout(() => setLean((now) => (now === 0 ? 1 : 0)), 4200);
    return () => clearTimeout(shift);
  }, [lean, mood, still]);

  /**
   * THE CELEBRATION, BEAT BY BEAT. He notices, his eyes widen, he grins,
   * throws his arms up, bounces, shuts his eyes with happiness, and points at
   * what the child made.
   */
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (mood !== "cheer" || still) return;
    // the first beat is at zero, which also puts the sequence back to the
    // start — there is nothing to reset on the way out
    const timers = CHEER_BEATS.map((at, i) => setTimeout(() => setBeat(i), at));
    return () => timers.forEach(clearTimeout);
  }, [mood, still]);

  /** The beat only means anything while he is celebrating. */
  const stage = mood === "cheer" ? beat : 0;

  /* ── what all that adds up to ────────────────────────────────────────── */

  const looking: Gaze = mood === "idle" ? gaze : mood === "wave" ? "child" : "board";

  const face: Face =
    mood === "cheer"
      ? stage >= 4
        ? "happy"
        : "wide"
      : mood === "oops"
        ? "worried"
        : blinking
          ? "happy"
          : "open";

  /** Arms: resting, one out to point, or both up in the air. */
  const pointing = mood === "point" || (mood === "cheer" && stage >= 5);
  const armsUp = mood === "cheer" && stage >= 2 && stage < 5;
  const leftArm = armsUp ? 150 : mood === "wave" ? 30 : 22;
  const rightArm = armsUp ? -150 : pointing ? -74 : mood === "watch" ? -40 : -22;

  /** The head leans towards whatever he is looking at, shakes when something
   *  did not fit, and tips back when he is delighted. */
  const headTilt =
    mood === "oops"
      ? [0, -7, 7, -5, 5, 0]
      : mood === "cheer"
        ? stage >= 3
          ? -6
          : stage >= 1
            ? -3
            : 4
        : looking === "board"
          ? 5
          : -2;

  /** The whole body: breathing, or bouncing with delight. */
  const body =
    mood === "cheer" && stage >= 3
      ? { y: ["0%", "-13%", "0%", "-6%", "0%"], rotate: [0, -3, 3, -1, 0] }
      : mood === "point"
        ? { y: ["0%", "-1.4%", "0%"], rotate: [0, 2.2, 0] }
        : { y: ["0%", "-1.4%", "0%"], rotate: lean ? [0, 1.6, 0] : [0, -1.6, 0] };

  const bodyTiming =
    mood === "cheer" && stage >= 3
      ? { duration: 1.1, ease: "easeOut" as const }
      : { duration: mood === "point" ? 2.4 : 3.8, repeat: Infinity, ease: "easeInOut" as const };

  /** Pupils follow his gaze. */
  const pupil = looking === "board" ? 2.4 : -0.6;

  return (
    <motion.svg
      className="sm-leo-figure"
      viewBox="0 0 100 150"
      animate={still ? undefined : body}
      transition={bodyTiming}
      role="img"
      aria-label="Leo the lion cub"
    >
      {/* legs and shoes */}
      <path
        d="M40 104v26M60 104v26"
        stroke={FUR}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="38" cy="136" rx="11" ry="7" fill={SHIRT_DARK} />
      <ellipse cx="62" cy="136" rx="11" ry="7" fill={SHIRT_DARK} />

      {/* shirt */}
      <path
        d="M34 80h32a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6Z"
        fill={SHIRT}
        stroke={SHIRT_DARK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M44 80h12l-6 8Z" fill={SHIRT_DARK} />

      {/* arms — straight limbs that SWING from the shoulder, so resting,
          pointing and both-in-the-air are one number rather than three
          drawings */}
      <motion.path
        className="sm-leo-arm sm-leo-arm--left"
        d="M32 88 32 108"
        stroke={FUR}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        animate={still ? undefined : { rotate: leftArm }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      />
      <motion.path
        className="sm-leo-arm sm-leo-arm--right"
        d="M68 88 68 108"
        stroke={FUR}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        animate={
          still
            ? undefined
            : mood === "wave"
              ? { rotate: [-30, -60, -30, -60, -30] }
              : { rotate: rightArm }
        }
        transition={
          mood === "wave"
            ? { duration: 1.6, repeat: Infinity, repeatDelay: 1.1, ease: "easeInOut" }
            : { type: "spring", stiffness: 190, damping: 13 }
        }
      />

      {/* the head, which leans, tilts and shakes on its own */}
      <motion.g
        className="sm-leo-head"
        animate={still ? undefined : { rotate: headTilt }}
        transition={
          mood === "oops"
            ? { duration: 0.7, ease: "easeInOut" }
            : { type: "spring", stiffness: 150, damping: 13 }
        }
      >
        <circle cx="22" cy="24" r="10" fill={FUR} stroke={FUR_DARK} strokeWidth="2.6" />
        <circle cx="78" cy="24" r="10" fill={FUR} stroke={FUR_DARK} strokeWidth="2.6" />
        <circle cx="22" cy="24" r="4.6" fill="#E98F86" />
        <circle cx="78" cy="24" r="4.6" fill="#E98F86" />

        {MANE.map((fluff, i) => (
          <circle key={i} cx={fluff.cx} cy={fluff.cy} r={fluff.r} fill={FUR} />
        ))}
        <circle cx="50" cy="49" r="34" fill={FUR_DARK} opacity="0.25" />

        <circle cx="50" cy="49" r="28" fill={FACE} />
        <ellipse cx="50" cy="60" rx="16" ry="12" fill={MUZZLE} />

        {/* eyes */}
        {face === "happy" ? (
          <path
            d="M34 45q6-7 12 0M54 45q6-7 12 0"
            stroke={INK}
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <>
            <ellipse
              cx="40"
              cy="44"
              rx={face === "wide" ? 8.4 : 7.4}
              ry={face === "wide" ? 9.6 : face === "worried" ? 6.4 : 8.2}
              fill="#FFFFFF"
            />
            <ellipse
              cx="60"
              cy="44"
              rx={face === "wide" ? 8.4 : 7.4}
              ry={face === "wide" ? 9.6 : face === "worried" ? 6.4 : 8.2}
              fill="#FFFFFF"
            />
            {/* the pupils have a resting place of their own, so the first
                glance has somewhere to start from — and the Library card,
                which never animates, still shows him looking somewhere */}
            <motion.circle
              cx={41 + pupil}
              cy="45"
              r={face === "wide" ? 4.8 : 4.4}
              fill={INK}
              initial={false}
              animate={still ? undefined : { cx: 41 + pupil }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            />
            <motion.circle
              cx={61 + pupil}
              cy="45"
              r={face === "wide" ? 4.8 : 4.4}
              fill={INK}
              initial={false}
              animate={still ? undefined : { cx: 61 + pupil }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            />
            {face === "worried" && (
              <path
                d="M33 35l12 4M67 35l-12 4"
                stroke={INK}
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            )}
          </>
        )}

        {/* nose and mouth */}
        <path d="M45.6 54h8.8L50 60Z" fill="#C77B3F" />
        {mood === "cheer" && stage >= 1 ? (
          <path
            d="M38 61q12 16 24 0q-12 7-24 0Z"
            fill="#C1564E"
            stroke="#C77B3F"
            strokeWidth="2.6"
          />
        ) : mood === "oops" ? (
          <path
            d="M44 65q6-4 12 0"
            fill="none"
            stroke="#C77B3F"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M50 60v3.4M50 63.4q-5 6-9 1M50 63.4q5 6 9 1"
            fill="none"
            stroke="#C77B3F"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        <circle cx="31" cy="56" r="5.4" fill="#FF9EBC" opacity={mood === "cheer" ? 0.85 : 0.5} />
        <circle cx="69" cy="56" r="5.4" fill="#FF9EBC" opacity={mood === "cheer" ? 0.85 : 0.5} />
      </motion.g>
    </motion.svg>
  );
}
