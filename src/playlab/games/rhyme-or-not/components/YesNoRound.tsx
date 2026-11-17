"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequenceChecked, sayAfter, stopVoice } from "@shared/audio/voice";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { fluentSrc } from "@shared/constants/fluent3d";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { useQuietHand } from "@games/rhyme-rocket/components/useQuietHand";
import { RynWorld } from "@games/rhyme-or-not/components/RynWorld";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, rhymes, type Word } from "@games/rhyme-or-not/constants/words";
import { ASK, ROUNDS, SAY_NO, SAY_YES } from "@games/rhyme-or-not/constants/rounds";

const TRY = "instr-try-again";
/** A breath between the first word and the second picture. */
const BEAT_MS = 350;
/** Round one: the longest the thumbs and the hand wait for the first word. */
const ARM_CAP_MS = 2000;

/** a: the first picture is out and said · b: the second too · ask: "Do they
 *  rhyme?" and the thumbs wait · right: answered, the pair said again. */
type Phase = "a" | "b" | "ask" | "right";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * RHYME TIME — one round: four pairs. The first picture stands up on the
 * stage and is named, then the second; "Do they rhyme?" A big green
 * thumbs-up (yes) and a big red thumbs-down (no). Right: the pair glows and
 * both words come again, "…they rhyme!" or "…they don't rhyme." Wrong: the
 * thumb shakes, "Try again!", and the right one glows.
 */
