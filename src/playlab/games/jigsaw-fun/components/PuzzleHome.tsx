"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { NavPillButton, type NavTone } from "@shared/components/ui/NavPillButton";
import { StarRow } from "@shared/components/ui/StarRow";
import { playClickSound } from "@shared/audio/sfx";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { bestOf } from "@games/jigsaw-fun/store/puzzleStore";

/** One picture on the picker: its drawing, name and colour. */
export interface PuzzleCard<M extends string> {
  id: M;
  name: string;
  accent: string;
  art: ReactNode;
  aria: string;
}

/**
 * THE PICKER — a puzzle game's home (Jigsaw Fun, Tangram Town). One card per
 * picture, each showing the puzzle and the best stars earned on it at any
 * level; a child picks a picture, not a word, and then how hard. The game's
 * world stands behind with room for its wall decorations. Classes carry the
 * game's `prefix`.
 */
export function PuzzleHome<M extends string>({
  prefix,
  title,
  subtitle,
  tone,
  world,
  cards,
  best,
  welcome,
  onPick,
  onExitPortal,
}: {
  prefix: string;
  title: string;
  subtitle: string;
  tone: NavTone;
  world: ReactNode;
  cards: readonly PuzzleCard<M>[];
  best: Partial<Record<string, number>>;
  /** The clip said when the pictures appear. */
  welcome?: string;
  onPick: (m: M) => void;
  onExitPortal: () => void;
}) {
  useSayOnEnter(welcome ? [welcome] : []);
  return (
    <div className={`${prefix}-screen ${prefix}-home`}>
      {world}

      <div className={`${prefix}-home-col`}>
        <motion.div
          className={`${prefix}-title-plate`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 18 }}
        >
          <h1 className={`${prefix}-title font-rounded font-black`}>{title}</h1>
          <p className={`${prefix}-subtitle font-rounded font-bold`}>{subtitle}</p>
        </motion.div>

        <div className={`${prefix}-cards`}>
          {cards.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              className={`${prefix}-card`}
              style={{ [`--${prefix}-accent`]: c.accent } as CSSProperties}
              onClick={() => {
                playClickSound();
                onPick(c.id);
              }}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 + i * 0.05, type: "spring", stiffness: 230, damping: 20 }}
              whileTap={{ scale: 0.95 }}
              aria-label={c.aria}
            >
              <span className={`${prefix}-card-pic`}>{c.art}</span>
              <span className={`${prefix}-card-name font-rounded font-black`}>{c.name}</span>
              <span className={`${prefix}-card-stars`}>
                <StarRow earned={bestOf(best, c.id)} total={3} size={14} />
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone={tone}
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
