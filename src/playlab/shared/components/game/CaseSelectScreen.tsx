"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { NavPillButton, type NavTone } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";

/** The two letter cases a game can be played in. Games' own LetterCase types
 *  are the same string union, so they interoperate without casts. */
export type SelectableCase = "upper" | "lower";

interface CaseSelectScreenProps {
  /** e.g. "Which letters?" */
  title: string;
  /** One line under the title — what the choice is for ("For your river
   *  crossing"). Omit for none. */
  subtitle?: string;
  /** The game's world behind the choice. */
  backdrop?: ReactNode;
  /** Back pill tone — the game's identity. */
  tone: NavTone;
  backAriaLabel: string;
  onBack: () => void;
  onPick: (c: SelectableCase) => void;
}

/**
 * BIG LETTERS / small letters — the ONE case picker.
 *
 * Space ABC, Ocean ABC and dino-dig each grew their own copy of this screen;
 * this is the shared version so no fourth copy ever exists (Ocean Hunt is
 * its first consumer, and the three copies can migrate here when touched).
 *
 * Same split as the letter puzzle: STRUCTURE lives here and in the pl-cs-*
 * rules in shared/styles/utilities.css; COLOUR is painted by each game's own
 * stylesheet, scoped under its root class, so the two plates wear each
 * game's world without forking the screen.
 *
 * The click sound is played here — a pick is a pick in every game — but
 * navigation is the caller's: games differ in what follows (feed plays,
 * stones opens its doorway).
 */
export function CaseSelectScreen({
  title,
  subtitle,
  backdrop,
  tone,
  backAriaLabel,
  onBack,
  onPick,
}: CaseSelectScreenProps) {
  const options: { c: SelectableCase; label: string; preview: string; aria: string }[] = [
    { c: "upper", label: "BIG LETTERS", preview: "ABC", aria: "Play with big letters" },
    { c: "lower", label: "small letters", preview: "abc", aria: "Play with small letters" },
  ];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-7 overflow-y-auto px-6 py-8">
      {backdrop}

      <NavPillButton
        label="Back"
        ariaLabel={backAriaLabel}
        tone={tone}
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-1 text-center"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="pl-cs-title font-rounded font-black">{title}</h1>
        {subtitle && <p className="pl-cs-subtitle font-rounded font-bold">{subtitle}</p>}
      </motion.div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6">
        {options.map((o, i) => (
          <motion.button
            key={o.c}
            onClick={() => {
              playClickSound();
              onPick(o.c);
            }}
            className={`pl-cs-btn pl-cs-btn--${o.c} flex flex-col items-center justify-center gap-2`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
            aria-label={o.aria}
          >
            <span className="pl-cs-preview font-rounded font-black">{o.preview}</span>
            <span className="pl-cs-label font-rounded font-black">{o.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
