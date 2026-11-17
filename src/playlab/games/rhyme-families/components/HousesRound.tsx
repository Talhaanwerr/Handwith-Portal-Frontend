"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequenceChecked, sayAfter } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useHandAt } from "@games/shadow-match/components/useHandAt";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, type Word } from "@games/rhyme-or-not/constants/words";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { RyhWorld } from "@games/rhyme-families/components/RyhWorld";
import { HouseArt } from "@games/rhyme-families/components/HouseArt";
import { ROOF, ROUNDS, WHICH, homeOf } from "@games/rhyme-families/constants/rounds";

const TRY = "instr-try-again";

/**
 * RHYME HOUSES — one round. Two or three houses, each with its family's
 * word on the front; a picture comes up the path ("hat… Which house?").
 * Drag it to the house it rhymes with: it goes in to stand by the door and
 * the pair is said, "hat, cat!" — then the next picture comes. The wrong
 * house sends it sliding back ("Try again!") and the right house glows. A
 * tap on a house says its word; a tap on the picture says the picture's.
 */
export function HousesRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = ROUNDS[round];
  const [idx, setIdx] = useState(0);
  /** Between a right drop and the next picture coming up. */
  const [waiting, setWaiting] = useState(false);
  const [hint, setHint] = useState(false);
  /** The picture whose word and "Which house?" have been said: the hand
   *  waits for it, so its "Watch carefully!" never cuts the word off. */
  const [ready, setReady] = useState(-1);
  const word = r.pictures[Math.min(idx, r.pictures.length - 1)];
  const home = homeOf(r, word);
  /** The last picture put away (said with its house while `waiting`). */
  const done = idx > 0 ? r.pictures[idx - 1] : null;

  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const targets = useRef(new Map<number, HTMLElement>());
  const schedule = useScheduler();

  const cast = useMemo(
    () =>
      r.houses.map((w) => (
        <span key={w} className="ng-cast">
          <RhymePic word={w} />
        </span>
      )),
    [r.houses]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
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

  // the first picture: its word, then "Which house?"
  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      void sayAfter(clipFor(ROUNDS[round].pictures[0]));
      void sayAfter(WHICH).then(() => {
        if (live) setReady(0);
      });
    }, 450);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [round]);

  const right = useCallback(
    (h: number) => {
      const last = idx + 1 >= r.pictures.length;
      setIdx(idx + 1);
      setWaiting(true);
      setHint(false);
      playStarPop();
      burst(targets.current.get(h));
      void playSequenceChecked([clipFor(word), clipFor(r.houses[h])], 150).then(() => {
        if (!alive.current) return;
        if (last) {
          finish(rowRef.current);
          return;
        }
        schedule(() => {
          setWaiting(false);
          void sayAfter(clipFor(r.pictures[idx + 1]));
          void sayAfter(WHICH).then(() => {
            if (alive.current) setReady(idx + 1);
          });
        }, 250);
      });
    },
    [burst, finish, idx, r, schedule, word]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<Word, number>({
    root: stageRef,
    targets,
    slopPx: 24,
    onDrop: (w, target, info) => {
      if (!info.moved) {
        void playClip(clipFor(w));
        return;
      }
      if (target === null) {
        slideBack(stageRef.current, pieceRef.current, info);
        return;
      }
      if (isSolved() || waiting) return;
      if (target === home) {
        right(target);
        return;
      }
      playIncorrectSound();
      void playClip(TRY);
      slideBack(stageRef.current, pieceRef.current, info);
      setHint(true);
      onMiss();
    },
  });

  const pick = (e: React.PointerEvent<HTMLElement>) => {
    if (solved || waiting || idx >= r.pictures.length) return;
    if (start(e, word)) playPickUpSound();
  };

  const register = useCallback((i: number, el: HTMLElement | null) => {
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);

  const hear = useCallback((w: Word) => void playClip(clipFor(w)), []);

  const live = !solved && !waiting && idx < r.pictures.length;
  const idle = useIdleHand(ready === idx && live && dragging === null, `${idx}-${hint}`);
  const from = useCallback(() => pieceRef.current, []);
  const to = useCallback(() => targets.current.get(home), [home]);
  const hand = useHandAt(idle, stageRef, from, to);

  const line =
    waiting && done
      ? `${clipText(clipFor(done))}, ${clipText(clipFor(r.houses[homeOf(r, done)]))}!`
      : hint
        ? clipText(TRY)
        : `${clipText(clipFor(word))} … ${clipText(WHICH)}`;

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`ryh-play ryh-play--${r.houses.length}`}
      world={<RyhWorld />}
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
              <span className="ng-carried ryh-carried">
                <RhymePic word={dragging} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="ryh-board">
        <div ref={rowRef} className="ryh-houses">
          {r.houses.map((h, i) => (
            <House
              key={`${round}-${h}`}
              index={i}
              word={h}
              guests={r.pictures.slice(0, idx).filter((w) => homeOf(r, w) === i)}
              lit={over === i}
              glow={hint && i === home}
              onTap={hear}
              register={register}
            />
          ))}
        </div>
        <div className="ryh-path">
          {live && (
            <div
              ref={pieceRef}
              key={`p-${idx}`}
              className={`ryh-piece touch-none ${dragging !== null ? "is-away" : ""}`}
              onPointerDown={pick}
              role="button"
              aria-label={`${word} — drag it to the house it rhymes with`}
            >
              <motion.span
                className="ryh-piece-pic"
                initial={{ opacity: 0, y: 40, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
              >
                <RhymePic word={word} />
              </motion.span>
            </div>
          )}
        </div>
      </div>
    </NgStage>
  );
}

const House = memo(function House({
  index,
  word,
  guests,
  lit,
  glow,
  onTap,
  register,
}: {
  index: number;
  word: Word;
  guests: readonly Word[];
  lit: boolean;
  glow: boolean;
  onTap: (w: Word) => void;
  register: (i: number, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    register(index, ref.current);
    return () => register(index, null);
  }, [index, register]);
  return (
    <button
      ref={ref}
      type="button"
      className={`ryh-house ${lit ? "is-lit" : ""} ${glow ? "is-hint" : ""}`}
      style={cssVars({ "--ryh-roof": ROOF[word] ?? "#F2734B" })}
      onClick={() => onTap(word)}
      aria-label={`The ${word} house`}
    >
      <HouseArt />
      <span className="ryh-sign">
        <RhymePic word={word} />
      </span>
      <span className="ryh-guests">
        {guests.map((g) => (
          <motion.span
            key={g}
            className="ryh-guest"
            initial={{ opacity: 0, scale: 1.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <RhymePic word={g} />
          </motion.span>
        ))}
      </span>
    </button>
  );
});
