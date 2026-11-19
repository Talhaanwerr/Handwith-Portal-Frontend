"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequenceChecked, sayAfter, stopVoice } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, type Word } from "@games/rhyme-or-not/constants/words";
import { useQuietHand } from "@games/rhyme-detective/components/useQuietHand";
import { ASK, ROUNDS } from "@games/finish-song/constants/rounds";
import { FmsWorld } from "@games/finish-song/components/FmsWorld";
import { Bird } from "@games/finish-song/components/Bird";

const TRY = "instr-try-again";

/** sing: the bird sings the song · hatch: the eggs open and are named (an
 *  open egg can already be tapped: it cuts the naming short) · pick:
 *  "Which one finishes my song?" and the child taps · right: the bird sings
 *  the whole line. */
type Phase = "sing" | "hatch" | "pick" | "right";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Round one's hand comes this soon once the eggs are open (the first-play
 *  shell caps every idle wait at 1.8 s; this is shorter still). */
const FIRST_HAND_MS = 300;
/** With nothing tapped for this long, the bird sings her song again. */
const RESING_MS = 7000;

/** The song's line without its trailing "…", for the whole line. */
const lineOf = (clip: string) => clipText(clip).replace(/[\s.…]+$/u, "");

/**
 * FINISH MY SONG — one round: one song. The bird on the branch sings two
 * short lines with the last word left out ("I saw a cat, wearing a…"); the
 * three eggs in the nest crack open one after another, each picture named.
 * "Which one finishes my song?" The child taps an egg: the right one and the
 * bird sings the whole line ("…wearing a hat!") with a happy hop; a wrong one
 * says its word, wobbles, "Try again!", and the right egg glows.
 */
