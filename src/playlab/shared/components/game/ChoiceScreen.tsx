"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { NavPillButton, type NavTone } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";

/**
 * One choice on a picker plate.
 *
 * `variant` is the modifier suffix the plate carries (`pl-cs-btn--upper`,
 * `pl-cs-btn--hard`, …) so a game can paint each plate differently under its
 * own root without this component knowing any colours.
 */
export interface Choice<T extends string> {
  value: T;
  /** The big sample on the plate — "ABC", "A B C", an icon. */
  preview: string;
  /** The plate's name — "BIG LETTERS", "Easy". */
  label: string;
  /** Full-sentence label for assistive tech. */
  aria: string;
  variant: string;
}

export interface ChoiceScreenProps<T extends string> {
  /** e.g. "Which letters?" */
  title: string;
  /** One line under the title — what the choice is for. Omit for none. */
  subtitle?: string;
  /** The game's world behind the choice. */
  backdrop?: ReactNode;
  /** Back pill tone — the game's identity. */
  tone: NavTone;
  backAriaLabel: string;
  onBack: () => void;
  onPick: (value: T) => void;
  options: readonly Choice<T>[];
}

/**
 * The portal's PICKER SCREEN: a title, an optional line of context, and a row
 * of plates.
 *
 * Extracted from CaseSelectScreen when Pirate Match needed a difficulty
 * picker. The two screens ask different questions but are the same screen —
 * same plates, same entrance, same pinned Back, same overflow-safe column —
 * so the second one is a different `options` array rather than a second copy
 * of the markup. CaseSelectScreen is now a thin wrapper over this.
 *
 * Same split as the letter puzzle: STRUCTURE lives here and in the pl-cs-*
 * rules in shared/styles/utilities.css; COLOUR is painted by each game's own
 * stylesheet, scoped under its root class, so the plates wear each game's
 * world without forking the screen.
 *
 * The click sound is played here — a pick is a pick in every game — but
 * navigation is the caller's: games differ in what follows.
 */
export function ChoiceScreen<T extends string>({
  title,
  subtitle,
  backdrop,
  tone,
  backAriaLabel,
  onBack,
  onPick,
  options,
}: ChoiceScreenProps<T>) {
  return (
    // The backdrop and the pinned Back pill are siblings of the scroller, not
    // children of it, so neither scrolls away; the content column inside uses
    // overflow-safe centring.
    <div className="pl-screen-shell">
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

      <div className="pl-screen-scroll pl-safe-center flex flex-col items-center gap-7 px-6 py-8 pt-16">
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
              key={o.value}
              onClick={() => {
                playClickSound();
                onPick(o.value);
              }}
              className={`pl-cs-btn pl-cs-btn--${o.variant} flex flex-col items-center justify-center gap-2`}
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
    </div>
  );
}
