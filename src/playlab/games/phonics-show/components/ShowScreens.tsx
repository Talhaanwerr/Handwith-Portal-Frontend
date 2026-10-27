"use client";

import { motion } from "framer-motion";
import { Teacher } from "@games/door-count/components/Teacher";
import { FinaleRain, useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";
import { LitSign, ShowPicture, ShowStage } from "@games/phonics-show/components/ShowStage";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { clipText } from "@shared/audio/voice";
import { playClickSound } from "@shared/audio/sfx";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";

/**
 * The two screens every show on this stage shares — Phonics Game Show and
 * Sound Show pass their own title, level and showcase; the studio, the lit
 * sign, the host and the finish card are the same.
 */

/** One picture on the title screen, with the letter it starts with under it. */
export interface Showcase {
  word: string;
  letter: string;
}

/* ── The way in ──────────────────────────────────────────────────────────── */

export function ShowSplash({
  title,
  level,
  showcase,
  best,
  total,
  onStart,
  onExitPortal,
}: {
  title: string;
  level: string;
  showcase: readonly Showcase[];
  best: number;
  total: number;
  onStart: () => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(["instr-tap-play"]);
  return (
    <div className="pgs-splash">
      <ShowStage />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="plum"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <motion.div
        className="pgs-splash-head"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <LitSign className="pgs-sign--title">
          <h1 className="pgs-title font-rounded font-black">{title}</h1>
          <p className="pgs-level font-rounded font-black">{level}</p>
        </LitSign>
      </motion.div>

      <div className="pgs-splash-row" aria-hidden="true">
        {showcase.map((s, i) => (
          <motion.div
            className="pgs-splash-card"
            key={s.word}
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.09, type: "spring", stiffness: 230, damping: 17 }}
          >
            <span className="pgs-splash-pic">
              <ShowPicture word={s.word} />
            </span>
            <span className="pgs-splash-letter font-rounded font-black">{s.letter}</span>
          </motion.div>
        ))}
      </div>

      {best > 0 && (
        <p className="pgs-best font-rounded font-black">
          Best so far: {best} / {total}
        </p>
      )}

      <motion.button
        type="button"
        className="pgs-play font-rounded font-black"
        onClick={() => {
          playClickSound();
          onStart();
        }}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.34, type: "spring", stiffness: 240, damping: 17 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Play ${title}`}
      >
        <span className="pgs-play-glyph" aria-hidden="true">
          ▶
        </span>
        Play
      </motion.button>

      {/* the host: Key Quest's teacher, on the title screen only */}
      <div className="pgs-host">
        <Teacher cheer={false} say={clipText("instr-tap-play")} />
      </div>
    </div>
  );
}

/* ── The finish ──────────────────────────────────────────────────────────── */

export function ShowDone({
  rain,
  firstTry,
  total,
  stars,
  onAgain,
  onExitPortal,
}: {
  /** Words whose pictures rain down at the end. */
  rain: readonly string[];
  firstTry: number;
  total: number;
  stars: number;
  onAgain: () => void;
  onExitPortal: () => void;
}) {
  // "You know your first sounds!", then the celebration sound
  useFinaleCheer("brick-sound-all");
  const cast = rain.map((word) => (
    <span className="jf-cast" key={word}>
      <ShowPicture word={word} />
    </span>
  ));
  return (
    <div className="pgs-done">
      <ShowStage />
      <FinaleRain cast={cast} />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="plum"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <motion.div
        className="pgs-done-card"
        initial={{ scale: 0.82, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <h2 className="pgs-done-title font-rounded font-black">{clipText("brick-sound-all")}</h2>
        <p className="pgs-done-line font-rounded font-bold">
          {firstTry} of {total} right first time
        </p>

        <StarRow earned={stars} total={3} size={44} />

        <div className="pgs-done-buttons">
          <button
            type="button"
            className="pgs-done-btn pgs-done-btn--go font-rounded font-black"
            onClick={() => {
              playClickSound();
              onAgain();
            }}
          >
            Play again
          </button>
          <button
            type="button"
            className="pgs-done-btn font-rounded font-black"
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
