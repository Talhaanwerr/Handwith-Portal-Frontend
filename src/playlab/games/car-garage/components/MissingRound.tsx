"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playIncorrectSound, playSnapSound } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  CarArt,
  spotBox,
  type CarBody,
  type CarColourId,
} from "@games/car-garage/components/CarArt";
import { GarageWorld } from "@games/car-garage/components/GarageWorld";
import { CarBay, SpotBox, playHonk, useDriveOff } from "@games/car-garage/components/CarBay";
import { PieceArt } from "@games/car-garage/components/StepStrip";
import { ODD_NAME, OddArt } from "@games/car-garage/components/OddArt";
import { useCarDrag, type Verdict } from "@games/car-garage/hooks/useCarDrag";
import {
  MISSING_ASK,
  MISSING_ROUNDS,
  NAME_CLIP,
  missingChoices,
  missingOn,
  type Choice,
} from "@games/car-garage/constants/rounds";

/** Said when an odd thing is tried on the car. */
const NOT_THAT = "bcg-not-that";
/** From the part going on to the car driving away. */
const DRIVE_AT = 1250;

/** The one drop target: the gap. */
type GapId = "gap";
type Hand = { fx: number; fy: number; tx: number; ty: number };

/**
 * MISSING PART — one round.
 *
 * A finished car on the lift has lost one part: a wheel, its roof, its
 * windows or its headlight eyes. Its place is outlined and glows. Three
 * things wait in the tray — the part, and two that could never go on a car
 * (a square wheel, a sail, a hat…). Drag the part in (a tap works too): it
 * clicks on, the car smiles, honks and drives off. An odd thing tried on the
 * car shakes, glides home and is crossed out.
 */
