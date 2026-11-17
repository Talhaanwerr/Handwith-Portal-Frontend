"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequenceChecked, sayAfter, stopVoice } from "@shared/audio/voice";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, type Word } from "@games/rhyme-or-not/constants/words";
import { SAY_YES } from "@games/rhyme-or-not/constants/rounds";
import { FIND, FIND_TWO, MORE, ROUNDS, gridSpot } from "@games/rhyme-detective/constants/rounds";
import { RdtWorld } from "@games/rhyme-detective/components/RdtWorld";
import { Detective } from "@games/rhyme-detective/components/Detective";
import { useQuietHand } from "@games/rhyme-detective/components/useQuietHand";

const TRY = "instr-try-again";

/** intro: the case is read out · tour: the lens names each thing in turn
 *  (a tap already counts: it cuts the naming short) · play: the child
 *  searches · busy: a find is being said · done: all found. */
type Phase = "intro" | "tour" | "play" | "busy" | "done";
/** What the lens is doing over a thing. */
type LensKind = "look" | "right" | "wrong";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Round one's hand comes this soon once the case has been said (the
 *  first-play shell caps every idle wait at 1.8 s; this is shorter still). */
const FIRST_HAND_MS = 300;

/**
 * RHYME DETECTIVE — one round: one case. The case file pins the target's
 * picture to the wall and the detective says "Find something that rhymes
 * with cat!"; the magnifying glass glides over each thing in the room as it
 * is named. Then the child taps things in the room: the glass zooms over the
 * tapped thing — a rhyme gets a gold "found" seal and both words are said
 * ("cat… hat… Yes! They rhyme!"); anything else says its word, wiggles
 * ("hmm"), "Try again!", and the rhyme glows. Rounds 5–6 hide two rhymes.
 */
