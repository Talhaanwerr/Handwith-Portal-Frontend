"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { playIncorrectSound } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { NgStage } from "@games/number-groups/components/NgStage";
import { sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { MISSING_ROUNDS, trainOf } from "@games/number-train/constants/rounds";
import { Carriage, TrainWorld } from "@games/number-train/components/TrainArt";
import { Train, YardCar, useChugAway } from "@games/number-train/components/Train";
import { useTrainDrag } from "@games/number-train/hooks/useTrainDrag";

const ASK = "ntr-missing";
const WRONG = "ntr-missing-wrong";

/**
 * MISSING CARRIAGE — one round (FILL THE GAP). A whole train stands on the
 * track with one carriage missing. Three carriages wait below: tap (or drag)
 * the missing number. A wrong one shakes and is crossed out; the right one
 * rolls into the gap, says its number, and the train chugs away.
 */
export function MissingRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = MISSING_ROUNDS[round];
  const gap = r.missing - 1;
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [shakes, setShakes] = useState<Readonly<Record<number, number>>>({});
  const [leaving, setLeaving] = useState(false);
  const schedule = useScheduler();
  const { controls, trainRef, chug } = useChugAway(stageRef);
  const cast = useMemo(
    () =>
      [r.missing, r.missing === 1 ? 2 : 1].map((n) => (
        <span key={n} className="ng-cast">
          <Carriage n={n} />
        </span>
      )),
    [r.missing]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: ROUND_COUNT + round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const missed = useCallback(
    (value: number) => {
      playIncorrectSound();
      void playClip(WRONG);
      setWrong((w) => (w.includes(value) ? w : [...w, value]));
      setShakes((s) => ({ ...s, [value]: (s[value] ?? 0) + 1 }));
      onMiss();
    },
    [onMiss]
  );

  const onPlaced = useCallback(
    (value: number, _slot: number, el: HTMLElement | undefined) => {
      burst(el);
      sayNumber(value);
      setLeaving(true);
      schedule(() => chug(() => finish(boardRef.current)), 800);
    },
    [burst, chug, finish, schedule]
  );

  const want = useMemo(() => (leaving ? null : { value: r.missing, slot: gap }), [gap, leaving, r]);
  const drag = useTrainDrag({
    stageRef,
    want,
    locked: leaving || solved,
    onMiss: missed,
    onWrongTap: missed,
    onPlaced,
  });

  const { registerTarget } = drag;
  const registerGap = useCallback(
    (k: number, el: HTMLElement | null) => {
      if (k === gap) registerTarget(k, el);
    },
    [gap, registerTarget]
  );

  const cars = trainOf(r.length).map((n, k) => (k === gap ? drag.placed[k] : n));
  const piece = useCallback((v: number) => <Carriage n={v} />, []);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="ntr-play"
      world={<TrainWorld />}
      round={round}
      solved={solved}
      say={say(clipText(wrong.length > 0 && !leaving ? WRONG : ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(piece)}
        </>
      }
    >
      <div ref={boardRef} className="ntr-board">
        <Train
          ref={trainRef}
          cars={cars}
          gap={gap}
          lit={drag.over}
          controls={controls}
          register={registerGap}
        />
        <div className="ntr-yard ntr-yard--choices">
          {r.choices.map((v) => (
            <YardCar
              key={v}
              value={v}
              away={drag.away(v)}
              locked={leaving || solved}
              wrong={wrong.includes(v)}
              shakeKey={shakes[v] ?? 0}
              onPick={drag.pickUp}
              register={drag.registerHome}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}
