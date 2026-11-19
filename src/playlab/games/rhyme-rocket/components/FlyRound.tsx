"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequenceChecked, sayAfter } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, type Word } from "@games/rhyme-or-not/constants/words";
import { SAY_YES } from "@games/rhyme-or-not/constants/rounds";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { RrkWorld } from "@games/rhyme-rocket/components/RrkWorld";
import { RocketArt } from "@games/rhyme-rocket/components/RocketArt";
import { useQuietHand } from "@games/rhyme-rocket/components/useQuietHand";
import { BLAST, FLY, ROUNDS, answerOf } from "@games/rhyme-rocket/constants/rounds";

const TRY = "instr-try-again";
/** Round one: the longest the silent hand waits for the ask to be said. */
const ARM_CAP_MS = 2000;

/** wait: the rocket is on the pad · dock: it sits under the right planet
 *  while the words are said · blast: it zooms off the top of the sky. */
type Phase = "wait" | "dock" | "blast";

/**
 * RHYME ROCKET — one round: three trips. The rocket waits on the launch pad
 * with its word in the window ("I fly to the planet that rhymes with… star")
 * and the three planets are named one by one, each glowing as it is said.
 * Drag the rocket up to the planet that rhymes: it docks under it, the planet
 * glows gold, "star… jar… Yes! They rhyme!", and it blasts off. A wrong
 * planet: the rocket wobbles and slides home to the pad, "Try again!", and
 * the right planet glows. Tapping the rocket or a planet says its word.
 */
