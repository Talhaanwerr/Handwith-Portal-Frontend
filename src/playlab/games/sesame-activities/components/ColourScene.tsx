"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FloatingClouds } from "@shared/components/animations/FloatingClouds";
import { Burst } from "@shared/components/game/Burst";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { playClickSound, playCorrectSound, playThudSound } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import {
  BirdArt,
  CrossMark,
  GlossyBall,
  GrassLedgeArt,
  PerchTreeArt,
} from "@games/sesame-activities/components/SesameArt";
import { CheerPop, SceneHud, type RoundProps } from "@games/sesame-activities/components/SceneHud";
import {
  COLOUR_ROUNDS,
  TRY_AGAIN_CLIP,
  ballClip,
  colourAnswer,
  colourClip,
} from "@games/sesame-activities/constants/content";

/** How long the burst + cheer stay up before the next round. */
const ADVANCE_MS = 1300;
const SPARK = [<span key="s" className="sa-spark" />];

/**
 * Colour Match — the park. Percy sits on a branch holding up a ball in his
 * speech bubble; four glossy balls wait on a grassy ledge. Tap the ball of
 * the same colour. A wrong ball is crossed out and can't be tapped again.
 * Six rounds, same layout, a new colour each round.
 */
export function ColourScene({ round, onMiss, onNext }: RoundProps) {
  const [cheerRound, setCheerRound] = useState<number | null>(null);
  const solved = cheerRound === round;
  const cheer = clipText(cheerFor(round)) || "Great job!";

  return (
    <div className="sa-world sa-world--park">
      <span className="sa-sun" aria-hidden="true" />
      <FloatingClouds />
      <div className="sa-hills" aria-hidden="true" />
      <div className="sa-ground sa-ground--grass" aria-hidden="true" />

      <SceneHud
        text={solved ? cheer : clipText(colourClip(COLOUR_ROUNDS[round]))}
        done={round + (solved ? 1 : 0)}
      />

      <ColourBoard
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

function ColourBoard({
  round,
  cheer,
  onMiss,
  onNext,
  onSolved,
}: RoundProps & { cheer: string; onSolved: () => void }) {
  const schedule = useScheduler();
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const r = COLOUR_ROUNDS[round];
  const answer = colourAnswer(r);

  // "Percy has a red ball. Find the red ball!" — queued after the card's line
  useSayOnEnter([colourClip(r)]);

  const handleTap = useCallback(
    (i: number) => {
      if (solved || wrong.has(i)) return;
      if (i === answer) {
        playClickSound();
        playCorrectSound();
        void playClip(cheerFor(round));
        setSolved(true);
        onSolved();
        schedule(onNext, ADVANCE_MS);
      } else {
        playThudSound();
        // "That one is blue." then "Try again!"
        void playClip(ballClip(r.balls[i]));
        void sayAfter(TRY_AGAIN_CLIP);
        setWrong((prev) => new Set(prev).add(i));
        onMiss();
      }
    },
    [answer, onMiss, onNext, onSolved, r, round, schedule, solved, wrong]
  );

  return (
    <div className="sa-set">
      <div className="sa-perch-tree" aria-hidden="true">
        <PerchTreeArt />
      </div>
      <div className={`sa-percy ${solved ? "sa-hop" : ""}`} aria-hidden="true">
        <BirdArt happy={solved} />
      </div>

      {/* what Percy is holding up — the colour to match */}
      <div className="sa-bubble sa-bubble--percy">
        <motion.div
          className="sa-bubble-ball"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          role="img"
          aria-label={`Percy's ${r.target} ball`}
        >
          <GlossyBall colorKey={r.target} />
        </motion.div>
      </div>

      {/* the back ledge only shows upright, where the balls stand 2×2 */}
      <div className="sa-ledge sa-ledge--back" aria-hidden="true">
        <GrassLedgeArt />
      </div>
      <div className="sa-ledge" aria-hidden="true">
        <GrassLedgeArt />
      </div>
      <div className="sa-balls">
        {r.balls.map((colorKey, i) => (
          <motion.button
            key={colorKey}
            className={`sa-ball ${wrong.has(i) ? "sa-ball--out" : ""} ${
              solved && i === answer ? "sa-ball--win" : ""
            }`}
            onClick={() => handleTap(i)}
            disabled={wrong.has(i)}
            aria-label={`${colorKey} ball`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.05 }}
          >
            <span className="sa-ball-art">
              <GlossyBall colorKey={colorKey} />
            </span>
            {wrong.has(i) && (
              <span className="sa-cross">
                <CrossMark />
              </span>
            )}
            {solved && i === answer && <Burst pieces={SPARK} count={18} />}
          </motion.button>
        ))}
      </div>

      {solved && <CheerPop text={cheer} />}
    </div>
  );
}
