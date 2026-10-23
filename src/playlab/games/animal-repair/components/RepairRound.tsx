"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  playClickSound,
  playIncorrectSound,
  playPickUpSound,
  playSnapSound,
  playStarPop,
} from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import type { RootPoint } from "@shared/utils/pointer";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { PlainWorld } from "@games/animal-repair/components/PlainWorld";
import {
  PartCard,
  PartSvg,
  SLOT_BOX,
  ToyAnimal,
  partName,
  slotVars,
  type Mood,
} from "@games/animal-repair/components/AnimalParts";
import { ToolRack, Workbench } from "@games/animal-repair/components/ShopProps";
import { usePartDrag } from "@games/animal-repair/components/usePartDrag";
import {
  ANIMAL_NAMES,
  LOST_ASK,
  MISSING_ROUNDS,
  SILLY_ROUNDS,
  missingTray,
  ownPart,
  ownParts,
  sillyTray,
  type AnimalId,
  type Kind,
  type PartId,
} from "@games/animal-repair/constants/rounds";

const SILLY_ASK = "arp-silly";
const FIX_ASK = "arp-find-right";
const TRY_AGAIN = "instr-try-again";
/** The silly part's boing, before the kit comes out. */
const POP_MS = 750;
/** Past this many pixels between press and click, the click ends a drag. */
const TAP_SLOP = 12;
/** Tap targets on the toy, bottom to top (a later one sits over an earlier). */
const HIT_ORDER: readonly Kind[] = ["mane", "tail", "ears", "nose"];

type Phase = "silly" | "pop" | "fix";

/** WHAT'S MISSING? — one round: the toy has lost a part; drag it back on. */
export function MissingRound(props: RoundProps) {
  const r = MISSING_ROUNDS[props.round];
  const tray = useMemo(() => missingTray(props.round), [props.round]);
  return (
    <RepairRound {...props} animal={r.animal} kind={r.kind} tray={tray} cheerSeed={props.round} />
  );
}

/** SILLY MIX-UP — one round: tap the silly part off, then drag the right one on. */
export function SillyRound(props: RoundProps) {
  const r = SILLY_ROUNDS[props.round];
  const tray = useMemo(() => sillyTray(props.round), [props.round]);
  return (
    <RepairRound
      {...props}
      animal={r.animal}
      kind={r.kind}
      silly={r.silly}
      tray={tray}
      cheerSeed={ROUND_COUNT + props.round}
    />
  );
}

/**
 * ONE TOY ON THE BENCH — both modules' round.
 *
 * The toy sits on the workbench with the kit (three loose parts) beside it.
 * With `silly`, it first wears another toy's part, looking puzzled: "Oh,
 * silly! Tap the silly part." Tapping it boings it off; tapping one of the
 * toy's own parts only wiggles that part (never a miss). Then — or straight
 * away in What's Missing? — the place is empty, outlined in dashes, the toy
 * sad, and the three parts are in the kit: drag (or tap) the right one and it
 * pops on; the toy blinks, wiggles, smiles and sparkles. A wrong part shakes,
 * goes back and is crossed out.
 */
