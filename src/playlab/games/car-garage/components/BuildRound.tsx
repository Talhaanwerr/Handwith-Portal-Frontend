"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSnapSound } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  ALL_SPOTS,
  CarArt,
  PartArt,
  spotBox,
  type Box,
  type CarBody,
  type CarColourId,
  type CarSpot,
} from "@games/car-garage/components/CarArt";
import { GarageWorld } from "@games/car-garage/components/GarageWorld";
import { CarBay, SpotBox, playHonk, useDriveOff } from "@games/car-garage/components/CarBay";
import { PieceArt, StepStrip } from "@games/car-garage/components/StepStrip";
import { useCarDrag, type Verdict } from "@games/car-garage/hooks/useCarDrag";
import {
  AXLES,
  BUILD_ROUNDS,
  NAME_CLIP,
  PIECES,
  STEPS,
  currentStep,
  pieceKind,
  seatFor,
  stepTargets,
  type BuildTarget,
  type PieceId,
  type StepKind,
} from "@games/car-garage/constants/rounds";

/** From the last part on to the car driving away. */
const DRIVE_AT = 1250;

type Placed = Readonly<Partial<Record<CarSpot, PieceId>>>;
type Hand = { fx: number; fy: number; tx: number; ty: number; key: string };

/** A target's box on the car: a part's own place, or both wheels of an axle. */
function targetBox(body: CarBody, t: BuildTarget): Box {
  if (t !== "axle-back" && t !== "axle-front") return spotBox(body, t);
  const [a, b] = AXLES[t].map((s) => spotBox(body, s));
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}

/**
 * BUILD THE CAR — one round.
 *
 * The car's ghost stands on the lift, outlined part by part; the parts wait
 * in the tray. The step strip shows the order — body, four wheels, roof,
 * windows — and only the step being built can be picked up (the others wait,
 * dimmed). Its places glow on the ghost. Each wheel is counted aloud as it
 * goes on. The last part wakes the car: its headlight eyes open, it smiles,
 * honks, bounces on its springs and drives down the ramp and away.
 *
 * Nothing here can be got wrong — a part let go anywhere but its place just
 * glides home — so this module is about order and counting, not misses.
 */
