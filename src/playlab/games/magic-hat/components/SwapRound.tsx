"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequenceChecked, sayAfter, stopVoice } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, type Word } from "@games/rhyme-or-not/constants/words";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { MhtWorld } from "@games/magic-hat/components/MhtWorld";
import { HatArt } from "@games/magic-hat/components/HatArt";
import { useHandPath } from "@games/magic-hat/components/useHandPath";
import {
  ALL_RHYME,
  MAKE,
  ROUNDS,
  answerOf,
  familyOf,
  soundOf,
  wordAt,
} from "@games/magic-hat/constants/rounds";

const TRY = "instr-try-again";
const HAT = "hat";
/** The blocks' letter colours, left to right. */
const INK = ["#E0408A", "#2F7FD0", "#2E9A5C"] as const;

/**
 * MAGIC HAT SWAP — one round: one word family. The card shows a word
 * ("cat"); the hat's wish bubble shows the word to make ("Can you make…
 * hat?"). Drag the right letter block into the hat: sparkles, the card's
 * first letter flips to the new one, its picture changes and the new word
 * is said. A wrong block slides home ("Try again!"), the hat shakes and the
 * right block glows. When the family is made the card shows it in a row and
 * says "They all rhyme!". Picking a block up says its letter's sound; a tap
 * on the card or the wish says its word.
 */
