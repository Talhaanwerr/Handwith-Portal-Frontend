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
import { useQuietHand } from "@games/rhyme-rocket/components/useQuietHand";
import { SswWorld } from "@games/silly-sandwich/components/SswWorld";
import { Munch, MunchHands, type Face } from "@games/silly-sandwich/components/Munch";
import { BreadBase, BreadLid } from "@games/silly-sandwich/components/BreadArt";
import {
  BITE,
  MORE,
  NEEDED,
  ROUNDS,
  WANT,
  YUCK,
  rhymesIn,
} from "@games/silly-sandwich/constants/rounds";

const TRY = "instr-try-again";
/** Round one: the longest the silent hand waits for the ask to be said. */
const ARM_CAP_MS = 2000;
const BREAD = "bread";

/**
 * SILLY SANDWICH — one round: one sandwich. Munch holds a slice of bread
 * behind the counter: "I want something that rhymes with… cat!", and the
 * four fillings on the tray are named one by one, each lighting up. Drag a
 * filling onto the bread: one that rhymes stays on it and Munch munches
 * ("hat… Yum! One more!"); one that doesn't gets a funny "Yuck! Silly!" face
 * and hops back to the tray, and a rhyming one glows. With both rhymes on,
 * "cat… hat… rat… Yes! They rhyme!", the lid goes on and Munch takes a big
 * bite. Tapping a filling says its word; tapping Munch says his.
 */
