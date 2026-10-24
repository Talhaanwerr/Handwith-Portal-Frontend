"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playIncorrectSound, playSnapSound } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import { useMatchDrag } from "@games/number-groups/hooks/useMatchDrag";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { SiteWorld } from "@games/silly-robot/components/SrbWorld";
import { Robot, ScreenDots, SparePart } from "@games/silly-robot/components/RobotArt";
import { FIX_ROUNDS, PART_ASK, fixChoices, type PartId } from "@games/silly-robot/constants/rounds";

/** Past this many pixels between press and click, the click ends a drag. */
const TAP_SLOP = 12;

/**
 * FIX THE ROBOT — one round (TAP or DRAG the matching part).
 *
 * The robot's tummy shows N dots as a die face; one part has fallen off and
 * its place is outlined. Three spare parts of that kind lie on the ground,
 * each holding a dot card. Tap the one with the tummy's dots, or drag it to
 * the gap: it clicks on, the number is said and the robot wiggles. A wrong
 * one shakes and is crossed out.
 *
 * The drag is Number Hunt's (`useMatchDrag`, one target: the gap), with its
 * idle teaching hand.
 */
export function FixRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = FIX_ROUNDS[round];
  const choices = useMemo(() => fixChoices(round), [round]);
  const answers = useMemo(() => [r.n], [r.n]);
  const stageRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const gapEl = useRef<HTMLElement | null>(null);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [tapped, setTapped] = useState(false);
  /** The piece last pressed, and where — to tell a tap from a drag's click. */
  const press = useRef<{ v: number; x: number; y: number } | null>(null);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <SparePart id={r.part} count={r.n} />
        </span>
      )),
    [r.part, r.n]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  const ask = PART_ASK[r.part];
  useSayOnEnter([ask]);

  const markWrong = useCallback(
    (v: number) => {
      if (wrong.includes(v)) return;
      playIncorrectSound();
      void playClip("srb-not-that");
      setWrong((w) => [...w, v]);
      onMiss();
    },
    [onMiss, wrong]
  );

  /** A wrong part dropped on the gap. */
  const missed = useCallback(() => {
    if (press.current) markWrong(press.current.v);
  }, [markWrong]);

  const onPlaced = useCallback((_k: number, el: HTMLElement | undefined) => burst(el), [burst]);
  const onAllPlaced = useCallback(() => finish(robotRef.current), [finish]);

  const drag = useMatchDrag({
    stageRef,
    answers,
    locked: solved || tapped,
    onMiss: missed,
    onPlaced,
    onAllPlaced,
  });

  const { pickUp: dragPickUp, registerTarget, registerSeat } = drag;
  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, v: number) => {
      press.current = { v, x: e.clientX, y: e.clientY };
      dragPickUp(e, v);
    },
    [dragPickUp]
  );

  /** A tap (not the end of a drag) on a spare part. */
  const tap = useCallback(
    (e: React.MouseEvent<HTMLElement>, v: number) => {
      const p = press.current;
      if (!p || p.v !== v || Math.hypot(e.clientX - p.x, e.clientY - p.y) > TAP_SLOP) return;
      if (isSolved() || tapped || wrong.includes(v)) return;
      if (v !== r.n) {
        markWrong(v);
        return;
      }
      setTapped(true);
      playSnapSound();
      sayNumber(v);
      burst(gapEl.current);
      finish(robotRef.current);
    },
    [burst, finish, isSolved, markWrong, r.n, tapped, wrong]
  );

  const fixed = tapped || drag.placed[0] !== undefined;
  const registerGap = useCallback(
    (el: HTMLElement | null) => {
      gapEl.current = el;
      registerTarget(0, el);
      registerSeat(0, el);
    },
    [registerTarget, registerSeat]
  );

  const piece = useCallback((v: number) => <SparePart id={r.part} count={v} />, [r.part]);
  const belly = useMemo(() => <ScreenDots count={r.n} />, [r.n]);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="srb-play--fix"
      world={<SiteWorld />}
      round={round}
      solved={solved}
      say={say(clipText(ask))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(piece, "srb-piece")}
        </>
      }
    >
      <div className="srb-board">
        <div ref={robotRef} className="srb-robot-slot">
          <Robot
            missing={fixed ? null : r.part}
            belly={belly}
            happy={fixed}
            gapRef={fixed ? undefined : registerGap}
          />
        </div>
        <div className="srb-ground">
          {choices.map((v) => (
            <Spare
              key={v}
              value={v}
              part={r.part}
              away={drag.away(v) || (tapped && v === r.n)}
              wrong={wrong.includes(v)}
              locked={solved || tapped}
              onPick={pickUp}
              onTap={tap}
              register={drag.registerHome}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

const Spare = memo(function Spare({
  value,
  part,
  away,
  wrong,
  locked,
  onPick,
  onTap,
  register,
}: {
  value: number;
  part: PartId;
  away: boolean;
  wrong: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, v: number) => void;
  onTap: (e: React.MouseEvent<HTMLElement>, v: number) => void;
  register: (v: number, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!wrong) return;
    // after the glide home, when the piece is back on show
    const t = setTimeout(() => shake(ref.current), 260);
    return () => clearTimeout(t);
  }, [wrong]);

  const can = !locked && !wrong && !away;
  const name = part === "head" ? "head" : part === "leg-r" ? "leg" : "arm";
  return (
    <button
      ref={(el) => {
        ref.current = el;
        register(value, el);
      }}
      type="button"
      className={`ng-piece srb-piece touch-none ${away ? "is-away" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onPointerDown={can ? (e) => onPick(e, value) : undefined}
      onClick={can ? (e) => onTap(e, value) : undefined}
      aria-label={`A robot ${name} with ${value} dot${value === 1 ? "" : "s"}`}
    >
      <SparePart id={part} count={value} />
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