export function FindRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const kase = ROUNDS[round];
  const { scene, target, answers, things } = kase;
  const [phase, setPhase] = useState<Phase>("intro");
  /** The thing the lens is over (an index into `things`), or none. */
  const [lens, setLens] = useState<{ at: number; kind: LensKind } | null>(null);
  const [found, setFound] = useState<readonly Word[]>([]);
  const [wrong, setWrong] = useState(false);
  /** The line in the guide bar while it is said. */
  const [line, setLine] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const caseRef = useRef<HTMLButtonElement>(null);
  const detRef = useRef<HTMLDivElement>(null);
  const thingRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const schedule = useScheduler();

  const cast = useMemo(
    () =>
      [target, ...answers].map((w) => (
        <span key={w} className="ng-cast">
          <RhymePic word={w} />
        </span>
      )),
    [target, answers]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 3,
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

  /** Set when a tap cuts the naming short: the tour's queued lines stop. */
  const cut = useRef(false);

  const ask = answers.length > 1 ? FIND_TWO : FIND;
  const caseLine = `${clipText(ask)} ${clipText(clipFor(target))}!`;

  // The case: "Find something that rhymes with… cat!", then the glass names
  // each thing in the room, then "cat" once more and the search is on. Each
  // step waits for the line before; a stop from anywhere just moves it on.
  useEffect(() => {
    let live = true;
    const t = setTimeout(
      () => {
        setLine(caseLine);
        // once the question has been said the search is open (a tap counts)
        let chain = sayAfter(ask).then(() => {
          if (!live || cut.current) return;
          setPhase("tour");
          return sayAfter(clipFor(target));
        });
        chain = chain.then(() => wait(250));
        things.forEach((w, i) => {
          chain = chain.then(() => {
            if (!live || cut.current) return;
            setPhase("tour");
            setLens({ at: i, kind: "look" });
            setLine(clipText(clipFor(w)));
            return sayAfter(clipFor(w)).then(() => wait(160));
          });
        });
        void chain
          .then(() => {
            if (!live || cut.current) return;
            setLens(null);
            setLine(caseLine);
            return sayAfter(clipFor(target));
          })
          .then(() => {
            if (live && !cut.current) setPhase("play");
          });
      },
      round === 0 ? 250 : 200
    );
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [ask, caseLine, round, target, things]);

  const hmm = useCallback((el: HTMLElement | null) => {
    el?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-8deg)" },
        { transform: "rotate(7deg)" },
        { transform: "rotate(-4deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 520, easing: "ease-in-out" }
    );
  }, []);

  const tap = useCallback(
    (i: number) => {
      const w = things[i];
      if ((phase !== "play" && phase !== "tour") || isSolved()) return;
      if (phase === "tour") {
        // a tap while the glass is still naming things is a real move: the
        // naming stops and the tap counts
        cut.current = true;
        stopVoice();
        setLens(null);
        setLine(caseLine);
        setPhase("play");
      }
      if (found.includes(w)) {
        void playClip(clipFor(w));
        return;
      }
      if (!answers.includes(w)) {
        playIncorrectSound();
        setLens({ at: i, kind: "wrong" });
        hmm(thingRefs.current[i]);
        hmm(detRef.current);
        setWrong(true);
        setLine(clipText(TRY));
        onMiss();
        void playSequenceChecked([clipFor(w), TRY], 150);
        schedule(() => setLens((l) => (l && l.at === i && l.kind === "wrong" ? null : l)), 1100);
        return;
      }
      const now = [...found, w];
      const all = now.length >= answers.length;
      setFound(now);
      setWrong(false);
      setPhase("busy");
      setLens({ at: i, kind: "right" });
      setLine(`${clipText(clipFor(target))} … ${clipText(clipFor(w))} — ${clipText(SAY_YES)}`);
      playStarPop();
      burst(thingRefs.current[i]);
      void playSequenceChecked([clipFor(target), clipFor(w), SAY_YES], 200).then(() => {
        if (!alive.current) return;
        setLens(null);
        if (all) {
          setPhase("done");
          finish(caseRef.current);
        } else {
          setPhase("play");
          setLine(clipText(MORE));
          void sayAfter(MORE);
        }
      });
    },
    [
      answers,
      burst,
      caseLine,
      finish,
      found,
      hmm,
      isSolved,
      onMiss,
      phase,
      schedule,
      target,
      things,
    ]
  );

  /** The case file: hear the word again (once the search is on). */
  const hearCase = useCallback(() => {
    if (phase === "play") void playClip(clipFor(target));
  }, [phase, target]);

  const next = answers.find((a) => !found.includes(a));
  const nextAt = next ? things.indexOf(next) : -1;
  // Round one: the hand shows the move soon after the case is said, while the
  // glass is still naming things. Later rounds: the usual idle hand.
  const first = round === 0;
  const idle = useIdleHand(
    (phase === "play" || (first && phase === "tour")) && !solved,
    `${found.length}-${wrong}`,
    first ? FIRST_HAND_MS : undefined
  );
  const handTo = useCallback(() => (nextAt >= 0 ? thingRefs.current[nextAt] : null), [nextAt]);
  const hand = useQuietHand(idle, stageRef, handTo);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="rdt-play"
      world={<RdtWorld scene={scene} floor />}
      round={round}
      solved={solved}
      say={say(line || caseLine)}
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
      <div className={`rdt-room rdt-room--${scene}`} data-phase={phase}>
        {things.map((w, i) => (
          <div
            key={w}
            className="rdt-spot"
            style={
              {
                "--x": gridSpot(i, things.length, false)[0],
                "--y": gridSpot(i, things.length, false)[1],
                "--px": gridSpot(i, things.length, true)[0],
                "--py": gridSpot(i, things.length, true)[1],
              } as CSSProperties
            }
          >
            <button
              ref={(el) => {
                thingRefs.current[i] = el;
              }}
              type="button"
              className={`rdt-thing ${found.includes(w) ? "is-found" : ""} ${
                wrong && w === next ? "is-hint" : ""
              }`}
              onClick={() => tap(i)}
              aria-label={w}
            >
              <span className="rdt-thing-shadow" aria-hidden="true" />
              <span className="rdt-thing-pic">
                <RhymePic word={w} />
              </span>
            </button>
            {lens?.at === i && <Lens word={w} kind={lens.kind} />}
            {found.includes(w) && <Seal />}
          </div>
        ))}

        <motion.button
          ref={caseRef}
          type="button"
          className="rdt-case"
          onClick={hearCase}
          aria-label={`The case: ${target}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.15 }}
        >
          <span className="rdt-case-tab" aria-hidden="true" />
          <span className="rdt-case-clip" aria-hidden="true" />
          <span className="rdt-case-photo">
            <RhymePic word={target} />
          </span>
          <span className="rdt-case-marks" aria-hidden="true">
            {answers.map((a) => (
              <span key={a} className={`rdt-case-mark ${found.includes(a) ? "is-on" : ""}`} />
            ))}
          </span>
        </motion.button>

        <div ref={detRef} className="rdt-detective" aria-hidden="true">
          <Detective />
        </div>
      </div>
    </NgStage>
  );
}

/** The magnifying glass over a thing: the thing bigger inside it. */
const Lens = memo(function Lens({ word, kind }: { word: Word; kind: LensKind }) {
  return (
    <motion.span
      layoutId="rdt-lens"
      className={`rdt-lens rdt-lens--${kind}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      aria-hidden="true"
    >
      <span className="rdt-lens-handle" />
      <span className="rdt-lens-glass">
        <span className="rdt-lens-pic">
          <RhymePic word={word} />
        </span>
      </span>
    </motion.span>
  );
});

/** The gold "found" seal stamped on a rhyme. */
const Seal = memo(function Seal() {
  return (
    <motion.span
      className="rdt-seal"
      initial={{ opacity: 0, scale: 2.2, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: -12 }}
      transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.25 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100">
        <path
          d="M50 4 L60 16 L75 10 L78 26 L94 30 L88 45 L98 58 L84 66 L86 82 L70 82 L62 96 L50 86 L38 96 L30 82 L14 82 L16 66 L2 58 L12 45 L6 30 L22 26 L25 10 L40 16 Z"
          fill="#F2B51F"
        />
        <circle cx="50" cy="50" r="30" fill="#FFD84D" stroke="#C98A10" strokeWidth="4" />
        <path
          d="M36 51 L46 61 L66 39"
          stroke="#8A5A00"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.span>
  );
});