export function SongRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const song = ROUNDS[round];
  const { clip, answer, eggs } = song;
  const [phase, setPhase] = useState<Phase>("sing");
  /** How many eggs have hatched (left to right). */
  const [hatched, setHatched] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [hops, setHops] = useState(0);
  const [singing, setSinging] = useState(false);
  const [line, setLine] = useState(clipText(clip));
  /** Taps while choosing: each one restarts the bird's quiet wait. */
  const [pokes, setPokes] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const nestRef = useRef<HTMLDivElement>(null);
  const eggRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cast = useMemo(
    () =>
      [song.partner, answer].map((w) => (
        <span key={w} className="ng-cast">
          <RhymePic word={w} />
        </span>
      )),
    [song.partner, answer]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 1,
    stageRef,
    cast,
    onDone,
  });

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const wobble = useCallback((el: HTMLElement | null, big = false) => {
    const a = big ? 9 : 6;
    el?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: `rotate(${-a}deg)` },
        { transform: `rotate(${a}deg)` },
        { transform: `rotate(${-a / 2}deg)` },
        { transform: "rotate(0deg)" },
      ],
      { duration: big ? 520 : 380, easing: "ease-in-out" }
    );
  }, []);

  // The song, then each egg cracks and its picture is named, then the
  // question. Each step waits for the line before (a stop from anywhere just
  // moves it on, so it can never hang).
  /** Set when a tap cuts the naming short: the queued lines stop. */
  const cut = useRef(false);
  const first = round === 0;

  // The song, then the eggs crack and each picture is named, then the
  // question. Round one opens all three eggs quickly first and names them
  // after (so the hand can show the move straight away); later rounds open
  // and name them one by one. Each step waits for the line before (a stop
  // from anywhere just moves it on, so it can never hang).
  useEffect(() => {
    let live = true;
    const on = () => live && !cut.current;
    const t = setTimeout(
      () => {
        setSinging(true);
        let chain = sayAfter(clip).then(() => {
          if (!on()) return;
          setSinging(false);
          setPhase("hatch");
          return wait(first ? 0 : 300);
        });
        if (first)
          eggs.forEach((_, i) => {
            chain = chain.then(() => {
              if (!on()) return;
              wobble(eggRefs.current[i]);
              return wait(140).then(() => {
                if (on()) setHatched(i + 1);
              });
            });
          });
        eggs.forEach((w, i) => {
          chain = chain.then(() => {
            if (!on()) return;
            const named = () => {
              if (!on()) return;
              setHatched((h) => Math.max(h, i + 1));
              setLine(clipText(clipFor(w)));
              return sayAfter(clipFor(w)).then(() => wait(180));
            };
            if (first) return named();
            wobble(eggRefs.current[i]);
            return wait(360).then(named);
          });
        });
        void chain
          .then(() => {
            if (!on()) return;
            setLine(clipText(ASK));
            return sayAfter(ASK);
          })
          .then(() => {
            if (on()) setPhase("pick");
          });
      },
      first ? 250 : 200
    );
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [clip, eggs, first, wobble]);

  const pick = useCallback(
    (i: number) => {
      const w = eggs[i];
      if ((phase !== "pick" && phase !== "hatch") || i >= hatched || isSolved()) return;
      if (phase === "hatch") {
        // a tap while the eggs are still being named is a real move: the
        // naming stops, the rest of the eggs open, and the tap counts
        cut.current = true;
        stopVoice();
        setHatched(eggs.length);
        setPhase("pick");
      }
      if (w !== answer) {
        playIncorrectSound();
        wobble(eggRefs.current[i], true);
        setWrong(true);
        setPokes((n) => n + 1);
        setLine(clipText(TRY));
        onMiss();
        void playSequenceChecked([clipFor(w), TRY], 150);
        return;
      }
      setPhase("right");
      setWrong(false);
      setSinging(true);
      setHops((h) => h + 1);
      setLine(`${lineOf(clip)} ${clipText(clipFor(answer))}!`);
      playStarPop();
      burst(eggRefs.current[i]);
      void playSequenceChecked([clip, clipFor(answer)], 80).then(() => {
        if (!alive.current) return;
        setSinging(false);
        setHops((h) => h + 1);
        finish(nestRef.current);
      });
    },
    [answer, burst, clip, eggs, finish, hatched, isSolved, onMiss, phase, wobble]
  );

  /** The bird or her notes: tap to hear the song again (once the eggs are
   *  open). She sings it with her notes bobbing, as at the start. */
  const hearSong = useCallback(() => {
    if (phase !== "pick" || isSolved() || singing) return;
    setLine(clipText(clip));
    setSinging(true);
    setPokes((n) => n + 1);
    void playClip(clip).then(() => {
      if (alive.current) setSinging(false);
    });
  }, [clip, isSolved, phase, singing]);

  // Seven quiet seconds while the child is choosing: she sings it again.
  // Any tap (an egg, the bird, the notes) starts the wait over.
  useEffect(() => {
    if (phase !== "pick" || solved || singing) return;
    const t = setTimeout(hearSong, RESING_MS);
    return () => clearTimeout(t);
  }, [hearSong, phase, pokes, singing, solved, wrong, hatched]);

  const right = eggs.indexOf(answer);
  // Round one: the hand shows the move as soon as the eggs are open, while
  // they are still being named. Later rounds: the usual idle hand.
  const idle = useIdleHand(
    (phase === "pick" || (first && phase === "hatch" && hatched >= eggs.length)) && !solved,
    wrong,
    first ? FIRST_HAND_MS : undefined
  );
  const handTo = useCallback(() => eggRefs.current[right], [right]);
  const hand = useQuietHand(idle, stageRef, handTo);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="fms-play"
      world={<FmsWorld />}
      round={round}
      solved={solved}
      say={say(line)}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="fms-board" data-phase={phase}>
        <div className="fms-perch">
          <span className="fms-perch-branch" aria-hidden="true" />
          <motion.button
            key={hops}
            type="button"
            className="fms-bird"
            onClick={hearSong}
            aria-label="The bird — tap to hear the song again"
            animate={hops > 0 ? { y: ["0%", "-22%", "0%", "-10%", "0%"] } : { y: "0%" }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <Bird singing={singing} />
          </motion.button>
          <button
            type="button"
            className={`fms-bubble ${singing ? "is-singing" : ""}`}
            onClick={hearSong}
            aria-label="The song — tap to hear it again"
          >
            <Notes />
          </button>
        </div>

        <div ref={nestRef} className="fms-nest">
          <span className="fms-nest-branch" aria-hidden="true" />
          <NestBack />
          <div className="fms-eggs">
            {eggs.map((w, i) => (
              <button
                key={w}
                ref={(el) => {
                  eggRefs.current[i] = el;
                }}
                type="button"
                className={`fms-egg fms-egg--${i} ${i < hatched ? "is-open" : ""} ${
                  wrong && i === right ? "is-hint" : ""
                } ${phase === "right" && i === right ? "is-right" : ""}`}
                onClick={() => pick(i)}
                disabled={i >= hatched}
                aria-label={i < hatched ? w : "An egg"}
              >
                <Egg word={w} index={i} open={i < hatched} />
              </button>
            ))}
          </div>
          <NestFront />
        </div>
      </div>
    </NgStage>
  );
}

