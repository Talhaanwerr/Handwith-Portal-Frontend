"use client";

import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { Confetti } from "@shared/components/game/Confetti";
import { SiteScene } from "@games/cvc-match/components/SiteScene";
import { playClickSound } from "@shared/audio/sfx";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import { MODULES } from "@games/cvc-match/constants/words";

/* ── The way in ──────────────────────────────────────────────────────────── */

export function SplashScreen({
  onStart,
  onExitPortal,
}: {
  onStart: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-tap-play"]);
  return (
    <div className="cv-splash ct-world">
      <SiteScene />

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

      <motion.div
        className="cv-splash-head"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="cv-title font-rounded font-black">Word Site</h1>
        <p className="cv-subtitle font-rounded font-bold">Build the words, one picture at a time</p>
      </motion.div>

      <motion.button
        type="button"
        className="cv-play font-rounded font-black"
        onClick={() => {
          playClickSound();
          onStart();
        }}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 18 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Play Word Site"
      >
        <span className="cv-play-glyph" aria-hidden="true">
          ▶
        </span>
        Play
      </motion.button>
    </div>
  );
}

/* ── Choosing a sound ────────────────────────────────────────────────────── */

/** One plate per short vowel. The plate shows the letter itself, because the
 *  letter IS what the module practises and a child who knows the sound can
 *  pick their own module without being read to. */
const MODULE_OPTIONS: readonly Choice<string>[] = MODULES.map((m) => ({
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
  onPick: (moduleId: string) => void;
  onBack: () => void;
}) {
  useSayOnEnter(["instr-site-pick-vowel"]);
  return (
    <div className="cv-pick ct-world">
      <SiteScene />
      <ChoiceScreen<string>
        title="Which sound?"
        subtitle="Every sound has its own set of words"
        tone="builder"
        backAriaLabel="Back to the Word Site title"
        onBack={onBack}
        onPick={onPick}
        options={MODULE_OPTIONS}
      />
    </div>
  );
}

/* ── Between boards ──────────────────────────────────────────────────────── */

/**
 * The board goes dark and one panel is left lit — the reference's strongest
 * beat, and the reason it is worth keeping the rest of the game so quiet.
 * Three stars for a clean board, and a Next that loads the next four words in
 * place rather than reloading anything.
 */
export function RoundDone({
  stars,
  last,
  onNext,
}: {
  stars: number;
  last: boolean;
  onNext: () => void;
}) {
  return (
    <motion.div
      className="cv-modal-wash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti count={40} />
      <motion.div
        className="cv-modal"
        initial={{ scale: 0.8, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        role="dialog"
        aria-label="Board finished"
      >
        <h2 className="cv-modal-title font-rounded font-black">Well done!</h2>
        <StarRow earned={stars} total={3} size={46} />
        <button
          type="button"
          className="cv-next font-rounded font-black"
          onClick={() => {
            playClickSound();
            onNext();
          }}
        >
          <span aria-hidden="true">➜</span> {last ? "Finish" : "Next"}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── The end of the set ──────────────────────────────────────────────────── */

export function AllDone({
  totalStars,
  onAgain,
  onExitPortal,
}: {
  totalStars: number;
  onAgain: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-site-built"]);
  return (
    <div className="cv-done ct-world">
      <SiteScene cheer />

      <Confetti count={54} />

      <motion.div
        className="cv-modal"
        initial={{ scale: 0.84, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <h2 className="cv-modal-title font-rounded font-black">The house is built!</h2>
        <p className="cv-modal-line font-rounded font-bold">{totalStars} stars earned</p>
        <div className="cv-done-buttons">
          <button
            type="button"
            className="cv-next font-rounded font-black"
            onClick={() => {
              playClickSound();
              onAgain();
            }}
          >
            Play again
          </button>
          <button
            type="button"
            className="cv-exit ct-pill font-rounded font-black"
            onClick={() => {
              playClickSound();
              onExitPortal();
            }}
          >
            Back to Games
          </button>
        </div>
      </motion.div>
    </div>
  );
}
