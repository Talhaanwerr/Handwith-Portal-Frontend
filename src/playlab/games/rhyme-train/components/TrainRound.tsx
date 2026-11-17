"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playStarPop } from "@shared/audio/sfx";
import {
  clipText,
  playClip,
  playSequenceChecked,
  sayAfter,
  stopVoice,
  voiceIdle,
} from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { RhymePic } from "@games/rhyme-or-not/components/RhymePic";
import { clipFor, type Word } from "@games/rhyme-or-not/constants/words";
import { useHandPath } from "@games/magic-hat/components/useHandPath";
import { RtrWorld } from "@games/rhyme-train/components/RtrWorld";
import { EngineArt } from "@games/rhyme-train/components/TrainArt";
import { PAINT, ROUNDS, TOOT, WHO, carOf } from "@games/rhyme-train/constants/rounds";

const TRY = "instr-try-again";

/**
 * A passenger dropped on the wrong carriage (or nowhere) hops home from
 * where the finger let go: a little arc and a bounce — Web Animations on the
 * DOM node, so it costs no React render. The passenger is placed by flex, so
 * animating its transform is free.
 */
function hopBack(
  root: HTMLElement | null,
  el: HTMLElement | null | undefined,
  at: { x: number; y: number }
) {
  if (!root || !el) return;
  const home = centreIn(root, el);
  const dx = at.x - home.x;
  const dy = at.y - home.y;
  const lift = Math.max(40, el.offsetHeight * 0.45);
  el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px)` },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px)`, offset: 0.45 },
      { transform: "translate(0, 0)", offset: 0.78 },
      { transform: "translate(0, -10px)", offset: 0.89 },
      { transform: "translate(0, 0)" },
    ],
    { duration: 640, easing: "ease-in-out" }
  );
}

/**
 * RHYME TRAIN STATION — one round: one train. The train pulls in and each
 * carriage's door picture is said, then each passenger's card ("moon… car…
 * star… spoon… jar… Who rides in which carriage?"). Drag a passenger to the
 * carriage that rhymes: they sit at its window and the pair is said ("star,
 * car!"). The wrong carriage sends them hopping home ("Try again!") and the
 * right carriage glows. When everyone is aboard the train toots and drives
 * away. Picking a passenger up says their word; a tap on a carriage says its.
 */