export function SwapRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = ROUNDS[round];
  /** Swaps made so far (the card's word is `wordAt(r, step)`). */
  const [step, setStep] = useState(0);
  /** Between a right drop and the next wish being said. */
  const [busy, setBusy] = useState(false);
  /** Every swap made: the card shows the whole family. */
  const [family, setFamily] = useState(false);
  const [hint, setHint] = useState(false);
  /** Bumped by every wrong block: the hat shakes once more. */
  const [shake, setShake] = useState(0);
  /** The step whose right block went into the hat (hidden until the next
   *  blocks come). */
  const [dropped, setDropped] = useState(-1);
  /** The step whose wish has been said: the hand waits for it. */
  const [ready, setReady] = useState(-1);
  const word = wordAt(r, step);
  const swap = r.swaps[Math.min(step, r.swaps.length - 1)];
  const answer = answerOf(swap);
  const live = !busy && !family && step < r.swaps.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hatRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<typeof HAT, HTMLElement>());
  const schedule = useScheduler();

  const words = useMemo(() => familyOf(r), [r]);
  const cast = useMemo(
    () =>
      words.map((w) => (
        <span key={w} className="ng-cast">
          <RhymePic word={w} />
        </span>
      )),
    [words]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 7,
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
    if (hatRef.current) targets.current.set(HAT, hatRef.current);
  }, []);

  // the round's opening: the card's word, then the wish — "cat… Can you make… hat?"
  useEffect(() => {
    let on = true;
    const first = ROUNDS[round];
    const t = setTimeout(() => {
      // the first round's hand shows the move WHILE the word is said (silent,
      // FirstPlayHand's 1.8 s) — a child must not wait out the whole opening
      if (round === 0) setReady(0);
      void sayAfter(clipFor(first.start));
      void sayAfter(MAKE);
      void sayAfter(clipFor(first.swaps[0].to)).then(() => {
        if (on) setReady(0);
      });
    }, 450);
    return () => {
      on = false;
      clearTimeout(t);
    };
  }, [round]);

  const right = useCallback(() => {
    const next = step + 1;
    const last = next >= r.swaps.length;
    const made = swap.to;
    setBusy(true);
    setDropped(step);
    setHint(false);
    playStarPop();
    burst(hatRef.current);
    schedule(() => {
      setStep(next);
      burst(cardRef.current);
      void playSequenceChecked([clipFor(made)], 0).then(() => {
        if (!alive.current) return;
        if (last) {
          setFamily(true);
          void playSequenceChecked([...words.map(clipFor), ALL_RHYME], 220).then(() => {
            if (alive.current) finish(cardRef.current);
          });
          return;
        }
        schedule(() => {
          setBusy(false);
          void sayAfter(MAKE);
          void sayAfter(clipFor(r.swaps[next].to)).then(() => {
            if (alive.current) setReady(next);
          });
        }, 300);
      });
    }, 380);
  }, [burst, finish, r.swaps, schedule, step, swap.to, words]);

  const { dragging, over, start, ghostRef } = useDragDrop<number, typeof HAT>({
    root: stageRef,
    targets,
    slopPx: 30,
    onDrop: (i, target, info) => {
      if (!info.moved) return; // the pick-up already said its sound
      if (target === null || isSolved() || !live) {
        slideBack(stageRef.current, tileRefs.current[i], info);
        return;
      }
      if (i === answer) {
        right();
        return;
      }
      playIncorrectSound();
      void playClip(TRY);
      slideBack(stageRef.current, tileRefs.current[i], info);
      setHint(true);
      setShake((n) => n + 1);
      onMiss();
    },
  });

  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, i: number) => {
      if (solved || !live) return;
      if (start(e, i)) {
        stopVoice(); // a move during the opening is a real move: the opening stops
        playPickUpSound();
        void playClip(soundOf(swap.tiles[i]));
      }
    },
    [live, solved, start, swap.tiles]
  );

  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    tileRefs.current[i] = el;
  }, []);

  const idle = useIdleHand(
    ready === step && live && !solved && dragging === null,
    `${step}-${hint}`
  );
  const from = useCallback(() => tileRefs.current[answer], [answer]);
  const to = useCallback(() => hatRef.current, []);
  const hand = useHandPath(idle, stageRef, from, to, round > 0);

  const line = family
    ? `${words.map((w) => clipText(clipFor(w))).join(", ")}! ${clipText(ALL_RHYME)}`
    : busy
      ? `${clipText(clipFor(word))}!`
      : hint
        ? clipText(TRY)
        : `${clipText(clipFor(word))} … ${clipText(MAKE)} ${clipText(clipFor(swap.to))}?`;

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`mht-play ${family ? "mht-play--family" : ""}`}
      world={<MhtWorld />}
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
              <span className="ng-carried mht-carried">
                <Block letter={swap.tiles[dragging]} ink={INK[dragging % INK.length]} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="mht-board">
        <div className="mht-top">
          <div className="mht-easel">
            <div
              ref={cardRef}
              className={`mht-card ${family ? "is-family" : ""}`}
              onClick={() =>
                void (family
                  ? playSequenceChecked([...words.map(clipFor), ALL_RHYME], 220)
                  : playClip(clipFor(word)))
              }
              role="button"
              aria-label={family ? words.join(", ") : word}
            >
              {family ? (
                <span className="mht-family">
                  {words.map((w, i) => (
                    <motion.span
                      key={w}
                      className="mht-member"
                      initial={{ opacity: 0, y: 30, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
                    >
                      <span className="mht-member-pic">
                        <RhymePic word={w} />
                      </span>
                      <Spelling word={w} small />
                    </motion.span>
                  ))}
                </span>
              ) : (
                <>
                  <motion.span
                    key={`p-${word}`}
                    className="mht-card-pic"
                    initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 15 }}
                  >
                    <RhymePic word={word} />
                  </motion.span>
                  <Spelling word={word} />
                </>
              )}
            </div>
            <span className="mht-legs" aria-hidden="true" />
          </div>
          <div className="mht-hat-col">
            <button
              type="button"
              className={`mht-wish ${live ? "" : "is-hidden"}`}
              onClick={() => void playClip(clipFor(swap.to))}
              aria-label={`Make ${swap.to}`}
              tabIndex={live ? 0 : -1}
            >
              <motion.span
                key={`w-${step}`}
                className="mht-wish-pic"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
              >
                <RhymePic word={swap.to} />
              </motion.span>
            </button>
            <div
              ref={hatRef}
              className={`mht-hat ${over === HAT ? "is-lit" : ""} ${busy ? "is-poof" : ""}`}
              aria-label="The magic hat — drop a letter in"
              role="img"
            >
              <span key={`s-${shake}`} className={`mht-hat-body ${shake ? "is-shake" : ""}`}>
                <HatArt />
              </span>
            </div>
          </div>
        </div>
        <div className={`mht-tiles ${live ? "" : "is-resting"} ${family ? "is-gone" : ""}`}>
          {swap.tiles.map((l, i) => (
            <Tile
              key={`${step}-${l}`}
              index={i}
              letter={l}
              away={dragging === i || (dropped === step && i === answer)}
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

/** A word in big letters, its first letter in magic pink (the one that swaps). */
const Spelling = memo(function Spelling({ word, small }: { word: Word; small?: boolean }) {
  return (
    <span className={`mht-word ${small ? "mht-word--small" : ""}`} aria-hidden="true">
      <motion.span
        key={word}
        className="mht-first"
        initial={{ opacity: 0, rotateX: 90, scale: 1.6 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
      >
        {word[0]}
      </motion.span>
      <span className="mht-rest">{word.slice(1)}</span>
    </span>
  );
});

/** A wooden alphabet block's face. */
const Block = memo(function Block({ letter, ink }: { letter: string; ink: string }) {
  return (
    <span className="mht-block" style={{ color: ink }}>
      <span className="mht-block-face">{letter}</span>
    </span>
  );
});

const Tile = memo(function Tile({
  index,
  letter,
  away,
  hint,
  onPick,
  register,
}: {
  index: number;
  letter: string;
  away: boolean;
  hint: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, i: number) => void;
  register: (i: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={(el) => register(index, el)}
      className={`mht-tile touch-none ${away ? "is-away" : ""} ${hint ? "is-hint" : ""}`}
      onPointerDown={(e) => onPick(e, index)}
      role="button"
      aria-label={`The letter ${letter} — drag it into the hat`}
    >
      <motion.span
        className="mht-tile-in"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 240, damping: 18 }}
      >
        <Block letter={letter} ink={INK[index % INK.length]} />
      </motion.span>
    </div>
  );
});
