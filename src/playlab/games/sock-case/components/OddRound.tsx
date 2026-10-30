"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playIncorrectSound, playPickUpSound, playSnapSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import type { RootPoint } from "@shared/utils/pointer";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { PlayroomWorld } from "@games/number-groups/components/NgWorlds";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { GlassOver, SockArt, TowelArt } from "@games/sock-case/components/SockArt";
import { Basket, HangingSock, LineRow } from "@games/sock-case/components/SockLine";
import {
  ODD_ROUNDS,
  oddIndex,
  pairsOnLine,
  partnerOf,
  type Sock,
} from "@games/sock-case/constants/rounds";

const ASK = "skc-odd-ask";
const SOLVED = "skc-case-solved";
const HAS_PARTNER = "skc-has-partner";

/** The beats after the lonely sock is found, in ms: the glass looks at it,
 *  its partner flies up from the basket, then the pairs are counted. */
const GLASS_MS = 1700;
const FLY_MS = 750;
const COUNT_MS = 850;

/** The wiggle a sock's partner gives — "we belong together". About its peg. */
const WIGGLE: Keyframe[] = [
  { transform: "rotate(0deg)" },
  { transform: "rotate(-10deg)" },
  { transform: "rotate(8deg)" },
  { transform: "rotate(-5deg)" },
  { transform: "rotate(0deg)" },
];

type Phase = "ask" | "glass" | "partner" | "count";

/**
 * THE ODD SOCK — one round (TAP the sock with no partner).
 *
 * 3 or 5 socks hang on the washing line: pairs, and one lonely sock. "Which
 * sock has no partner?" Tap it: the detective's magnifying glass zooms in on
 * it — "Case solved!" — then its partner flies up out of the basket to hang
 * beside it, and the pairs are counted aloud, each pair swinging as its
 * number is said. Tapping a sock that HAS a partner: its partner wiggles to
 * show they belong together, and the tapped sock shakes and is crossed out.
 */
