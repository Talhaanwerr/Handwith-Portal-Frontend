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
import { useHandAt } from "@games/shadow-match/components/useHandAt";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, type Word } from "@games/rhyme-or-not/constants/words";
import { SAY_YES } from "@games/rhyme-or-not/constants/rounds";
import { RymWorld } from "@games/rhyme-match/components/RymWorld";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { FIND, ROUNDS, answerOf } from "@games/rhyme-match/constants/rounds";

const TRY = "instr-try-again";
const PAD = "pad";

/**
 * RHYME MATCH — one round: four targets. The target stands on the garden
 * pad with an empty place beside it ("Find the one that rhymes with… cat");
 * three pictures wait below. Drag the rhyming one onto the pad: it snaps in
 * beside the target and both words are said, "cat… hat… they rhyme!". A
 * wrong one slides back ("Try again!") and the right one glows. A tap on any
 * picture just says its word.
 */
export function MatchRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const items = ROUNDS[round];
  const [idx, setIdx] = useState(0);
  const [matched, setMatched] = useState(false);
  const [hint, setHint] = useState(false);
  /** The target whose prompt has been said: the hand waits for it, so its
   *  "Watch carefully!" never cuts the word off. */
  const [ready, setReady] = useState(-1);
  const item = items[idx];
  const answer = answerOf(item);

  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const optRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<typeof PAD, HTMLElement>());
  const schedule = useScheduler();

  const cast = useMemo(
    () =>
      items.map((m) => (
        <span key={m.target} className="ng-cast">
          <RhymePic word={m.target} />
        </span>
      )),
    [items]
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

  useEffect(() => {
    if (padRef.current) targets.current.set(PAD, padRef.current);
  }, []);

  // each target: "Find the one that rhymes with" + its word
  useEffect(() => {
    let live = true;
    const t = setTimeout(
      () => {
        void sayAfter(FIND);
        void sayAfter(clipFor(items[idx].target)).then(() => {
          if (live) setReady(idx);
        });
      },
      idx === 0 ? 450 : 150
    );
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [idx, items]);

  const right = useCallback(() => {
    setMatched(true);
    setHint(false);
    playStarPop();
    burst(padRef.current);
    const last = idx + 1 >= items.length;
    void playSequenceChecked(
      [clipFor(item.target), clipFor(item.options[answer]), SAY_YES],
      200
    ).then(() => {
      if (!alive.current) return;
      if (last) finish(boardRef.current);
      else
        schedule(() => {
          setIdx(idx + 1);
          setMatched(false);
        }, 450);
    });
  }, [answer, burst, finish, idx, item, items.length, schedule]);

  const { dragging, over, start, ghostRef } = useDragDrop<number, typeof PAD>({
    root: stageRef,
    targets,
    slopPx: 28,
    onDrop: (i, target, info) => {
      if (!info.moved) {
        void playClip(clipFor(item.options[i]));
        return;
      }
      if (target === null) {
        slideBack(stageRef.current, optRefs.current[i], info);
        return;
      }
      if (isSolved() || matched) return;
      if (i === answer) {
        right();
        return;
      }
      playIncorrectSound();
      void playClip(TRY);
      slideBack(stageRef.current, optRefs.current[i], info);
      setHint(true);
      onMiss();
    },
  });

  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, i: number) => {
      if (solved || matched) return;
      if (start(e, i)) playPickUpSound();
    },
    [matched, solved, start]
  );

  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    optRefs.current[i] = el;
  }, []);

  const idle = useIdleHand(
    ready === idx && !solved && !matched && dragging === null,
    `${idx}-${hint}`
  );
  const from = useCallback(() => optRefs.current[answer], [answer]);
  const to = useCallback(() => padRef.current, []);
  const hand = useHandAt(idle, stageRef, from, to);

  const line = matched
    ? clipText(SAY_YES)
    : hint
      ? clipText(TRY)
      : `${clipText(FIND)} ${clipText(clipFor(item.target))}`;

  return (
    <NgStage
      stageRef={stageRef}
      playClass="rym-play"
      world={<RymWorld />}
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
              <span className="ng-carried rym-carried">
                <RhymePic word={item.options[dragging]} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div ref={boardRef} className="rym-board">
        <div
          ref={padRef}
          className={`rym-pad ${over === PAD ? "is-lit" : ""} ${matched ? "is-paired" : ""}`}
          onClick={() => void playClip(clipFor(item.target))}
          role="img"
          aria-label={`${item.target} — drag the picture that rhymes here`}
        >
          <motion.span
            key={`t-${idx}`}
            className="rym-pad-pic"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <RhymePic word={item.target} />
          </motion.span>
          <span className="rym-spot">
            {matched && (
              <motion.span
                className="rym-spot-pic"
                initial={{ opacity: 0, scale: 1.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
              >
                <RhymePic word={item.options[answer]} />
              </motion.span>
            )}
          </span>
        </div>
        <div className="rym-options">
          {item.options.map((w, i) => (
            <Option
              key={`${idx}-${w}`}
              index={i}
              word={w}
              away={dragging === i || (matched && i === answer)}
              hint={hint && i === answer}
              onPick={pick}
              register={register}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

const Option = memo(function Option({
  index,
  word,
  away,
  hint,
  onPick,
  register,
}: {
  index: number;
  word: Word;
  away: boolean;
  hint: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, i: number) => void;
  register: (i: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={(el) => register(index, el)}
      className={`rym-opt touch-none ${away ? "is-away" : ""} ${hint ? "is-hint" : ""}`}
      onPointerDown={(e) => onPick(e, index)}
      role="button"
      aria-label={`${word} — drag it to the picture it rhymes with`}
    >
      <motion.span
        className="rym-opt-pic"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + index * 0.08, type: "spring", stiffness: 240, damping: 18 }}
      >
        <RhymePic word={word} />
      </motion.span>
    </div>
  );
});
