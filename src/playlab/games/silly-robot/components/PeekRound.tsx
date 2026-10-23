"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playClickSound, playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { SiteWorld } from "@games/silly-robot/components/SrbWorld";
import { Robot, ScreenDots } from "@games/silly-robot/components/RobotArt";
import { FLASH_MS, PEEK_MS, PEEK_ROUNDS, peekChoices } from "@games/silly-robot/constants/rounds";

const ASK = "srb-look";
const WHAT = "srb-what-see";
const PEEK = "srb-peek-again";

/**
 * QUICK LOOK — one round (SEE, then TAP the numeral).
 *
 * The robot's tummy shows N dots as a die face for two seconds, then its
 * shutter closes: "How many dots did you see?" Three big numerals wait; tap
 * the right one and it is said, the robot beeps and wiggles and the tummy
 * opens again to show it. A wrong numeral shakes and is crossed out. "Peek
 * again" opens the tummy for one more second, as often as wanted — so it is
 * never unfair.
 */
export function PeekRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = PEEK_ROUNDS[round];
  const choices = useMemo(() => peekChoices(round), [round]);
  const stageRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<number, HTMLButtonElement>());
  const schedule = useScheduler();
  const [open, setOpen] = useState(true);
  const [peeked, setPeeked] = useState(false);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  /** Which opening the pending close belongs to (a later peek wins). */
  const opening = useRef(0);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast srb-cast-num font-rounded font-black">
          {r.n}
        </span>
      )),
    [r.n]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: 4 + round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const closeLater = useCallback(
    (ms: number, ask: boolean) => {
      const id = ++opening.current;
      schedule(() => {
        if (id !== opening.current || isSolved()) return;
        setOpen(false);
        setPeeked(true);
        if (ask) void playClip(WHAT);
      }, ms);
    },
    [isSolved, schedule]
  );

  // the first look
  useEffect(() => closeLater(FLASH_MS, true), [closeLater]);

  const peekAgain = useCallback(() => {
    if (open || isSolved()) return;
    playClickSound();
    setOpen(true);
    closeLater(PEEK_MS, false);
  }, [closeLater, isSolved, open]);

  const tap = useCallback(
    (v: number) => {
      if (isSolved() || wrong.includes(v)) return;
      const el = refs.current.get(v);
      if (v !== r.n) {
        playIncorrectSound();
        shake(el ?? null);
        setWrong((w) => [...w, v]);
        onMiss();
        return;
      }
      opening.current++;
      setOpen(true);
      burst(el);
      playStarPop();
      sayNumber(v);
      finish(robotRef.current);
    },
    [burst, finish, isSolved, onMiss, r.n, wrong]
  );

  const register = useCallback((v: number, el: HTMLButtonElement | null) => {
    if (el) refs.current.set(v, el);
    else refs.current.delete(v);
  }, []);

  // ── the idle teaching hand: it points at the right numeral ──
  const idle = useIdleHand(!open && !solved, wrong.length);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => setHand(centreIn(stageRef.current, refs.current.get(r.n)));
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, r.n]);

  const belly = useMemo(
    () => (
      <>
        <ScreenDots count={r.n} />
        <span className={`srb-shutter ${open ? "" : "is-shut"}`} aria-hidden="true">
          <span className="srb-shutter-q font-rounded font-black">?</span>
        </span>
      </>
    ),
    [open, r.n]
  );

  return (
    <NgStage
      stageRef={stageRef}
      playClass="srb-play--peek"
      world={<SiteWorld />}
      round={round}
      solved={solved}
      say={say(clipText(peeked ? WHAT : ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {idle && hand && (
            <TeachingHand fx={hand.x + 40} fy={hand.y + 60} tx={hand.x} ty={hand.y} />
          )}
        </>
      }
    >
      <div className="srb-board">
        <div ref={robotRef} className="srb-robot-slot">
          <Robot belly={belly} happy={solved} />
        </div>
        <div className="srb-answers">
          <div className="srb-nums">
            {choices.map((v) => (
              <NumButton
                key={v}
                value={v}
                wrong={wrong.includes(v)}
                right={solved && v === r.n}
                live={!solved}
                onTap={tap}
                register={register}
              />
            ))}
          </div>
          <button
            type="button"
            className="srb-peek font-rounded font-black"
            disabled={open || solved}
            onClick={peekAgain}
            aria-label="Peek again"
          >
            <svg viewBox="0 0 24 16" className="srb-peek-eye" aria-hidden="true">
              <path d="M1 8 Q12 -4 23 8 Q12 20 1 8 Z" fill="#FFFFFF" />
              <circle cx="12" cy="8" r="4" fill="#1F5FA6" />
            </svg>
            <span>{clipText(PEEK)}</span>
          </button>
        </div>
      </div>
    </NgStage>
  );
}

const NumButton = memo(function NumButton({
  value,
  wrong,
  right,
  live,
  onTap,
  register,
}: {
  value: number;
  wrong: boolean;
  right: boolean;
  live: boolean;
  onTap: (v: number) => void;
  register: (v: number, el: HTMLButtonElement | null) => void;
}) {
  const can = live && !wrong;
  return (
    <button
      ref={(el) => register(value, el)}
      type="button"
      className={`srb-num font-rounded font-black ${wrong ? "is-wrong" : ""} ${right ? "is-right" : ""}`}
      disabled={!can}
      onClick={can ? () => onTap(value) : undefined}
      aria-label={`${value}`}
    >
      <span className="srb-num-digit">{value}</span>
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