const EGG = "M50 4 C80 4 96 58 96 84 C96 112 76 127 50 127 C24 127 4 112 4 84 C4 58 20 4 50 4 Z";
const ZIG = "4 72 16 62 28 74 40 62 52 74 64 62 76 74 88 62 96 72";
const SPECKS: readonly (readonly [number, number, number])[] = [
  [30, 30, 4],
  [62, 22, 3],
  [72, 48, 5],
  [24, 58, 3],
  [48, 96, 4],
  [72, 104, 3],
  [28, 104, 5],
];
const SHELLS = ["#BFE3F2", "#FFF1D0", "#CFEFD6"] as const;
const SHADES = ["#93C7DE", "#EFD8A8", "#A5D9B1"] as const;

/** One egg: whole, or cracked open with its picture sitting up in the shell. */
const Egg = memo(function Egg({ word, index, open }: { word: Word; index: number; open: boolean }) {
  const top = `fms-top-${index}`;
  const bottom = `fms-bottom-${index}`;
  const shell = (clipId: string) => (
    <svg viewBox="0 0 100 130" className="fms-shell-svg">
      <defs>
        <clipPath id={clipId}>
          <polygon
            points={
              clipId === top ? `0 0 100 0 100 72 ${ZIG} 0 72` : `0 130 100 130 100 72 ${ZIG} 0 72`
            }
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path d={EGG} fill={SHELLS[index]} />
        <path
          d="M70 18 C88 40 92 70 88 96 C84 112 70 122 56 124 C80 112 86 70 70 18 Z"
          fill={SHADES[index]}
        />
        {SPECKS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={SHADES[index]} />
        ))}
        <ellipse
          cx="34"
          cy="34"
          rx="9"
          ry="16"
          fill="#FFFFFF"
          opacity="0.6"
          transform="rotate(20 34 34)"
        />
      </g>
      {open && clipId === bottom && (
        <polyline
          points={ZIG}
          fill="none"
          stroke={SHADES[index]}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
  return (
    <>
      {open && (
        <motion.span
          className="fms-egg-pic"
          initial={{ opacity: 0, scale: 0.4, y: "30%" }}
          animate={{ opacity: 1, scale: 1, y: "0%" }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          <RhymePic word={word} />
        </motion.span>
      )}
      <span className="fms-shell">{shell(bottom)}</span>
      <motion.span
        className="fms-shell"
        initial={false}
        animate={open ? { y: "-60%", rotate: -35, opacity: 0 } : { y: "0%", rotate: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {shell(top)}
      </motion.span>
    </>
  );
});

const NOTES: readonly (readonly [number, number, string])[] = [
  [22, 52, "#E8483C"],
  [58, 40, "#7A5BC4"],
  [94, 50, "#2F9E6E"],
];

/** The three music notes in the bird's bubble. */
const Notes = memo(function Notes() {
  return (
    <svg viewBox="0 0 120 80" className="fms-notes">
      {NOTES.map(([x, y, c], i) => (
        <g key={c} className={`fms-note fms-note--${i}`}>
          <ellipse cx={x} cy={y} rx="10" ry="8" fill={c} transform={`rotate(-20 ${x} ${y})`} />
          <rect x={x + 7} y={y - 34} width="4.5" height="34" rx="2" fill={c} />
          <path
            d={`M${x + 9} ${y - 34} q12 6 10 18`}
            stroke={c}
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
});

/** The back of the woven nest, behind the eggs. */
const NestBack = memo(function NestBack() {
  return (
    <svg
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      className="fms-nest-back"
      aria-hidden="true"
    >
      <path d="M10 40 Q200 -10 390 40 L380 70 Q200 40 20 70 Z" fill="#8A5A34" />
      <path d="M20 46 Q200 6 380 46" stroke="#A8743F" strokeWidth="6" fill="none" />
    </svg>
  );
});

/** The front of the nest, over the bottom of the eggs. */
const NestFront = memo(function NestFront() {
  return (
    <svg
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      className="fms-nest-front"
      aria-hidden="true"
    >
      <path d="M0 20 Q200 60 400 20 Q396 92 300 112 Q200 124 100 112 Q4 92 0 20 Z" fill="#A8743F" />
      <path
        d="M8 30 Q200 72 392 30"
        stroke="#C99158"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M20 56 Q200 96 380 56"
        stroke="#8A5A34"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 86 Q200 112 350 86"
        stroke="#C99158"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 34 L70 70 M120 46 L150 86 M220 50 L190 92 M300 44 L270 84 M360 34 L330 70"
        stroke="#8A5A34"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
});