export function BuildRound({ round, title, onDone, onHome, onExitPortal }: RoundProps) {
  const r = BUILD_ROUNDS[round];
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const seats = useRef(new Map<CarSpot, HTMLElement>());
  const [placed, setPlaced] = useState<Placed>({});
  const placedRef = useRef<Placed>({});
  const [driving, setDriving] = useState(false);
  const schedule = useScheduler();
  const { controls, slotRef, drive } = useDriveOff(stageRef);

  const filled = useMemo(() => new Set(Object.keys(placed) as CarSpot[]), [placed]);
  const stepIx = currentStep(filled);
  const step = STEPS[stepIx] as (typeof STEPS)[number] | undefined;
  const built = !step;

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
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([STEPS[0].clip]);

  /** The car is whole: it wakes up, honks, says its name and drives off. */
  const complete = useCallback(() => {
    playHonk();
    const name = NAME_CLIP[r.body];
    if (name) void sayAfter(name);
    finish(boardRef.current);
    schedule(() => {
      setDriving(true);
      drive();
    }, DRIVE_AT);
  }, [drive, finish, r.body, schedule]);

  /** Put a part on through a target: the place it fills, or null. */
  const place = useCallback(
    (piece: PieceId, target: BuildTarget): HTMLElement | null => {
      const cur = placedRef.current;
      const was = new Set(Object.keys(cur) as CarSpot[]);
      const at = currentStep(was);
      const now = STEPS[at];
      if (!now || pieceKind(piece) !== now.kind || !stepTargets(now.kind).includes(target))
        return null;
      const seat = seatFor(target, was);
      if (!seat) return null;
      const next: Placed = { ...cur, [seat]: piece };
      placedRef.current = next;
      setPlaced(next);
      const seatEl = seats.current.get(seat) ?? null;
      playSnapSound();
      burst(seatEl);
      const after = currentStep(new Set(Object.keys(next) as CarSpot[]));
      if (now.kind === "wheel") sayNumber(wheelsOn(next));
      if (after >= STEPS.length) complete();
      else if (after !== at) void sayAfter(STEPS[after].clip);
      return seatEl;
    },
    [burst, complete]
  );

  const isEligible = useCallback(
    (t: BuildTarget) =>
      !!step &&
      stepTargets(step.kind).includes(t) &&
      seatFor(t, new Set(Object.keys(placedRef.current) as CarSpot[])) !== null,
    [step]
  );
  const judge = useCallback(
    (piece: PieceId, t: BuildTarget): Verdict => {
      const seat = place(piece, t);
      return seat ? { ok: true, seat } : { ok: false };
    },
    [place]
  );
  const drag = useCarDrag<PieceId, BuildTarget>({ stageRef, locked: built, isEligible, judge });
  const { send, tookClick } = drag;

  /** A tap on a waiting part puts it on by itself. */
  const tap = useCallback(
    (piece: PieceId) => {
      if (tookClick() || !step || pieceKind(piece) !== step.kind) return;
      const t = stepTargets(step.kind).find((x) => isEligible(x));
      if (!t) return;
      const seat = place(piece, t);
      if (seat) send(piece, seat);
    },
    [isEligible, place, send, step, tookClick]
  );

  // ── the car as it stands: the parts that have landed (the body brings its
  // sleeping headlight eyes with it)
  const on = useMemo(() => {
    const spots = ALL_SPOTS.filter((s) => {
      const p = placed[s];
      return p !== undefined && !drag.flying(p);
    });
    if (spots.includes("body")) spots.push("lights");
    return spots;
  }, [placed, drag]);
  const waiting = useMemo(
    () => (step ? ALL_SPOTS.filter((s) => !filled.has(s) && kindMatches(s, step.kind)) : []),
    [filled, step]
  );

  // ── the idle teaching hand: the next part, to its place
  const nextPiece = step
    ? PIECES.find((p) => pieceKind(p) === step.kind && !Object.values(placed).includes(p))
    : undefined;
  const nextTarget = step
    ? stepTargets(step.kind).find((t) => seatFor(t, filled) !== null)
    : undefined;
  const idle = useIdleHand(!built && !drag.busy, filled.size);
  const [hand, setHand] = useState<Hand | null>(null);
  const { homeOf, targetOf } = drag;
  useEffect(() => {
    if (!idle || !nextPiece || !nextTarget) return;
    void playClip("instr-watch-carefully");
    const measure = () => {
      const a = centreIn(stageRef.current, homeOf(nextPiece));
      const b = centreIn(stageRef.current, targetOf(nextTarget));
      setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y, key: `${nextPiece}-${nextTarget}` });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, nextPiece, nextTarget, homeOf, targetOf]);

  const registerSeat = useCallback((s: CarSpot, el: HTMLElement | null) => {
    if (el) seats.current.set(s, el);
    else seats.current.delete(s);
  }, []);

  const piece = useCallback(
    (p: PieceId) => <PartArt body={r.body} colour={r.colour} kind={pieceKind(p)} />,
    [r.body, r.colour]
  );

  return (
    <NgStage
      stageRef={stageRef}
      playClass="bcg-play bcg-play--build"
      world={<GarageWorld />}
      round={round}
      solved={solved}
      say={say(clipText(step ? step.clip : STEPS[STEPS.length - 1].clip))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(piece)}
          {idle && hand && hand.key === `${nextPiece}-${nextTarget}` && (
            <TeachingHand key={hand.key} fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
          )}
        </>
      }
    >
      <div className="bcg-board">
        <div ref={boardRef} className="bcg-bay">
          <StepStrip body={r.body} colour={r.colour} now={stepIx} wheelsOn={wheelsOn(placed)} />
          <CarBay slotRef={slotRef} controls={controls}>
            <CarArt
              body={r.body}
              colour={r.colour}
              on={on}
              ghost={!built}
              glow={waiting}
              face={built ? "happy" : "sleep"}
              driving={driving}
            />
            {ALL_SPOTS.map((s) => (
              <SpotBox
                key={s}
                box={spotBox(r.body, s)}
                className="bcg-seat"
                register={(el) => registerSeat(s, el)}
              />
            ))}
            {step &&
              stepTargets(step.kind).map((t) => (
                <SpotBox
                  key={t}
                  box={targetBox(r.body, t)}
                  className={`bcg-target ${drag.over === t ? "is-over" : ""}`}
                  register={(el) => drag.registerTarget(t, el)}
                />
              ))}
          </CarBay>
        </div>

        <div className="bcg-tray bcg-tray--build">
          {STEPS.map((s, i) => (
            <div
              key={s.kind}
              className={`bcg-bin bcg-bin--${s.kind} ${i === stepIx ? "is-now" : ""} ${i < stepIx ? "is-done" : ""}`}
            >
              {PIECES.filter((p) => pieceKind(p) === s.kind).map((p) => (
                <TrayPiece
                  key={p}
                  piece={p}
                  body={r.body}
                  colour={r.colour}
                  live={i === stepIx && !built}
                  gone={Object.values(placed).includes(p) || drag.away(p)}
                  onPick={drag.pickUp}
                  onTap={tap}
                  register={drag.registerHome}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </NgStage>
  );
}

function kindMatches(s: CarSpot, kind: StepKind): boolean {
  return kind === "wheel" ? s.startsWith("wheel") : s === kind;
}

function wheelsOn(placed: Placed): number {
  return Object.keys(placed).filter((s) => s.startsWith("wheel")).length;
}

const PIECE_NAME: Record<StepKind, string> = {
  body: "the car's body",
  wheel: "a wheel",
  roof: "the roof",
  windows: "the windows",
};

/** One part in the tray. Only the step being built can be picked up. */
const TrayPiece = memo(function TrayPiece({
  piece,
  body,
  colour,
  live,
  gone,
  onPick,
  onTap,
  register,
}: {
  piece: PieceId;
  body: CarBody;
  colour: CarColourId;
  live: boolean;
  gone: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, p: PieceId) => void;
  onTap: (p: PieceId) => void;
  register: (p: PieceId, el: HTMLElement | null) => void;
}) {
  const kind = pieceKind(piece);
  const can = live && !gone;
  return (
    <button
      type="button"
      className={`bcg-piece bcg-piece--${kind} touch-none ${gone ? "is-gone" : ""} ${live ? "" : "is-dim"}`}
      disabled={!can}
      onPointerDown={can ? (e) => onPick(e, piece) : undefined}
      onClick={can ? () => onTap(piece) : undefined}
      aria-label={
        live ? `${PIECE_NAME[kind]} — drag it onto the car` : `${PIECE_NAME[kind]} — later`
      }
    >
      <PieceArt body={body} colour={colour} kind={kind} register={(el) => register(piece, el)} />
    </button>
  );
});
