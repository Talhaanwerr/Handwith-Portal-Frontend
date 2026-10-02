"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound, playCorrectSound, playStarPop, playThudSound } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { Picture } from "@games/blend-read/components/PictureArt";
import {
  BoArt,
  CrossMark,
  PlateArt,
  RubyArt,
  WindowArt,
} from "@games/sesame-activities/components/SesameArt";
import { CheerPop, SceneHud, type RoundProps } from "@games/sesame-activities/components/SceneHud";
import {
  PAL_NAMES,
  SNACK_ROUNDS,
  snackAnswer,
  snackClip,
  snackWrongClip,
  snackYumClip,
} from "@games/sesame-activities/constants/content";

const ADVANCE_MS = 1500;
const FLY_MS = 620;
const SPARK = [<span key="s" className="sa-spark" />];

/**
 * The food's trip into the pal's mouth is a transform, measured in the
 * food's own width. Positions are in set units (1 = 1% of the set's width):
 * sideways, four plates in a row under a centred pal; upright, a 2×2 grid
 * under a bigger pal. Must match the stylesheet.
 */
const LAND = {
  plateX: [26, 42, 58, 74],
  foodY: 22.2,
  foodW: 9,
  mouth: { x: 50, y: 28.8 },
};
const PORT = {
  food: [
    { x: 29, y: 80.1 },
    { x: 71, y: 80.1 },
    { x: 29, y: 54.1 },
    { x: 71, y: 54.1 },
  ],
  foodW: 19,
  mouth: { x: 43, y: 110 },
};

function flight(i: number) {
  const p = PORT.food[i];
  return cssVars({
    "--sa-fx": `${((LAND.mouth.x - LAND.plateX[i]) / LAND.foodW) * 100}%`,
    "--sa-fy": `${((LAND.foodY - LAND.mouth.y) / LAND.foodW) * 100}%`,
    "--sa-pfx": `${((PORT.mouth.x - p.x) / PORT.foodW) * 100}%`,
    "--sa-pfy": `${((p.y - PORT.mouth.y) / PORT.foodW) * 100}%`,
  });
}

/**
 * Snack Time — the dining room. One hungry pal (Ruby and Bo take turns)
 * thinks of a food; four plates sit on the table. Tap the matching plate and
 * the food flies into their mouth. A wrong plate is crossed out and can't be
 * tapped again. Six rounds, same layout, new food each round.
 */
export function SnackScene({ round, onMiss, onNext }: RoundProps) {
  const [cheerRound, setCheerRound] = useState<number | null>(null);
  const solved = cheerRound === round;
  const r = SNACK_ROUNDS[round];
  // the pal thanks you — said AND shown in place of a generic cheer
  const cheer = clipText(snackYumClip(r)) || "Yum!";

  return (
    <div className="sa-world sa-world--dining">
      <div className="sa-ground sa-ground--tiles" aria-hidden="true" />

      <SceneHud text={solved ? cheer : clipText(snackClip(r))} done={round + (solved ? 1 : 0)} />

      <SnackBoard
        key={round}
        round={round}
        cheer={cheer}
        onMiss={onMiss}
        onNext={onNext}
        onSolved={() => setCheerRound(round)}
      />
    </div>
  );
}

function SnackBoard({
  round,
  cheer,
  onMiss,
  onNext,
  onSolved,
}: RoundProps & { cheer: string; onSolved: () => void }) {
  const schedule = useScheduler();
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [flying, setFlying] = useState(false);
  const [eaten, setEaten] = useState(false);
  const [shake, setShake] = useState<number | null>(null);
  const r = SNACK_ROUNDS[round];
  const answer = snackAnswer(r);

  // "Ruby is hungry! Ruby wants an apple." — queued after the card's line
  useSayOnEnter([snackClip(r)]);

  const handleTap = useCallback(
    (i: number) => {
      if (flying || eaten || wrong.has(i)) return;
      if (i === answer) {
        playClickSound();
        setFlying(true);
        schedule(() => {
          playStarPop();
          playCorrectSound();
          void playClip(snackYumClip(r));
          setEaten(true);
          onSolved();
          schedule(onNext, ADVANCE_MS);
        }, FLY_MS);
      } else {
        playThudSound();
        // "Not that one. What does Ruby want?" — re-asks in one line
        void playClip(snackWrongClip(r));
        setWrong((prev) => new Set(prev).add(i));
        setShake(i);
        schedule(() => setShake(null), 420);
        onMiss();
      }
    },
    [answer, eaten, flying, onMiss, onNext, onSolved, r, schedule, wrong]
  );

  return (
    <div className="sa-set">
      <div className="sa-dining-window" aria-hidden="true">
        <WindowArt />
      </div>

      <div className={`sa-diner ${eaten ? "sa-hop" : ""}`} aria-hidden="true">
        {r.who === "ruby" ? (
          <RubyArt mood={eaten ? "happy" : "idle"} />
        ) : (
          <BoArt mood={eaten ? "happy" : "idle"} />
        )}
      </div>

      {/* the thought bubble: what the pal wants */}
      {!eaten && (
        <motion.div
          className="sa-bubble sa-bubble--snack"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          role="img"
          aria-label={`${PAL_NAMES[r.who]} wants the ${r.food}`}
        >
          <span className="sa-bubble-food">
            <Picture id={r.food} />
          </span>
        </motion.div>
      )}

      <div className="sa-dining-table" aria-hidden="true">
        <span className="sa-dining-top" />
        <span className="sa-dining-cloth" />
        <span className="sa-dining-leg sa-dining-leg--l" />
        <span className="sa-dining-leg sa-dining-leg--r" />
      </div>

      {r.plates.map((food, i) => {
        const isAnswer = i === answer;
        return (
          <button
            key={food}
            className={`sa-plate sa-plate--${i} ${shake === i ? "sa-shake" : ""} ${
              wrong.has(i) ? "sa-plate--out" : ""
            }`}
            style={cssVars({ "--sa-x": `${LAND.plateX[i] - 6}%` })}
            onClick={() => handleTap(i)}
            disabled={wrong.has(i)}
            aria-label={isAnswer && eaten ? "Empty plate" : food}
          >
            <span className="sa-plate-dish">
              <PlateArt />
            </span>
            {!(isAnswer && eaten) && (
              <span
                className={`sa-plate-food ${isAnswer && flying ? "sa-plate-food--fly" : ""}`}
                style={isAnswer ? flight(i) : undefined}
              >
                <Picture id={food} />
              </span>
            )}
            {wrong.has(i) && (
              <span className="sa-cross">
                <CrossMark />
              </span>
            )}
          </button>
        );
      })}

      {eaten && (
        <span className="sa-mouth-burst" aria-hidden="true">
          <Burst pieces={SPARK} count={14} />
        </span>
      )}

      {eaten && <CheerPop text={cheer} />}
    </div>
  );
}
