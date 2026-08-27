"use client";

import { motion } from "framer-motion";
import { playClickSound } from "@shared/audio/sfx";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { TREAT_LETTERS } from "@games/letter-treats/constants/alphabet";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { useTreatsStore } from "@games/letter-treats/store/treatsStore";

/** Candy flavours cycle across the alphabet so neighbours never share a colour.
 *  Six, not 26: the letter is what must be recognised, the colour is flavour. */
const FLAVOURS = ["strawberry", "lemon", "mint", "sky", "grape", "peach"] as const;

/**
 * ALPHABET SET - choose a letter.
 *
 * The game's first screen after the splash. 26 candy letters laid straight on
 * Candy Land; tapping one opens its learning screen. Free exploration - no
 * order, no locks, no progress. Back here is "Back to Games".
 */
export function AlphabetSetScreen({ onExitPortal }: { onExitPortal: () => void }) {
  const openLetter = useTreatsStore((s) => s.openLetter);
  const lastLetter = useTreatsStore((s) => s.lastLetter);

  return (
    <div className="lt-screen lt-wash relative flex h-full w-full flex-col items-center">
      <CandyScene variant="soft" />

      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the games library"
        tone="plum"
        pinned
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
      />

      <div className="ab-set relative z-10 flex h-full w-full flex-col items-center justify-center">
        <motion.h1
          className="ab-set-title font-rounded font-black"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <span className="lt-title-word">Candy</span>{" "}
          <span className="lt-title-word lt-title-word--b">ABC</span>
        </motion.h1>

        <div className="ab-grid grid w-full" role="list">
          {TREAT_LETTERS.map((letter, i) => (
            <motion.button
              key={letter}
              role="listitem"
              onClick={() => {
                playClickSound();
                openLetter(letter);
              }}
              className={`ab-key ab-key--${FLAVOURS[i % FLAVOURS.length]} font-rounded font-black`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: Math.min(i * 0.025, 0.6),
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.06 }}
              aria-label={`Letter ${letter}`}
            >
              <span className="ab-key-glyph">{letter}</span>
            </motion.button>
          ))}
        </div>

        <div className="ab-set-start">
          <StartOptions
            hasProgress={Boolean(lastLetter)}
            onContinue={() => {
              playClickSound();
              openLetter(lastLetter ?? "A");
            }}
            continueLabel={`Continue · ${lastLetter ?? "A"}`}
            onStartFromA={() => {
              playClickSound();
              openLetter("A");
            }}
          />
        </div>
      </div>

      <Bee mood="point" className="lt-bee-corner absolute z-10" />
    </div>
  );
}
