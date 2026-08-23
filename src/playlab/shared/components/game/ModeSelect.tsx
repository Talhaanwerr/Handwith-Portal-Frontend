"use client";

import { motion } from "framer-motion";
import { SceneDecor } from "@shared/components/animations/SceneDecor";
import type { PlayMode } from "@shared/types/game";

interface ModeSelectProps {
  onSelect: (mode: PlayMode) => void;
  /** Full-screen wash class for the host game (e.g. "bg-wash-lavender-sky"). */
  washClassName: string;
  /** Sub-label under each mode name — the only genuinely per-game copy. */
  freeSubtitle: string;
  starSubtitle: string;
  /** aria-label per card; the sub-labels alone are not descriptive enough. */
  freeAriaLabel: string;
  starAriaLabel: string;
  /** Card styling per game, so each keeps its own border colour/height. */
  freeCardClassName: string;
  starCardClassName: string;
  title?: string;
}

function StarIcon({ filled, size = 22 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 1.5l2.9 6.8 7.4.6-5.6 4.9 1.7 7.2L12 17.1l-6.4 3.9 1.7-7.2-5.6-4.9 7.4-.6L12 1.5z"
        fill={filled ? "#FFD93D" : "#E7DFFA"}
        stroke={filled ? "#F4A73E" : "#D8CDF2"}
        strokeWidth="1"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect
        x="16"
        y="4"
        width="12"
        height="26"
        rx="2.5"
        fill="#FFD93D"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1.5"
        transform="rotate(20 22 17)"
      />
      <path d="M14.5 31 L25 34.8 L17 40 Z" fill="#F0B27A" />
      <path d="M16.2 36.2 L19.4 37.4 L17 40 Z" fill="#4A4A4A" />
      <rect x="16" y="1" width="12" height="6" rx="3" fill="#FF9EBC" transform="rotate(20 22 4)" />
    </svg>
  );
}

/**
 * "How do you want to play?" — the Free / 5 Star picker.
 *
 * Letter Tracing owned this screen; Letter Hunt needs the identical flow, so
 * the screen itself moved here rather than being copied. Each game passes only
 * what genuinely differs (its wash, its card classes, its two sub-labels) and
 * therefore cannot drift out of step with the other.
 */
export function ModeSelect({
  onSelect,
  washClassName,
  freeSubtitle,
  starSubtitle,
  freeAriaLabel,
  starAriaLabel,
  freeCardClassName,
  starCardClassName,
  title = "How do you want to play?",
}: ModeSelectProps) {
  return (
    <div
      className={`${washClassName} relative flex h-full w-full flex-col items-center gap-6 overflow-x-hidden overflow-y-auto px-6 py-6`}
    >
      <SceneDecor variant="minimal" />

      <motion.h2
        className="font-rounded text-plum relative z-10 mt-auto text-center text-2xl font-black md:text-3xl"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <div className="relative z-10 mb-auto flex w-full max-w-lg flex-col gap-5 sm:flex-row sm:justify-center">
        {/* FREE MODE */}
        <motion.button
          onClick={() => onSelect("free")}
          className={`${freeCardClassName} flex flex-1 flex-col items-center gap-3 rounded-4xl bg-white/80 p-6 shadow-lg`}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          aria-label={freeAriaLabel}
        >
          <PencilIcon />
          <span className="font-rounded text-jade text-xl font-black">Free Mode</span>
          <span className="font-rounded text-jade/70 text-sm font-semibold">{freeSubtitle}</span>
        </motion.button>

        {/* 5 STAR MODE */}
        <motion.button
          onClick={() => onSelect("five-star")}
          className={`${starCardClassName} flex flex-1 flex-col items-center gap-3 rounded-4xl bg-white/80 p-6 shadow-lg`}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          aria-label={starAriaLabel}
        >
          <div className="flex gap-1">
            {[true, true, true, false, false].map((f, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.8, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
              >
                <StarIcon filled={f} />
              </motion.div>
            ))}
          </div>
          <span className="font-rounded text-plum text-xl font-black">5 Star Mode</span>
          <span className="font-rounded text-plum/60 text-sm font-semibold">{starSubtitle}</span>
        </motion.button>
      </div>
    </div>
  );
}
