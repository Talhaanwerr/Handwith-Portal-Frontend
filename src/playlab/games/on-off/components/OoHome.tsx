"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { stopVoice } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Teacher } from "@games/door-count/components/Teacher";
import { Picture } from "@games/blend-read/components/PictureArt";
import { Backdrop } from "@games/on-off/components/OoArt";
import type { Dir } from "@games/on-off/constants/scenes";

const ARROW: Record<Dir, string> = { on: "M8 8 Q30 4 30 30", off: "M10 10 Q32 8 32 32" };

/** A bedroom corner in miniature with the teddy going ON the bed (it waits
 *  up top, its silhouette on the mattress) or coming OFF it (it sits on the
 *  mattress, its silhouette on the floor). */
function Mini({ dir }: { dir: Dir }) {
  return (
    <span className={`oo-mini oo-mini--${dir}`} aria-hidden="true">
      <span className="oo-mini-bed">
        <Picture id="bed" />
      </span>
      <span className="oo-mini-shadow">
        <Picture id="toys" />
      </span>
      <span className="oo-mini-teddy">
        <Picture id="toys" />
      </span>
      <span className="oo-mini-arrow">
        <svg viewBox="0 0 40 40">
          <path
            d={ARROW[dir]}
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
          <path
            d="M23 26 L30 35 L37 26"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <em className={`oo-mini-word oo-word oo-word--${dir} font-rounded font-black`}>
        {dir.toUpperCase()}
      </em>
    </span>
  );
}

/**
 * THE TITLE SCREEN — the name on a plate in the playroom, the teacher in his
 * corner, and ONE big Play card: the game in miniature (the teddy going ON
 * the bed, and coming OFF it) so a child who can't read still knows what
 * waits, the best stars under it.
 */
export function OoHome({
  best,
  onPlay,
  onExitPortal,
}: {
  best: number;
  onPlay: () => void;
  onExitPortal: () => void;
}) {
  // "Let's play! Put things on, and take things off." — cut short by Play
  useSayOnEnter(["onoff-welcome"]);
  useEffect(() => () => stopVoice(), []);

  return (
    <div className="oo-screen">
      <Backdrop id="room" />

      <div className="oo-teacher-slot" aria-hidden="true">
        <Teacher cheer={false} />
      </div>
      <div className="oo-says oo-says--home font-rounded font-black" aria-hidden="true">
        Let&apos;s play!
      </div>

      <div className="oo-home-col">
        <motion.div
          className="oo-title-plate"
          initial={{ y: -22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 18 }}
        >
          <span className="oo-title-icon" aria-hidden="true">
            <Picture id="toys" />
          </span>
          <h1 className="oo-title font-rounded font-black">
            <span className="oo-title-on">On</span> &amp; <span className="oo-title-off">Off</span>
          </h1>
          <span className="oo-title-icon" aria-hidden="true">
            <Picture id="chair" />
          </span>
        </motion.div>

        <motion.button
          type="button"
          className="oo-play-card"
          onClick={() => {
            playClickSound();
            onPlay();
          }}
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 19 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Play: put things ON and take things OFF the bed, the tree, the table…"
        >
          <span className="oo-play-minis">
            <Mini dir="on" />
            <Mini dir="off" />
          </span>
          <span className="oo-play-name font-rounded font-black">Play</span>
          <span className="oo-play-stars">
            <StarRow earned={best} total={3} size={18} />
          </span>
          <span className="oo-play-go" aria-hidden="true">
            ▶
          </span>
        </motion.button>
      </div>

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
    </div>
  );
}
