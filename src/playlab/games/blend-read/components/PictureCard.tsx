"use client";

import { motion } from "framer-motion";
import { Picture, type PictureId } from "@games/blend-read/components/PictureArt";

export type CardState = "idle" | "wrong" | "correct";

interface PictureCardProps {
  picture: PictureId;
  state: CardState;
  /** Any card is disabled once THIS question is solved, and a wrong card is
   *  disabled the moment it is marked — there is no reason to let a child
   *  tap a known-wrong answer again. */
  disabled: boolean;
  onPick: () => void;
  label: string;
}

const SHAKE = { x: [0, -6, 6, -4, 4, 0] };

/**
 * ONE ANSWER CARD.
 *
 * Three states for the whole game to agree on: unmarked, permanently WRONG
 * (a big red X, and the card stops responding), or the single CORRECT one (a
 * big dark check). Neither mark ever clears itself — a wrong card stays
 * crossed out for the rest of this question, which is what lets a child keep
 * trying without the game pretending the mistake did not happen.
 */
export function PictureCard({ picture, state, disabled, onPick, label }: PictureCardProps) {
  return (
    <motion.button
      type="button"
      className="br-card"
      data-state={state}
      disabled={disabled}
      aria-label={label}
      aria-pressed={state === "correct"}
      onClick={onPick}
      animate={state === "wrong" ? SHAKE : { x: 0 }}
      transition={state === "wrong" ? { duration: 0.4 } : { duration: 0.15 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
    >
      <span className="br-card-art">
        <Picture id={picture} />
      </span>

      {state === "wrong" && (
        <motion.span
          className="br-card-mark br-card-mark--wrong"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40">
            <path
              d="M8 8 L32 32 M32 8 L8 32"
              stroke="#E0413F"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
      )}

      {state === "correct" && (
        <motion.span
          className="br-card-mark br-card-mark--correct"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40">
            <path
              d="M7 21 L16 30 L33 10"
              stroke="#2B4E8A"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      )}
    </motion.button>
  );
}