export function FlyRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const trips = ROUNDS[round];
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("wait");
  const [hint, setHint] = useState(false);
  const [wobble, setWobble] = useState(0);
  /** The planet whose word is being said in the trip's opening. */
  const [naming, setNaming] = useState(-1);
  /** The trip whose opening has been said — the hand waits for it. */
  const [ready, setReady] = useState(-1);
  const trip = trips[idx];
  const answer = answerOf(trip);

  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<number, HTMLElement>());
  const phaseRef = useRef<Phase>("wait");
  /** Bumped by anything the child does: the opening stops naming planets. */
  const acted = useRef(0);
  const schedule = useScheduler();

  const cast = useMemo(
    () =>
      trips.map((t) => (
        <span key={t.target} className="ng-cast">
          <RhymePic word={t.target} />
        </span>
      )),
    [trips]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
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

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  // each trip: "I fly to the planet that rhymes with" + the rocket's word,
  // then the three planets' words, each planet glowing as it is said
  useEffect(() => {
    let live = true;
    // round one: the hand also comes by itself soon after the start even if
    // the ask is slow to say (browser speech), never waiting out the naming
    const cap = round === 0 ? setTimeout(() => setReady(idx), ARM_CAP_MS) : undefined;
    const startedAt = acted.current;
    const t = setTimeout(
      () => {
        void sayAfter(FLY);
        void sayAfter(clipFor(trips[idx].target)).then(async () => {
          // round one: the (silent) hand may show as soon as the ask is
          // said, while the planets are still being named
          if (live && round === 0) setReady(idx);
          if (live && acted.current === startedAt && phaseRef.current === "wait")
            await playSequenceChecked(trips[idx].options.map(clipFor), 250, (i) => {
              if (live) setNaming(i);
            });
          if (!live) return;
          setNaming(-1);
          setReady(idx);
        });
      },
      idx === 0 ? 450 : 200
    );
    return () => {
      live = false;
      clearTimeout(t);
      clearTimeout(cap);
    };
  }, [idx, round, trips]);

  const right = useCallback(() => {
    go("dock");
    setHint(false);
    setNaming(-1);
    playStarPop();
    burst(planetRefs.current[answer]);
    const last = idx + 1 >= trips.length;
    void playSequenceChecked(
      [clipFor(trip.target), clipFor(trip.options[answer]), SAY_YES],
      200
    ).then(() => {
      if (!alive.current) return;
      go("blast");
      void playClip(BLAST);
      schedule(() => {
        if (!alive.current) return;
        if (last) finish(boardRef.current);
        else {
          setIdx(idx + 1);
          setWobble(0);
          go("wait");
        }
      }, 1100);
    });
  }, [answer, burst, finish, go, idx, schedule, trip, trips.length]);

  const { dragging, over, start, ghostRef } = useDragDrop<"rocket", number>({
    root: stageRef,
    targets,
    slopPx: 24,
    onDrop: (_item, target, info) => {
      if (phaseRef.current !== "wait") return;
      acted.current++;
      if (!info.moved) {
        void playClip(clipFor(trip.target));
        return;
      }
      if (target === null) {
        slideBack(stageRef.current, rocketRef.current, info);
        return;
      }
      if (target === answer) {
        right();
        return;
      }
      playIncorrectSound();
      void playClip(TRY);
      slideBack(stageRef.current, rocketRef.current, info);
      setWobble((n) => n + 1);
      setHint(true);
      setNaming(-1);
      onMiss();
    },
  });

  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (solved || phaseRef.current !== "wait") return;
      if (start(e, "rocket")) playPickUpSound();
    },
    [solved, start]
  );

  const tapPlanet = useCallback(
    (i: number) => {
      if (phaseRef.current !== "wait") return;
      acted.current++;
      setNaming(-1);
      void playClip(clipFor(trip.options[i]));
    },
    [trip]
  );

  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    planetRefs.current[i] = el;
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);

  const idle = useIdleHand(
    ready === idx && phase === "wait" && !solved && dragging === null,
    `${idx}-${hint}`
  );
  const from = useCallback(() => rocketRef.current, []);
  const to = useCallback(() => planetRefs.current[answer], [answer]);
  const hand = useQuietHand(idle, round > 0, stageRef, from, to);

  const line =
    phase !== "wait"
      ? clipText(SAY_YES)
      : hint
        ? clipText(TRY)
        : `${clipText(FLY)} ${clipText(clipFor(trip.target))}`;

  const docked = phase !== "wait";

  return (
    <NgStage
      stageRef={stageRef}
      playClass="rrk-play"
      world={<RrkWorld />}
      round={round}
      solved={solved}
      say={say(line)}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {dragging !== null && (
            <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
              <span className="ng-carried rrk-carried">
                <RocketArt word={trip.target} flame />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div ref={boardRef} className="rrk-board">
        <div className="rrk-sky-row">
          {trip.options.map((w, i) => (
            <Planet
              key={`${idx}-${w}`}
              index={i}
              word={w}
              lit={over === i}
              naming={naming === i}
              hint={hint && i === answer && !docked}
              docked={docked && i === answer}
              blast={phase === "blast" && i === answer}
              rocketWord={trip.target}
              onTap={tapPlanet}
              register={register}
            />
          ))}
        </div>
        <div className="rrk-launch">
          <div
            ref={rocketRef}
            className={`rrk-rocket touch-none ${dragging !== null || docked ? "is-away" : ""}`}
            onPointerDown={pick}
            role="button"
            aria-label={`The rocket says ${trip.target} — fly it to the planet that rhymes`}
          >
            <motion.span
              key={`r-${idx}`}
              className="rrk-rocket-in"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <span key={`w-${wobble}`} className={`rrk-wobble ${wobble > 0 ? "is-wobbling" : ""}`}>
                <RocketArt word={trip.target} />
              </span>
            </motion.span>
          </div>
          <span className="rrk-pad" aria-hidden="true" />
        </div>
      </div>
    </NgStage>
  );
}

const Planet = memo(function Planet({
  index,
  word,
  lit,
  naming,
  hint,
  docked,
  blast,
  rocketWord,
  onTap,
  register,
}: {
  index: number;
  word: Word;
  lit: boolean;
  naming: boolean;
  hint: boolean;
  docked: boolean;
  blast: boolean;
  rocketWord: Word;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={(el) => register(index, el)}
      className={`rrk-planet-slot rrk-planet-slot--${index}`}
      onClick={() => onTap(index)}
      role="button"
      aria-label={`${word} planet`}
    >
      <motion.span
        className="rrk-planet-in"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 240, damping: 16 }}
      >
        <span
          className={`rrk-planet rrk-planet--${index} ${lit ? "is-lit" : ""} ${naming ? "is-naming" : ""} ${hint ? "is-hint" : ""} ${docked ? "is-docked" : ""}`}
        >
          <span className="rrk-crater rrk-crater--a" />
          <span className="rrk-crater rrk-crater--b" />
          <span className="rrk-planet-pic">
            <RhymePic word={word} />
          </span>
        </span>
      </motion.span>
      {docked && (
        <motion.span
          className="rrk-docked"
          initial={{ opacity: 0, y: 30 }}
          animate={blast ? { opacity: 1, y: -1400 } : { opacity: 1, y: 0 }}
          transition={
            blast
              ? { duration: 0.9, ease: [0.5, 0, 0.9, 0.6] }
              : { type: "spring", stiffness: 260, damping: 16 }
          }
        >
          <RocketArt word={rocketWord} flame />
        </motion.span>
      )}
    </div>
  );
});