function RepairRound({
  round,
  title,
  onDone,
  onMiss,
  onHome,
  onExitPortal,
  animal,
  kind,
  silly,
  tray,
  cheerSeed,
}: RoundProps & {
  animal: AnimalId;
  kind: Kind;
  silly?: PartId;
  tray: readonly PartId[];
  cheerSeed: number;
}) {
  const answer = ownPart(animal, kind) as PartId;
  const own = useMemo(() => ownParts(animal), [animal]);
  const stageRef = useRef<HTMLDivElement>(null);
  const toyRef = useRef<HTMLDivElement>(null);
  const gapEl = useRef<HTMLElement | null>(null);
  const sillyHit = useRef<HTMLButtonElement | null>(null);
  const partEls = useRef(new Map<Kind, SVGGElement>());
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>(silly ? "silly" : "fix");
  const [wrong, setWrong] = useState<readonly PartId[]>([]);
  const [tapped, setTapped] = useState(false);
  /** The part last pressed, and where — to tell a tap from a drag's click. */
  const press = useRef<{ part: PartId; x: number; y: number } | null>(null);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <PartSvg id={answer} />
        </span>
      )),
    [answer]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed,
    stageRef,
    cast,
    onDone,
  });

  const fixAsk = silly ? FIX_ASK : LOST_ASK[kind];
  useSayOnEnter([silly ? SILLY_ASK : LOST_ASK[kind]]);

  const markWrong = useCallback(
    (part: PartId) => {
      if (wrong.includes(part)) return;
      playIncorrectSound();
      void playClip(TRY_AGAIN);
      setWrong((w) => [...w, part]);
      onMiss();
    },
    [onMiss, wrong]
  );

  const onRight = useCallback(
    (gap: HTMLElement | undefined) => {
      burst(gap);
      playStarPop();
      finish(toyRef.current);
    },
    [burst, finish]
  );

  const drag = usePartDrag({
    stageRef,
    answer,
    locked: solved || tapped || phase !== "fix",
    onWrong: markWrong,
    onRight,
  });
  const fixed = tapped || drag.landed;

  const { pickUp: dragPickUp, registerGap: dragRegisterGap, take, isTaken } = drag;
  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>, part: PartId) => {
      press.current = { part, x: e.clientX, y: e.clientY };
      dragPickUp(e, part);
    },
    [dragPickUp]
  );

  /** A tap (not the end of a drag) on a part in the kit. */
  const tap = useCallback(
    (e: React.MouseEvent<HTMLElement>, part: PartId) => {
      const p = press.current;
      if (!p || p.part !== part || Math.hypot(e.clientX - p.x, e.clientY - p.y) > TAP_SLOP) return;
      if (isSolved() || isTaken() || wrong.includes(part) || phase !== "fix") return;
      if (part !== answer) {
        markWrong(part);
        return;
      }
      take();
      setTapped(true);
      playSnapSound();
      onRight(gapEl.current ?? undefined);
    },
    [answer, isSolved, isTaken, markWrong, onRight, phase, take, wrong]
  );

  /** Phase one of a mix-up: a tap on the toy. */
  const tapSlot = useCallback(
    (k: Kind) => {
      if (phase !== "silly" || isSolved()) return;
      if (k === kind) {
        playPickUpSound();
        setPhase("pop");
        schedule(() => {
          setPhase("fix");
          void playClip(FIX_ASK);
        }, POP_MS);
        return;
      }
      // one of the toy's own parts: it only wiggles
      playClickSound();
      partEls.current
        .get(k)
        ?.animate(
          [
            { transform: "rotate(0deg)" },
            { transform: "rotate(-9deg)" },
            { transform: "rotate(8deg)" },
            { transform: "rotate(-4deg)" },
            { transform: "rotate(0deg)" },
          ],
          { duration: 560, easing: "ease-in-out" }
        );
    },
    [isSolved, kind, phase, schedule]
  );

  const registerPart = useCallback((k: Kind, el: SVGGElement | null) => {
    if (el) partEls.current.set(k, el);
    else partEls.current.delete(k);
  }, []);
  const registerGap = useCallback(
    (el: HTMLElement | null) => {
      gapEl.current = el;
      dragRegisterGap(el);
    },
    [dragRegisterGap]
  );

  // ── what the toy wears, and its face ──
  const wear = useMemo(
    () =>
      phase === "fix"
        ? { ...own, [kind]: fixed ? answer : null }
        : { ...own, [kind]: silly ?? null },
    [answer, fixed, kind, own, phase, silly]
  );
  const gap = useMemo(
    () => (phase === "fix" && !fixed ? { kind, part: answer } : null),
    [answer, fixed, kind, phase]
  );
  const mood: Mood = fixed ? "happy" : phase === "fix" ? "sad" : "puzzled";

  // ── the idle hand in phase one: it taps the silly part ──
  const sillyIdle = useIdleHand(phase === "silly" && !solved, phase);
  const [sillyHand, setSillyHand] = useState<RootPoint | null>(null);
  useEffect(() => {
    if (!sillyIdle) return;
    const measure = () => setSillyHand(centreIn(stageRef.current, sillyHit.current));
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [sillyIdle]);

  const piece = useCallback((p: PartId) => <PartCard id={p} />, []);
  const name = ANIMAL_NAMES[animal];

  return (
    <NgStage
      stageRef={stageRef}
      playClass="arp-play"
      world={<PlainWorld />}
      round={round}
      solved={solved}
      say={say(clipText(phase === "fix" ? fixAsk : SILLY_ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(piece)}
          {sillyIdle && sillyHand && (
            <TeachingHand
              fx={sillyHand.x + 40}
              fy={sillyHand.y + 60}
              tx={sillyHand.x}
              ty={sillyHand.y}
            />
          )}
        </>
      }
    >
      <div className="arp-shop">
        <Workbench />
        <ToolRack />
        <div
          ref={toyRef}
          className="arp-toy-slot"
          role="img"
          aria-label={
            fixed
              ? `The ${name} is fixed`
              : phase === "fix"
                ? `A toy ${name} with a part missing`
                : `A toy ${name} wearing ${partName(silly as PartId)}`
          }
        >
          <ToyAnimal
            animal={animal}
            wear={wear}
            gap={gap}
            mood={mood}
            fresh={fixed ? kind : null}
            popOff={phase === "pop" ? kind : null}
            register={registerPart}
          />
          {gap && (
            <span
              ref={registerGap}
              className={`arp-gap ${drag.over ? "is-lit" : ""}`}
              style={slotVars(SLOT_BOX[kind])}
              aria-hidden="true"
            />
          )}
          {phase === "silly" &&
            HIT_ORDER.filter((k) => wear[k]).map((k) => (
              <button
                key={k}
                ref={k === kind ? sillyHit : undefined}
                type="button"
                className="arp-hit"
                style={slotVars(SLOT_BOX[k])}
                disabled={solved}
                onClick={() => tapSlot(k)}
                aria-label={k === kind ? `The silly ${k}` : `The ${name}'s own ${k}`}
              />
            ))}
        </div>

        <div className="arp-kit">
          {tray.map((p, i) => (
            <span key={p} className="arp-kit-cell">
              {phase === "fix" && (
                <KitPart
                  index={i}
                  part={p}
                  away={drag.away(p) || (tapped && p === answer)}
                  wrong={wrong.includes(p)}
                  locked={solved || tapped}
                  onPick={pickUp}
                  onTap={tap}
                  register={drag.registerHome}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </NgStage>
  );
}

const KitPart = memo(function KitPart({
  index,
  part,
  away,
  wrong,
  locked,
  onPick,
  onTap,
  register,
}: {
  index: number;
  part: PartId;
  away: boolean;
  wrong: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, p: PartId) => void;
  onTap: (e: React.MouseEvent<HTMLElement>, p: PartId) => void;
  register: (p: PartId, el: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!wrong) return;
    // after the glide home, when the part is back on show
    const t = setTimeout(() => shake(ref.current), 260);
    return () => clearTimeout(t);
  }, [wrong]);

  const can = !locked && !wrong && !away;
  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
        register(part, el);
      }}
      type="button"
      className={`ng-piece arp-piece touch-none ${away ? "is-away" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onPointerDown={can ? (e) => onPick(e, part) : undefined}
      onClick={can ? (e) => onTap(e, part) : undefined}
      aria-label={`${partName(part)} — drag it to the toy`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.3, ease: "easeOut" }}
    >
      <PartCard id={part} />
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </motion.button>
  );
});
