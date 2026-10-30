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
import { PICK_ROUNDS, pickAsk, type ToyId } from "@games/tiny-toy-shop/constants/rounds";

/** Where a toy hopped from, relative to the basket. */
interface Hop {
  shelf: number;
  dx: number;
  dy: number;
}

/**
 * PICK THE TOYS — one round (TAP TO COUNT).
 *
 * The customer wants N of one toy (shown in their bubble). Six toys stand on
 * the shelf: tap one asked for and it hops into the basket with a ding, and
 * the basket's count is said. A wrong kind shakes and is crossed out. The
 * round is won the moment the basket holds N — no over-count is possible.
 */
export function PickRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = PICK_ROUNDS[round];
  const stageRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hops, setHops] = useState<readonly Hop[]>([]);
  const [wrong, setWrong] = useState<readonly number[]>([]);
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
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  const ask = pickAsk(r);
  useSayOnEnter([ask]);

  const picked = useMemo(() => hops.map((h) => h.shelf), [hops]);

  const tap = useCallback(
    (i: number) => {
      if (isSolved() || picked.includes(i) || wrong.includes(i)) return;
      if (r.shelf[i] === r.toy) {
        const from = refs.current[i]?.getBoundingClientRect();
        const to = basketRef.current?.getBoundingClientRect();
        const dx = from && to ? from.left + from.width / 2 - (to.left + to.width / 2) : 0;
        const dy = from && to ? from.top + from.height / 2 - (to.top + to.height * 0.35) : 0;
        const next = [...hops, { shelf: i, dx, dy }];
        setHops(next);
        burst(basketRef.current);
        playStarPop();
        sayNumber(next.length);
        if (next.length >= r.count) finish(basketRef.current);
        return;
      }
      playIncorrectSound();
      void playClip("tys-pick-wrong");
      setWrong([...wrong, i]);
      onMiss();
    },
    [burst, finish, hops, isSolved, onMiss, picked, r, wrong]
  );

  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  }, []);

  // The idle hand taps the next right toy.
  const next = r.shelf.findIndex((t, i) => t === r.toy && !picked.includes(i));
  const idle = useIdleHand(!solved && next >= 0, `${hops.length}-${wrong.length}`);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle || next < 0) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, refs.current[next]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, next]);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="tys-play"
      world={<StreetBackdrop />}
      round={round}
      solved={solved}
      say={say(clipText(ask))}
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
          <ToyRow toy={r.toy} n={r.count} />
        </ShopCustomer>
        <div className="tys-shop">
          <div className="tys-shelf">
            {r.shelf.map((t, i) => (
              <ShelfToy
                key={`${round}-${i}`}
                index={i}
                toy={t}
                gone={picked.includes(i)}
                wrong={wrong.includes(i)}
                live={!solved}
                onTap={tap}
                register={register}
              />
            ))}
          </div>
          <div className="tys-counter">
            <Basket basketRef={basketRef}>
              {hops.map((h) => (
                <motion.span
                  key={h.shelf}
                  className="tys-load-toy"
                  initial={{ x: h.dx, y: h.dy, scale: 1.25 }}
                  animate={{ x: 0, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <Picture id={r.toy} />
                </motion.span>
              ))}
            </Basket>
            <span className="tys-count font-rounded font-black">{hops.length}</span>
          </div>
        </div>
      </div>
    </NgStage>
  );
}

const ShelfToy = memo(function ShelfToy({
  index,
  toy,
  gone,
  wrong,
  live,
  onTap,
  register,
}: {
  index: number;
  toy: ToyId;
  gone: boolean;
  wrong: boolean;
  live: boolean;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);

  const can = live && !wrong && !gone;
  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
        register(index, el);
      }}
      type="button"
      className={`tys-toy ${gone ? "is-gone" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onClick={can ? () => onTap(index) : undefined}
      aria-label={toy === "bear" ? "teddy bear" : toy}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: gone ? 0 : 1, y: 0 }}
      transition={{ delay: gone ? 0 : 0.08 + index * 0.06, duration: 0.25, ease: "easeOut" }}
    >
      <span className="tys-toy-pic">
        <Picture id={toy} />
      </span>
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </motion.button>
  );
});
