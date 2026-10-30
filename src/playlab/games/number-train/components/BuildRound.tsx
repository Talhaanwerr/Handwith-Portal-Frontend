"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { playThudSound } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { NgStage } from "@games/number-groups/components/NgStage";
import { sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { BUILD_ROUNDS, buildYard } from "@games/number-train/constants/rounds";
import { Carriage, TrainWorld } from "@games/number-train/components/TrainArt";
import { Train, YardCar, useChugAway } from "@games/number-train/components/Train";
import { useTrainDrag } from "@games/number-train/hooks/useTrainDrag";

const ASK = "ntr-build";
const NEXT = "ntr-which-next";

/**
 * BUILD THE TRAIN — one round (ORDER). The engine waits on the track with
 * empty places; the carriages wait shuffled in the yard below. Drag them on
 * in order, 1 first: only the NEXT number clicks on (a later one bounces
 * home); a tap on the next one rolls it on by itself. Each says its number.
 * When the train is whole it chugs off to the right and the round is won.
 */
export function BuildRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const length = BUILD_ROUNDS[round];
  const yard = useMemo(() => buildYard(round), [round]);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [shakes, setShakes] = useState<Readonly<Record<number, number>>>({});
  const schedule = useScheduler();
  const { controls, trainRef, chug } = useChugAway(stageRef);
  const cast = useMemo(
    () =>
      [1, 2].map((n) => (
        <span key={n} className="ng-cast">
          <Carriage n={n} />
        </span>
      )),
    []
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const missed = useCallback(
    (value: number) => {
      onMiss();
      setNudge(true);
      setShakes((s) => ({ ...s, [value]: (s[value] ?? 0) + 1 }));
      void playClip(NEXT);
    },
    [onMiss]
  );
  const wrongTap = useCallback(
    (value: number) => {
      playThudSound();
      missed(value);
    },
    [missed]
  );

  const onPlaced = useCallback(
    (value: number, _slot: number, el: HTMLElement | undefined) => {
      burst(el);
      sayNumber(value);
      setCount(value);
      setNudge(false);
      if (value >= length) {
        setLeaving(true);
        schedule(() => chug(() => finish(boardRef.current)), 700);
      }
    },
    [burst, chug, finish, length, schedule]
  );

  const want = useMemo(
    () => (count < length ? { value: count + 1, slot: count } : null),
    [count, length]
  );
  const drag = useTrainDrag({
    stageRef,
    want,
    locked: leaving || solved,
    onMiss: missed,
    onWrongTap: wrongTap,
    onPlaced,
  });

  const cars = Array.from({ length }, (_, k) => drag.placed[k]);
  const piece = useCallback((v: number) => <Carriage n={v} />, []);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="ntr-play"
      world={<TrainWorld />}
      round={round}
      solved={solved}
      say={say(clipText(nudge ? NEXT : ASK))}
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
          lit={drag.over}
          controls={controls}
          register={drag.registerTarget}
        />
        <div className="ntr-yard">
          {yard.map((v) => (
            <YardCar
              key={v}
              value={v}
              away={drag.away(v)}
              locked={leaving || solved}
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
