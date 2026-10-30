"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { Picture } from "@games/blend-read/components/PictureArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  Basket,
  ShopCustomer,
  StreetBackdrop,
  ToyRow,
} from "@games/tiny-toy-shop/components/ShopParts";
import { useAddLevel } from "@games/tiny-toy-shop/store/addLevelStore";
import {
  ADD_LEVELS,
  addAskLines,
  type AddRound as AddRoundData,
} from "@games/tiny-toy-shop/constants/rounds";

interface Slide {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

/** From an element's centre to the basket's. */
function towards(el: Element | null, basket: Element | null): [number, number] {
  if (!el || !basket) return [0, 0];
  const a = el.getBoundingClientRect();
  const b = basket.getBoundingClientRect();
  return [
    b.left + b.width / 2 - (a.left + a.width / 2),
    b.top + b.height / 2 - (a.top + a.height / 2),
  ];
}

/**
 * ADD THEM UP — one round (TAP THE TOTAL).
 *
 * The customer brings two little groups of one toy, laid on the counter with
 * a + between. Three big number buttons: tap the total and the two groups
 * slide together into the basket; a wrong number shakes and is crossed out.
 */
function AddRoundOf({
  rounds,
  round,
  title,
  onDone,
  onMiss,
  onHome,
  onExitPortal,
}: RoundProps & { rounds: readonly AddRoundData[] }) {
  const r = rounds[round];
  const sum = r.a + r.b;
  const stageRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const groupA = useRef<HTMLDivElement>(null);
  const groupB = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [slide, setSlide] = useState<Slide | null>(null);
  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <Picture id={r.toy} />
        </span>
      )),
    [r.toy]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 4,
    stageRef,
    cast,
    onDone,
  });

  const askLines = addAskLines(r);
  useSayOnEnter(askLines);
  // shown as words too: the recorded sentence, or the sum itself
  const askText = askLines.length === 1 ? clipText(askLines[0]) : `${r.a} + ${r.b}. How many?`;

  const pick = useCallback(
    (n: number) => {
      if (isSolved() || wrong.includes(n)) return;
      if (n === sum) {
        const [ax, ay] = towards(groupA.current, basketRef.current);
        const [bx, by] = towards(groupB.current, basketRef.current);
        setSlide({ ax, ay, bx, by });
        burst(buttons.current[r.choices.indexOf(n)]);
        playStarPop();
        sayNumber(n);
        finish(basketRef.current);
        return;
      }
      playIncorrectSound();
      void playClip("tys-add-wrong");
      setWrong([...wrong, n]);
      onMiss();
    },
    [burst, finish, isSolved, onMiss, r.choices, sum, wrong]
  );

  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    buttons.current[i] = el;
  }, []);

  // The idle hand taps the total.
  const idle = useIdleHand(!solved, wrong.length);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  const right = r.choices.indexOf(sum);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, buttons.current[right]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, right]);

  const glide = { duration: 0.6, ease: "easeInOut" } as const;

  return (
    <NgStage
      stageRef={stageRef}
      playClass="tys-play"
      world={<StreetBackdrop />}
      round={round}
      solved={solved}
      say={say(askText)}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {idle && hand && <TeachingHand fx={hand.x} fy={hand.y} tx={hand.x} ty={hand.y} />}
        </>
      }
    >
      <div className="tys-board">
        <ShopCustomer who={r.customer} happy={solved}>
          <span className="tys-ask font-rounded font-black">?</span>
        </ShopCustomer>
        <div className="tys-shop">
          <div className="tys-sum">
            <motion.div
              ref={groupA}
              className="tys-group"
              animate={
                slide ? { x: slide.ax, y: slide.ay, opacity: 0 } : { x: 0, y: 0, opacity: 1 }
              }
              transition={glide}
            >
              <ToyRow toy={r.toy} n={r.a} />
            </motion.div>
            <span className="tys-plus font-rounded font-black" aria-hidden="true">
              +
            </span>
            <motion.div
              ref={groupB}
              className="tys-group"
              animate={
                slide ? { x: slide.bx, y: slide.by, opacity: 0 } : { x: 0, y: 0, opacity: 1 }
              }
              transition={glide}
            >
              <ToyRow toy={r.toy} n={r.b} />
            </motion.div>
          </div>
          <div className="tys-counter tys-counter--add">
            <div className="tys-choices">
              {r.choices.map((n, i) => (
                <NumberButton
                  key={`${round}-${n}`}
                  index={i}
                  n={n}
                  right={solved && n === sum}
                  wrong={wrong.includes(n)}
                  live={!solved}
                  onPick={pick}
                  register={register}
                />
              ))}
            </div>
            <Basket basketRef={basketRef}>
              {slide &&
                Array.from({ length: sum }, (_, i) => (
                  <motion.span
                    key={i}
                    className="tys-load-toy"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 + i * 0.06, duration: 0.25, ease: "easeOut" }}
                  >
                    <Picture id={r.toy} />
                  </motion.span>
                ))}
            </Basket>
          </div>
        </div>
      </div>
    </NgStage>
  );
}

const NumberButton = memo(function NumberButton({
  index,
  n,
  right,
  wrong,
  live,
  onPick,
  register,
}: {
  index: number;
  n: number;
  right: boolean;
  wrong: boolean;
  live: boolean;
  onPick: (n: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);
  const can = live && !wrong;
  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
        register(index, el);
      }}
      type="button"
      className={`tys-num font-rounded font-black ${right ? "is-right" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onClick={can ? () => onPick(n) : undefined}
      aria-label={`${n}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.25, ease: "easeOut" }}
    >
      {n}
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </motion.button>
  );
});

/** Add Them Up at the level picked on the title screen. */
export function AddRound(props: RoundProps) {
  const level = useAddLevel((s) => s.level);
  return <AddRoundOf {...props} rounds={ADD_LEVELS[level]} />;
}
