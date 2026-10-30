"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { PlayroomWorld } from "@games/number-groups/components/NgWorlds";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { SockArt, PegArt } from "@games/sock-case/components/SockArt";
import { Basket, HangingSock, LineRow } from "@games/sock-case/components/SockLine";
import { useSockDrag } from "@games/sock-case/hooks/useSockDrag";
import { PAIR_ROUNDS, pairAnswer, pairBasket, type Sock } from "@games/sock-case/constants/rounds";

const ASK = "skc-find-pair";
const PAIRED = "skc-pair";

/**
 * FIND THE PAIR — one round (DRAG, or tap, the matching sock).
 *
 * A sock hangs on the washing line beside an empty peg; the laundry basket
 * holds 2–4 socks. Drag the one that matches onto the empty peg: it clicks
 * on, confetti flies, and the pair does a happy little swing side by side.
 * A sock that does not match shakes, goes back to the basket and stays
 * crossed out.
 */
export function PairRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = PAIR_ROUNDS[round];
  const basket = useMemo(() => pairBasket(round), [round]);
  const answer = useMemo(() => pairAnswer(round), [round]);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const schedule = useScheduler();
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [swing, setSwing] = useState(0);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <SockArt sock={r.clue} />
        </span>
      )),
    [r.clue]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const onWrong = useCallback(
    (v: number) => {
      if (wrong.includes(v)) return;
      playIncorrectSound();
      void playClip("instr-try-again");
      setWrong((w) => [...w, v]);
      onMiss();
    },
    [onMiss, wrong]
  );

  const onRight = useCallback(
    (peg: HTMLElement | undefined) => {
      burst(peg);
      playStarPop();
      void playClip(PAIRED);
      // the pair swings once the sock has settled on its peg
      schedule(() => setSwing(1), 260);
      finish(lineRef.current);
    },
    [burst, finish, schedule]
  );

  const { placed, lit, pickUp, tap, registerPeg, registerSeat, registerHome, away, layer } =
    useSockDrag({ stageRef, answer, locked: solved, onRight, onWrong });
  const piece = useCallback((v: number) => <SockArt sock={basket[v]} />, [basket]);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="skc-play skc-play--pair"
      world={<PlayroomWorld />}
      round={round}
      solved={solved}
      say={say(clipText(solved ? PAIRED : ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {layer(piece, "skc-piece")}
        </>
      }
    >
      <div className="skc-board skc-board--pair">
        <div className="skc-lines">
          <LineRow lineRef={lineRef}>
            <div className="skc-slot">
              <HangingSock sock={r.clue} swing={swing} />
            </div>
            <div
              ref={(el) => registerPeg(el)}
              className={`skc-slot skc-slot--empty ${lit ? "is-lit" : ""}`}
              role="group"
              aria-label={placed ? "The pair, side by side" : "The empty peg"}
            >
              {placed ? (
                <HangingSock sock={r.clue} swing={swing} />
              ) : (
                <EmptyPeg seatRef={registerSeat} />
              )}
            </div>
          </LineRow>
        </div>

        <Basket>
          {basket.map((s, i) => (
            <BasketSock
              key={`${round}-${i}`}
              index={i}
              sock={s}
              away={away(i)}
              wrong={wrong.includes(i)}
              locked={solved}
              onPick={pickUp}
              onTap={tap}
              register={registerHome}
            />
          ))}
        </Basket>
      </div>
    </NgStage>
  );
}

/** The peg with nothing on it, and the sock-shaped place under it. */
function EmptyPeg({ seatRef }: { seatRef: (el: HTMLElement | null) => void }) {
  return (
    <>
      <span ref={(el) => seatRef(el)} className="skc-hang skc-ghost" aria-hidden="true">
        <svg viewBox="0 0 80 110" className="skc-sock-art">
          <path
            d="M16 14 Q16 6 24 6 H48 Q56 6 56 14 V58 Q56 64 61 67 L70 72 Q80 78 78 89 Q75 102 62 101 L34 97 Q16 95 16 76 Z"
            fill="rgba(255,255,255,0.55)"
            stroke="rgba(120,80,40,0.45)"
            strokeWidth="2.6"
            strokeDasharray="6 5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="skc-peg" aria-hidden="true">
        <PegArt />
      </span>
    </>
  );
}

const BasketSock = memo(function BasketSock({
  index,
  sock,
  away,
  wrong,
  locked,
  onPick,
  onTap,
  register,
}: {
  index: number;
  sock: Sock;
  away: boolean;
  wrong: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, v: number) => void;
  onTap: (v: number) => void;
  register: (v: number, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!wrong) return;
    // after the glide home, once the sock is back in the basket
    const t = setTimeout(() => shake(ref.current), 280);
    return () => clearTimeout(t);
  }, [wrong]);

  const can = !locked && !wrong && !away;
  return (
    <button
      ref={(el) => {
        ref.current = el;
        register(index, el);
      }}
      type="button"
      className={`ng-piece skc-piece touch-none ${away ? "is-away" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onPointerDown={can ? (e) => onPick(e, index) : undefined}
      onClick={can ? () => onTap(index) : undefined}
      aria-label={`A ${sock.colour} sock with ${sock.pattern === "plain" ? "no pattern" : sock.pattern}`}
    >
      <SockArt sock={sock} />
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