export function TrainRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = ROUNDS[round];
  /** Who has sat down, in the order they did (passenger indexes). */
  const [aboard, setAboard] = useState<readonly number[]>([]);
  const aboardRef = useRef<readonly number[]>([]);
  /** The passenger who just tried the wrong carriage (-1: none). */
  const [missed, setMissed] = useState(-1);
  /** The last pair said ("star, car!"), until the next move. */
  const [pair, setPair] = useState<readonly [Word, Word] | null>(null);
  /** The train is leaving: everyone is aboard. */
  const [leaving, setLeaving] = useState(false);
  /** Which word the opening is saying: cars first, then passengers (-1: none). */
  const [talk, setTalk] = useState(-1);
  /** The opening has been said: the hand may show. */
  const [ready, setReady] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const riderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<number, HTMLElement>());
  const schedule = useScheduler();

  const cast = useMemo(
    () =>
      r.cars.map((w) => (
        <span key={w} className="ng-cast">
          <RhymePic word={w} />
        </span>
      )),
    [r.cars]
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

  // the opening, once the train has pulled in: every carriage, every passenger, the question
  useEffect(() => {
    let on = true;
    const now = ROUNDS[round];
    const ids = [...now.cars.map(clipFor), ...now.riders.map(clipFor), WHO];
    const t = setTimeout(() => {
      // the train is in: on the first round the (silent) hand may show the
      // move while the carriages and passengers are still being named
      if (round === 0) setReady(true);
      void voiceIdle()
        .then(() => (on ? playSequenceChecked(ids, 140, (i) => on && setTalk(i)) : false))
        .then(() => {
          if (!on) return;
          setTalk(-1);
          setReady(true);
        });
    }, 1000);
    return () => {
      on = false;
      clearTimeout(t);
    };
  }, [round]);

  const depart = useCallback(() => {
    setLeaving(true);
    setPair(null);
    void sayAfter(TOOT);
    schedule(() => finish(platformRef.current), 1500);
  }, [finish, schedule]);

  const seat = useCallback(
    (i: number, car: number) => {
      const next = [...aboardRef.current, i];
      aboardRef.current = next;
      setAboard(next);
      setMissed(-1);
      setPair([r.riders[i], r.cars[car]]);
      setTalk(-1);
      playStarPop();
      burst(targets.current.get(car));
      const all = next.length >= r.riders.length;
      void playSequenceChecked([clipFor(r.riders[i]), clipFor(r.cars[car])], 150).then(() => {
        if (alive.current && all) depart();
      });
    },
    [burst, depart, r]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: stageRef,
    targets,
    slopPx: 20,
    onDrop: (i, car, info) => {
      if (!info.moved) return; // the pick-up already said the word
      const el = riderRefs.current[i];
      if (car === null || isSolved() || leaving || aboardRef.current.includes(i)) {
        hopBack(stageRef.current, el, info);
        return;
      }
      if (car === carOf(r, r.riders[i])) {
        seat(i, car);
        return;
      }
      playIncorrectSound();
      void playClip(TRY);
      hopBack(stageRef.current, el, info);
      setMissed(i);
      setPair(null);
      onMiss();
    },
  });

  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, i: number) => {
      if (solved || leaving || aboardRef.current.includes(i)) return;
      if (start(e, i)) {
        stopVoice(); // a move during the naming is a real move: the naming stops
        playPickUpSound();
        void playClip(clipFor(r.riders[i]));
      }
    },
    [leaving, r.riders, solved, start]
  );

  const registerRider = useCallback((i: number, el: HTMLDivElement | null) => {
    riderRefs.current[i] = el;
  }, []);
  const registerCar = useCallback((i: number, el: HTMLElement | null) => {
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);
  const hear = useCallback((w: Word) => void playClip(clipFor(w)), []);

  // the hand: the passenger who just missed, else the first still waiting
  const waiting = r.riders.map((_, i) => i).filter((i) => !aboard.includes(i));
  const shown = missed >= 0 && !aboard.includes(missed) ? missed : (waiting[0] ?? -1);
  const goal = shown >= 0 ? carOf(r, r.riders[shown]) : -1;
  const idle = useIdleHand(
    ready && !leaving && !solved && shown >= 0 && dragging === null,
    `${aboard.length}-${missed}`
  );
  const from = useCallback(() => riderRefs.current[shown], [shown]);
  const to = useCallback(() => targets.current.get(goal), [goal]);
  const hand = useHandPath(idle, stageRef, from, to, round > 0);

  const line = leaving
    ? clipText(TOOT)
    : missed >= 0
      ? clipText(TRY)
      : pair
        ? `${clipText(clipFor(pair[0]))}, ${clipText(clipFor(pair[1]))}!`
        : clipText(WHO);

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`rtr-play rtr-play--${r.cars.length}`}
      world={<RtrWorld />}
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
              <span className="ng-carried rtr-carried">
                <Rider word={r.riders[dragging]} />
              </span>
            </div>
          )}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="rtr-board">
        <div className="rtr-line">
          <motion.div
            className="rtr-train"
            initial={{ x: "115%" }}
            animate={{ x: leaving ? "-170%" : "0%" }}
            transition={
              leaving ? { duration: 1.5, ease: "easeIn" } : { duration: 1.0, ease: "easeOut" }
            }
          >
            <span className="rtr-engine">
              <EngineArt puff={leaving} />
            </span>
            {r.cars.map((c, k) => (
              <Carriage
                key={`${round}-${c}`}
                index={k}
                word={c}
                riders={aboard.filter((i) => carOf(r, r.riders[i]) === k)}
                words={r.riders}
                lit={over === k}
                glow={missed >= 0 && k === carOf(r, r.riders[missed])}
                talk={talk === k}
                onTap={hear}
                register={registerCar}
              />
            ))}
          </motion.div>
          <span className="rtr-rails" aria-hidden="true" />
        </div>
        <div ref={platformRef} className="rtr-platform">
          {r.riders.map((w, i) => (
            <div
              key={`${round}-${w}`}
              ref={(el) => registerRider(i, el)}
              className={`rtr-rider touch-none ${dragging === i || aboard.includes(i) ? "is-away" : ""} ${talk === r.cars.length + i ? "is-talk" : ""}`}
              onPointerDown={(e) => pick(e, i)}
              role="button"
              aria-label={`${w} — drag them to the carriage that rhymes`}
            >
              <motion.span
                className="rtr-rider-in"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 240, damping: 18 }}
              >
                <Rider word={w} />
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </NgStage>
  );
}

/** A passenger: their picture card. */
const Rider = memo(function Rider({ word }: { word: Word }) {
  return (
    <span className="rtr-person">
      <span className="rtr-card">
        <RhymePic word={word} />
      </span>
    </span>
  );
});

const Carriage = memo(function Carriage({
  index,
  word,
  riders,
  words,
  lit,
  glow,
  talk,
  onTap,
  register,
}: {
  index: number;
  word: Word;
  /** The passengers sitting in it (indexes into `words`). */
  riders: readonly number[];
  words: readonly Word[];
  lit: boolean;
  glow: boolean;
  talk: boolean;
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
      className={`rtr-car ${lit ? "is-lit" : ""} ${glow ? "is-hint" : ""} ${talk ? "is-talk" : ""}`}
      style={cssVars({ "--rtr-paint": PAINT[index % PAINT.length] })}
      onClick={() => onTap(word)}
      aria-label={`The ${word} carriage`}
    >
      <span className="rtr-car-roof" />
      <span className="rtr-car-body">
        <span className="rtr-windows">
          {[0, 1].map((s) => {
            const who = riders[s];
            return (
              <span key={s} className="rtr-window">
                {who !== undefined && (
                  <motion.span
                    className="rtr-sitter"
                    initial={{ opacity: 0, y: "60%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  >
                    <span className="rtr-sitter-card">
                      <RhymePic word={words[who]} />
                    </span>
                  </motion.span>
                )}
              </span>
            );
          })}
        </span>
        <span className="rtr-door">
          <span className="rtr-door-pic">
            <RhymePic word={word} />
          </span>
        </span>
      </span>
      <span className="rtr-wheels" aria-hidden="true">
        <span className="rtr-wheel" />
        <span className="rtr-wheel" />
      </span>
    </button>
  );
});
