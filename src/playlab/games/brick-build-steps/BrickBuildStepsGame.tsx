"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrickShell, ModelView, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import { COLORS, type Brick, type BrickKind } from "@games/brick-lab/engine/geometry";
import type { Landing } from "@games/brick-lab/engine/world";
import { HERO_HOUSE, HERO_PLATE, STEP_MODELS } from "@games/brick-lab/constants/models";
import { playSequence, stopVoice } from "@shared/audio/voice";
import { playStarPop } from "@shared/audio/sfx";

/**
 * BUILD STEPS — a building booklet, one brick at a time.
 *
 * Made for children who do best with one clear, predictable thing to do: the
 * finished model is always on show, a see-through brick on the plate shows
 * exactly where the next one goes, and the tray offers three to choose from:
 * the right one, one the right size in another colour, and one the right
 * colour in another size. Nothing is timed, nothing is lost; a wrong brick or a
 * wrong spot is just a soft bump and the colour is named again;
 * held near the right spot the brick pulls itself in. Six models — tower,
 * duck, car, house, tree, robot — each three to six steps.
 */
export function BrickBuildStepsGame() {
  return (
    <BrickShell
      title="Build Steps"
      tagline="One brick at a time"
      hero={HERO_HOUSE}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-steps-welcome"
      doneClip="brick-steps-all"
      play={(api) => <Steps api={api} />}
    />
  );
}

const SAME_SIZE_COLORS = ["red", "blue", "yellow", "green", "orange", "purple"] as const;
const SIZES: Array<[number, number]> = [
  [2, 2],
  [2, 4],
  [1, 2],
  [1, 4],
  [2, 3],
];

/** Same footprint (either way round) and same colour. */
function isTarget(k: Pick<BrickKind, "w" | "d" | "color">, t: Brick | undefined): boolean {
  if (!t) return false;
  const same = (k.w === t.w && k.d === t.d) || (k.w === t.d && k.d === t.w);
  return same && k.color === t.color;
}

function stepChoices(t: Brick, seed: number): BrickKind[] {
  const right: BrickKind = { w: t.w, d: t.d, color: t.color };
  const other = SAME_SIZE_COLORS.filter((c) => c !== t.color)[seed % 5];
  const wrongColor: BrickKind = { w: t.w, d: t.d, color: other };
  const size = SIZES.filter(([w, d]) => !((w === t.w && d === t.d) || (w === t.d && d === t.w)))[
    seed % 4
  ];
  const wrongSize: BrickKind = { w: size[0], d: size[1], color: t.color };
  const all = [right, wrongColor, wrongSize];
  const r = seed % 3;
  return [...all.slice(r), ...all.slice(0, r)];
}

/** How close (in studs, centre to centre) counts as "on the shadow". */
const PULL = 2.2;

function Steps({ api }: { api: PlayApi }) {
  const [mi, setMi] = useState(0);
  const [step, setStep] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [won, setWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const model = STEP_MODELS[mi];
  const target = model.steps[step] as Brick | undefined;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopVoice();
    },
    []
  );

  // Every step says what to look for: "Red block!"
  useEffect(() => {
    if (!target) return;
    const clip = COLORS[target.color].clip;
    const lines = step === 0 ? ["brick-steps-look"] : [];
    if (clip) lines.push(clip);
    const t = setTimeout(() => void playSequence(lines, 150), step === 0 ? 600 : 350);
    return () => clearTimeout(t);
  }, [mi, step, target]);

  // Three bricks to choose from: the right one, one the right size in the
  // wrong colour, one the right colour in the wrong size — so the child looks
  // at both colour and shape. Their order changes every step.
  const choices = useMemo(
    () => (target ? stepChoices(target, mi * 7 + step) : []),
    [target, mi, step]
  );
  const tray: BrickKind[] = won ? [] : choices;
  const answer = choices.findIndex((k) => isTarget(k, target));
  const hints = useMemo(() => (target ? [{ ...target, id: `hint-${target.id}` }] : []), [target]);

  const snap = useCallback(
    (
      k: BrickKind,
      free: Landing | null,
      _all: readonly Brick[],
      via: string
    ): SnapResult | null => {
      if (!target) return null;
      // The right brick lands exactly on its shadow (turned to fit); any other
      // brick is tried there with its own size, and `accept` sends it back.
      const fit = isTarget(k, target);
      const spot = {
        x: target.x,
        z: target.z,
        y: target.y,
        w: fit ? target.w : k.w,
        d: fit ? target.d : k.d,
      };
      if (via !== "drag") return { spot, ok: true };
      if (!free) return null;
      const dx = free.spot.x + free.spot.w / 2 - (target.x + target.w / 2);
      const dz = free.spot.z + free.spot.d / 2 - (target.z + target.d / 2);
      if (Math.hypot(dx, dz) <= PULL) return { spot, ok: true };
      return { spot: free.spot, ok: false };
    },
    [target]
  );

  const onPlaced = useCallback(() => {
    const last = step + 1 >= model.steps.length;
    if (!last) {
      setStep(step + 1);
      return;
    }
    setWon(true);
    playStarPop();
    void playSequence(["brick-steps-done", `brick-model-${model.id}`], 200);
    timer.current = setTimeout(() => {
      setWon(false);
      setBricks([]);
      setStep(0);
      if (mi + 1 >= STEP_MODELS.length) api.finish(STEP_MODELS[mi].steps, model.plate);
      else setMi(mi + 1);
    }, 3000);
  }, [api, mi, model, step]);

  return (
    <BrickBoard
      key={mi}
      plate={model.plate}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      editable={false}
      levels={6}
      snap={snap}
      onPlaced={onPlaced}
      accept={(b) => isTarget(b, target)}
      onRejected={() => {
        const clip = target ? COLORS[target.color].clip : null;
        void playSequence(clip ? ["brick-steps-shadow", clip] : ["brick-steps-shadow"], 150);
      }}
      hints={won ? undefined : hints}
      locked={won}
      handFrom={target && !won && answer >= 0 ? answer : undefined}
      plateColor="#8FC9EA"
    >
      <div
        className="bk-booklet"
        aria-label={`${model.name}, step ${step + 1} of ${model.steps.length}`}
      >
        <ModelView
          bricks={model.steps}
          plate={model.plate}
          size={150}
          levels={6}
          plateColor="#8FC9EA"
        />
        <div className="bk-booklet-steps" aria-hidden="true">
          {model.steps.map((s, i) => (
            <span
              key={s.id}
              className={`bk-pip bk-c--${s.color} ${i < step || won ? "bk-pip--on" : ""} ${
                i === step && !won ? "bk-pip--now" : ""
              }`}
            />
          ))}
        </div>
      </div>
      <RoundDots total={STEP_MODELS.length} at={mi} />
      {won && <RoundWin label={`You built the ${model.name}!`} />}
    </BrickBoard>
  );
}