export function MissingRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = MISSING_ROUNDS[round];
  const choices = useMemo(() => missingChoices(round), [round]);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLElement | null>(null);
  const [fixed, setFixed] = useState(false);
  const fixedRef = useRef(false);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [driving, setDriving] = useState(false);
  const schedule = useScheduler();
  const { controls, slotRef, drive } = useDriveOff(stageRef);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <CarArt body={r.body} colour={r.colour} face="happy" />
        </span>
      )),
    [r.body, r.colour]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: ROUND_COUNT + round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([MISSING_ASK]);

  const markWrong = useCallback(
    (i: number) => {
      if (wrong.includes(i)) return;
      playIncorrectSound();
      void playClip(NOT_THAT);
      setWrong((w) => [...w, i]);
      onMiss();
    },
    [onMiss, wrong]
  );

  /** The part goes on: snap, confetti, the car wakes up and leaves. */
  const fix = useCallback((): HTMLElement | null => {
    if (fixedRef.current) return null;
    fixedRef.current = true;
    setFixed(true);
    playSnapSound();
    burst(gapRef.current);
    playHonk();
    const name = NAME_CLIP[r.body];
    if (name) void sayAfter(name);
    finish(boardRef.current);
    schedule(() => {
      setDriving(true);
      drive();
    }, DRIVE_AT);
    return gapRef.current;
  }, [burst, drive, finish, r.body, schedule]);

  const judge = useCallback(
    (i: number): Verdict => {
      if (choices[i].right) {
        const seat = fix();
        return seat ? { ok: true, seat } : { ok: false };
      }
      markWrong(i);
      return { ok: false };
    },
    [choices, fix, markWrong]
  );
  const isEligible = useCallback(() => !fixedRef.current, []);
  const drag = useCarDrag<`${number}`, GapId>({
    stageRef,
    locked: fixed,
    isEligible,
    judge: (p) => judge(Number(p)),
  });
  const { send, tookClick } = drag;

  const tap = useCallback(
    (i: number) => {
      if (tookClick() || fixedRef.current || wrong.includes(i)) return;
      if (!choices[i].right) {
        markWrong(i);
        return;
      }
      const seat = fix();
      if (seat) send(`${i}`, seat);
    },
    [choices, fix, markWrong, send, tookClick, wrong]
  );

  const right = choices.findIndex((c) => c.right);
  const landed = fixed && !drag.flying(`${right}`);
  const on = useMemo(() => (landed ? undefined : missingOn(r)), [landed, r]);

  // ── the idle teaching hand: the right part, into the gap
  const idle = useIdleHand(!fixed && !drag.busy, wrong.length);
  const [hand, setHand] = useState<Hand | null>(null);
  const { homeOf } = drag;
  useEffect(() => {
    if (!idle) return;
    void playClip("instr-watch-carefully");
    const measure = () => {
      const a = centreIn(stageRef.current, homeOf(`${right}`));
      const b = centreIn(stageRef.current, gapRef.current);
      setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, right, homeOf]);

  const { registerTarget } = drag;
  const registerGap = useCallback(
    (el: HTMLElement | null) => {
      gapRef.current = el;
      registerTarget("gap", el);
    },
    [registerTarget]
  );

  const piece = useCallback(
    (p: `${number}`) => <ChoiceArt choice={choices[Number(p)]} body={r.body} colour={r.colour} />,
    [choices, r.body, r.colour]
  );

  return (
    <NgStage
      stageRef={stageRef}
      playClass="bcg-play bcg-play--missing"
      world={<GarageWorld />}
      round={round}
      solved={solved}
      say={say(clipText(MISSING_ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(piece)}
          {idle && hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="bcg-board">
        <div ref={boardRef} className="bcg-bay">
          <CarBay slotRef={slotRef} controls={controls}>
            <CarArt
              body={r.body}
              colour={r.colour}
              on={on}
              ghost={!landed}
              glow={landed ? [] : [r.missing]}
              face={landed ? "happy" : "awake"}
              driving={driving}
            />
            <SpotBox
              box={spotBox(r.body, r.missing)}
              className={`bcg-target ${drag.over === "gap" ? "is-over" : ""}`}
              register={registerGap}
            />
          </CarBay>
        </div>

        <div className="bcg-tray bcg-tray--missing">
          {choices.map((c, i) => (
            <ChoicePiece
              key={i}
              index={i}
              choice={c}
              body={r.body}
              colour={r.colour}
              live={!fixed}
              gone={drag.away(`${i}`) || (fixed && c.right)}
              wrong={wrong.includes(i)}
              onPick={drag.pickUp}
              onTap={tap}
              register={drag.registerHome}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

/** A choice's picture: the car part at its true shape, or the odd thing.
 *  `register` gets the picture itself (the drag measures from it). */
function ChoiceArt({
  choice,
  body,
  colour,
  register,
}: {
  choice: Choice;
  body: CarBody;
  colour: CarColourId;
  register?: (el: HTMLElement | null) => void;
}) {
  return choice.right ? (
    <PieceArt
      body={body}
      colour={colour}
      kind={choice.kind}
      withWindows={choice.kind === "roof"}
      register={register}
    />
  ) : (
    <span ref={register} className="bcg-piece-art bcg-piece-art--odd">
      <OddArt thing={choice.odd} />
    </span>
  );
}

const PART_NAME = {
  wheel: "a wheel",
  roof: "a roof",
  windows: "the windows",
  lights: "the headlights",
  body: "a car body",
} as const;

const ChoicePiece = memo(function ChoicePiece({
  index,
  choice,
  body,
  colour,
  live,
  gone,
  wrong,
  onPick,
  onTap,
  register,
}: {
  index: number;
  choice: Choice;
  body: CarBody;
  colour: CarColourId;
  live: boolean;
  gone: boolean;
  wrong: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, p: `${number}`) => void;
  onTap: (i: number) => void;
  register: (p: `${number}`, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!wrong) return;
    // after the glide home, when the piece is back on show
    const t = setTimeout(() => shake(ref.current), 280);
    return () => clearTimeout(t);
  }, [wrong]);

  const can = live && !gone && !wrong;
  const name = choice.right ? PART_NAME[choice.kind] : ODD_NAME[choice.odd];
  return (
    <button
      ref={ref}
      type="button"
      className={`bcg-piece bcg-piece--choice touch-none ${gone ? "is-gone" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onPointerDown={can ? (e) => onPick(e, `${index}`) : undefined}
      onClick={can ? () => onTap(index) : undefined}
      aria-label={`${name} — does it go on the car?`}
    >
      <ChoiceArt
        choice={choice}
        body={body}
        colour={colour}
        register={(el) => register(`${index}`, el)}
      />
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