export function YesNoRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const pairs = ROUNDS[round];
  const [idx, setIdx] = useState(0);
  const [phase, setPhaseState] = useState<Phase>("a");
  const [wrong, setWrong] = useState(false);
  /** The pair whose question has been asked: the hand waits for it, so its
   *  "Watch carefully!" never cuts "Do they rhyme?" off. */
  const [asked, setAsked] = useState(-1);
  const [a, b] = pairs[idx];
  const yes = rhymes(a, b);
  /** Round one teaches straight away: the thumbs work, and the (silent)
   *  hand shows the right one, as soon as the first word has been said —
   *  not only after the second word and "Do they rhyme?". */
  const early = round === 0;
  /** The phase, readable at once by the opening's promise chain (an answer
   *  during the words must stop it putting the question back). */
  const phaseRef = useRef<Phase>("a");
  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const pairRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const schedule = useScheduler();

  const cast = useMemo(
    () =>
      pairs
        .filter(([x, y]) => rhymes(x, y))
        .flat()
        .map((w) => (
          <span key={w} className="ng-cast">
            <RhymePic word={w} />
          </span>
        )),
    [pairs]
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

  // A pair comes on: the first word, a breath, the second picture and word,
  // then the question. Each step waits for the line before (a stop from
  // anywhere just moves it on, so it can never hang).
  useEffect(() => {
    let live = true;
    const [x, y] = pairs[idx];
    // round one: if the first word is slow to come (a slow load, browser
    // speech), the second picture — and with it the thumbs and the silent
    // hand — come anyway soon after the start; the words carry on
    const cap = early
      ? setTimeout(() => {
          if (live && phaseRef.current === "a") setPhase("b");
        }, ARM_CAP_MS)
      : undefined;
    const t = setTimeout(
      () => {
        void sayAfter(clipFor(x))
          .then(() => wait(BEAT_MS))
          .then(() => {
            if (!live || phaseRef.current === "right") return;
            setPhase("b");
            return sayAfter(clipFor(y));
          })
          .then(() => {
            // answered already (round one may answer while the words come)
            if (!live || phaseRef.current === "right") return;
            setPhase("ask");
            return sayAfter(ASK);
          })
          .then(() => {
            if (live) setAsked(idx);
          });
      },
      idx === 0 ? 450 : 150
    );
    return () => {
      live = false;
      clearTimeout(t);
      clearTimeout(cap);
    };
  }, [early, idx, pairs, setPhase]);

  const answer = useCallback(
    (saidYes: boolean) => {
      const open = phase === "ask" || (early && phase === "b");
      if (!open || isSolved()) return;
      // an answer during the words cuts them off and counts
      if (phase !== "ask") stopVoice();
      if (saidYes !== yes) {
        playIncorrectSound();
        void playClip(TRY);
        shake(saidYes ? yesRef.current : noRef.current);
        setWrong(true);
        onMiss();
        return;
      }
      setPhase("right");
      setWrong(false);
      playStarPop();
      burst(pairRef.current);
      const last = idx + 1 >= pairs.length;
      void playSequenceChecked([clipFor(a), clipFor(b), yes ? SAY_YES : SAY_NO], 200).then(() => {
        if (!alive.current) return;
        if (last) finish(boardRef.current);
        else
          schedule(() => {
            setIdx(idx + 1);
            setPhase("a");
          }, 400);
      });
    },
    [
      a,
      b,
      burst,
      early,
      finish,
      idx,
      isSolved,
      onMiss,
      pairs.length,
      phase,
      schedule,
      setPhase,
      yes,
    ]
  );

  /** Tap a picture to hear its word again. */
  const hear = useCallback(
    (w: Word) => {
      if (phase === "ask" || (early && phase === "b")) void playClip(clipFor(w));
    },
    [early, phase]
  );

  const idle = useIdleHand(
    (early ? phase === "b" || phase === "ask" : asked === idx && phase === "ask") && !solved,
    `${idx}-${wrong}`
  );
  const rightBtn = useCallback(() => (yes ? yesRef.current : noRef.current), [yes]);
  const hand = useQuietHand(idle, !early, stageRef, rightBtn, rightBtn);

  const line =
    phase === "a"
      ? clipText(clipFor(a))
      : phase === "b"
        ? `${clipText(clipFor(a))} … ${clipText(clipFor(b))}`
        : phase === "right"
          ? clipText(yes ? SAY_YES : SAY_NO)
          : clipText(wrong ? TRY : ASK);

  const live = (phase === "ask" || (early && phase === "b")) && !solved;
  return (
    <NgStage
      stageRef={stageRef}
      playClass="ryn-play"
      world={<RynWorld />}
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
      <div ref={boardRef} className="ryn-board">
        <div
          ref={pairRef}
          className={`ryn-pair ${phase === "right" ? (yes ? "is-rhyme" : "is-apart") : ""}`}
        >
          <Card key={`a-${idx}`} word={a} shown onTap={hear} />
          <span className="ryn-link" aria-hidden="true">
            {phase === "right" && yes ? "=" : "?"}
          </span>
          <Card key={`b-${idx}`} word={b} shown={phase !== "a"} onTap={hear} />
        </div>
        <div className="ryn-answers">
          <button
            ref={yesRef}
            type="button"
            className={`ryn-btn ryn-btn--yes ${wrong && yes ? "is-hint" : ""}`}
            disabled={!live}
            onClick={() => answer(true)}
            aria-label="Yes, they rhyme"
          >
            <Thumb />
            <span className="ryn-btn-word font-rounded font-black">Yes</span>
          </button>
          <button
            ref={noRef}
            type="button"
            className={`ryn-btn ryn-btn--no ${wrong && !yes ? "is-hint" : ""}`}
            disabled={!live}
            onClick={() => answer(false)}
            aria-label="No, they don't rhyme"
          >
            <Thumb down />
            <span className="ryn-btn-word font-rounded font-black">No</span>
          </button>
        </div>
      </div>
    </NgStage>
  );
}

/** One picture on its spotlight card. Before its turn: an empty card. */
const Card = memo(function Card({
  word,
  shown,
  onTap,
}: {
  word: Word;
  shown: boolean;
  onTap: (w: Word) => void;
}) {
  return (
    <button
      type="button"
      className={`ryn-card ${shown ? "" : "is-waiting"}`}
      onClick={shown ? () => onTap(word) : undefined}
      aria-label={shown ? `${word} — tap to hear it again` : "The next picture"}
    >
      {shown && (
        <motion.span
          className="ryn-card-pic"
          initial={{ opacity: 0, scale: 0.6, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <RhymePic word={word} />
        </motion.span>
      )}
    </button>
  );
});

/** The big thumb (Fluent's thumbs-up; turned over for no). */
function Thumb({ down = false }: { down?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fluentSrc("thumb") ?? ""}
      alt=""
      className={`ryn-thumb ${down ? "ryn-thumb--down" : ""}`}
      draggable={false}
      aria-hidden="true"
    />
  );
}
