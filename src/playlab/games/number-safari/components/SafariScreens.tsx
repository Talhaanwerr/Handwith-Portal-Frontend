"use client";

import { motion } from "framer-motion";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { Confetti } from "@shared/components/game/Confetti";
import { Burst } from "@shared/components/game/Burst";
import { Teacher } from "@games/door-count/components/Teacher";
import { playClickSound } from "@shared/audio/sfx";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Spark, Thing } from "@games/number-safari/components/SceneArt";
import {
  DIFFICULTY_NAMES,
  DIFFICULTY_RANGE,
  runLength,
  type Difficulty,
} from "@games/number-safari/constants/levels";

/* ── The way in ──────────────────────────────────────────────────────────── */

/** The five things the title screen counts, so the first thing a child sees is
 *  the thing the game asks them to do. */
const TITLE_ROW = [1, 2, 3, 4, 5] as const;

export function SplashScreen({
  onStart,
  onExitPortal,
}: {
  onStart: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-tap-play"]);
  return (
    <div className="ns-splash">
      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="jungle"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <motion.div
        className="ns-splash-head"
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="ns-title font-rounded font-black">Number Safari</h1>
        <p className="ns-subtitle font-rounded font-bold">
          Count the creatures, find the missing number
        </p>
      </motion.div>

      <div className="ns-splash-row" aria-hidden="true">
        {TITLE_ROW.map((n, i) => (
          <motion.div
            className="ns-splash-item"
            key={n}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.07, type: "spring", stiffness: 260, damping: 18 }}
          >
            <span className="ns-station-number ns-station-number--blue font-rounded font-black">
              {n}
            </span>
            <span className="ns-splash-thing">
              <Thing theme="ant" index={i} />
            </span>
          </motion.div>
        ))}
      </div>

      <div className="ns-splash-teacher">
        <Teacher cheer={false} say="Shall we count?" />
      </div>

      <motion.button
        type="button"
        className="ns-play font-rounded font-black"
        onClick={() => {
          playClickSound();
          onStart();
        }}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 240, damping: 18 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Play Number Safari"
      >
        <span className="ns-play-glyph" aria-hidden="true">
          ▶
        </span>
        Play
      </motion.button>
    </div>
  );
}

/* ── Choosing a run ──────────────────────────────────────────────────────── */

/**
 * Three runs, and the plate is an honest sample of each: easy counts to three
 * and shows you two numbers, medium is the full one-to-five, tricky starts the
 * line somewhere in the middle. A child cannot read "tricky", so the preview
 * has to carry the difference on its own.
 */
const OPTIONS: readonly Choice<Difficulty>[] = [
  {
    value: "easy",
    preview: DIFFICULTY_RANGE.easy,
    label: DIFFICULTY_NAMES.easy,
    aria: "Easy — counting from one to five",
    variant: "easy",
  },
  {
    value: "medium",
    preview: DIFFICULTY_RANGE.medium,
    label: DIFFICULTY_NAMES.medium,
    aria: "Medium — counting all the way to ten",
    variant: "medium",
  },
  {
    value: "hard",
    preview: DIFFICULTY_RANGE.hard,
    label: DIFFICULTY_NAMES.hard,
    aria: "Hard — counting in fives and tens, from ten to fifty",
    variant: "hard",
  },
];

export function DifficultyScreen({
  onPick,
  onBack,
}: {
  onPick: (d: Difficulty) => void;
  onBack: () => void;
}) {
  useSayOnEnter(["instr-safari-pick-level"]);
  return (
    <div className="ns-pick">
      <ChoiceScreen<Difficulty>
        title="Which safari?"
        subtitle="Pick how far you can count"
        tone="jungle"
        backAriaLabel="Back to the Number Safari title"
        onBack={onBack}
        onPick={onPick}
        options={OPTIONS}
      />
    </div>
  );
}

/* ── The end of a run ────────────────────────────────────────────────────── */

const SPARKS = [<Spark key="spark" />];

export function CompleteScreen({
  difficulty,
  stars,
  onAgain,
  onChoose,
  onExitPortal,
}: {
  difficulty: Difficulty;
  stars: number;
  onAgain: () => void;
  onChoose: () => void;
  onExitPortal: () => void;
}) {
  return (
    <div className="ns-done">
      <Confetti count={52} />
      <div className="ns-centre" aria-hidden="true">
        <Burst pieces={SPARKS} count={22} reach={[18, 50]} size="clamp(14px, 5cqh, 40px)" />
      </div>

      <motion.div
        className="ns-done-card"
        initial={{ scale: 0.82, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <h2 className="ns-done-title font-rounded font-black">Well done!</h2>
        <p className="ns-done-line font-rounded font-bold">
          {DIFFICULTY_NAMES[difficulty]} safari · {runLength(difficulty)} levels
        </p>

        <StarRow earned={stars} total={3} size={44} />

        <div className="ns-done-buttons">
          <button
            type="button"
            className="ns-done-btn ns-done-btn--go font-rounded font-black"
            onClick={() => {
              playClickSound();
              onAgain();
            }}
          >
            Play again
          </button>
          <button
            type="button"
            className="ns-done-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onChoose();
            }}
          >
            Another safari
          </button>
          <button
            type="button"
            className="ns-done-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onExitPortal();
            }}
          >
            Back to Games
          </button>
        </div>
      </motion.div>

      <div className="ns-done-teacher">
        <Teacher cheer say="Hooray!" />
      </div>
    </div>
  );
}