export function OddRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = ODD_ROUNDS[round];
  const odd = useMemo(() => oddIndex(r), [r]);
  const pairs = useMemo(() => pairsOnLine(r), [r]);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const sockRefs = useRef(new Map<number, HTMLElement>());
  const hangRefs = useRef(new Map<number, HTMLElement>());
  const seatRef = useRef<HTMLSpanElement>(null);
  const basketRef = useRef<HTMLSpanElement>(null);
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>("ask");
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [glassAt, setGlassAt] = useState<RootPoint | null>(null);
  /** Where the partner starts, relative to its place beside the odd sock. */
  const [from, setFrom] = useState<{ x: number; y: number; s: number } | null>(null);
  /** Which pair is swinging as it is counted, and a count of swings. */
  const [counted, setCounted] = useState(-1);
  const found = phase !== "ask";

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <SockArt sock={r.line[odd] ?? r.line[0]} />
        </span>
      )),
    [r, odd]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: ROUND_COUNT + round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const tap = useCallback(
    (i: number) => {
      if (found || wrong.includes(i)) return;
      const el = sockRefs.current.get(i);
      if (i !== odd) {
        playIncorrectSound();
        void playClip(HAS_PARTNER);
        shake(el ?? null);
        hangRefs.current.get(partnerOf(r, i))?.animate(WIGGLE, {
          duration: 900,
          easing: "ease-in-out",
        });
        setWrong((w) => [...w, i]);
        onMiss();
        return;
      }
      // the case is solved: the glass on the sock, then its partner, then the count
      setGlassAt(centreIn(stageRef.current, el));
      setPhase("glass");
      burst(el);
      playStarPop();
      void playClip(SOLVED);
      schedule(() => {
        const seat = seatRef.current?.getBoundingClientRect();
        const box = basketRef.current?.getBoundingClientRect();
        if (seat && box)
          setFrom({
            x: box.left + box.width / 2 - (seat.left + seat.width / 2),
            y: box.top + box.height / 2 - (seat.top + seat.height / 2),
            s: Math.min(1, box.height / Math.max(1, seat.height)),
          });
        setPhase("partner");
        playPickUpSound();
      }, GLASS_MS);
      schedule(() => playSnapSound(), GLASS_MS + FLY_MS);
      pairs.forEach((_, k) => {
        schedule(
          () => {
            setPhase("count");
            setCounted(k);
            sayNumber(k + 1);
          },
          GLASS_MS + FLY_MS + 250 + k * COUNT_MS
        );
      });
      schedule(
        () => finish(lineRef.current),
        GLASS_MS + FLY_MS + 250 + (pairs.length - 1) * COUNT_MS + 500
      );
    },
    [burst, finish, found, odd, onMiss, pairs, r, schedule, wrong]
  );

  const registerSock = useCallback((i: number, el: HTMLElement | null) => {
    if (el) sockRefs.current.set(i, el);
    else sockRefs.current.delete(i);
  }, []);
  const registerHang = useCallback((i: number, el: HTMLElement | null) => {
    if (el) hangRefs.current.set(i, el);
    else hangRefs.current.delete(i);
  }, []);

  /** The swing key of sock `i`: its pair's turn in the count. */
  const swingOf = (i: number) => {
    const k = pairs.findIndex(([a, b]) => a === i || b === i);
    return counted >= k && k >= 0 && phase === "count" ? k + 1 : 0;
  };

  // ── the idle teaching hand: it points at the lonely sock ──
  const idle = useIdleHand(!found, wrong.length);
  const [hand, setHand] = useState<RootPoint | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => setHand(centreIn(stageRef.current, sockRefs.current.get(odd)));
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, odd]);

  // landscape: one line; portrait: the CSS stacks a long line's two halves
  const rows =
    r.line.length === 5
      ? [
          [0, 1, 2],
          [3, 4],
        ]
      : [r.line.map((_, i) => i)];

  return (
    <NgStage
      stageRef={stageRef}
      playClass="skc-play skc-play--odd"
      world={<PlayroomWorld />}
      round={round}
      solved={solved}
      say={say(clipText(found ? SOLVED : ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          <AnimatePresence>
            {phase === "glass" && glassAt && (
              <motion.div
                key="glass"
                className="skc-glass-at pl-at"
                style={cssVars({
                  "--pl-x": `${glassAt.x}px`,
                  "--pl-y": `${glassAt.y}px`,
                  "--skc-n": r.line.length,
                })}
                initial={{ opacity: 0, scale: 0.35 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 190, damping: 16 }}
                aria-hidden="true"
              >
                <span className="skc-glass">
                  <GlassOver sock={r.line[odd]} />
                </span>
                <span className="skc-solved font-rounded font-black">{clipText(SOLVED)}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {idle && hand && (
            <TeachingHand fx={hand.x + 40} fy={hand.y + 60} tx={hand.x} ty={hand.y} />
          )}
        </>
      }
    >
      <div
        className={`skc-board skc-board--odd ${rows.length > 1 ? "skc-board--two" : ""}`}
        style={cssVars({ "--skc-n": r.line.length })}
      >
        <div ref={lineRef} className="skc-lines">
          {rows.map((row, ri) => (
            <LineRow key={ri} ends={rows.length === 1 ? "both" : ri === 0 ? "left" : "right"}>
              {row.map((i) => (
                <LineSock
                  key={`${round}-${i}`}
                  index={i}
                  sock={r.line[i]}
                  isOdd={i === odd}
                  found={found}
                  wrong={wrong.includes(i)}
                  swing={swingOf(i)}
                  from={i === odd ? from : null}
                  partnerSwing={i === odd ? swingOf(i) : 0}
                  onTap={tap}
                  register={registerSock}
                  registerHang={registerHang}
                  seatRef={i === odd ? seatRef : undefined}
                />
              ))}
            </LineRow>
          ))}
        </div>

        <Basket small>
          <span ref={basketRef} className="skc-towel">
            <TowelArt />
          </span>
        </Basket>
      </div>
    </NgStage>
  );
}

/** One slot of the line: a sock on its peg (a button until the case is
 *  solved) — and, for the lonely sock, the place its partner comes to. */
const LineSock = memo(function LineSock({
  index,
  sock,
  isOdd,
  found,
  wrong,
  swing,
  from,
  partnerSwing,
  onTap,
  register,
  registerHang,
  seatRef,
}: {
  index: number;
  sock: Sock;
  isOdd: boolean;
  found: boolean;
  wrong: boolean;
  swing: number;
  /** Where the partner flies in from (the lonely sock, once found). */
  from: { x: number; y: number; s: number } | null;
  partnerSwing: number;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLElement | null) => void;
  registerHang: (i: number, el: HTMLElement | null) => void;
  seatRef?: React.Ref<HTMLSpanElement>;
}) {
  const can = !found && !wrong;
  const paired = isOdd && from !== null;
  return (
    <div className={`skc-slot skc-slot--wide ${paired ? "is-paired" : ""}`}>
      <motion.button
        ref={(el) => register(index, el)}
        type="button"
        className={`skc-line-sock ${wrong ? "is-wrong" : ""} ${isOdd && found ? "is-odd" : ""}`}
        disabled={!can}
        onClick={can ? () => onTap(index) : undefined}
        animate={{ x: paired ? "-28%" : "0%" }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        aria-label={`A ${sock.colour} sock with ${sock.pattern === "plain" ? "no pattern" : sock.pattern}`}
      >
        <span ref={(el) => registerHang(index, el)} className="skc-hang-box">
          <HangingSock sock={sock} swing={swing} />
        </span>
        {wrong && (
          <span className="ng-cross" aria-hidden="true">
            <CrossMark />
          </span>
        )}
      </motion.button>
      {isOdd && (
        <span ref={seatRef} className="skc-partner-seat" aria-hidden="true">
          {from && (
            <motion.span
              className="skc-partner"
              initial={{ x: from.x, y: from.y, scale: from.s, opacity: 0.6 }}
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: FLY_MS / 1000, ease: "easeOut" }}
            >
              <HangingSock sock={sock} swing={partnerSwing} />
            </motion.span>
          )}
        </span>
      )}
    </div>
  );
});
