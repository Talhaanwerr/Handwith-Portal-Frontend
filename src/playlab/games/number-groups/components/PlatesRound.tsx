"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { PlateArt } from "@games/sesame-activities/components/SesameArt";
import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import { NgStage } from "@games/number-groups/components/NgStage";
import { ParkWorld } from "@games/number-groups/components/NgWorlds";
import { sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import { PLATE_ROUNDS, plateAnswer, type Fruit } from "@games/number-groups/constants/rounds";
import type { RoundProps } from "@games/number-groups/components/roundProps";

const FRUIT_NAMES: Record<Fruit, [string, string]> = {
  apple: ["apple", "apples"],
  orange: ["orange", "oranges"],
  lemon: ["lemon", "lemons"],
  banana: ["banana", "bananas"],
  pineapple: ["pineapple", "pineapples"],
};

/** One piece of fruit — Letter Treats' drawing (its gradients come from the
 *  `CandyDefs` the game root mounts). */
function FruitArt({ fruit }: { fruit: Fruit }) {
  const Draw = VOCAB_ART[fruit];
  return Draw ? <Draw /> : null;
}

/**
 * COUNT THE PLATES — one round (TAP).
 *
 * A picnic table in the park with three plates of fruit on it, each a
 * different number. "Find the plate with 3!" — the right plate throws
 * confetti, wears its number and the number is said; a wrong plate shakes,
 * is crossed out and can't be tapped again, so every round ends in a find.
 */
export function PlatesRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = PLATE_ROUNDS[round];
  const answer = plateAnswer(r);
  const stageRef = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <FruitArt fruit={r.plates[answer].fruit} />
        </span>
      )),
    [r, answer]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  /** "Find the plate with three!" — said, and shown, from one clip. */
  const ask = `count-plate-${r.target}`;
  useSayOnEnter([ask]);

  const tap = useCallback(
    (i: number) => {
      if (isSolved()) return;
      const el = plateRefs.current[i];
      if (i === answer) {
        burst(el);
        sayNumber(r.target);
        finish(el);
        return;
      }
      playIncorrectSound();
      void playClip("mouse-count-again");
      setWrong((w) => (w.includes(i) ? w : [...w, i]));
      onMiss();
    },
    [answer, burst, finish, isSolved, onMiss, r.target]
  );

  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    plateRefs.current[i] = el;
  }, []);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="ng-play--plates"
      world={<ParkWorld />}
      round={round}
      solved={solved}
      say={say(clipText(ask))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={overlay}
    >
      <div className="ng-picnic">
        <div className="ng-table" aria-hidden="true">
          <span className="ng-table-top" />
          <span className="ng-table-cloth" />
          <span className="ng-table-leg ng-table-leg--l" />
          <span className="ng-table-leg ng-table-leg--r" />
        </div>
        <div className="ng-plates">
          {r.plates.map((p, i) => (
            <PlateButton
              key={`${round}-${i}`}
              index={i}
              fruit={p.fruit}
              count={p.count}
              wrong={wrong.includes(i)}
              found={solved && i === answer}
              live={!solved}
              onTap={tap}
              register={register}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

const PlateButton = memo(function PlateButton({
  index,
  fruit,
  count,
  wrong,
  found,
  live,
  onTap,
  register,
}: {
  index: number;
  fruit: Fruit;
  count: number;
  wrong: boolean;
  found: boolean;
  live: boolean;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);

  const can = live && !wrong;
  return (
    <button
      ref={(el) => {
        ref.current = el;
        register(index, el);
      }}
      type="button"
      className={`ng-plate ${wrong ? "is-wrong" : ""} ${found ? "is-found" : ""}`}
      disabled={!can}
      onClick={can ? () => onTap(index) : undefined}
      aria-label={`A plate with ${count} ${FRUIT_NAMES[fruit][count === 1 ? 0 : 1]}`}
    >
      <span className="ng-plate-dish">
        <PlateArt />
      </span>
      <span className="ng-pile" data-n={count}>
        {Array.from({ length: count }, (_, k) => (
          <motion.span
            key={k}
            className="ng-fruit"
            data-at={`${k + 1}-of-${count}`}
            initial={{ y: "-40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.12 + k * 0.06, duration: 0.3, ease: "easeOut" }}
          >
            <FruitArt fruit={fruit} />
          </motion.span>
        ))}
      </span>
      {found && (
        <motion.span
          className="ng-plate-count font-rounded font-black"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 15 }}
        >
          {count}
        </motion.span>
      )}
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