export function MakeRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const order = ROUNDS[round];
  const wanted = useMemo(() => rhymesIn(order), [order]);
  const [placed, setPlaced] = useState<readonly number[]>([]);
  const [face, setFace] = useState<Face>("idle");
  /** Bumped each time Munch pulls a face, so its wiggle plays again. */
  const [faceKey, setFaceKey] = useState(0);
  const [hint, setHint] = useState(false);
  const [naming, setNaming] = useState(-1);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [lid, setLid] = useState(false);
  const [eaten, setEaten] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const breadRef = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<typeof BREAD, HTMLElement>());
  const doneRef = useRef(false);
  const placedRef = useRef<readonly number[]>([]);
  /** Bumped by anything the child does: the opening stops naming fillings. */
  const acted = useRef(0);
  const faceTok = useRef(0);
  const schedule = useScheduler();

  const cast = useMemo(
    () =>
      [order.target, ...wanted.map((i) => order.tray[i])].map((w) => (
        <span key={w} className="ng-cast">
          <RhymePic word={w} />
        </span>
      )),
    [order, wanted]
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

  useEffect(() => {
    if (breadRef.current) targets.current.set(BREAD, breadRef.current);
  }, []);

  /** Pull a face for a while, then go back to waiting. */
  const pull = useCallback(
    (f: Face, ms: number) => {
      const tok = ++faceTok.current;
      setFace(f);
      setFaceKey((k) => k + 1);
      if (ms > 0)
        schedule(() => {
          if (faceTok.current === tok) setFace("idle");
        }, ms);
    },
    [schedule]
  );

  // the order: "I want something that rhymes with" + the word, then the four
  // fillings' words, each lighting up as it is said
  useEffect(() => {
    let live = true;
    // round one: the hand also comes by itself soon after the start even if
    // the ask is slow to say (browser speech), never waiting out the naming
    const cap = round === 0 ? setTimeout(() => setReady(true), ARM_CAP_MS) : undefined;
    const t = setTimeout(() => {
      void sayAfter(WANT);
      void sayAfter(clipFor(order.target)).then(async () => {
        // round one: the (silent) hand may show as soon as the ask is said,
        // while the fillings are still being named
        if (live && round === 0) setReady(true);
        if (live && acted.current === 0)
          await playSequenceChecked(order.tray.map(clipFor), 250, (i) => {
            if (live) setNaming(i);
          });
        if (!live) return;
        setNaming(-1);
        setReady(true);
      });
    }, 450);
    return () => {
      live = false;
      clearTimeout(t);
      clearTimeout(cap);
    };
  }, [order, round]);

  const right = useCallback(
    (i: number) => {
      const now = [...placedRef.current, i];
      placedRef.current = now;
      setPlaced(now);
      setHint(false);
      setNaming(-1);
      playStarPop();
      burst(breadRef.current);
      if (now.length < NEEDED) {
        pull("munch", 1600);
        void playSequenceChecked([clipFor(order.tray[i]), MORE], 150);
        return;
      }
      // the sandwich is full: say the rhyme, put the lid on, take a big bite
      doneRef.current = true;
      setDone(true);
      pull("munch", 0);
      void playSequenceChecked(
        [clipFor(order.target), ...now.map((j) => clipFor(order.tray[j])), SAY_YES],
        200
      ).then(() => {
        if (!alive.current) return;
        setLid(true);
        schedule(() => {
          pull("bite", 0);
          void playClip(BITE);
          setEaten(true);
          schedule(() => {
            pull("munch", 0);
            finish(boardRef.current);
          }, 900);
        }, 600);
      });
    },
    [burst, finish, order, pull, schedule]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<number, typeof BREAD>({
    root: stageRef,
    targets,
    slopPx: 28,
    onDrop: (i, target, info) => {
      if (doneRef.current) return;
      acted.current++;
      if (!info.moved) {
        setNaming(-1);
        void playClip(clipFor(order.tray[i]));
        return;
      }
      if (target === null) {
        slideBack(stageRef.current, plateRefs.current[i], info);
        return;
      }
      if (wanted.includes(i)) {
        right(i);
        return;
      }
      playIncorrectSound();
      pull("yuck", 1700);
      void playClip(YUCK);
      void sayAfter(TRY);
      slideBack(stageRef.current, plateRefs.current[i], info);
      setHint(true);
      setNaming(-1);
      onMiss();
    },
  });

  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, i: number) => {
      if (solved || doneRef.current || placedRef.current.includes(i)) return;
      if (start(e, i)) playPickUpSound();
    },
    [solved, start]
  );

  const tapMunch = useCallback(() => {
    if (doneRef.current) return;
    acted.current++;
    setNaming(-1);
    void playClip(clipFor(order.target));
  }, [order]);

  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    plateRefs.current[i] = el;
  }, []);

  const next = wanted.find((i) => !placed.includes(i)) ?? wanted[0];
  const idle = useIdleHand(
    ready && !done && !solved && dragging === null,
    `${placed.length}-${hint}`
  );
  const from = useCallback(() => plateRefs.current[next], [next]);
  const to = useCallback(() => breadRef.current, []);
  const hand = useQuietHand(idle, round > 0, stageRef, from, to);

  const line = done
    ? clipText(SAY_YES)
    : hint
      ? clipText(TRY)
      : `${clipText(WANT)} ${clipText(clipFor(order.target))}`;

  return (
    <NgStage
      stageRef={stageRef}
      playClass="ssw-play"
      world={<SswWorld />}
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
              <span className="ng-carried ssw-carried">
                <span className="ssw-plate-pic">
                  <RhymePic word={order.tray[dragging]} />
                </span>
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div ref={boardRef} className="ssw-board">
        <div className="ssw-top">
          <div
            className="ssw-munch"
            onClick={tapMunch}
            role="button"
            aria-label={`Munch wants something that rhymes with ${order.target}`}
          >
            <span key={faceKey} className={`ssw-munch-body ssw-munch-body--${face}`}>
              <Munch face={face} />
            </span>
            <motion.div
              ref={breadRef}
              className={`ssw-sandwich ${over === BREAD ? "is-lit" : ""}`}
              animate={
                eaten ? { opacity: 0, scale: 0.3, y: "-80%" } : { opacity: 1, scale: 1, y: 0 }
              }
              transition={eaten ? { duration: 0.55, ease: "easeIn" } : { duration: 0.2 }}
            >
              <span className="ssw-bread">
                <BreadBase />
              </span>
              {placed.map((j, k) => (
                <motion.span
                  key={j}
                  className={`ssw-slice ssw-slice--${k}`}
                  initial={{ opacity: 0, y: -60, scale: 1.25 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 17 }}
                >
                  <span className="ssw-slice-pic">
                    <RhymePic word={order.tray[j]} />
                  </span>
                </motion.span>
              ))}
              {lid && (
                <motion.span
                  className="ssw-lid"
                  initial={{ opacity: 0, y: -80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <BreadLid />
                </motion.span>
              )}
            </motion.div>
            <span className="ssw-hands" aria-hidden="true">
              <MunchHands />
            </span>
          </div>
        </div>
        <div className="ssw-counter">
          <div className="ssw-mat">
            {order.tray.map((w, i) => (
              <Plate
                key={`${round}-${w}`}
                index={i}
                word={w}
                gone={placed.includes(i) || dragging === i}
                naming={naming === i}
                hint={hint && !done && i === next}
                onPick={pick}
                register={register}
              />
            ))}
          </div>
        </div>
      </div>
    </NgStage>
  );
}

const Plate = memo(function Plate({
  index,
  word,
  gone,
  naming,
  hint,
  onPick,
  register,
}: {
  index: number;
  word: Word;
  gone: boolean;
  naming: boolean;
  hint: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, i: number) => void;
  register: (i: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={(el) => register(index, el)}
      className={`ssw-plate touch-none ${gone ? "is-gone" : ""} ${naming ? "is-naming" : ""} ${hint ? "is-hint" : ""}`}
      onPointerDown={(e) => onPick(e, index)}
      role="button"
      aria-label={`${word} — drag it onto the sandwich if it rhymes`}
    >
      <motion.span
        className="ssw-plate-in"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + index * 0.08, type: "spring", stiffness: 240, damping: 18 }}
      >
        <span className="ssw-plate-pic">
          <RhymePic word={word} />
        </span>
      </motion.span>
    </div>
  );
});
