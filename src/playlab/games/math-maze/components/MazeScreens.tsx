"use client";

import { motion } from "framer-motion";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { Confetti } from "@shared/components/game/Confetti";
import { playClickSound } from "@shared/audio/sfx";
import { MazeWorker } from "@games/math-maze/components/MazeWorker";
import { MazeTitle } from "@games/math-maze/components/MazeTitle";
import { MazePreview } from "@games/math-maze/components/MazePreview";
import type { LevelId, Maze } from "@games/math-maze/constants/mazes";

/* ── The way in ──────────────────────────────────────────────────────────── */

export function SplashScreen({
  onStart,
  onExitPortal,
}: {
  onStart: () => void;
  onExitPortal: () => void;
}) {
  return (
    <div className="mz-splash">
      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="builder"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <div className="mz-home">
        {/* the site notice board: hazard trim, bolts, the name and the rule */}
        <motion.div
          className="mz-home-sign ct-panel-paper"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <span className="mz-home-stripe" aria-hidden="true" />
          <span className="mz-home-bolt mz-home-bolt--l" aria-hidden="true" />
          <span className="mz-home-bolt mz-home-bolt--r" aria-hidden="true" />
          <MazeTitle from={1} to={10} big />
          <p className="mz-home-tag font-rounded font-bold">
            Tap the numbers in order to reach the prize
          </p>
        </motion.div>

        {/* the game in miniature, and the builder waving the child in */}
        <div className="mz-home-stage">
          <div className="mz-home-worker" aria-hidden="true">
            <MazeWorker mood="wave" />
          </div>
          <MazePreview />
        </div>

        <motion.button
          type="button"
          className="mz-play-btn mz-home-play font-rounded font-black"
          onClick={() => {
            playClickSound();
            onStart();
          }}
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 17 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play Math Maze"
        >
          <span className="mz-play-glyph" aria-hidden="true">
            ▶
          </span>
          Play
        </motion.button>
      </div>
    </div>
  );
}

/* ── Choosing a maze ─────────────────────────────────────────────────────── */

/** The plate shows the run itself — a child who cannot read "Tricky" can
 *  still see that the third one counts backwards. */
const OPTIONS: readonly Choice<LevelId>[] = [
  {
    value: "one-five",
    preview: "1 → 5",
    label: "Easy",
    aria: "Easy — count from one to five",
    variant: "easy",
  },
  {
    value: "one-ten",
    preview: "1 → 10",
    label: "Medium",
    aria: "Medium — count from one to ten",
    variant: "medium",
  },
  {
    value: "count-down",
    preview: "10 → 1",
    label: "Tricky",
    aria: "Tricky — count down from ten to one",
    variant: "hard",
  },
  {
    value: "twos",
    preview: "2 → 20",
    label: "Twos",
    aria: "Twos — count in twos from two to twenty",
    variant: "twos",
  },
];

export function PickScreen({
  onPick,
  onBack,
}: {
  onPick: (level: LevelId) => void;
  onBack: () => void;
}) {
  return (
    <div className="mz-pick">
      <ChoiceScreen<LevelId>
        title="Which maze?"
        subtitle="Follow the numbers to the prize"
        tone="builder"
        backAriaLabel="Back to the Math Maze title"
        onBack={onBack}
        onPick={onPick}
        options={OPTIONS}
      />
    </div>
  );
}

/* ── The prize ───────────────────────────────────────────────────────────── */

export function DoneScreen({
  maze,
  stars,
  next,
  onNext,
  onAgain,
  onChoose,
  onExitPortal,
}: {
  maze: Maze;
  stars: number;
  /** The next maze up, or null after the last one. */
  next: LevelId | null;
  onNext: () => void;
  onAgain: () => void;
  onChoose: () => void;
  onExitPortal: () => void;
}) {
  return (
    <div className="mz-done">
      <Confetti count={48} />

      <motion.div
        className="mz-done-card"
        initial={{ scale: 0.84, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <h2 className="mz-done-title font-rounded font-black">You reached the prize!</h2>
        <MazeTitle from={maze.from} to={maze.to} />
        <StarRow earned={stars} total={3} size={44} />

        <div className="mz-done-buttons">
          <button
            type="button"
            className="mz-done-btn mz-done-btn--go font-rounded font-black"
            onClick={() => {
              playClickSound();
              if (next) onNext();
              else onAgain();
            }}
          >
            {next ? "Next maze" : "Play again"}
          </button>
          <button
            type="button"
            className="mz-done-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onChoose();
            }}
          >
            Choose a maze
          </button>
          <button
            type="button"
            className="mz-done-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onExitPortal();
            }}
          >
            Back to Games
          </button>
        </div>
      </motion.div>

      <div className="mz-done-worker" aria-hidden="true">
        <MazeWorker mood="cheer" />
      </div>
    </div>
  );
}
