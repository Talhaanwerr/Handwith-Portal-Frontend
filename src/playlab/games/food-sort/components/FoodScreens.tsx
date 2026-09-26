"use client";

import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { Confetti } from "@shared/components/game/Confetti";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import { playClickSound } from "@shared/audio/sfx";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Helper } from "@games/food-sort/components/Helper";
import { FoodPreview } from "@games/food-sort/components/FoodPreview";
import { MODULES, type ModuleId } from "@games/food-sort/constants/activities";

/* ── The way in ──────────────────────────────────────────────────────────── */

/** The home screen: the reference's rounded pink title card, the first
 *  table in miniature with the guide hand on it, and Play. Our own name
 *  only: the reference's credit line belongs to its makers, not this game. */
export function SplashScreen({
  onStart,
  onExitPortal,
}: {
  onStart: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-tap-play"]);
  return (
    <div className="sf-splash">
      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <div className="sf-home">
        {/* the reference's pink-and-purple title card, with the rule under it */}
        <motion.div
          className="sf-home-sign"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <h1 className="sf-title font-rounded font-black">Sorting Food</h1>
          <p className="sf-home-tag font-rounded font-bold">Put each food where its shadow is</p>
        </motion.div>

        {/* the first table, in miniature, with the hand showing the move */}
        <motion.div
          className="sf-home-stage"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
        >
          <FoodPreview />
        </motion.div>

        <motion.button
          type="button"
          className="sf-play-btn sf-home-play font-rounded font-black"
          onClick={() => {
            playClickSound();
            onStart();
          }}
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 240, damping: 17 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Play Sorting Food"
        >
          <span className="sf-play-glyph" aria-hidden="true">
            ▶
          </span>
          Play
        </motion.button>
      </div>
    </div>
  );
}

/* ── Choosing a module ───────────────────────────────────────────────────── */

/**
 * Four modules on the portal's shared picker. A plate shows the rule in one
 * look, and once a child has started a module it says how far they got —
 * "2 / 4" — so a returning child can see what is left.
 */
export function PickScreen({
  finished,
  onPick,
  onBack,
}: {
  finished: Partial<Record<ModuleId, number>>;
  onPick: (module: ModuleId) => void;
  onBack: () => void;
}) {
  useSayOnEnter(["instr-sort-pick"]);
  const options: readonly Choice<ModuleId>[] = MODULES.map((m) => {
    const done = Math.min(finished[m.id] ?? 0, m.activities.length);
    return {
      value: m.id,
      preview: m.preview,
      label: done > 0 ? `${m.label} · ${done} / ${m.activities.length}` : m.label,
      aria: m.aria,
      variant: m.id,
    };
  });
  return (
    <div className="sf-pick">
      <ChoiceScreen<ModuleId>
        title="What shall we sort?"
        subtitle="Four tables in each"
        tone="kitchen"
        backAriaLabel="Back to the Sorting Food title"
        onBack={onBack}
        onPick={onPick}
        options={options}
      />
    </div>
  );
}

/* ── The end ─────────────────────────────────────────────────────────────── */

/** Everything sorted. No stars — sorting cannot be failed, so a score would
 *  be a judgement the activity never makes (the same call Sort It makes). */
export function AllDone({
  label,
  tables,
  onAgain,
  onChoose,
  onExitPortal,
}: {
  /** The module just finished. */
  label: string;
  tables: number;
  onAgain: () => void;
  onChoose: () => void;
  onExitPortal: () => void;
}) {
  return (
    <div className="sf-done">
      <Confetti count={52} />

      <motion.div
        className="sf-done-card"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <h2 className="sf-done-title font-rounded font-black">All sorted!</h2>
        <p className="sf-done-line font-rounded font-bold">
          {label}: {tables} tables, every thing in its place
        </p>
        <div className="sf-done-buttons">
          <button
            type="button"
            className="sf-play-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onAgain();
            }}
          >
            Play again
          </button>
          <button
            type="button"
            className="sf-leave-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onChoose();
            }}
          >
            Another module
          </button>
          <button
            type="button"
            className="sf-leave-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onExitPortal();
            }}
          >
            Back to Games
          </button>
        </div>
      </motion.div>

      <div className="sf-done-helper">
        <Helper cheer />
      </div>
    </div>
  );
}
