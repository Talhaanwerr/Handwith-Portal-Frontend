"use client";

import { motion } from "framer-motion";
import { Picture } from "@games/blend-read/components/PictureArt";
import { BigSmallPal } from "@games/sort-it/components/BigSmallPal";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { Confetti } from "@shared/components/game/Confetti";
import { FloatingClouds } from "@shared/components/animations/FloatingClouds";
import { playClickSound } from "@shared/audio/sfx";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import { MODULES, TOTAL_ACTIVITIES, type Rule } from "@games/sort-it/constants/activities";

/**
 * The way in. The title screen shows the game itself — two boards with a thing
 * in each — because the whole activity is understood by looking at it, and a
 * paragraph explaining sorting would be read by nobody it is for.
 */
export function SplashScreen({
  onStart,
  onExitPortal,
}: {
  onStart: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-tap-play"]);
  return (
    <div className="so-splash">
      <FloatingClouds />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <motion.div
        className="so-splash-head"
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="so-title font-rounded font-black">Sort It</h1>
        <p className="so-subtitle font-rounded font-bold">Put each thing where it belongs</p>
      </motion.div>

      {/* The game in one picture: two labelled boards, the pal between them,
          and a thing actually hopping from the pile into the board it belongs
          in — on a loop. A child sees the whole mechanic before pressing
          anything, which is the only instruction this game ever gives. */}
      <div className="so-splash-show">
        <div className="so-splash-board so-splash-board--big">
          <span className="so-splash-tag font-rounded font-black">BIG</span>
          <span className="so-item so-item--big">
            <Picture id="apple" />
          </span>
        </div>

        <div className="so-splash-pal" aria-hidden="true">
          <BigSmallPal cheer={false} />
        </div>

        <div className="so-splash-board so-splash-board--small">
          <span className="so-splash-tag font-rounded font-black">SMALL</span>
          <span className="so-item">
            <Picture id="apple" />
          </span>
        </div>

        {/* the travelling thing — two keyframes per property, so the arc is a
            tween and never a spring */}
        <motion.span
          className="so-splash-fly"
          animate={{ x: ["0%", "-140%", "-140%"], y: ["0%", "-120%", "-120%"], opacity: [1, 1, 0] }}
          transition={{ duration: 2.6, times: [0, 0.6, 1], repeat: Infinity, repeatDelay: 0.9 }}
          aria-hidden="true"
        >
          {/* the same apple as the boards: the demo shows the rule (big goes
              to BIG), so the flying thing must be one of the things sorted */}
          <span className="so-item so-item--big">
            <Picture id="apple" />
          </span>
        </motion.span>
      </div>

      <motion.button
        type="button"
        className="so-play-btn font-rounded font-black"
        onClick={() => {
          playClickSound();
          onStart();
        }}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.22, type: "spring", stiffness: 240, damping: 18 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Play Sort It"
      >
        <span className="so-play-glyph" aria-hidden="true">
          ▶
        </span>
        Play
      </motion.button>
    </div>
  );
}

/* ── Choosing a rule ─────────────────────────────────────────────────────── */

/** One plate per rule. Each preview is the rule itself in two marks, because a
 *  child who cannot read "Where it lives" can still see two things that differ
 *  the way the boards will. */
const MODULE_OPTIONS: readonly Choice<Rule>[] = MODULES.map((m) => ({
  value: m.id,
  preview: m.preview,
  label: m.label,
  aria: m.aria,
  variant: m.id,
}));

export function ModuleScreen({
  onPick,
  onBack,
}: {
  onPick: (rule: Rule) => void;
  onBack: () => void;
}) {
  useSayOnEnter(["instr-sort-pick"]);
  return (
    <div className="so-pick">
      <ChoiceScreen<Rule>
        title="What shall we sort?"
        subtitle="Four boards of each"
        tone="ocean"
        backAriaLabel="Back to the Sort It title"
        onBack={onBack}
        onPick={onPick}
        options={MODULE_OPTIONS}
      />
      <div className="so-splash-pal" aria-hidden="true">
        <BigSmallPal cheer={false} />
      </div>
    </div>
  );
}

/** The end of the set: everything sorted, the shared confetti, and the two
 *  ways on. No stars here — a sorting round cannot be failed, so a score would
 *  be inventing a judgement the activity never makes. */
export function AllDone({
  onAgain,
  onExitPortal,
}: {
  onAgain: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-sort-done"]);
  return (
    <div className="so-done">
      <Confetti count={54} />

      <motion.div
        className="so-done-card"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <h2 className="so-done-title font-rounded font-black">All sorted!</h2>
        <p className="so-done-line font-rounded font-bold">
          {TOTAL_ACTIVITIES} boards, every thing in its place
        </p>
        <div className="so-done-buttons">
          <button
            type="button"
            className="so-play-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onAgain();
            }}
          >
            Play again
          </button>
          <button
            type="button"
            className="so-leave-btn font-rounded font-black"
            onClick={() => {
              playClickSound();
              onExitPortal();
            }}
          >
            Back to Games
          </button>
        </div>
      </motion.div>

      <div className="so-splash-pal" aria-hidden="true">
        <BigSmallPal cheer />
      </div>
    </div>
  );
}
